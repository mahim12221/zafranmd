import mongoose from "mongoose";

const adminProfileSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String, default: "Zafran Super Admin" },
    role: { type: String, default: "System Administrator" },
    title: { type: String, default: "Executive Store Manager" },
    phone: { type: String, default: "+880 1700-000000" },
    profilePic: { type: String, default: "" },
    lastLogin: { type: Date, default: Date.now }
}, { minimize: false, timestamps: true });

const adminProfileModel = mongoose.models.adminProfile || mongoose.model('adminProfile', adminProfileSchema);

export default adminProfileModel;
