import mongoose from "mongoose";

const recommendationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['user_based', 'product_similar', 'trending', 'bought_together'],
        required: true
    },
    // userId nếu type='user_based', productId nếu type khác
    referenceId: { type: String, required: true },
    recommendations: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'product' },
        score: { type: Number, default: 0 }
    }],
    algorithm: { type: String, default: 'content_based' }, // 'content_based' | 'collaborative' | 'hybrid'
    updatedAt: { type: Date, default: Date.now },
});

// Index lookup
recommendationSchema.index({ type: 1, referenceId: 1 }, { unique: true });
// TTL index: tự xoá sau 24 giờ
recommendationSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 86400 });

const Recommendation = mongoose.models.recommendation || mongoose.model('recommendation', recommendationSchema);

export default Recommendation;
