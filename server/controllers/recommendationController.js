import Product from "../models/Product.js";
import Order from "../models/Order.js";
import UserBehavior from "../models/UserBehavior.js";
import Recommendation from "../models/Recommendation.js";
import axios from "axios";
import pkg from 'natural';
const { TfIdf } = pkg;
import { similarity } from 'ml-distance';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';

// ─────────────────────────────────────────────────────────
// Helper: Content-based fallback (Node.js TF-IDF)
// ─────────────────────────────────────────────────────────
const contentBasedFallback = async (productId, topN = 8) => {
    const products = await Product.find({ inStock: true });
    const tfidf = new TfIdf();

    const documents = products.map(p => {
        const descText = Array.isArray(p.description) ? p.description.join(' ') : String(p.description);
        return `${p.name} ${p.category} ${descText} ${p.price}`;
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
    return sims.slice(1, topN + 1).map(s => products[s.idx]);
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

        // Thử Python ML service trước
        const mlResult = await callMLService(`/ml/recommend/content/${productId}`);
        if (mlResult && mlResult.success && mlResult.recommendations?.length) {
            return res.json({ success: true, recommendations: mlResult.recommendations, source: 'ml' });
        }

        // Fallback: Node.js TF-IDF
        const recommendations = await contentBasedFallback(productId);
        return res.json({ success: true, recommendations, source: 'fallback' });
    } catch (error) {
        console.log(error.message);
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

        // Thử Python ML service trước (Hybrid)
        const mlResult = await callMLService(`/ml/recommend/user/${userId}`);
        if (mlResult && mlResult.success && mlResult.recommendations?.length) {
            // Lấy đầy đủ thông tin product
            const productIds = mlResult.recommendations.map(r => r.productId);
            const products = await Product.find({ _id: { $in: productIds }, inStock: true });
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

        return res.json({ success: true, recommendations: filtered, source: 'fallback_cb' });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────────────────
// GET /api/recommendations/trending
// Sản phẩm nổi bật (dựa trên hành vi 7 ngày)
// ─────────────────────────────────────────────────────────
export const getTrendingProducts = async (req, res) => {
    try {
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

            return res.json({ success: true, recommendations: products, source: 'behavior' });
        }

        // Fallback nếu chưa có behavior data: lấy sản phẩm mới nhất
        const latestProducts = await Product.find({ inStock: true })
            .sort({ createdAt: -1 })
            .limit(12);
        return res.json({ success: true, recommendations: latestProducts, source: 'latest' });
    } catch (error) {
        console.log(error.message);
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

        // Tìm các đơn hàng có chứa sản phẩm này
        const orders = await Order.find({
            'items.product': productId,
            $or: [{ paymentType: 'COD' }, { isPaid: true }],
        }).select('items');

        if (orders.length === 0) {
            // Fallback: Content-based
            const recommendations = await contentBasedFallback(productId, 5);
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
            return res.json({ success: true, recommendations, source: 'fallback_cb' });
        }

        const products = await Product.find({ _id: { $in: sorted }, inStock: true });
        // Sắp xếp theo co-occurrence count
        products.sort((a, b) => (coOccurrence[b._id.toString()] || 0) - (coOccurrence[a._id.toString()] || 0));

        return res.json({ success: true, recommendations: products, source: 'co_occurrence' });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};
