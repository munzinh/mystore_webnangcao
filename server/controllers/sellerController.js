import jwt from 'jsonwebtoken'

//Login seller : /api/seller/login

export const sellerLogin = async (req, res)=>{
    try {
        const {email,password}=req.body;

    if(password === process.env.SELLER_PASSWORD && email === process.env.SELLER_EMAIL){
        const token = jwt.sign({email}, process.env.JWT_SECRET, {expiresIn: '7d'});

        res.cookie('sellerToken',token, {
            httpOnly: true, //Prevent JavaScript to access cookie
            secure: process.env.NODE_ENV === 'production', //Use secure cookies in production
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', //CSRF protection
            maxAge: 7*24*60*60*1000, //Cookie expiration time
        });

        return res.json({ success: true, message: "Đăng nhập thành công"});

    }else{
        return res.json({ success: false, message: "Thông tin đăng nhập không hợp lệ"});
    }
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message });
    }
}

//Seller auth: /api/seller/is-auth
export const isSellerAuth = async(req, res)=>{
    try{
        return res.json({success: true,sellerEmail: req.sellerEmail});
    }catch (error){
        console.log(error.message);
        res.json({success: false, message: error.message });
    }
}


// Logout Seller: /api/seller/logout

export const sellerLogout = async(req,res)=>{
    try {
        res.clearCookie('sellerToken',{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none':'strict',
        });
        return res.json({success: true, message: "Đã đăng xuất"})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message });
    }
}