import mongoose from 'mongoose'

const connectDB = async() => {
    mongoose.set('bufferCommands', false);
    if (!process.env.MONGODB_URI) {
        console.warn('[AI Studio] MONGODB_URI not provided — in-memory fallback active');
        return;
    }
    try {
        mongoose.connection.on('connected', ()=>{
            console.log('Connected to MongoDB')
        });
        await mongoose.connect(`${process.env.MONGODB_URI}/e-commerce`);
    } catch (err) {
        console.warn('[AI Studio] MongoDB connection failed — in-memory fallback active:', err.message);
    }
}

export default connectDB;