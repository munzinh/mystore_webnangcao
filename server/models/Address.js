import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'user'
    },
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipcode: { type: String, required: true },   // Đổi Number → String (zipcode có thể có ký tự đặc biệt)
    country: { type: String, required: true },
    phone: { type: String, required: true },
    isDefault: { type: Boolean, default: false }, // Địa chỉ mặc định của user
})

// Index để lấy danh sách địa chỉ của user nhanh
addressSchema.index({ userId: 1 });

const Address = mongoose.models.address || mongoose.model('address', addressSchema)

export default Address;