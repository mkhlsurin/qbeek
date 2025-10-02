import mongoose from 'mongoose';
import { env } from '../config/env.js';

export async function connectDB() {
    
    mongoose.set('strictQuery', true);
    
    await mongoose.connect(env.DATABASE_URL);
    console.log('MongoDB connected');
    
    // Connection logs
    mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected'));
    mongoose.connection.on('error', (err) => console.error('MongoDB error:', err));
}

    // Stutdown
export async function disconnectDB() {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
}
