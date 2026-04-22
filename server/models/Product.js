import mongoose from "mongoose";

// Schema cho từng biến thể sản phẩm — thiết kế linh hoạt cho đồ điện tử
//
// VD 1 — Chỉ màu:
//   attributes: { "Màu": "Đen" }
//   variantLabel: "Đen"
//
// VD 2 — Màu + Dung lượng (điện thoại):
//   attributes: { "Màu": "Titan Tự Nhiên", "ROM": "256GB" }
//   variantLabel: "Titan Tự Nhiên - 256GB"
//
// VD 3 — RAM + SSD (laptop):
//   attributes: { "RAM": "16GB", "SSD": "512GB" }
//   variantLabel: "16GB RAM / 512GB SSD"
//
// VD 4 — Kích thước + Tần số (màn hình):
//   attributes: { "Kích thước": "27\"", "Tần số": "144Hz" }
//   variantLabel: "27\" 144Hz"
//
const variantSchema = new mongoose.Schema({
    // Thông số linh hoạt dạng key-value — seller tự định nghĩa key phù hợp sản phẩm
    attributes: {
        type: Map,
        of: String,
        default: {},
    },
    // Label hiển thị trên UI (seller nhập hoặc tự ghép từ attributes)
    // VD: "Đen - 256GB", "16GB / 512GB", "Xanh dương"
    variantLabel: { type: String, default: '' },

    price:      { type: Number, required: true },    // Giá gốc của biến thể
    offerPrice: { type: Number, required: true },    // Giá ưu đãi
    inStock:    { type: Number, default: 0 },        // Tồn kho (số lượng)
}, { _id: false });

const productSchema = new mongoose.Schema({
    name:        { type: String, required: true },
    description: { type: Array,  required: true },

    // Giá & tồn kho global — tự động tính từ variants (lấy min), giữ làm fallback
    price:      { type: Number, required: true },
    offerPrice: { type: Number, required: true },
    inStock:    { type: Boolean, default: true },
    
    // Tính năng Flash Sale
    flashSaleEndTime: { type: Date, default: null },

    image:    { type: Array,  required: true },
    category: { type: String, required: true },     // "mobile", "laptop", "tablet", "accessory"
    brand:    { type: String, default: '' },        // "Apple", "Samsung", "Dell"
    specs:    { type: Object, default: {} },        // Thông số chung: { CPU, Screen, Battery }
    tags:     { type: [String], default: [] },      // AI tags: ["5g", "gaming", "fast-charge"]

    // Mảng biến thể — mỗi biến thể có attributes linh hoạt + giá + kho riêng
    variants: { type: [variantSchema], default: [] },

    avgRating:    { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
}, { timestamps: true });

// Index tìm kiếm nhanh
productSchema.index({ category: 1, brand: 1 });
productSchema.index({ name: 'text', brand: 'text', tags: 'text' });

const Product = mongoose.models.product || mongoose.model('product', productSchema);

export default Product;