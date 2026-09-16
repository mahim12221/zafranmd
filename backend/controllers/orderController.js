import orderModel from "../models/orderModel.js"
import userModel from "../models/userModel.js"
import mongoose from "mongoose"
import { mockCarts } from "./cartController.js"

// In-memory fallback orders
let mockOrders = [];

const placeOrder = async (req, res) => {
    try {
        const { userId, items, amount, address} = req.body
        const orderData = {
            userId,
            items,
            amount,
            address,
            paymentMethod: "COD",
            payment: false,
            status: "Order Placed",
            date: Date.now()
        }

        if (mongoose.connection.readyState === 1) {
            const newOrder = new orderModel(orderData)
            await newOrder.save()
            await userModel.findByIdAndUpdate(userId, {cartData: {}})
        }
        
        mockOrders.unshift({ ...orderData, _id: 'ord_' + Date.now() });
        mockCarts.set(userId, {});

        res.json({success: true, message: "Order Placed"})
    }
    catch (error){
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

// Placing orders using stripe method
const placeOrderStripe = async (req, res) => {
    res.json({ success: false, message: "Stripe not configured in demo" });
}

// Placing orders using Razorpay method
const placeOrderRazorpay = async (req, res) => {
    res.json({ success: false, message: "Razorpay not configured in demo" });
}

// All orders data for admin panel
const allOrders = async (req, res) => {
    try{
        if (mongoose.connection.readyState === 1) {
            const orders = await orderModel.find({})
            if (orders && orders.length > 0) {
                return res.json({success: true, orders})
            }
        }
        res.json({success: true, orders: mockOrders})
    }
    catch(error){
        console.log(error)
        res.json({success: true, orders: mockOrders})
    }
}

// User order data for frontend
const userOrders = async (req, res) => {
    try{
        const {userId} = req.body
        if (mongoose.connection.readyState === 1) {
            const orders = await orderModel.find({userId})
            if (orders && orders.length > 0) {
                return res.json({success: true, orders})
            }
        }
        const orders = mockOrders.filter(o => o.userId === userId);
        res.json({success: true, orders})
    }
    catch (error){
        console.log(error)
        res.json({success: true, orders: []})
    }
}

// Update order status
const updateStatus = async (req, res) => {
    try{
        const {orderId, status} = req.body
        if (mongoose.connection.readyState === 1) {
            await orderModel.findByIdAndUpdate(orderId, {status})
        }
        const order = mockOrders.find(o => o._id === orderId);
        if (order) {
            order.status = status;
        }
        res.json({success: true, message: "Order Status Updated"})
    }
    catch (error){
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

// App settings (Delivery Fee, etc.)
let appSettings = {
    deliveryFee: 60,
    deliveryFeeDhaka: 60,
    deliveryFeeOutside: 120,
    freeDeliveryThreshold: 2000
};

const getSettings = async (req, res) => {
    res.json({ success: true, settings: appSettings });
};

const updateSettings = async (req, res) => {
    try {
        const { deliveryFee, deliveryFeeDhaka, deliveryFeeOutside, freeDeliveryThreshold } = req.body;
        if (deliveryFee !== undefined) appSettings.deliveryFee = Number(deliveryFee);
        if (deliveryFeeDhaka !== undefined) appSettings.deliveryFeeDhaka = Number(deliveryFeeDhaka);
        if (deliveryFeeOutside !== undefined) appSettings.deliveryFeeOutside = Number(deliveryFeeOutside);
        if (freeDeliveryThreshold !== undefined) appSettings.freeDeliveryThreshold = Number(freeDeliveryThreshold);
        res.json({ success: true, message: "Delivery settings updated successfully", settings: appSettings });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export {placeOrder, placeOrderRazorpay, placeOrderStripe, allOrders, updateStatus, userOrders, getSettings, updateSettings, mockOrders}