import messageModel from "../models/messageModel.js";
import conversationModel from "../models/conversationModel.js";
import { v2 as cloudinary } from "cloudinary";

// Send a message
const sendMessage = async (req, res) => {
    try {
        let { senderId, receiverId, text, messageType } = req.body;
        let fileUrl = "";

        // If message is image, upload it
        if (req.file && messageType === 'image') {
            const imageUpload = await cloudinary.uploader.upload(req.file.path, { resource_type: "image" });
            fileUrl = imageUpload.secure_url;
        }

        if (!text && !fileUrl) {
            return res.json({ success: false, message: "Empty message" });
        }

        // Find or create conversation
        let conversation = await conversationModel.findOne({
            participants: { $all: [senderId, receiverId] }
        });

        if (!conversation) {
            conversation = await conversationModel.create({
                participants: [senderId, receiverId],
                lastMessage: messageType === 'image' ? "📷 Image" : text,
                lastMessageTime: new Date()
            });
        } else {
            conversation.lastMessage = messageType === 'image' ? "📷 Image" : text;
            conversation.lastMessageTime = new Date();
            await conversation.save();
        }

        const newMessage = new messageModel({
            senderId,
            receiverId,
            messageType: messageType || 'text',
            text: text || "",
            fileUrl,
            conversationId: conversation._id
        });

        await newMessage.save();

        res.json({ success: true, message: newMessage });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Get messages for a specific conversation
const getMessages = async (req, res) => {
    try {
        const { userId1, userId2 } = req.params;
        
        const conversation = await conversationModel.findOne({
            participants: { $all: [userId1, userId2] }
        });

        if (!conversation) {
            return res.json({ success: true, messages: [] });
        }

        const messages = await messageModel.find({ conversationId: conversation._id }).sort({ createdAt: 1 });
        res.json({ success: true, messages });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Get all conversations (mostly for admin)
const getConversations = async (req, res) => {
    try {
        const { userId } = req.params; // usually "admin"
        const conversations = await conversationModel.find({
            participants: { $in: [userId] }
        }).sort({ lastMessageTime: -1 });

        res.json({ success: true, conversations });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Delete a conversation
const deleteConversation = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const messages = await messageModel.find({ conversationId });
        
        // Delete images from cloudinary
        for (const msg of messages) {
            if (msg.messageType === 'image' && msg.fileUrl) {
                try {
                    const publicId = msg.fileUrl.split('/').pop().split('.')[0];
                    await cloudinary.uploader.destroy(publicId);
                } catch (e) { console.log(e); }
            }
        }
        
        await messageModel.deleteMany({ conversationId });
        await conversationModel.findByIdAndDelete(conversationId);
        
        res.json({ success: true, message: "Conversation deleted" });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Delete a specific message
const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const msg = await messageModel.findById(messageId);
        if (!msg) return res.json({ success: false, message: "Message not found" });

        if (msg.messageType === 'image' && msg.fileUrl) {
            try {
                const publicId = msg.fileUrl.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(publicId);
            } catch (e) { console.log(e); }
        }

        await messageModel.findByIdAndDelete(messageId);
        res.json({ success: true, message: "Message deleted" });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Edit a specific message
const editMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { text } = req.body;
        
        const msg = await messageModel.findById(messageId);
        if (!msg) return res.json({ success: false, message: "Message not found" });
        if (msg.messageType === 'image') return res.json({ success: false, message: "Cannot edit image message text" });

        msg.text = text;
        await msg.save();
        
        res.json({ success: true, message: msg });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

export { sendMessage, getMessages, getConversations, deleteConversation, deleteMessage, editMessage };
