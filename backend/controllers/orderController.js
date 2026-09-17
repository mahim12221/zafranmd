import orderModel from "../models/orderModel.js"
import userModel from "../models/userModel.js"
import productModel from "../models/productModel.js"
import mongoose from "mongoose"
import { mockCarts } from "./cartController.js"
import { mockProducts } from "./productController.js"

// In-memory fallback orders
let mockOrders = [];

// Time constants
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000; // 24 hours for cancelled orders
const EIGHT_DAYS_MS = 8 * 24 * 60 * 60 * 1000;       // 8 days for delivered orders

// Helper to clean up cancelled orders (older than 24h) and delivered orders (older than 8d)
const cleanupExpiredOrders = async () => {
    try {
        const now = Date.now();
        const cancelledExpiryThreshold = new Date(now - TWENTY_FOUR_HOURS_MS);
        const deliveredExpiryThreshold = new Date(now - EIGHT_DAYS_MS);

        if (mongoose.connection.readyState === 1) {
            // Delete cancelled orders older than 24 hours
            await orderModel.deleteMany({
                $or: [
                    { status: 'Cancelled' },
                    { status: { $regex: /^Cancelled/i } },
                    { status: { $regex: /^Order Cancelled/i } }
                ],
                $or: [
                    { cancelledDate: { $lte: cancelledExpiryThreshold } },
                    { cancelledDate: { $exists: false }, date: { $lte: cancelledExpiryThreshold } },
                    { updatedAt: { $lte: cancelledExpiryThreshold } }
                ]
            });

            // Delete delivered orders older than 8 days
            await orderModel.deleteMany({
                status: 'Delivered',
                $or: [
                    { deliveredDate: { $lte: deliveredExpiryThreshold } },
                    { deliveredDate: { $exists: false }, date: { $lte: deliveredExpiryThreshold } }
                ]
            });
        }

        // Clean up mock fallback orders as well
        mockOrders = mockOrders.filter(o => {
            const statusStr = String(o.status || '').toLowerCase();
            const isCancelled = statusStr === 'cancelled' || statusStr.includes('cancel');
            if (isCancelled) {
                const cancelTime = o.cancelledDate ? new Date(o.cancelledDate).getTime() : new Date(o.date).getTime();
                if (now - cancelTime >= TWENTY_FOUR_HOURS_MS) {
                    return false; // Remove cancelled order after 24 hours
                }
            }
            if (o.status === 'Delivered') {
                const deliveredTime = o.deliveredDate ? new Date(o.deliveredDate).getTime() : new Date(o.date).getTime();
                if (now - deliveredTime >= EIGHT_DAYS_MS) {
                    return false; // Remove delivered order after 8 days
                }
            }
            return true;
        });
    } catch (err) {
        console.log('Error cleaning up expired orders:', err.message);
    }
};

