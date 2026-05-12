import { v2 as cloudinary } from "cloudinary";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Brand from "../models/Brand.js";
import pkg from 'natural';
import { similarity } from 'ml-distance';

const { TfIdf } = pkg;

// Helper to upload images
const uploadMultipleImages = async (reqFiles, prefix, bodyFields) => {
    let imagesUrl = [];
    for (let i = 0; i < 4; i++) {
        const fileArray = reqFiles && reqFiles[`${prefix}_${i}`];
        if (fileArray && fileArray.length > 0) {
            let result = await cloudinary.uploader.upload(fileArray[0].path, { resource_type: 'image' });
            imagesUrl.push(result.secure_url);
        } else if (bodyFields && bodyFields[`existing_${prefix}_${i}`]) {
            imagesUrl.push(bodyFields[`existing_${prefix}_${i}`]);
        }
    }
    return imagesUrl;
}

// Add Product : /api/product/add
export const addProduct = async (req, res) => {
    try {
        let productData = JSON.parse(req.body.productData);

        // Upload global images
        let globalImages = await uploadMultipleImages(req.files, 'image', req.body);
        if(globalImages.length === 0) {
            return res.json({ success: false, message: 'Global images are required' });
        }

        // Upload variant specific images
        for (let i = 0; i < productData.variants.length; i++) {
            let variantImages = await uploadMultipleImages(req.files, `variant_${i}_image`, req.body);
            productData.variants[i].images = variantImages;
        }

        // Validate Category & Brand 
        const category = await Category.findById(productData.category);
        const brand = await Brand.findById(productData.brand);

        if (!category) return res.json({ success: false, message: 'Invalid category' });
        if (!brand) return res.json({ success: false, message: 'Invalid brand' });

        await Product.create({ ...productData, image: globalImages });

        res.json({ success: true, message: 'Đã thêm sản phẩm thành công' });
    } catch (error) {
        console.error("Add Product Error: ", error);
        res.json({ success: false, message: error.message });
    }
}

// Get Product List : /api/product/list
export const productList = async (req, res) => {
    try {
        const products = await Product.find({})
            .populate('category', 'name slug')
            .populate('brand', 'name slug');
        res.json({ success: true, products });
    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: error.message });
    }
}

// Get single Product : /api/product/id
export const productById = async (req, res) => {
    try {
        const { id } = req.body;
        const product = await Product.findById(id)
            .populate('category', 'name slug')
            .populate('brand', 'name slug');
        res.json({ success: true, product });
    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: error.message });
    }
}

// Change Product inStock (global & variant)
export const changeStock = async (req, res) => {
    try {
        const { id, inStock, variantIndex, variantStock } = req.body;

        if (typeof variantIndex === 'number' && typeof variantStock === 'number') {
            await Product.findByIdAndUpdate(id, {
                [`variants.${variantIndex}.inStock`]: variantStock
            });
            return res.json({ success: true, message: 'Cập nhật tồn kho biến thể thành công' });
        }

        await Product.findByIdAndUpdate(id, { inStock });
        res.json({ success: true, message: 'Đã cập nhật tồn kho' });
    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: error.message });
    }
}

// Edit Product : /api/product/edit
export const editProduct = async (req, res) => {
    try {
        const { id } = req.body;
        let productData = JSON.parse(req.body.productData);

        let product = await Product.findById(id);
        if (!product) return res.json({ success: false, message: 'Sản phẩm không tồn tại' });

        // Global images update
        let globalImages = await uploadMultipleImages(req.files, 'image', req.body);
        if(globalImages.length > 0) {
            productData.image = globalImages;
        }

        // Variants images update
        for (let i = 0; i < productData.variants.length; i++) {
            let variantImages = await uploadMultipleImages(req.files, `variant_${i}_image`, req.body);
            // If they didn't upload any new image for this variant, keep existing array (or override if they explicitly delete)
            if(variantImages.length > 0 || req.body[`override_variant_${i}_images`]) {
                productData.variants[i].images = variantImages;
            }
        }

        await Product.findByIdAndUpdate(id, productData);
        res.json({ success: true, message: 'Đã cập nhật sản phẩm thành công' });
    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: error.message });
    }
}

// Delete Product : /api/product/delete
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.body;
        await Product.findByIdAndDelete(id);
        res.json({ success: true, message: 'Đã xóa sản phẩm thành công' });
    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: error.message });
    }
}

// Recommend Products (Content-based): /api/product/recommend
export const recommendProducts = async (req, res) => {
    try {
        const { id } = req.body;
        const products = await Product.find({}).populate('category brand');
        const tfidf = new TfIdf();

        const documents = products.map(p => {
            const descText = Array.isArray(p.description) ? p.description.join(' ') : p.description;
            const tagsText = Array.isArray(p.tags) ? p.tags.join(' ') : '';
            const brandText = p.brand ? p.brand.name : '';
            const catText = p.category ? p.category.name : '';
            const priceRange = p.offerPrice < 5000000 ? 'gia_re' :
                               p.offerPrice < 15000000 ? 'gia_trung' :
                               p.offerPrice < 30000000 ? 'gia_cao' : 'gia_cao_cap';
            return `${descText} ${brandText} ${catText} ${tagsText} ${priceRange}`;
        });

        documents.forEach(doc => tfidf.addDocument(doc));

        const allTerms = new Set();
        for (let i = 0; i < documents.length; i++) {
            tfidf.listTerms(i).forEach(termObj => allTerms.add(termObj.term));
        }
        const termList = Array.from(allTerms);
        const vectors = [];
        for (let i = 0; i < documents.length; i++) {
            const vector = termList.map(term => tfidf.tfidf(term, i));
            vectors.push(vector);
        }

        const targetIndex = products.findIndex(p => p._id.toString() === id);
        if (targetIndex === -1) return res.json({ success: false, message: 'Không tìm thấy sản phẩm' });

        const similarities = vectors.map((vec, idx) => ({
            idx,
            sim: similarity.cosine(vectors[targetIndex], vec)
        }));
        similarities.sort((a, b) => b.sim - a.sim);

        const top = similarities
            .filter(s => s.idx !== targetIndex)
            .slice(0, 5)
            .map(s => products[s.idx]);

        res.json({ success: true, recommendations: top });
    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: error.message });
    }
}

// Search Products
export const searchProducts = async (req, res) => {
    try {
        const { q, categoryId, brandId, minPrice, maxPrice, inStock } = req.query;

        let filter = {};

        if (q) filter.$text = { $search: q };
        if (categoryId) filter.category = categoryId;
        if (brandId) filter.brand = brandId;
        if (minPrice || maxPrice) {
            filter.offerPrice = {};
            if (minPrice) filter.offerPrice.$gte = Number(minPrice);
            if (maxPrice) filter.offerPrice.$lte = Number(maxPrice);
        }
        if (inStock === 'true') filter.inStock = true;

        const products = await Product.find(filter)
            .populate('category', 'name slug')
            .populate('brand', 'name slug')
            .sort(q ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
            .limit(20);

        res.json({ success: true, products });
    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: error.message });
    }
}
