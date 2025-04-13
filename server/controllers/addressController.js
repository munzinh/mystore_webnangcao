import Address from "../models/Address.js";

// Thêm địa chỉ: /api/address/add
export const addAddress = async (req, res) => {
    try {
        const {address, userId} = req.body;
        await Address.create({...address, userId});
        res.json({success: true, message: 'Đã thêm địa chỉ thành công'});
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message });
    }
}

// Lấy địa chỉ: api/address/get
export const getAddress = async (req, res) => {
    try {
        const userId = req.userId;
        const addresses = await Address.find({userId});
        res.json({success: true, addresses});
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message });
    }
}