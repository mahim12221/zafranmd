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
            _id: 'ord_' + Date.now(),
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
        
        mockOrders.unshift(orderData);
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

export {placeOrder, placeOrderRazorpay, placeOrderStripe, allOrders, updateStatus, userOrders, mockOrders}