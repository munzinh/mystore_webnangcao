import jwt from 'jsonwebtoken';

// Middleware xác thực người dùng
const authUser = async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return res.json({ success: false, message: 'Không có quyền truy cập' });
    }

    try {
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

        if (tokenDecode.id) {
            req.userId = tokenDecode.id;
            next(); // Cho phép tiếp tục nếu xác thực thành công
        } else {
            return res.json({ success: false, message: 'Không có quyền truy cập' });
        }

    } catch (error) {
        res.json({ success: false, message: 'Lỗi xác thực: ' + error.message });
    }
};

export default authUser;
