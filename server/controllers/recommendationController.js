import Product from "../models/Product.js";
import Order from "../models/Order.js";
import UserBehavior from "../models/UserBehavior.js";
import Recommendation from "../models/Recommendation.js";
import mongoose from "mongoose";
import axios from "axios";
import pkg from 'natural';
const { TfIdf } = pkg;
import { similarity } from 'ml-distance';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';

const getProductId = (item) => String(item?.productId || item?._id || item?.product || '');

const hydrateProducts = async (items, limit = 8) => {
    const orderedIds = items
        .map(getProductId)
        .filter(id => mongoose.Types.ObjectId.isValid(id))
        .slice(0, limit);

    if (orderedIds.length === 0) return [];

    const products = await Product.find({ _id: { $in: orderedIds }, inStock: true });
    const productMap = new Map(products.map(product => [product._id.toString(), product]));

    return orderedIds
        .map(id => productMap.get(id))
        .filter(Boolean);
};

const getCachedRecommendations = async (type, referenceId, limit = 8) => {
    const cache = await Recommendation.findOne({ type, referenceId: String(referenceId) }).lean();
    if (!cache?.recommendations?.length) return null;

    const products = await hydrateProducts(cache.recommendations, limit);
    return products.length ? products : null;
};

const saveRecommendationCache = async (type, referenceId, recommendations, algorithm = 'content_based') => {
    const cacheItems = recommendations
        .map(item => ({
            productId: getProductId(item),
            score: Number(item?.score || 0),
        }))
        .filter(item => mongoose.Types.ObjectId.isValid(item.productId));

    if (cacheItems.length === 0) return;

    await Recommendation.updateOne(
        { type, referenceId: String(referenceId) },
        {
            $set: {
                recommendations: cacheItems,
                algorithm,
                updatedAt: new Date(),
            },
        },
        { upsert: true }
    );
};

// ─────────────────────────────────────────────────────────
// Helper: Content-based fallback (Node.js TF-IDF)
// Đồng nhất với productController: dùng brand, category, tags, price range
// ─────────────────────────────────────────────────────────
const contentBasedFallback = async (productId, topN = 8) => {
    const products = await Product.find({ inStock: true })
        .populate('category', 'name')
        .populate('brand', 'name');
    const tfidf = new TfIdf();

    const documents = products.map(p => {
        const descText = Array.isArray(p.description) ? p.description.join(' ') : String(p.description);
        const tagsText = Array.isArray(p.tags) ? p.tags.join(' ') : '';
        const catName = p.category?.name || p.category || '';
        const brandName = p.brand?.name || p.brand || '';
        const priceRange = p.offerPrice < 5000000 ? 'gia_re' :
                           p.offerPrice < 15000000 ? 'gia_trung' :
                           p.offerPrice < 30000000 ? 'gia_cao' : 'gia_cao_cap';
        // Kết hợp đầy đủ: name + category + brand + tags + description + price range
        return `${p.name} ${catName} ${brandName} ${tagsText} ${descText} ${priceRange}`;
    });
    documents.forEach(doc => tfidf.addDocument(doc));

    const allTerms = new Set();
    for (let i = 0; i < documents.length; i++) {
        tfidf.listTerms(i).forEach(t => allTerms.add(t.term));
    }
    const termList = Array.from(allTerms);
    const vectors = documents.map((_, i) =>
        termList.map(term => tfidf.tfidf(term, i))
    );

    const targetIndex = products.findIndex(p => p._id.toString() === productId);
    if (targetIndex === -1) return [];

    const sims = vectors.map((vec, idx) => ({
        idx,
        sim: similarity.cosine(vectors[targetIndex], vec)
    }));
    sims.sort((a, b) => b.sim - a.sim);
    // Bỏ qua bản thân (idx === targetIndex), lấy top N
    return sims
        .filter(s => s.idx !== targetIndex)
        .slice(0, topN)
        .map(s => products[s.idx]);
};

