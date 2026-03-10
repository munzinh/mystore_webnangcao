import mongoose from "mongoose";

const userBehaviorSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'product', required: true },
    eventType: {
        type: String,
        enum: ['view', 'add_to_cart', 'purchase', 'rating'],
        required: true
    },
    // Weight dùng cho user-item matrix
    weight: { type: Number, default: 1.0 },
    // Metadata tuỳ chọn
    metadata: {
        rating: { type: Number, min: 1, max: 5 }, // nếu eventType = 'rating'
        sessionId: { type: String },
    },
    timestamp: { type: Date, default: Date.now },
});

// Index để query nhanh
userBehaviorSchema.index({ userId: 1, productId: 1 });
userBehaviorSchema.index({ productId: 1, eventType: 1 });
userBehaviorSchema.index({ timestamp: -1 });

const UserBehavior = mongoose.models.userbehavior || mongoose.model('userbehavior', userBehaviorSchema);

export default UserBehavior;
