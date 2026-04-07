import mongoose from "mongoose";

// Schema cho từng biến thể sản phẩm (VD: iPhone 15 - 128GB - Đen)
const variantSchema = new mongoose.Schema({
    color: { type: String, default: "" },           // VD: "Titan Tự nhiên", "Đen"
    storage: { type: String, default: "" },          // VD: "128GB", "256GB", "1TB"
    price: { type: Number, required: true },         // Giá gốc của biến thể này
    offerPrice: { type: Number, required: true },    // Giá khuyến mãi
    inStock: { type: Number, default: 0 },           // Số lượng tồn kho
}, { _id: false });

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: Array, required: true },
    // price/offerPrice/inStock giữ lại làm FALLBACK cho data cũ & sản phẩm không có variant
    price: { type: Number, required: true },
    offerPrice: { type: Number, required: true },
    image: { type: Array, required: true },
    category: { type: String, required: true },     // VD: "mobile", "laptop", "tablet", "accessory"
    brand: { type: String, default: "" },           // VD: "Apple", "Samsung", "Dell"
    specs: { type: Object, default: {} },           // Thông số kỹ thuật: { RAM, CPU, ROM, Screen, Battery }
    tags: { type: [String], default: [] },          // Tags để AI gợi ý: ["gaming", "5g", "fast-charge"]
    // Biến thể sản phẩm: màu sắc, dung lượng, giá riêng từng loại
    variants: { type: [variantSchema], default: [] },
    inStock: { type: Boolean, default: true },      // Fallback cho sản phẩm không có variant
    avgRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
}, { timestamps: true });

// Index để tìm kiếm nhanh theo category, brand
productSchema.index({ category: 1, brand: 1 });
productSchema.index({ name: 'text', brand: 'text', tags: 'text' }); // Text search

const Product = mongoose.models.product || mongoose.model('product', productSchema)

export default Product