import { GoogleGenAI } from '@google/genai';
import aiChatMessageModel from '../models/aiChatMessageModel.js';
import productModel from '../models/productModel.js';
import mongoose from 'mongoose';

// In-memory fallback if MongoDB connection is pending/offline
const inMemoryAiHistory = new Map(); // userId => Array of { id, role, text, createdAt }

// 24 Hours in milliseconds
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

// Periodic cleanup ensuring database messages older than 24h are deleted
const purgeOldAiMessages = async () => {
  try {
    const cutoff = new Date(Date.now() - TWENTY_FOUR_HOURS_MS);
    if (mongoose.connection.readyState === 1) {
      const result = await aiChatMessageModel.deleteMany({ createdAt: { $lte: cutoff } });
      if (result.deletedCount > 0) {
        console.log(`[AI Chat] Auto-purged ${result.deletedCount} messages older than 24h`);
      }
    }

    // Also clean in-memory fallback
    const cutoffTime = Date.now() - TWENTY_FOUR_HOURS_MS;
    for (const [uid, msgs] of inMemoryAiHistory.entries()) {
      const filtered = msgs.filter(m => new Date(m.createdAt).getTime() > cutoffTime);
      if (filtered.length === 0) {
        inMemoryAiHistory.delete(uid);
      } else {
        inMemoryAiHistory.set(uid, filtered);
      }
    }
  } catch (err) {
    console.error('[AI Chat] Cleanup error:', err.message);
  }
};

// Run background purge every 30 minutes
const cleanupInterval = setInterval(purgeOldAiMessages, 30 * 60 * 1000);
if (cleanupInterval.unref) cleanupInterval.unref();

// Lazy initialize Gemini client
let aiClient = null;
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
};

// System instruction for Keriyo AI Assistant
const buildSystemInstruction = async () => {
  let productContext = '';
  try {
    if (mongoose.connection.readyState === 1) {
      const products = await productModel.find({}).select('name price category subCategory description bestseller').limit(25);
      if (products && products.length > 0) {
        productContext = `\nCurrent Featured Products in Keriyo Store:\n` + 
          products.map(p => `- ${p.name} (৳${p.price}) [Category: ${p.category} > ${p.subCategory}]`).join('\n');
      }
    }
  } catch (e) {
    // Ignore db read error
  }

  return `You are "Keriyo AI" (কেরিয়ো এআই), the official intelligent shopping concierge and gadget specialist for Keriyo. Your identity is Keriyo AI. Never refer to yourself as Gemini or any external model.

About Keriyo:
- Keriyo is Bangladesh's top premium store for smart gadgets, mechanical EDC fidget toys, satisfying titanium clickers, haptic sliders, noise-cancelling earbuds, smartwatches, magnetic wireless chargers, and tech accessories.
- Delivery: All over Bangladesh. Inside Dhaka: 2-3 days, Outside Dhaka: 3-5 days.
- Payment Methods: Cash on Delivery (COD), bKash, Nagad, and Credit/Debit Cards.
- Warranty & Return: Official replacement warranty and a 7-day return policy for manufacturing defects.

Response Guidelines:
1. Language: If the user writes in Bengali or Banglish, reply in polite, fluent, natural Bengali (বাংলা). If they write in English, reply in English.
2. COMPLETENESS (Critical): Always provide full, comprehensive, and complete answers. Never cut off midway or leave a thought or bullet point incomplete. Ensure every sentence and recommendation is rounded out to completion.
3. Formatting: Use neat bullet points, bold product names or key features, and keep paragraphs clean and readable on mobile screens.
4. Tone: Helpful, knowledgeable, and enthusiastic about smart tech and EDC fidget gear.
${productContext}`;
};

// Candidate Gemini models with automatic fallback
const CANDIDATE_MODELS = [
  'gemini-3.6-flash',
  'gemini-flash-latest',
  'gemini-3.5-flash',
  'gemini-3.8-flash'
];

