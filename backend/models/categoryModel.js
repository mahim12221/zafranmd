import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, default: null }, // null means top-level navbar item
    level: { type: Number, default: 1 }, // 1, 2, 3, or 4
    order: { type: Number, default: 0 }
});

const dynamicCategoryModel = mongoose.models.dynamicCategory || mongoose.model("dynamicCategory", categorySchema);

export default dynamicCategoryModel;
