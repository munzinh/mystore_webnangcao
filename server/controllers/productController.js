import { v2 as cloudinary } from "cloudinary";
import Product from "../models/Product.js";
import pkg from 'natural';
const { TfIdf } = pkg;
import { similarity } from 'ml-distance';

// Add Product : /api/product/add
export const addProduct = async (req, res) => {
    try {
        let productData = JSON.parse(req.body.productData);


        let imagesUrl = [];
        for (let i = 0; i < 4; i++) {
            const fileArray = req.files && req.files[`image_${i}`];
            if (fileArray && fileArray.length > 0) {
                let result = await cloudinary.uploader.upload(fileArray[0].path, { resource_type: 'image' });
                imagesUrl.push(result.secure_url);
            } else if (req.body[`existingImage_${i}`]) {
                imagesUrl.push(req.body[`existingImage_${i}`]);
            } else {
                imagesUrl.push('');
            }
        }

        await Product.create({ ...productData, image: imagesUrl })
        res.json({ success: true, message: 'Đã thêm sản phẩm thành công' })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// Get Product List : /api/product/list
export const productList = async (req, res) => {
    try {
        const products = await Product.find({});
        res.json({ success: true, products });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// Get single Product : /api/product/id
export const productById = async (req, res) => {
    try {
        const { id } = req.body
        const product = await Product.findById(id);
        res.json({ success: true, product });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// Change Product inStock (global): /api/product/stock
// Body: { id, inStock } — toggle inStock fallback
// Body: { id, variantIndex, inStock } — cập nhật tồn kho biến thể cụ thể
export const changeStock = async (req, res) => {
    try {
        const { id, inStock, variantIndex, variantStock } = req.body;

        // Nếu có variantIndex → cập nhật tồn kho của biến thể cụ thể
        if (typeof variantIndex === 'number' && typeof variantStock === 'number') {
            await Product.findByIdAndUpdate(id, {
                [`variants.${variantIndex}.inStock`]: variantStock
            });
            return res.json({ success: true, message: 'Cập nhật tồn kho biến thể thành công' });
        }

        // Fallback: update inStock boolean toàn bộ sản phẩm
        await Product.findByIdAndUpdate(id, { inStock });
        res.json({ success: true, message: 'Đã cập nhật tồn kho' });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// Edit Product : /api/product/edit
export const editProduct = async (req, res) => {
    try {
        const { id } = req.body;
        let productData = JSON.parse(req.body.productData);

        let product = await Product.findById(id);
        if (!product) {
            return res.json({ success: false, message: 'Sản phẩm không tồn tại' });
        }

        let updateData = { ...productData };

        let imagesUrl = [];
        for (let i = 0; i < 4; i++) {
            const fileArray = req.files && req.files[`image_${i}`];
            if (fileArray && fileArray.length > 0) {
                let result = await cloudinary.uploader.upload(fileArray[0].path, { resource_type: 'image' });
                imagesUrl.push(result.secure_url);
            } else if (req.body[`existingImage_${i}`]) {
                imagesUrl.push(req.body[`existingImage_${i}`]);
            } else {
                imagesUrl.push('');
            }
        }
        
        // Only update image field if there are any images provided (new or existing)
        // If the user deliberately removed all images, it will save an array of empty strings.
        updateData.image = imagesUrl;

        await Product.findByIdAndUpdate(id, updateData);
        res.json({ success: true, message: 'Đã cập nhật sản phẩm thành công' });
    } catch (error) {
        console.log(error.message);
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
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// Recommend Products (Content-based): /api/product/recommend
// Gợi ý sản phẩm tương tự dựa trên TF-IDF kết hợp category, brand, tags
export const recommendProducts = async (req, res) => {
    try {
        const { id } = req.body;
        const products = await Product.find({});
        const tfidf = new TfIdf();

        // Xây dựng document phong phú hơn cho đồ điện tử:
        // kết hợp description + brand + category + tags + price range
        const documents = products.map(p => {
            const descText = Array.isArray(p.description) ? p.description.join(' ') : p.description;
            const tagsText = Array.isArray(p.tags) ? p.tags.join(' ') : '';
            const priceRange = p.offerPrice < 5000000 ? 'gia_re' :
                               p.offerPrice < 15000000 ? 'gia_trung' :
                               p.offerPrice < 30000000 ? 'gia_cao' : 'gia_cao_cap';
            return `${descText} ${p.brand} ${p.category} ${tagsText} ${priceRange}`;
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

        // Lấy top 5 sản phẩm tương tự (bỏ qua chính nó)
        const top = similarities
            .filter(s => s.idx !== targetIndex)
            .slice(0, 5)
            .map(s => products[s.idx]);

        res.json({ success: true, recommendations: top });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// Search Products: /api/product/search
// Dùng MongoDB text index để tìm kiếm nhanh theo name, brand, tags
export const searchProducts = async (req, res) => {
    try {
        const { q, category, brand, minPrice, maxPrice, inStock } = req.query;

        let filter = {};

        // Full-text search nếu có query string
        if (q) {
            filter.$text = { $search: q };
        }

        // Lọc theo category nếu có
        if (category) filter.category = category;

        // Lọc theo brand nếu có
        if (brand) filter.brand = brand;

        // Lọc theo khoảng giá
        if (minPrice || maxPrice) {
            filter.offerPrice = {};
            if (minPrice) filter.offerPrice.$gte = Number(minPrice);
            if (maxPrice) filter.offerPrice.$lte = Number(maxPrice);
        }

        // Lọc còn hàng
        if (inStock === 'true') filter.inStock = true;

        const products = await Product.find(filter)
            .sort(q ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
            .limit(20);

        res.json({ success: true, products });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}
