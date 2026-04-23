import mongoose from "mongoose";

const brandSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    logo: { type: String, default: '' },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Pre-save hook to generate slug if not provided
brandSchema.pre('validate', function (next) {
    if (this.name && !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
    }
    next();
});

const Brand = mongoose.models.Brand || mongoose.model('Brand', brandSchema);
export default Brand;
