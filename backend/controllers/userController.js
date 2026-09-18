import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import validator from 'validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import { mockCarts } from "./cartController.js";

const JWT_SECRET = process.env.JWT_SECRET || 'zafran_jwt_secret_key';

// In-memory fallback users for offline/container database
const mockUsers = new Map();

const createToken = (id) => {
    return jwt.sign({ id }, JWT_SECRET);
}

// Route for user login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (mongoose.connection.readyState === 1) {
            const user = await userModel.findOne({ email });
            if (!user) {
                return res.json({ success: false, message: "User doesn't exist" });
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.json({ success: false, message: "Invalid password" });
            }

            // Track login count and last login timestamp
            user.loginCount = (user.loginCount || 0) + 1;
            user.lastLogin = new Date();
            await user.save();

            const token = createToken(user._id);
            return res.json({ success: true, token, user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                profilePic: user.profilePic || '',
                phone: user.phone || '',
                address: user.address || '',
                loginCount: user.loginCount,
                lastLogin: user.lastLogin
            }});
        } else {
            // In-memory fallback
            const user = mockUsers.get(email);
            if (!user) {
                return res.json({ success: false, message: "User doesn't exist" });
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.json({ success: false, message: "Invalid password" });
            }

            user.loginCount = (user.loginCount || 0) + 1;
            user.lastLogin = new Date();
            mockUsers.set(email, user);

            const token = createToken(user._id);
            const { password: _, ...safeUser } = user;
            return res.json({ success: true, token, user: safeUser });
        }
    }
    catch (err) {
        console.error(err);
        res.json({ success: false, message: err.message });
    }
}

// Route for user register
const registerUser = async (req, res) => {
    try {
        const { name, email, password, phone, address } = req.body;
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        if (mongoose.connection.readyState === 1) {
            const exists = await userModel.findOne({ email });
            if (exists) {
                return res.json({ success: false, message: "User already exists" });
            }
            const newUser = new userModel({
                name,
                email,
                password: hashedPassword,
                phone: phone || '',
                address: address || '',
                profilePic: '',
                loginCount: 1,
                lastLogin: new Date(),
                createdAt: new Date()
            });
            const user = await newUser.save();
            const token = createToken(user._id);
            return res.json({ success: true, token, user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                profilePic: user.profilePic || '',
                phone: user.phone || '',
                address: user.address || '',
                loginCount: user.loginCount,
                lastLogin: user.lastLogin
            }});
        } else {
            // In-memory fallback
            if (mockUsers.has(email)) {
                return res.json({ success: false, message: "User already exists" });
            }
            const fakeId = 'usr_' + Date.now();
            const user = {
                _id: fakeId,
                name,
                email,
                password: hashedPassword,
                phone: phone || '',
                address: address || '',
                profilePic: '',
                loginCount: 1,
                lastLogin: new Date(),
                createdAt: new Date(),
                cartData: {}
            };
            mockUsers.set(email, user);
            const token = createToken(fakeId);
            const { password: _, ...safeUser } = user;
            return res.json({ success: true, token, user: safeUser });
        }
    }
    catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

import adminProfileModel from "../models/adminProfileModel.js";
import fs from 'fs';
import path from 'path';

const ADMIN_PROFILE_FILE = path.resolve('./adminProfile.json');

const loadAdminProfileFromFile = () => {
    try {
        if (fs.existsSync(ADMIN_PROFILE_FILE)) {
            const raw = fs.readFileSync(ADMIN_PROFILE_FILE, 'utf8');
            return JSON.parse(raw);
        }
    } catch (e) {
        console.log('Error reading adminProfile.json:', e.message);
    }
    return {
        name: 'Zafran Super Admin',
        email: process.env.ADMIN_EMAIL || 'admin@zafran.com',
        role: 'System Administrator',
        profilePic: '',
        phone: '+880 1700-000000',
        title: 'Executive Store Manager',
        lastLogin: new Date()
    };
};

