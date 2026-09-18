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

// Socket.io connection logic
const userSocketMap = new Map(); // userId -> socketId

const broadcastOnlineUsers = () => {
  const adminSocketId = userSocketMap.get('admin');
  if (adminSocketId) {
    io.to(adminSocketId).emit('onlineUsers', Array.from(userSocketMap.keys()));
  }
};

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('register', (userId) => {
    userSocketMap.set(userId, socket.id);
    console.log(`User registered: ${userId} with socketId: ${socket.id}`);
    broadcastOnlineUsers();
  });

  socket.on('sendMessage', (messageData) => {
    // messageData: { senderId, receiverId, text, messageType, fileUrl }
    const receiverSocketId = userSocketMap.get(messageData.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receiveMessage', messageData);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    for (let [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        broadcastOnlineUsers();
        break;
      }
    }
  });
});

// middlewares
app.use(express.json())
app.use(cors())

// api endpoints
app.use('/api/user', userRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);
app.use('/api/chat', chatRouter);

app.get('/', (req, res) => {
    res.send("API working")
})

httpServer.listen(port, ()=> console.log('Server started on port: ' + port));