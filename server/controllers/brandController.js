import Brand from '../models/Brand.js';

// Add new brand
export const addBrand = async (req, res) => {
    try {
        const { name, logo, isActive } = req.body;
        
        const brand = new Brand({
            name,
            logo: logo || '',
            isActive: isActive !== undefined ? isActive : true
        });

        await brand.save();

        res.json({ success: true, message: 'Brand added successfully', brand });
    } catch (error) {
        console.error("Add brand error:", error);
        res.json({ success: false, message: error.message });
    }
};

// Get all active brands
export const getBrands = async (req, res) => {
    try {
        const brands = await Brand.find({ isActive: true }).sort({ name: 1 });
        res.json({ success: true, brands });
    } catch (error) {
        console.error("Get brands error:", error);
        res.json({ success: false, message: error.message });
    }
};