let fallbackAdminProfileData = loadAdminProfileFromFile();

const saveAdminProfileToFile = (data) => {
    try {
        fs.writeFileSync(ADMIN_PROFILE_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
        console.log('Error saving adminProfile.json:', e.message);
    }
};

const getAdminProfileData = async () => {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@zafran.com';
    if (mongoose.connection.readyState === 1) {
        let profile = await adminProfileModel.findOne({ email: adminEmail });
        if (!profile) {
            profile = await adminProfileModel.create({
                email: adminEmail,
                ...fallbackAdminProfileData,
                _id: undefined // Let mongo create it
            });
        }
        return profile;
    }
    fallbackAdminProfileData.email = adminEmail;
    return fallbackAdminProfileData;
};

// Route for admin login
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@zafran.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin1234';

        if (email === adminEmail && password === adminPassword) {
            const token = jwt.sign(email + password, JWT_SECRET);
            
            const profile = await getAdminProfileData();
            if (mongoose.connection.readyState === 1) {
                profile.lastLogin = new Date();
                await profile.save();
            } else {
                fallbackAdminProfileData.lastLogin = new Date();
                saveAdminProfileToFile(fallbackAdminProfileData);
            }

            res.json({ 
                success: true, 
                token,
                admin: profile
            });
        }
        else {
            res.json({ success: false, message: "Invalid email or password" });
        }
    }
    catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Route for getting dedicated admin profile