// Helper: Gọi Python ML service
const callMLService = async (endpoint) => {
    try {
        const { data } = await axios.get(`${ML_SERVICE_URL}${endpoint}`, { timeout: 5000 });
        return data;
    } catch {
        return null;
    }
};

// ─────────────────────────────────────────────────────────
// GET /api/recommendations/product/:productId
// Sản phẩm tương tự (Content-based)
// ─────────────────────────────────────────────────────────
export const getSimilarProducts = async (req, res) => {
    try {
        const { productId } = req.params;

        const cached = await getCachedRecommendations('product_similar', productId, 8);
        if (cached) {
            return res.json({ success: true, recommendations: cached, source: 'cache' });
        }

        // Thử Python ML service trước
        const mlResult = await callMLService(`/ml/recommend/content/${productId}`);
        if (mlResult && mlResult.success && mlResult.recommendations?.length) {
            const products = await hydrateProducts(mlResult.recommendations, 8);
            if (products.length) {
                await saveRecommendationCache('product_similar', productId, mlResult.recommendations, 'content_based');
                return res.json({ success: true, recommendations: products, source: 'ml' });
            }
        }

        // Fallback: Node.js TF-IDF
        const recommendations = await contentBasedFallback(productId);
        await saveRecommendationCache('product_similar', productId, recommendations, 'content_based_fallback');
        return res.json({ success: true, recommendations, source: 'fallback' });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────────────────
// GET /api/recommendations/user/:userId
// Gợi ý cá nhân hoá (Hybrid = CB + CF)
// ─────────────────────────────────────────────────────────
export const getUserRecommendations = async (req, res) => {
    try {
        const { userId } = req.params;

        const cached = await getCachedRecommendations('user_based', userId, 8);
        if (cached) {
            return res.json({ success: true, recommendations: cached, source: 'cache' });
        }

        // Thử Python ML service trước (Hybrid)
        const mlResult = await callMLService(`/ml/recommend/user/${userId}`);
        if (mlResult && mlResult.success && mlResult.recommendations?.length) {
            // Lấy đầy đủ thông tin product và giữ đúng thứ tự score từ ML
            const products = await hydrateProducts(mlResult.recommendations, 8);
            await saveRecommendationCache('user_based', userId, mlResult.recommendations, 'hybrid');
            return res.json({ success: true, recommendations: products, source: 'ml_hybrid' });
        }

        // Fallback: dùng hành vi gần nhất để CB recommend
        const recentBehaviors = await UserBehavior.find({ userId })
            .sort({ timestamp: -1 })
            .limit(5);

        if (recentBehaviors.length === 0) {
            // Cold start: trả trending
            return getTrendingProducts(req, res);
        }

        // Lấy sản phẩm xem gần nhất, recommend similar
        const lastProductId = recentBehaviors[0].productId.toString();
        const recommendations = await contentBasedFallback(lastProductId, 8);

        // Loại bỏ sản phẩm đã tương tác
        const interactedIds = new Set(recentBehaviors.map(b => b.productId.toString()));
        const filtered = recommendations.filter(p => !interactedIds.has(p._id.toString()));

        await saveRecommendationCache('user_based', userId, filtered, 'content_based_fallback');
        return res.json({ success: true, recommendations: filtered, source: 'fallback_cb' });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────────────────
// GET /api/recommendations/trending
// Sản phẩm nổi bật (dựa trên hành vi 7 ngày)
// ─────────────────────────────────────────────────────────
export const getTrendingProducts = async (req, res) => {
    try {
        const cached = await getCachedRecommendations('trending', 'global', 12);
        if (cached) {
            return res.json({ success: true, recommendations: cached, source: 'cache' });
        }

        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        // Tổng hợp điểm từ behavior events
        const behaviorAgg = await UserBehavior.aggregate([
            { $match: { timestamp: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: '$productId',
                    totalScore: { $sum: '$weight' },
                    viewCount: {
                        $sum: { $cond: [{ $eq: ['$eventType', 'view'] }, 1, 0] }
                    },
                    purchaseCount: {
                        $sum: { $cond: [{ $eq: ['$eventType', 'purchase'] }, 1, 0] }
                    }
                }
            },
            { $sort: { totalScore: -1 } },
            { $limit: 12 },
        ]);

        if (behaviorAgg.length > 0) {
            const productIds = behaviorAgg.map(b => b._id);
            const products = await Product.find({ _id: { $in: productIds }, inStock: true });

            // Sắp xếp theo score
            const scoreMap = {};
            behaviorAgg.forEach(b => { scoreMap[b._id.toString()] = b.totalScore; });
            products.sort((a, b) => (scoreMap[b._id.toString()] || 0) - (scoreMap[a._id.toString()] || 0));

            await saveRecommendationCache(
                'trending',
                'global',
                products.map(product => ({ _id: product._id, score: scoreMap[product._id.toString()] || 0 })),
                'trending'
            );
            return res.json({ success: true, recommendations: products, source: 'behavior' });
        }

        // Fallback nếu chưa có behavior data: lấy sản phẩm mới nhất
        const latestProducts = await Product.find({ inStock: true })
            .sort({ createdAt: -1 })
            .limit(12);
        await saveRecommendationCache('trending', 'global', latestProducts, 'latest_fallback');
        return res.json({ success: true, recommendations: latestProducts, source: 'latest' });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────────────────
// GET /api/recommendations/bought-together/:productId
// Thường mua cùng nhau (Order co-occurrence)
// ─────────────────────────────────────────────────────────
export const getFrequentlyBoughtTogether = async (req, res) => {
    try {
        const { productId } = req.params;

        const cached = await getCachedRecommendations('bought_together', productId, 5);
        if (cached) {
            return res.json({ success: true, recommendations: cached, source: 'cache' });
        }

        // Tìm các đơn hàng có chứa sản phẩm này
        // Convert sang ObjectId để match đúng type (sau khi model đổi từ String → ObjectId)
        let productObjId;
        try {
            productObjId = new mongoose.Types.ObjectId(productId);
        } catch {
            return res.json({ success: false, message: 'productId không hợp lệ', recommendations: [] });
        }

        const orders = await Order.find({
            'items.product': productObjId,
            $or: [{ paymentType: 'COD' }, { isPaid: true }],
        }).select('items');

        if (orders.length === 0) {
            // Fallback: Content-based
            const recommendations = await contentBasedFallback(productId, 5);
            await saveRecommendationCache('bought_together', productId, recommendations, 'content_based_fallback');
            return res.json({ success: true, recommendations, source: 'fallback_cb' });
        }

        // Đếm co-occurrence
        const coOccurrence = {};
        orders.forEach(order => {
            const productIds = order.items.map(item => item.product.toString());
            productIds.forEach(pid => {
                if (pid !== productId) {
                    coOccurrence[pid] = (coOccurrence[pid] || 0) + 1;
                }
            });
        });

        // Sắp xếp theo frequency
        const sorted = Object.entries(coOccurrence)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([id]) => id);

        if (sorted.length === 0) {
            const recommendations = await contentBasedFallback(productId, 5);
            await saveRecommendationCache('bought_together', productId, recommendations, 'content_based_fallback');
            return res.json({ success: true, recommendations, source: 'fallback_cb' });
        }

        const products = await Product.find({ _id: { $in: sorted }, inStock: true });
        // Sắp xếp theo co-occurrence count
        products.sort((a, b) => (coOccurrence[b._id.toString()] || 0) - (coOccurrence[a._id.toString()] || 0));

        await saveRecommendationCache(
            'bought_together',
            productId,
            products.map(product => ({ _id: product._id, score: coOccurrence[product._id.toString()] || 0 })),
            'co_occurrence'
        );
        return res.json({ success: true, recommendations: products, source: 'co_occurrence' });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};
