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
import categoryRouter from './backend/routes/categoryRoute.js';
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

// Socket.io connection logic with robust multi-socket & heartbeat user presence
const userSocketMap = new Map(); // key (userId, email, 'admin') -> Set of socketIds
const socketToKeysMap = new Map(); // socketId -> Set of keys
const userLastSeen = new Map(); // key -> timestamp

const getOnlineKeys = () => {
  const now = Date.now();
  const onlineSet = new Set();
  
  for (const [key, sockets] of userSocketMap.entries()) {
    if (sockets && sockets.size > 0) {
      onlineSet.add(key);
    }
  }

  for (const [key, timestamp] of userLastSeen.entries()) {
    if (now - timestamp < 45000) {
      onlineSet.add(key);
    } else {
      userLastSeen.delete(key);
    }
  }

  return Array.from(onlineSet);
};

const broadcastOnlineUsers = () => {
  const onlineList = getOnlineKeys();
  io.emit('onlineUsers', onlineList);
};

io.on('connection', (socket) => {
  socket.on('register', (registrationData) => {
    const keysToAdd = [];
    if (typeof registrationData === 'object' && registrationData !== null) {
      if (registrationData.userId) keysToAdd.push(String(registrationData.userId).trim());
      if (registrationData.email) keysToAdd.push(String(registrationData.email).trim().toLowerCase());
    } else if (registrationData) {
      keysToAdd.push(String(registrationData).trim());
    }

    if (keysToAdd.length === 0) return;

    if (!socketToKeysMap.has(socket.id)) {
      socketToKeysMap.set(socket.id, new Set());
    }
    const socketKeys = socketToKeysMap.get(socket.id);

    keysToAdd.forEach(key => {
      socketKeys.add(key);
      socket.join(key);
      if (!userSocketMap.has(key)) {
        userSocketMap.set(key, new Set());
      }
      userSocketMap.get(key).add(socket.id);
      userLastSeen.set(key, Date.now());
      if (key === 'admin') {
        socket.join('admin');
        socket.join('admins');
      }
    });

    socket.emit('onlineUsers', getOnlineKeys());
    broadcastOnlineUsers();
  });

  socket.on('sendMessage', (messageData) => {
    if (!messageData) return;
    const receiverId = String(messageData.receiverId || '').trim();
    const senderId = String(messageData.senderId || '').trim();

    const receiverSockets = userSocketMap.get(receiverId);
    if (receiverSockets && receiverSockets.size > 0) {
      receiverSockets.forEach(sId => io.to(sId).emit('receiveMessage', messageData));
    }
    if (receiverId === 'admin') {
      io.to('admin').emit('receiveMessage', messageData);
      io.to('admins').emit('receiveMessage', messageData);
    } else {
      io.to(receiverId).emit('receiveMessage', messageData);
    }

    const senderSockets = userSocketMap.get(senderId);
    if (senderSockets && senderSockets.size > 0) {
      senderSockets.forEach(sId => io.to(sId).emit('receiveMessage', messageData));
    }
  });

  socket.on('messageAction', (actionData) => {
    if (!actionData) return;
    const receiverId = String(actionData.receiverId || '').trim();
    if (receiverId === 'admin') {
      io.to('admin').emit('messageAction', actionData);
      io.to('admins').emit('messageAction', actionData);
    } else {
      io.to(receiverId).emit('messageAction', actionData);
    }
  });

  socket.on('disconnect', () => {
    const keys = socketToKeysMap.get(socket.id);
    if (keys) {
      keys.forEach(key => {
        const sockets = userSocketMap.get(key);
        if (sockets) {
          sockets.delete(socket.id);
          if (sockets.size === 0) {
            userSocketMap.delete(key);
          }
        }
      });
      socketToKeysMap.delete(socket.id);
    }
    broadcastOnlineUsers();
  });
});

const PORT = 3000;

// Connect DB & Cloudinary safely
try {
  await connectDB();
} catch (e) {
  console.warn('[Database] Initial connect failed, continuing:', e.message);
}

try {
  await connectCloudinary();
} catch (e) {
  console.warn('[Cloudinary] Initial connect failed, continuing:', e.message);
}

// Middlewares
app.use(express.json());
app.use(cors());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'mongodb' : 'fallback',
    time: new Date().toISOString()
  });
});

// Presence fallback endpoints (used by ChatWidget and AdminChat)
app.get('/api/chat/online-users', (req, res) => {
  res.json({ success: true, onlineUsers: getOnlineKeys() });
});

app.post('/api/chat/heartbeat', (req, res) => {
  const { userId, email } = req.body || {};
  if (userId) userLastSeen.set(String(userId).trim(), Date.now());
  if (email) userLastSeen.set(String(email).trim().toLowerCase(), Date.now());
  broadcastOnlineUsers();
  res.json({ success: true, onlineUsers: getOnlineKeys() });
});

// Core API Endpoints
app.use('/api/user', userRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);
app.use('/api/chat', chatRouter);
app.use('/api/category', categoryRouter);

// Frontend Vite integration
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      hmr: false,
      host: '0.0.0.0'
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
