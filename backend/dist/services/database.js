import mongoose from 'mongoose';
import { config } from '../config/env.js';
class Database {
    connected = false;
    async connect() {
        if (this.connected)
            return;
        try {
            await mongoose.connect(config.mongodb.uri, {
                dbName: config.mongodb.dbName,
                serverSelectionTimeoutMS: 5000,
                family: 4, // Force IPv4
            });
            this.connected = true;
            console.log('✅ MongoDB connected');
        }
        catch (err) {
            console.warn('⚠️ MongoDB connection failed, running without database:', err.message);
            this.connected = false;
        }
    }
    async disconnect() {
        if (this.connected) {
            await mongoose.disconnect();
            this.connected = false;
            console.log('MongoDB disconnected');
        }
    }
    isConnected() {
        return this.connected && mongoose.connection.readyState === 1;
    }
}
export const db = new Database();
