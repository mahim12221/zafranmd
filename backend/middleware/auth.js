import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import userModel from '../models/userModel.js';

const authUser = async (req, res, next) => {
    const { token } = req.headers;
    if (!token) {
        return res.json({ success: false, message: 'Not Authorized Login Again' });
    }
    try {
        const secret = process.env.JWT_SECRET || 'zafran_jwt_secret_key';
        const token_decoded = jwt.verify(token, secret);
        
        // Verify user still exists in database
        if (mongoose.connection.readyState === 1 && token_decoded.id) {
            // Check if it's a valid object ID to avoid cast errors
            if (mongoose.Types.ObjectId.isValid(token_decoded.id)) {
                const user = await userModel.findById(token_decoded.id);
                if (!user) {
                    return res.json({ success: false, message: 'User account has been removed. Please login again.' });
                }
            } else {
                // For custom IDs (fallback), check by _id or email just in case
                const user = await userModel.findOne({ _id: token_decoded.id });
                if (!user) {
                    return res.json({ success: false, message: 'User account has been removed. Please login again.' });
                }
            }
        }

        if (!req.body) {
            req.body = {};
        }
        req.body.userId = token_decoded.id;
        req.userId = token_decoded.id;
        next();
    }
    catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export default authUser;