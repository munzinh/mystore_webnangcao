import { v2 as cloudinary } from "cloudinary";
import Product from "../models/Product.js";
import pkg from 'natural';
const { TfIdf } = pkg;
import { similarity } from 'ml-distance';

// Add Product : /api/product/add
export const addProduct = async (req, res) => {
    try {
        let productData = JSON.parse(req.body.productData);


        const images = req.files

        let imagesUrl = await Promise.all(
            images.map(async (image) => {
                let result = await cloudinary.uploader.upload(image.path, { resource_type: 'image' });
                return result.secure_url
            })
        )

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

// Change Product inStock: /api/product/stock 
export const changeStock = async (req, res) => {
    try {
        const { id, inStock } = req.body;
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

        const images = req.files;
        let product = await Product.findById(id);

        if (!product) {
            return res.json({ success: false, message: 'Sản phẩm không tồn tại' });
        }

        let updateData = { ...productData };

        if (images && images.length > 0) {
            let imagesUrl = await Promise.all(
                images.map(async (image) => {
                    let result = await cloudinary.uploader.upload(image.path, { resource_type: 'image' });
                    return result.secure_url
                })
            );
            updateData.image = imagesUrl;
        }

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

// Recommend Products: /api/product/recommend
export const recommendProducts = async (req, res) => {
    try {
        const { id } = req.body;
        const products = await Product.find({});
        const tfidf = new TfIdf();
        const documents = products.map(p => p.description + ' ' + p.price.toString());
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
        if (targetIndex === -1) return res.json({ success: false, message: 'Product not found' });
        const similarities = vectors.map((vec, idx) => ({ idx, sim: similarity.cosine(vectors[targetIndex], vec) }));
        similarities.sort((a, b) => b.sim - a.sim);
        const top = similarities.slice(1, 6).map(s => products[s.idx]);
        res.json({ success: true, recommendations: top });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}
