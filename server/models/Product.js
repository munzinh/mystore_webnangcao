import mongoose from "mongoose";

const variantSchema = new mongoose.Schema({
    sku: { type: String, unique: true, required: true },
    attributes: {
        type: Map,
        of: String,
        default: {}, // e.g. { "Color": "Red", "Storage": "128GB" }
    },
    variantLabel: { type: String, default: '' },
    price: { type: Number, required: true },
    offerPrice: { type: Number, required: true },
    inStock: { type: Number, default: 0 },
    images: { type: [String], default: [] } // Option for variant-specific imagery
}, { _id: true, timestamps: true });

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: [String], required: true },
    
    // Base global values (calculated from variants when saving/updating)
    price: { type: Number, required: true },
    offerPrice: { type: Number, required: true },
    inStock: { type: Boolean, default: true },

    // Pricing & Scheduling logic 
    discountPercentage: { type: Number, default: 0 }, 
    flashSalePrice: { type: Number, default: null },
    flashSaleStartTime: { type: Date, default: null },
    flashSaleEndTime: { type: Date, default: null },

    image: { type: [String], required: true }, // Global product images
    
    // Relationships
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },

    specs: { 
        type: Map, 
        of: String, 
        default: {} 
    }, // e.g {"Screen": "6.1 OLED", "Processor": "A16"}
    
    tags: { type: [String], default: [] },
    
    // Scalable variants matrix
    variants: { type: [variantSchema], default: [] },

    avgRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
}, { timestamps: true });

// Search Index
productSchema.index({ category: 1, brand: 1 });
productSchema.index({ name: 'text', tags: 'text' });

const Product = mongoose.models.product || mongoose.model('product', productSchema);

export default Product;