const getAdminProfile = async (req, res) => {
    try {
        const profile = await getAdminProfileData();
        res.json({ success: true, admin: profile });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Route for updating dedicated admin profile
const updateAdminProfile = async (req, res) => {
    try {
        const { name, phone, title } = req.body || {};
        let profilePic = req.body?.profilePic;

        if (req.file) {
            try {
                const uploadRes = await cloudinary.uploader.upload(req.file.path, { resource_type: 'image' });
                profilePic = uploadRes.secure_url;
            } catch (cErr) {
                console.log('Cloudinary upload fallback for admin avatar:', cErr.message);
                try {
                    const fs = await import('fs');
                    const fileData = fs.readFileSync(req.file.path);
                    profilePic = `data:${req.file.mimetype || 'image/jpeg'};base64,${fileData.toString('base64')}`;
                } catch (fsErr) {
                    console.log('FS read error:', fsErr.message);
                }
            }
        }

        const profile = await getAdminProfileData();
        
        if (mongoose.connection.readyState === 1) {
            if (name) profile.name = name;
            if (phone !== undefined) profile.phone = phone;
            if (title !== undefined) profile.title = title;
            if (profilePic) profile.profilePic = profilePic;
            await profile.save();
        } else {
            if (name) fallbackAdminProfileData.name = name;
            if (phone !== undefined) fallbackAdminProfileData.phone = phone;
            if (title !== undefined) fallbackAdminProfileData.title = title;
            if (profilePic) fallbackAdminProfileData.profilePic = profilePic;
            saveAdminProfileToFile(fallbackAdminProfileData);
        }

        res.json({ 
            success: true, 
            message: "Admin profile updated successfully", 
            admin: profile 
        });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
}

// Route for getting user profile
const getUserProfile = async (req, res) => {
    try {
        const userId = req.params.userId || req.body.userId || req.query.userId || req.userId;
        if (!userId) {
            return res.json({ success: false, message: "User ID required" });
        }

        if (mongoose.connection.readyState === 1) {
            if (mongoose.Types.ObjectId.isValid(userId)) {
                const user = await userModel.findById(userId).select('-password');
                if (user) {
                    return res.json({ success: true, user });
                }
            }
            const userById = await userModel.findOne({ _id: userId }).select('-password');
            if (userById) {
                return res.json({ success: true, user: userById });
            }
            const userByEmail = await userModel.findOne({ email: String(userId).toLowerCase() }).select('-password');
            if (userByEmail) {
                return res.json({ success: true, user: userByEmail });
            }
        }
        
        // Search in mockUsers
        for (const user of mockUsers.values()) {
            if (String(user._id) === String(userId) || (user.email && user.email.toLowerCase() === String(userId).toLowerCase())) {
                const { password, ...safeUser } = user;
                return res.json({ success: true, user: safeUser });
            }
        }

        // Check if user has orders with customer address details
        if (mongoose.connection.readyState === 1) {
            try {
                const lastOrder = await orderModel.findOne({ userId }).sort({ date: -1 });
                if (lastOrder && lastOrder.address) {
                    const custName = `${lastOrder.address.firstName || ''} ${lastOrder.address.lastName || ''}`.trim() || 'Valued Customer';
                    return res.json({
                        success: true,
                        user: {
                            _id: userId,
                            name: custName,
                            email: lastOrder.address.email || 'customer@zafran.com',
                            phone: lastOrder.address.phone || '',
                            address: `${lastOrder.address.street || lastOrder.address.detailedAddress || ''}, ${lastOrder.address.district || lastOrder.address.city || ''}`,
                            profilePic: '',
                            role: 'Customer'
                        }
                    });
                }
            } catch (oErr) {
                console.log('Order lookup fallback error:', oErr.message);
            }
        }

        // Return fallback user if token is valid
        res.json({
            success: true,
            user: {
                _id: userId,
                name: 'Valued Customer',
                email: 'customer@zafran.com',
                profilePic: '',
                phone: '',
                address: '',
                loginCount: 1,
                lastLogin: new Date(),
                createdAt: new Date(),
                role: 'Customer'
            }
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Route for updating user profile (including avatar)
const updateUserProfile = async (req, res) => {
    try {
        let userId = req.userId || req.body?.userId;
        if (!userId && req.headers?.token) {
            try {
                const secret = process.env.JWT_SECRET || 'zafran_jwt_secret_key';
                const token_decoded = jwt.verify(req.headers.token, secret);
                userId = token_decoded.id;
            } catch (tErr) {
                console.log('Token decode error in updateUserProfile:', tErr.message);
            }
        }

        if (!userId) {
            return res.json({ success: false, message: "User not authorized" });
        }

        const { name, phone, address } = req.body || {};
        let profilePic = req.body?.profilePic;

        if (req.file) {
            try {
                if (process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_NAME) {
                    const uploadRes = await cloudinary.uploader.upload(req.file.path, { resource_type: "image" });
                    profilePic = uploadRes.secure_url;
                } else {
                    const fs = await import('fs');
                    if (req.file.path && fs.existsSync(req.file.path)) {
                        const fileData = fs.readFileSync(req.file.path);
                        profilePic = `data:${req.file.mimetype || 'image/jpeg'};base64,${fileData.toString('base64')}`;
                    }
                }
            } catch (cErr) {
                console.log('Cloudinary upload error, using local/data url fallback:', cErr.message);
                try {
                    const fs = await import('fs');
                    if (req.file.path && fs.existsSync(req.file.path)) {
                        const fileData = fs.readFileSync(req.file.path);
                        profilePic = `data:${req.file.mimetype || 'image/jpeg'};base64,${fileData.toString('base64')}`;
                    }
                } catch (fsErr) {
                    console.log('FS read error:', fsErr.message);
                }
            }
        }

        const updateFields = {};
        if (name !== undefined && name !== '') updateFields.name = name;
        if (phone !== undefined) updateFields.phone = phone;
        if (address !== undefined) updateFields.address = address;
        if (profilePic !== undefined && profilePic !== null) updateFields.profilePic = profilePic;

        let updatedUser = null;

        if (mongoose.connection.readyState === 1) {
            if (mongoose.Types.ObjectId.isValid(userId)) {
                updatedUser = await userModel.findByIdAndUpdate(userId, updateFields, { new: true }).select('-password');
            }
            if (!updatedUser) {
                updatedUser = await userModel.findOneAndUpdate({ _id: userId }, updateFields, { new: true }).select('-password');
            }
        }

        // Search and update mockUsers
        for (const [emailKey, userObj] of mockUsers.entries()) {
            if (userObj._id === userId) {
                if (name) userObj.name = name;
                if (phone !== undefined) userObj.phone = phone;
                if (address !== undefined) userObj.address = address;
                if (profilePic !== undefined) userObj.profilePic = profilePic;
                mockUsers.set(emailKey, userObj);
                if (!updatedUser) {
                    const { password: _, ...safeUser } = userObj;
                    updatedUser = safeUser;
                }
            }
        }

        if (!updatedUser) {
            updatedUser = {
                _id: userId,
                name: name || 'Valued Customer',
                phone: phone || '',
                address: address || '',
                profilePic: profilePic || ''
            };
        }

        return res.json({ success: true, message: "Profile updated successfully", user: updatedUser });
    } catch (error) {
        console.error('updateUserProfile error:', error);
        res.json({ success: false, message: error.message });
    }
}

// Route for admin to get all users, login statistics, and overview (READ ONLY)
const getAllUsers = async (req, res) => {
    try {
        let users = [];
        let totalLogins = 0;

        if (mongoose.connection.readyState === 1) {
            users = await userModel.find({}).select('-password').sort({ createdAt: -1 });
            totalLogins = users.reduce((acc, curr) => acc + (curr.loginCount || 1), 0);
        } else {
            // In-memory fallback
            for (const user of mockUsers.values()) {
                const { password, ...safeUser } = user;
                users.push(safeUser);
            }
            totalLogins = users.reduce((acc, curr) => acc + (curr.loginCount || 1), 0);
        }

        return res.json({
            success: true,
            users,
            totalUsers: users.length,
            totalLogins
        });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
}

// Route for admin to delete/remove a user account
const deleteUser = async (req, res) => {
    try {
        const { userId, email } = req.body;
        if (!userId && !email) {
            return res.json({ success: false, message: "User ID or Email is required" });
        }

        let deleted = false;

        if (mongoose.connection.readyState === 1) {
            const queryConditions = [];
            if (userId && mongoose.Types.ObjectId.isValid(userId)) {
                queryConditions.push({ _id: userId });
            }
            if (email) {
                queryConditions.push({ email: email.toLowerCase().trim() });
            }
            if (queryConditions.length > 0) {
                const result = await userModel.deleteMany({ $or: queryConditions });
                if (result.deletedCount > 0) {
                    deleted = true;
                }
            }
        }

        // Also delete from in-memory fallback mockUsers
        for (const [key, val] of mockUsers.entries()) {
            if (
                (userId && String(val._id) === String(userId)) ||
                (email && val.email?.toLowerCase().trim() === email.toLowerCase().trim()) ||
                key.toLowerCase().trim() === (email || '').toLowerCase().trim()
            ) {
                mockUsers.delete(key);
                deleted = true;
            }
        }

        return res.json({
            success: true,
            message: "User account removed successfully. The user can register freshly with this email later."
        });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
}

export { loginUser, registerUser, adminLogin, getAdminProfile, updateAdminProfile, getUserProfile, updateUserProfile, getAllUsers, deleteUser, mockUsers, resetPassword };
// Reset password for demo purposes
const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        
        if (!email || !newPassword) {
            return res.json({ success: false, message: "Please provide both email and new password." });
        }
        
        if (newPassword.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password (min 8 chars)" });
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        
        if (mongoose.connection.readyState === 1) {
            const user = await userModel.findOne({ email });
            if (!user) {
                return res.json({ success: false, message: "No account found with that email." });
            }
            
            user.password = hashedPassword;
            await user.save();
            return res.json({ success: true, message: "Password reset successful!" });
        } else {
            // Mock fallback
            const existingUser = Array.from(mockUsers.values()).find(u => u.email === email);
            if (!existingUser) {
                return res.json({ success: false, message: "No account found with that email." });
            }
            existingUser.password = hashedPassword;
            return res.json({ success: true, message: "Password reset successful!" });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}
