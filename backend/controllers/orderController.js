import orderModel from "../models/orderModel.js"
import userModel from "../models/userModel.js"
import mongoose from "mongoose"
import { mockCarts } from "./cartController.js"

// In-memory fallback orders
let mockOrders = [];

// 8 days in milliseconds
const EIGHT_DAYS_MS = 8 * 24 * 60 * 60 * 1000;

// Helper to clean up delivered orders older than 8 days to save database storage
const cleanupOldDeliveredOrders = async () => {
    try {
        const expiryThreshold = new Date(Date.now() - EIGHT_DAYS_MS);
        if (mongoose.connection.readyState === 1) {
            // Delete delivered orders whose deliveredDate or order date is older than 8 days
            await orderModel.deleteMany({
                status: 'Delivered',
                $or: [
                    { deliveredDate: { $lte: expiryThreshold } },
                    { deliveredDate: { $exists: false }, date: { $lte: expiryThreshold } }
                ]
            });
        }
        // Clean up mock fallback orders as well
        const now = Date.now();
        mockOrders = mockOrders.filter(o => {
            if (o.status === 'Delivered') {
                const deliveredTime = o.deliveredDate ? new Date(o.deliveredDate).getTime() : new Date(o.date).getTime();
                if (now - deliveredTime >= EIGHT_DAYS_MS) {
                    return false; // Remove order to free storage
                }
            }
            return true;
        });
    } catch (err) {
        console.log('Error cleaning up old delivered orders:', err.message);
    }
};

// Run cleanup periodically every hour
setInterval(cleanupOldDeliveredOrders, 60 * 60 * 1000);


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
        await cleanupOldDeliveredOrders();
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
        await cleanupOldDeliveredOrders();
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

// Cancel order by customer
const cancelOrderUser = async (req, res) => {
    try {
        const { userId, orderId, reason } = req.body;
        if (!orderId) {
            return res.json({ success: false, message: "Order ID is required" });
        }

        let orderFound = false;

        if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(orderId)) {
            const existingOrder = await orderModel.findById(orderId);
            if (existingOrder) {
                if (existingOrder.userId && existingOrder.userId !== userId) {
                    return res.json({ success: false, message: "Unauthorized to cancel this order" });
                }
                if (existingOrder.status === 'Delivered') {
                    return res.json({ success: false, message: "Delivered orders cannot be cancelled" });
                }
                if (existingOrder.status === 'Cancelled' || existingOrder.status?.startsWith('Cancelled')) {
                    return res.json({ success: false, message: "Order is already cancelled" });
                }
                existingOrder.status = 'Cancelled';
                existingOrder.cancelReason = reason || 'Cancelled by Customer';
                await existingOrder.save();
                orderFound = true;
            }
        }

        // Also update in mock fallback orders
        const mockOrder = mockOrders.find(o => o._id === orderId);
        if (mockOrder) {
            if (mockOrder.status === 'Delivered') {
                return res.json({ success: false, message: "Delivered orders cannot be cancelled" });
            }
            if (mockOrder.status === 'Cancelled' || mockOrder.status?.startsWith('Cancelled')) {
                return res.json({ success: false, message: "Order is already cancelled" });
            }
            mockOrder.status = 'Cancelled';
            mockOrder.cancelReason = reason || 'Cancelled by Customer';
            orderFound = true;
        }

        if (!orderFound) {
            return res.json({ success: false, message: "Order not found" });
        }

        res.json({ success: true, message: "Order cancelled successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Update order status
const updateStatus = async (req, res) => {
    try{
        const {orderId, status, cancelReason} = req.body
        const updateData = { status };
        if (status === 'Delivered') {
            updateData.deliveredDate = new Date();
        }
        if (cancelReason || status === 'Cancelled' || status?.startsWith('Cancelled')) {
            updateData.cancelReason = cancelReason || 'Cancelled by Admin';
        }

        if (mongoose.connection.readyState === 1) {
            if (mongoose.Types.ObjectId.isValid(orderId)) {
                await orderModel.findByIdAndUpdate(orderId, updateData)
            }
        }
        const order = mockOrders.find(o => o._id === orderId);
        if (order) {
            order.status = status;
            if (status === 'Delivered') {
                order.deliveredDate = new Date();
            }
            if (cancelReason || status === 'Cancelled' || status?.startsWith('Cancelled')) {
                order.cancelReason = cancelReason || 'Cancelled by Admin';
            }
        }
        await cleanupOldDeliveredOrders();
        res.json({success: true, message: status === 'Delivered' ? "Order marked as Delivered (auto-cleans after 8 days to save storage)" : status?.startsWith('Cancelled') ? "Order Cancelled / Rejected" : "Order Status Updated"})
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

export {placeOrder, placeOrderRazorpay, placeOrderStripe, allOrders, updateStatus, userOrders, cancelOrderUser, getSettings, updateSettings, mockOrders}