import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String },
        price: { type: Number, required: true },
        category: { type: String, required: true },
        stock: { type: Number, default: 0 },
        images: [{ type: String }], // Array of image URLs
    },
    { timestamps: true }
);

export const Product = mongoose.model('Product', productSchema);