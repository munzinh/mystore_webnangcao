import Category from '../models/Category.js';

// Add new category
export const addCategory = async (req, res) => {
    try {
        const { name, parentId, suggestedAttributes, isActive } = req.body;
        
        const category = new Category({
            name,
            parentId: parentId || null,
            suggestedAttributes: suggestedAttributes || [],
            isActive: isActive !== undefined ? isActive : true
        });

        await category.save();

        res.json({ success: true, message: 'Category added successfully', category });
    } catch (error) {
        console.error("Add category error:", error);
        res.json({ success: false, message: error.message });
    }
};

// Get all categories as a flat list
export const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({}).populate('parentId', 'name');
        res.json({ success: true, categories });
    } catch (error) {
        console.error("Get categories error:", error);
        res.json({ success: false, message: error.message });
    }
};

// Get category tree (hierarchical)
export const getCategoryTree = async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true }).lean();
        
        // Build tree
        const categoryMap = {};
        const roots = [];

        categories.forEach(cat => {
            categoryMap[cat._id.toString()] = { ...cat, children: [] };
        });

        categories.forEach(cat => {
            if (cat.parentId) {
                if(categoryMap[cat.parentId.toString()]) {
                    categoryMap[cat.parentId.toString()].children.push(categoryMap[cat._id.toString()]);
                }
            } else {
                roots.push(categoryMap[cat._id.toString()]);
            }
        });

        res.json({ success: true, tree: roots });
    } catch (error) {
        console.error("Get category tree error:", error);
        res.json({ success: false, message: error.message });
    }
};

// Update category
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, parentId, suggestedAttributes, isActive } = req.body;

        const category = await Category.findByIdAndUpdate(
            id,
            { name, parentId: parentId || null, suggestedAttributes, isActive },
            { new: true, runValidators: true }
        );

        if (!category) return res.json({ success: false, message: 'Category not found' });
        res.json({ success: true, message: 'Category updated', category });
    } catch (error) {
        console.error("Update category error:", error);
        res.json({ success: false, message: error.message });
    }
};

// Delete category
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Category.findByIdAndDelete(id);
        if (!deleted) return res.json({ success: false, message: 'Category not found' });
        res.json({ success: true, message: 'Category deleted' });
    } catch (error) {
        console.error("Delete category error:", error);
        res.json({ success: false, message: error.message });
    }
};
