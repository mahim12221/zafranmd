import userModel from "../models/userModel.js";
import mongoose from 'mongoose';

// In-memory fallback carts when MongoDB is offline
const mockCarts = new Map();

// add products to user cart
const addToCart = async (req, res) => {
    try{
        const { userId, itemId, size } = req.body;
        if (mongoose.connection.readyState === 1) {
            const userData = await userModel.findById(userId);
            let cartData = (userData && userData.cartData) ? userData.cartData : {};
            if(cartData[itemId]){
                if(cartData[itemId][size]){
                    cartData[itemId][size] += 1;
                }
                else{
                    cartData[itemId][size] = 1;
                }
            }
            else{
                cartData[itemId] = {};
                cartData[itemId][size] = 1;
            }
            await userModel.findByIdAndUpdate(userId, {cartData});
            return res.json({success: true, message: "Product added to cart successfully"});
        } else {
            let cartData = mockCarts.get(userId) || {};
            if(cartData[itemId]){
                if(cartData[itemId][size]){
                    cartData[itemId][size] += 1;
                }
                else{
                    cartData[itemId][size] = 1;
                }
            }
            else{
                cartData[itemId] = {};
                cartData[itemId][size] = 1;
            }
            mockCarts.set(userId, cartData);
            return res.json({success: true, message: "Product added to cart successfully"});
        }
    }
    catch(error){
        console.log(error)
        res.json({success: false, message: error.message});
    }
}

// update user cart
const updateCart = async (req, res) => {
    try{
        const { userId, itemId, size, quantity } = req.body
        if (mongoose.connection.readyState === 1) {
            const userData = await userModel.findById(userId);
            let cartData = (userData && userData.cartData) ? userData.cartData : {};
            if (!cartData[itemId]) {
                cartData[itemId] = {};
            }
            cartData[itemId][size] = quantity;
            await userModel.findByIdAndUpdate(userId, {cartData});
            return res.json({success: true, message: "Cart updated successfully"});
        } else {
            let cartData = mockCarts.get(userId) || {};
            if (!cartData[itemId]) {
                cartData[itemId] = {};
            }
            cartData[itemId][size] = quantity;
            mockCarts.set(userId, cartData);
            return res.json({success: true, message: "Cart updated successfully"});
        }
    }
    catch(error){
        console.log(error)
        res.json({success: false, message: error.message});
    }
}

// get user cart
const getUserCart = async (req, res) => {
    try{
        const { userId } = req.body;
        if (mongoose.connection.readyState === 1) {
            const userData = await userModel.findById(userId);
            let cartData = (userData && userData.cartData) ? userData.cartData : {};
            return res.json({success: true, cartData, message: cartData});
        } else {
            const cartData = mockCarts.get(userId) || {};
            return res.json({success: true, cartData, message: cartData});
        }
    }
    catch(error){
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

export { addToCart, updateCart, getUserCart, mockCarts }