import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePic: { type: String, default: "" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    loginCount: { type: Number, default: 0 },
    lastLogin: { type: Date, default: Date.now },
    cartData: { type: Object, default: {} },
    createdAt: { type: Date, default: Date.now }
}, { minimize: false, timestamps: true });

const userModel = mongoose.models.user || mongoose.model('user', userSchema);

export default userModel;