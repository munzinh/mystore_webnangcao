import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'user'
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'product'
        },
        quantity: { type: Number, required: true },
        // Giá chốt tại thời điểm đặt hàng — không bị ảnh hưởng khi admin sửa giá sau
        price_at_purchase: { type: Number, default: 0 },
        // Thông tin biến thể đã chọn, VD: "Đen - 256GB"
        variantInfo: { type: String, default: "" },
    }],
    amount: { type: Number, required: true },
    // Snapshot địa chỉ giao hàng lúc đặt (để giữ đúng dù user sửa/xóa địa chỉ sau)
    shippingAddress: {
        name: { type: String, default: "" },
        phone: { type: String, default: "" },
        street: { type: String, default: "" },
        city: { type: String, default: "" },
        state: { type: String, default: "" },
        zipcode: { type: String, default: "" },
        country: { type: String, default: "" },
    },
    // Giữ lại `address` (ObjectId) để tương thích ngược với data cũ & flow hiện tại
    address: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'address'
    },
    status: {
        type: String,
        enum: ['Order Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Order Placed'
    },
    paymentType: { type: String, required: true },  // "COD" | "Online"
    isPaid: { type: Boolean, required: true, default: false },
}, { timestamps: true });

// Index để query "lịch sử đơn hàng của user" nhanh
orderSchema.index({ userId: 1, createdAt: -1 });

const Order = mongoose.models.order || mongoose.model('order', orderSchema);

export default Order;