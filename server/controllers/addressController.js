import Address from "../models/Address.js";


//Add address: /api/address/add
export const addAddress = async (req, res) => {
    try {
        const {address, userId} = req.body;
        await Address.create({...address, userId});
        res.json({success: true, message: 'Address Added'});
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message });
    }
}

//Get address: api/address/get
export const getAddress = async (req, res) => {
    try {
        const userId = req.userId; // Lấy từ middleware đã gán
        const addresses = await Address.find({userId});
        res.json({success: true, addresses});
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message });
    }
}