import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'product', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '' },
    images: { type: [String], default: [] },
}, { timestamps: true });

// Mỗi user chỉ được review một sản phẩm một lần
reviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

const Review = mongoose.models.review || mongoose.model('review', reviewSchema);

export default Review;
