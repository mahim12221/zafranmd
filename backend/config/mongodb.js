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

        // Clean up previously seeded test products so user has clean slate to add real products manually
        try {
            await productModel.deleteMany({
                name: {
                    $in: [
                        "Magnetic Slider EDC Haptic Fidget Toy",
                        "Pro ANC Wireless Noise Cancelling Earbuds",
                        "Titanium EDC Mini Bolt-Action Pen",
                        "RGB Mechanical Macropad & Knob Controller",
                        "Modular Magnetic Key Organizer & Carabiner",
                        "Fast Magnetic Wireless Power Bank 10000mAh",
                        "RGB Magnetic Levitation Display Stand",
                        "Aerospace Grade Metal Fidget Spinner Pro",
                        "Aroma Flame Diffuser & Ambient Night Light",
                        "Smart OLED Air Quality & Temp Monitor",
                        "Cyberpunk Transparent Fast Charging Cable",
                        "Minimalist RFID Blocking Pop-Up Cardholder",
                        "Women Round Neck Cotton Top",
                        "Men Round Neck Pure Cotton T-shirt",
                        "Girls Round Neck Cotton Top",
                        "Men Slim Fit Relaxed Denim Jacket",
                        "Women Zip-Front Relaxed Fit Jacket"
                    ]
                }
            });
        } catch (seedErr) {
            console.warn('[Database] Seed clean check note:', seedErr.message);
        }

        return true;
    } catch (err) {
        console.warn('[Database] Running in fallback mode:', err.message);
        return false;
    }
}

export default connectDB;