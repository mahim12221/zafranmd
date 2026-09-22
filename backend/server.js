import express from 'express'
import cors from 'cors'
import 'dotenv/config' 
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import userRouter from './routes/userRoute.js'
import productRouter from './routes/productRoute.js'
import cartRouter from './routes/cartRoute.js'
import orderRouter from './routes/orderRoute.js'
import chatRouter from './routes/chatRoute.js'
import categoryRouter from './routes/categoryRoute.js'
import { createServer } from 'http'
import { Server } from 'socket.io'

//App config
const app = express()
const port = process.env.PORT || 4000
connectDB();
connectCloudinary();

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
  console.log('A user connected:', socket.id);

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
      if (!userSocketMap.has(key)) {
        userSocketMap.set(key, new Set());
      }
      userSocketMap.get(key).add(socket.id);
      userLastSeen.set(key, Date.now());
      if (key === 'admin') {
        socket.join('admins');
      }
    });

    console.log(`User/admin registered: ${keysToAdd.join(', ')} on socket: ${socket.id}`);
    socket.emit('onlineUsers', getOnlineKeys());
    broadcastOnlineUsers();
  });

  socket.on('sendMessage', (messageData) => {
    const receiverKey = String(messageData.receiverId || '').trim();
    const sockets = userSocketMap.get(receiverKey);
    if (sockets && sockets.size > 0) {
      sockets.forEach(sId => io.to(sId).emit('receiveMessage', messageData));
    }
    if (receiverKey === 'admin') {
      io.to('admins').emit('receiveMessage', messageData);
    }
  });

  socket.on('messageAction', (actionData) => {
    const receiverKey = String(actionData.receiverId || '').trim();
    const sockets = userSocketMap.get(receiverKey);
    if (sockets && sockets.size > 0) {
      sockets.forEach(sId => io.to(sId).emit('messageAction', actionData));
    }
    if (receiverKey === 'admin') {
      io.to('admins').emit('messageAction', actionData);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
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

// middlewares
app.use(express.json())
app.use(cors())

// Presence fallback endpoints
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

// api endpoints
app.use('/api/user', userRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);
app.use('/api/chat', chatRouter);
app.use('/api/category', categoryRouter);

app.get('/', (req, res) => {
    res.send("API working")
})

httpServer.listen(port, ()=> console.log('Server started on port: ' + port));