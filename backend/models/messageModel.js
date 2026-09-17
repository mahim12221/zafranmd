import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  senderId: { type: String, required: true },
  receiverId: { type: String, required: true },
  messageType: { type: String, enum: ['text', 'image'], default: 'text' },
  text: { type: String, default: "" },
  fileUrl: { type: String, default: "" },
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
}, { timestamps: true });

const messageModel = mongoose.models.message || mongoose.model('message', messageSchema);
export default messageModel;
