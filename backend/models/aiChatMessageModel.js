import mongoose from "mongoose";

const aiChatMessageSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  role: { type: String, enum: ['user', 'model'], required: true },
  text: { type: String, required: true },
  createdAt: { 
    type: Date, 
    default: Date.now, 
    expires: 86400 // 24 hours in seconds (MongoDB automatically purges after 24h)
  }
});

// Compound index for chronological querying by user
aiChatMessageSchema.index({ userId: 1, createdAt: 1 });

const aiChatMessageModel = mongoose.models.aiChatMessage || mongoose.model('aiChatMessage', aiChatMessageSchema);
export default aiChatMessageModel;
