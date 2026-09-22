import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    image: { type: Array, default: [] },
    images: { type: Array, default: [] },
    category: { type: String, required: true },
    subCategory: { type: String, required: true },
    sizes: { type: Array, required: true },
    colors: { type: Array, default: [] },
    bestseller: { type: Boolean, default: false },
    outOfStock: { type: Boolean, default: false },
    date: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    salesCount: { type: Number, default: 0 },
    categoryPath: { type: Array, default: [] }, // Array of selected menu path levels e.g. ["Phone Case", "iPhone", "iPhone 17"]
    reviews: [reviewSchema]
})

const productModel =mongoose.models.product || mongoose.model("product", productSchema);

export default productModel;