// Run cleanup periodically every 15 minutes
setInterval(cleanupExpiredOrders, 15 * 60 * 1000);


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

        let savedOrderId = 'ord_' + Date.now();
        if (mongoose.connection.readyState === 1) {
            const newOrder = new orderModel(orderData)
            const saved = await newOrder.save()
            savedOrderId = saved._id.toString();
            await userModel.findByIdAndUpdate(userId, {cartData: {}})
        }
        
        mockOrders.unshift({ ...orderData, _id: savedOrderId });
        mockCarts.set(userId, {});

        // Increment salesCount for each ordered product
        if (Array.isArray(items)) {
            for (const item of items) {
                const prodId = item._id || item.itemId || item.id;
                const qty = Number(item.quantity) || 1;
                if (prodId) {
                    if (mongoose.connection.readyState === 1) {
                        try {
                            if (mongoose.Types.ObjectId.isValid(prodId)) {
                                await productModel.findByIdAndUpdate(prodId, { $inc: { salesCount: qty } });
                            } else {
                                await productModel.findOneAndUpdate({ _id: prodId }, { $inc: { salesCount: qty } });
                            }
                        } catch (pErr) {
                            console.log('Error updating salesCount:', pErr.message);
                        }
                    }
                    const mockProd = mockProducts.find(p => String(p._id) === String(prodId));
                    if (mockProd) {
                        mockProd.salesCount = (mockProd.salesCount || 0) + qty;
                    }
                }
            }
        }

        res.json({success: true, message: "Order Placed", orderId: savedOrderId})
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
        await cleanupExpiredOrders();
        if (mongoose.connection.readyState === 1) {
            const orders = await orderModel.find({}).sort({ date: -1 })
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
        await cleanupExpiredOrders();
        const {userId} = req.body
        if (mongoose.connection.readyState === 1) {
            const query = mongoose.Types.ObjectId.isValid(userId)
                ? { $or: [{ userId: userId }, { userId: new mongoose.Types.ObjectId(userId) }, { userId: String(userId) }] }
                : { userId: String(userId) };
            const orders = await orderModel.find(query).sort({ date: -1 })
            if (orders && orders.length > 0) {
                return res.json({success: true, orders})
            }
        }
        const orders = mockOrders.filter(o => String(o.userId) === String(userId));
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

        if (mongoose.connection.readyState === 1) {
            let existingOrder = null;
            if (mongoose.Types.ObjectId.isValid(orderId)) {
                existingOrder = await orderModel.findById(orderId);
            }
            if (!existingOrder) {
                existingOrder = await orderModel.findOne({ _id: orderId });
            }

            if (existingOrder) {
                // Ensure userId matches using string comparison
                if (existingOrder.userId && String(existingOrder.userId) !== String(userId)) {
                    return res.json({ success: false, message: "Unauthorized to cancel this order" });
                }
                if (existingOrder.status === 'Delivered') {
                    return res.json({ success: false, message: "Delivered orders cannot be cancelled" });
                }
                if (existingOrder.status === 'Cancelled' || existingOrder.status?.startsWith('Cancelled')) {
                    return res.json({ success: false, message: "Order is already cancelled" });
                }
                existingOrder.status = 'Cancelled';
                existingOrder.cancelledDate = new Date();
                existingOrder.cancelReason = reason || 'Cancelled by Customer';
                await existingOrder.save();
                orderFound = true;
            }
        }

        // Also update in mock fallback orders by matching string IDs
        const mockOrder = mockOrders.find(o => String(o._id) === String(orderId));
        if (mockOrder) {
            if (mockOrder.status === 'Delivered') {
                return res.json({ success: false, message: "Delivered orders cannot be cancelled" });
            }
            if (mockOrder.status === 'Cancelled' || mockOrder.status?.startsWith('Cancelled')) {
                return res.json({ success: false, message: "Order is already cancelled" });
            }
            mockOrder.status = 'Cancelled';
            mockOrder.cancelledDate = new Date();
            mockOrder.cancelReason = reason || 'Cancelled by Customer';
            orderFound = true;
        }

        if (!orderFound) {
            return res.json({ success: false, message: "Order not found" });
        }

        await cleanupExpiredOrders();
        res.json({ success: true, message: "Order cancelled successfully (will auto-delete after 24h)" });
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
            updateData.cancelledDate = new Date();
            updateData.cancelReason = cancelReason || 'Cancelled by Admin';
        }

        let orderFound = false;

        if (mongoose.connection.readyState === 1) {
            if (mongoose.Types.ObjectId.isValid(orderId)) {
                const updated = await orderModel.findByIdAndUpdate(orderId, updateData, { new: true })
                if (updated) orderFound = true;
            } else {
                const updated = await orderModel.findOneAndUpdate({ _id: orderId }, updateData, { new: true })
                if (updated) orderFound = true;
            }
        }
        const order = mockOrders.find(o => String(o._id) === String(orderId));
        if (order) {
            order.status = status;
            if (status === 'Delivered') {
                order.deliveredDate = new Date();
            }
            if (cancelReason || status === 'Cancelled' || status?.startsWith('Cancelled')) {
                order.cancelledDate = new Date();
                order.cancelReason = cancelReason || 'Cancelled by Admin';
            }
            orderFound = true;
        }
        await cleanupExpiredOrders();
        res.json({success: true, message: status === 'Delivered' ? "Order marked as Delivered (auto-cleans after 8 days)" : status?.startsWith('Cancelled') ? "Order Cancelled (auto-deletes after 24 hours)" : "Order Status Updated"})
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