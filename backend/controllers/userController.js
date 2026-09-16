import userModel from "../models/userModel.js";
import validator from 'validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

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
            const token = createToken(user._id);
            return res.json({ success: true, token });
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
            const token = createToken(user._id);
            return res.json({ success: true, token });
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
        const { name, email, password } = req.body;
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
                password: hashedPassword
            });
            const user = await newUser.save();
            const token = createToken(user._id);
            return res.json({ success: true, token });
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
                cartData: {}
            };
            mockUsers.set(email, user);
            const token = createToken(fakeId);
            return res.json({ success: true, token });
        }
    }
    catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Route for admin login
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@zafran.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin1234';

        if (email === adminEmail && password === adminPassword) {
            const token = jwt.sign(email + password, JWT_SECRET);
            res.json({ success: true, token });
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

export { loginUser, registerUser, adminLogin, mockUsers };