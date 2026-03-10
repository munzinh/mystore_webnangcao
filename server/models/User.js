import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cartItems: { type: Object, default: {} },
    role: { type: String, enum: ['user', 'manager', 'admin'], default: 'user' },
}, { minimize: false })

const User = mongoose.models.user || mongoose.model('user', userSchema)

export default User