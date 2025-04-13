import User from "../models/User.js";

// Cập nhật giỏ hàng: /api/cart/update
export const updateCart = async (req, res) => {
    try {
        const {userId, cartItems} = req.body;
        await User.findByIdAndUpdate(userId, {cartItems});
        res.json({success: true, message: 'Đã cập nhật giỏ hàng'});
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message });
    }
}