import jwt from 'jsonwebtoken'

//Login seller : /api/seller/login

export const sellerLogin = async (req, res)=>{
    try {
        const {email,password}=req.body;

    if(password === process.env.SELLER_PASSWORD && email === process.env.SELLER_EMAIL){
        const token = jwt.sign({email}, process.env.JWT_SECRET, {expiresIn: '7d'});

        res.cookie('sellerToken',token, {
            httpOnly: true, // Ngăn JavaScript truy cập cookie
            secure: process.env.NODE_ENV === 'production', // Dùng cookie bảo mật trong môi trường production
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Bảo vệ CSRF
            maxAge: 7*24*60*60*1000, // Thời gian hết hạn cookie
        });

        return res.json({ success: true, message: "Đăng nhập thành công"});

    }else{
        return res.json({ success: false, message: "Thông tin đăng nhập không hợp lệ"});
    }
    } catch (error) {
        console.error(error.message);
        res.json({success: false, message: error.message });
    }
}

//Seller auth: /api/seller/is-auth
export const isSellerAuth = async(req, res)=>{
    try{
        return res.json({success: true,sellerEmail: req.sellerEmail});
    }catch (error){
        console.error(error.message);
        res.json({success: false, message: error.message });
    }
}


// Logout Seller: /api/seller/logout

export const sellerLogout = async(req,res)=>{
    try {
        res.clearCookie('sellerToken',{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none':'lax',
        });
        return res.json({success: true, message: "Đã đăng xuất"})
    } catch (error) {
        console.error(error.message);
        res.json({success: false, message: error.message });
    }
}