// Send message to AI Assistant
export const sendAiMessage = async (req, res) => {
  try {
    const { userId, text } = req.body;

    if (!userId || !text || !text.trim()) {
      return res.status(400).json({ success: false, message: "User ID and message text are required" });
    }

    const trimmedText = text.trim();
    const cutoffDate = new Date(Date.now() - TWENTY_FOUR_HOURS_MS);

    // Save user message
    let priorMessages = [];
    if (mongoose.connection.readyState === 1) {
      await aiChatMessageModel.create({
        userId,
        role: 'user',
        text: trimmedText
      });

      // Retrieve recent conversation history within last 24h
      priorMessages = await aiChatMessageModel.find({
        userId,
        createdAt: { $gt: cutoffDate }
      }).sort({ createdAt: 1 }).limit(20);
    } else {
      // In-memory fallback
      const list = inMemoryAiHistory.get(userId) || [];
      const userMsg = {
        _id: 'mem_' + Date.now() + Math.random(),
        userId,
        role: 'user',
        text: trimmedText,
        createdAt: new Date()
      };
      list.push(userMsg);
      inMemoryAiHistory.set(userId, list);
      priorMessages = list;
    }

    // Format Gemini contents with strict user/model alternation and clean text
    const formattedContents = [];
    for (const msg of priorMessages) {
      if (!msg.text || !msg.text.trim()) continue;
      const role = msg.role === 'user' ? 'user' : 'model';

      if (formattedContents.length > 0 && formattedContents[formattedContents.length - 1].role === role) {
        // Append text if consecutive roles are the same to maintain strict alternation
        formattedContents[formattedContents.length - 1].parts[0].text += '\n' + msg.text.trim();
      } else {
        formattedContents.push({
          role,
          parts: [{ text: msg.text.trim() }]
        });
      }
    }

    // Ensure contents starts with a user message
    while (formattedContents.length > 0 && formattedContents[0].role !== 'user') {
      formattedContents.shift();
    }

    // Ensure the last item in contents is the current user message
    if (formattedContents.length === 0 || formattedContents[formattedContents.length - 1].role !== 'user') {
      formattedContents.push({
        role: 'user',
        parts: [{ text: trimmedText }]
      });
    }

    const systemInstruction = await buildSystemInstruction();
    const ai = getAiClient();

    let replyText = "";
    if (!ai) {
      // Graceful fallback if GEMINI_API_KEY is not set yet in development
      replyText = "স্বাগতম! আমি Keriyo AI Assistant। আমাদের লেটেস্ট স্মার্ট গ্যাজেট, ইডিসি ফিজেট টয় এবং টেক অ্যাক্সেসরিজ নিয়ে আমি আপনাকে কীভাবে সাহায্য করতে পারি? (Note: To enable live AI intelligence, please set GEMINI_API_KEY in your environment settings).";
    } else {
      let lastError = null;
      // Try candidate models in order until one succeeds
      for (const modelName of CANDIDATE_MODELS) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: formattedContents,
            config: {
              systemInstruction,
              temperature: 0.7,
              maxOutputTokens: 2500,
              thinkingConfig: { thinkingBudget: 0 }
            }
          });

          if (response && response.text && response.text.trim().length > 0) {
            replyText = response.text.trim();
            lastError = null;
            break;
          }
        } catch (err) {
          lastError = err;
          console.warn(`[AI Chat] ${modelName} encountered error:`, err.message || err);
          // Continue to next model in CANDIDATE_MODELS
        }
      }

      if (!replyText) {
        console.error('[AI Chat] All candidate models failed. Last error:', lastError);
        replyText = "দুঃখিত, এই মুহূর্তে সার্ভারে সামান্য সংযোগ ত্রুটি হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন অথবা আমাদের কাস্টমার সাপোর্টে যোগাযোগ করুন।";
      }
    }

    // Save model reply in database
    let savedModelMessage = null;
    if (mongoose.connection.readyState === 1) {
      savedModelMessage = await aiChatMessageModel.create({
        userId,
        role: 'model',
        text: replyText
      });
    } else {
      const list = inMemoryAiHistory.get(userId) || [];
      savedModelMessage = {
        _id: 'mem_' + Date.now() + Math.random(),
        userId,
        role: 'model',
        text: replyText,
        createdAt: new Date()
      };
      list.push(savedModelMessage);
      inMemoryAiHistory.set(userId, list);
    }

    return res.json({
      success: true,
      reply: replyText,
      message: savedModelMessage
    });
  } catch (error) {
    console.error('[AI Chat] sendAiMessage error:', error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get AI chat history for a user (only within last 24 hours)
export const getAiHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID required" });
    }

    const cutoffDate = new Date(Date.now() - TWENTY_FOUR_HOURS_MS);
    let messages = [];

    if (mongoose.connection.readyState === 1) {
      messages = await aiChatMessageModel.find({
        userId,
        createdAt: { $gt: cutoffDate }
      }).sort({ createdAt: 1 });
    } else {
      const list = inMemoryAiHistory.get(userId) || [];
      const cutoffTime = cutoffDate.getTime();
      messages = list.filter(m => new Date(m.createdAt).getTime() > cutoffTime);
    }

    return res.json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('[AI Chat] getAiHistory error:', error);
    return res.status(500).json({ success: false, message: "Failed to load chat history" });
  }
};

// Clear AI conversation history for this user
export const clearAiHistory = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID required" });
    }

    if (mongoose.connection.readyState === 1) {
      await aiChatMessageModel.deleteMany({ userId });
    }
    inMemoryAiHistory.delete(userId);

    return res.json({ success: true, message: "Chat reset successfully" });
  } catch (error) {
    console.error('[AI Chat] clearAiHistory error:', error);
    return res.status(500).json({ success: false, message: "Failed to clear history" });
  }
};
