import jwt from 'jsonwebtoken';

// Middleware xác thực người dùng
// Hỗ trợ token từ: cookie, Authorization header (Bearer), query param hoặc body
const authUser = async (req, res, next) => {
    const tokenFromCookie = req.cookies && req.cookies.token;
    const authHeader = req.headers && req.headers.authorization;
    const tokenFromHeader = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    const token = tokenFromCookie || tokenFromHeader || req.query?.token || req.body?.token;

    if (!token) {
        return res.json({ success: false, message: 'Not Authorized' });
    }

    try {
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

        if (tokenDecode && tokenDecode.id) {
            req.userId = tokenDecode.id;
            return next(); // Cho phép tiếp tục nếu xác thực thành công
        }

        return res.json({ success: false, message: 'Not Authorized' });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

export default authUser;
