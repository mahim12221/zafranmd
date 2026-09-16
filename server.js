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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
