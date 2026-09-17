import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
  participants: [{ type: String, required: true }],
  lastMessage: { type: String, default: "" },
  lastMessageTime: { type: Date, default: Date.now },
}, { timestamps: true });

const conversationModel = mongoose.models.conversation || mongoose.model('conversation', conversationSchema);
export default conversationModel;
