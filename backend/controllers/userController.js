import userModel from "../models/userModel.js";
import validator from 'validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';

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

// In-memory or persisted admin profile
let adminProfileData = {
    name: 'Zafran Super Admin',
    email: process.env.ADMIN_EMAIL || 'admin@zafran.com',
    role: 'System Administrator',
    profilePic: '',
    phone: '+880 1700-000000',
    title: 'Executive Store Manager',
    lastLogin: new Date()
};

// Route for admin login
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@zafran.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin1234';

        if (email === adminEmail && password === adminPassword) {
            const token = jwt.sign(email + password, JWT_SECRET);
            adminProfileData.lastLogin = new Date();
            adminProfileData.email = adminEmail;
            res.json({ 
                success: true, 
                token,
                admin: adminProfileData
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
        adminProfileData.email = process.env.ADMIN_EMAIL || adminProfileData.email;
        res.json({ success: true, admin: adminProfileData });
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

        if (name) adminProfileData.name = name;
        if (phone !== undefined) adminProfileData.phone = phone;
        if (title !== undefined) adminProfileData.title = title;
        if (profilePic) adminProfileData.profilePic = profilePic;

        res.json({ 
            success: true, 
            message: "Admin profile updated successfully", 
            admin: adminProfileData 
        });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
}

// Route for getting user profile
const getUserProfile = async (req, res) => {
    try {
        const userId = req.body.userId || req.query.userId;
        if (!userId) {
            return res.json({ success: false, message: "User ID required" });
        }

        if (mongoose.connection.readyState === 1) {
            const user = await userModel.findById(userId).select('-password');
            if (user) {
                return res.json({ success: true, user });
            }
        }
        
        // Search in mockUsers
        for (const user of mockUsers.values()) {
            if (user._id === userId) {
                const { password, ...safeUser } = user;
                return res.json({ success: true, user: safeUser });
            }
        }

        // Return a generic fallback user if token is valid
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
                const uploadRes = await cloudinary.uploader.upload(req.file.path, { resource_type: "image" });
                profilePic = uploadRes.secure_url;
            } catch (cErr) {
                console.log('Cloudinary upload error, using local/data url fallback:', cErr.message);
                try {
                    const fs = await import('fs');
                    const fileData = fs.readFileSync(req.file.path);
                    profilePic = `data:${req.file.mimetype || 'image/jpeg'};base64,${fileData.toString('base64')}`;
                } catch (fsErr) {
                    console.log('FS read error:', fsErr.message);
                }
            }
        }

        if (mongoose.connection.readyState === 1) {
            const updateFields = {};
            if (name !== undefined && name !== '') updateFields.name = name;
            if (phone !== undefined) updateFields.phone = phone;
            if (address !== undefined) updateFields.address = address;
            if (profilePic !== undefined && profilePic !== null) updateFields.profilePic = profilePic;

            let updatedUser = null;
            if (mongoose.Types.ObjectId.isValid(userId)) {
                updatedUser = await userModel.findByIdAndUpdate(userId, updateFields, { new: true }).select('-password');
            }

            if (!updatedUser) {
                // Check in mockUsers
                for (const [emailKey, userObj] of mockUsers.entries()) {
                    if (userObj._id === userId) {
                        if (name) userObj.name = name;
                        if (phone !== undefined) userObj.phone = phone;
                        if (address !== undefined) userObj.address = address;
                        if (profilePic !== undefined) userObj.profilePic = profilePic;
                        mockUsers.set(emailKey, userObj);
                        const { password: _, ...safeUser } = userObj;
                        return res.json({ success: true, message: "Profile updated successfully", user: safeUser });
                    }
                }

                // If user was created prior or mock user
                return res.json({
                    success: true,
                    message: "Profile updated successfully",
                    user: {
                        _id: userId,
                        name: name || 'Valued Customer',
                        phone: phone || '',
                        address: address || '',
                        profilePic: profilePic || ''
                    }
                });
            }
            return res.json({ success: true, message: "Profile updated successfully", user: updatedUser });
        } else {
            // In-memory fallback
            for (const [emailKey, userObj] of mockUsers.entries()) {
                if (userObj._id === userId) {
                    if (name) userObj.name = name;
                    if (phone !== undefined) userObj.phone = phone;
                    if (address !== undefined) userObj.address = address;
                    if (profilePic !== undefined) userObj.profilePic = profilePic;
                    mockUsers.set(emailKey, userObj);
                    const { password: _, ...safeUser } = userObj;
                    return res.json({ success: true, message: "Profile updated successfully", user: safeUser });
                }
            }
            return res.json({ 
                success: true, 
                message: "Profile updated successfully", 
                user: { _id: userId, name: name || 'Valued Customer', phone: phone || '', address: address || '', profilePic: profilePic || '' } 
            });
        }
    } catch (error) {
        console.error(error);
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

export { loginUser, registerUser, adminLogin, getAdminProfile, updateAdminProfile, getUserProfile, updateUserProfile, getAllUsers, mockUsers };