import User from "../models/User.js";

// Cập nhật giỏ hàng: /api/cart/update
export const updateCart = async (req, res) => {
    try {
        const userId = req.userId; // Lấy từ auth middleware, không tin vào body
        const { cartItems } = req.body;
        if (!userId) return res.json({ success: false, message: 'Unauthorized' });
        await User.findByIdAndUpdate(userId, { cartItems });
        res.json({ success: true, message: 'Đã cập nhật giỏ hàng' });
    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: error.message });
    }
}