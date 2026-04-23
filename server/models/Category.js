import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    parentId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Category', 
        default: null 
    },
    // Useful for suggesting dynamic variant attributes 
    // e.g., if category is "Mobile", suggestedAttributes: ["Color", "Storage", "RAM"]
    suggestedAttributes: { 
        type: [String], 
        default: [] 
    },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Pre-save hook to generate slug if not provided
categorySchema.pre('validate', function (next) {
    if (this.name && !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove diacritics
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
    }
    next();
});

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
export default Category;
