import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: Array, required: true },
    price: { type: Number, required: true },
    offerPrice: { type: Number, required: true },
    image: { type: Array, required: true },
    category: { type: String, required: true },
    brand: { type: String, default: "" },
    specs: { type: Object, default: {} },
    inStock: { type: Boolean, default: true },
    avgRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
}, { timestamps: true });

const Product = mongoose.models.product || mongoose.model('product', productSchema)

export default Product