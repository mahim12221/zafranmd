import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import connectDB from './backend/config/mongodb.js';
import connectCloudinary from './backend/config/cloudinary.js';
import userRouter from './backend/routes/userRoute.js';
import productRouter from './backend/routes/productRoute.js';
import cartRouter from './backend/routes/cartRoute.js';
import orderRouter from './backend/routes/orderRoute.js';
import chatRouter from './backend/routes/chatRoute.js';
import { createServer } from 'http';
import { Server } from 'socket.io';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const userSocketMap = new Map();

io.on('connection', (socket) => {
  socket.on('register', (userId) => {
    if (userId) {
      const uId = String(userId);
      socket.join(uId);
      userSocketMap.set(uId, socket.id);
      if (uId === 'admin') {
        socket.join('admin');
      }
    }
  });

  socket.on('sendMessage', (messageData) => {
    if (!messageData) return;
    const receiverId = String(messageData.receiverId);
    const senderId = String(messageData.senderId);

    if (receiverId === 'admin') {
      io.to('admin').emit('receiveMessage', messageData);
    } else {
      io.to(receiverId).emit('receiveMessage', messageData);
    }

    if (senderId === 'admin') {
      io.to('admin').emit('receiveMessage', messageData);
    } else {
      io.to(senderId).emit('receiveMessage', messageData);
    }
  });

  socket.on('messageAction', (actionData) => {
    if (!actionData) return;
    const receiverId = String(actionData.receiverId);
    if (receiverId === 'admin') {
      io.to('admin').emit('messageAction', actionData);
    } else {
      io.to(receiverId).emit('messageAction', actionData);
    }
  });

  socket.on('disconnect', () => {
    for (let [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        break;
      }
    }
  });
});
const PORT = process.env.PORT || 3000;

// Connect DB & Cloudinary safely
await connectDB();
await connectCloudinary();

// Middlewares
app.use(express.json());
app.use(cors());

// API Endpoints
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'mongodb' : 'fallback',
    time: new Date().toISOString()
  });
});

app.use('/api/user', userRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);
app.use('/api/chat', chatRouter);

// Frontend Vite integration
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      host: '0.0.0.0',
      port: 3000
    },
    appType: 'spa',
    root: path.resolve(__dirname, 'frontend')
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.resolve(__dirname, 'frontend/dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
}

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
