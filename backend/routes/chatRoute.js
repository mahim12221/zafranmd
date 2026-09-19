import express from 'express';
import { sendMessage, getMessages, getConversations, deleteConversation, deleteMessage, editMessage } from '../controllers/chatController.js';
import { sendAiMessage, getAiHistory, clearAiHistory } from '../controllers/aiChatController.js';
import upload from '../middleware/multer.js';

const chatRouter = express.Router();

chatRouter.post('/send', upload.single('image'), sendMessage);
chatRouter.get('/messages/:userId1/:userId2', getMessages);
chatRouter.get('/conversations/:userId', getConversations);
chatRouter.delete('/conversation/:conversationId', deleteConversation);
chatRouter.delete('/message/:messageId', deleteMessage);
chatRouter.put('/message/:messageId', editMessage);

// Gemini AI Chatbot routes
chatRouter.post('/ai/message', sendAiMessage);
chatRouter.get('/ai/history/:userId', getAiHistory);
chatRouter.post('/ai/clear', clearAiHistory);

export default chatRouter;
