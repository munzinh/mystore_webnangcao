import { v2 as cloudinary } from "cloudinary";
import Review from "../models/Review.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";

// Helper: tính lại avgRating & totalReviews cho sản phẩm
const updateProductRating = async (productId) => {
    const reviews = await Review.find({ productId });
    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0
        ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) * 10) / 10
        : 0;
    await Product.findByIdAndUpdate(productId, { avgRating, totalReviews });
};

// POST /api/review/add — Thêm review (auth required, upload ảnh)
export const addReview = async (req, res) => {
    try {
        const userId = req.userId; // set by authUser middleware
        const { productId, rating, comment } = req.body;

        if (!productId || !rating) {
            return res.json({ success: false, message: 'Thiếu thông tin đánh giá' });
        }

        // Check duplicate
        const existing = await Review.findOne({ userId, productId });
        if (existing) {
            return res.json({ success: false, message: 'Bạn đã đánh giá sản phẩm này rồi' });
        }

        // Upload images if any
        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            imageUrls = await Promise.all(
                req.files.map(async (file) => {
                    const result = await cloudinary.uploader.upload(file.path, { resource_type: 'image' });
                    return result.secure_url;
                })
            );
        }

        const review = await Review.create({
            userId,
            productId,
            rating: Number(rating),
            comment: comment || '',
            images: imageUrls
        });

        // Populate user info for response
        await review.populate('userId', 'name');

        // Cập nhật rating tổng cho sản phẩm
        await updateProductRating(productId);

        res.json({ success: true, message: 'Đã thêm đánh giá thành công', review });
    } catch (error) {
        if (error.code === 11000) {
            return res.json({ success: false, message: 'Bạn đã đánh giá sản phẩm này rồi' });
        }
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// GET /api/review/:productId — Lấy reviews của product
export const getReviews = async (req, res) => {
    try {
        const { productId } = req.params;

        const reviews = await Review.find({ productId })
            .populate('userId', 'name')
            .sort({ createdAt: -1 });

        const totalReviews = reviews.length;
        const avgRating = totalReviews > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
            : 0;

        // Distribution: { 5: count, 4: count, ... }
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviews.forEach(r => {
            if (distribution[r.rating] !== undefined) {
                distribution[r.rating]++;
            }
        });

        res.json({
            success: true,
            reviews,
            totalReviews,
            avgRating: Math.round(avgRating * 10) / 10,
            distribution
        });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// GET /api/review/user-review/:productId — Check nếu user đã review
export const getUserReview = async (req, res) => {
    try {
        const userId = req.userId;
        const { productId } = req.params;

        const review = await Review.findOne({ userId, productId });
        res.json({ success: true, review: review || null });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// DELETE /api/review/:id — Xóa review của chính user
export const deleteReview = async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        const review = await Review.findById(id);
        if (!review) {
            return res.json({ success: false, message: 'Không tìm thấy đánh giá' });
        }
        if (review.userId.toString() !== userId.toString()) {
            return res.json({ success: false, message: 'Không có quyền xóa đánh giá này' });
        }

        await Review.findByIdAndDelete(id);

        // Cập nhật lại rating tổng cho sản phẩm
        await updateProductRating(review.productId);

        res.json({ success: true, message: 'Đã xóa đánh giá thành công' });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};
