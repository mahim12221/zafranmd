import mongoose from 'mongoose';
import productModel from '../models/productModel.js';
import { defaultProducts } from './seedProducts.js';

const formatMongoUri = (rawUri) => {
    if (!rawUri) return '';
    let uri = rawUri.trim();
    if (uri.includes('?')) {
        const [base, query] = uri.split('?');
        const atIndex = base.indexOf('@');
        const hostPart = atIndex !== -1 ? base.slice(atIndex + 1) : base;
        if (!hostPart.includes('/') || hostPart.endsWith('/')) {
            const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
            return `${cleanBase}/e-commerce?${query}`;
        }
    } else {
        const atIndex = uri.indexOf('@');
        const hostPart = atIndex !== -1 ? uri.slice(atIndex + 1) : uri;
        if (!hostPart.includes('/')) {
            return `${uri}/e-commerce`;
        }
    }
    return uri;
};

const connectDB = async() => {
    mongoose.set('bufferCommands', false);
    if (!process.env.MONGODB_URI) {
        return false;
    }
    try {
        mongoose.connection.on('connected', () => {
            console.log('[Database] Connected to MongoDB Atlas');
        });
        mongoose.connection.on('error', (err) => {
            console.warn('[Database] Connection event warning:', err.message);
        });

        const targetUri = formatMongoUri(process.env.MONGODB_URI);
        await mongoose.connect(targetUri, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 5000
        });

        // If products collection is empty, auto-seed initial products
        try {
            const count = await productModel.countDocuments();
            if (count === 0) {
                console.log('[Database] Seeding initial products to MongoDB Atlas...');
                const seedData = defaultProducts.map(p => ({
                    name: p.name,
                    description: p.description,
                    price: p.price,
                    image: p.images || [p.image],
                    images: p.images || [p.image],
                    category: p.category,
                    subCategory: p.subCategory,
                    sizes: p.sizes,
                    bestseller: p.bestseller || false,
                    date: p.date || Date.now()
                }));
                await productModel.insertMany(seedData);
                console.log(`[Database] Successfully seeded ${seedData.length} products to MongoDB Atlas`);
            }
        } catch (seedErr) {
            console.warn('[Database] Seed check note:', seedErr.message);
        }

        return true;
    } catch (err) {
        console.warn('[Database] Running in fallback mode:', err.message);
        return false;
    }
}

export default connectDB;