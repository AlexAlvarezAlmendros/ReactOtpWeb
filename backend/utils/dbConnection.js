const mongoose = require('mongoose');

// Cache the connection to reuse across serverless function invocations
let cachedConnection = null;

const connectDB = async () => {
    // If we have a cached connection and it's connected, reuse it
    if (cachedConnection && mongoose.connection.readyState === 1) {
        console.log('✅ Using cached MongoDB connection');
        return cachedConnection;
    }

    // If connection is in progress, wait for it
    if (mongoose.connection.readyState === 2) {
        console.log('⏳ MongoDB connection in progress, waiting...');
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Connection wait timeout'));
            }, 8000); // 8 seconds max wait
            
            mongoose.connection.once('connected', () => {
                clearTimeout(timeout);
                resolve();
            });
            
            mongoose.connection.once('error', (err) => {
                clearTimeout(timeout);
                reject(err);
            });
        });
        return mongoose.connection;
    }

    try {
        const MONGO_URI = process.env.MONGO_URI;
        
        if (!MONGO_URI) {
            throw new Error('MONGO_URI is not defined in environment variables');
        }

        console.log('🔄 Connecting to MongoDB...');
        const startTime = Date.now();
        
        // Aggressive timeouts for Vercel Hobby plan (10s max execution time)
        const connectionOptions = {
            serverSelectionTimeoutMS: 8000, // 8 seconds - must connect fast
            socketTimeoutMS: 30000,
            connectTimeoutMS: 8000,
            maxPoolSize: 5, // Reduced pool size
            minPoolSize: 1,
            retryWrites: true,
            retryReads: true,
            heartbeatFrequencyMS: 15000,
        };

        cachedConnection = await mongoose.connect(MONGO_URI, connectionOptions);

        const connectionTime = Date.now() - startTime;
        console.log(`✅ Connected to MongoDB Atlas in ${connectionTime}ms`);
        
        // Set up connection event handlers only once
        if (!mongoose.connection._eventsListenersSet) {
            mongoose.connection._eventsListenersSet = true;
            
            mongoose.connection.on('disconnected', () => {
                console.log('⚠️ MongoDB disconnected');
                cachedConnection = null;
            });

            mongoose.connection.on('error', (err) => {
                console.error('❌ MongoDB connection error:', err);
                cachedConnection = null;
            });

            mongoose.connection.on('reconnected', () => {
                console.log('🔄 MongoDB reconnected');
            });
        }
        
        return cachedConnection;

    } catch (error) {
        cachedConnection = null;
        console.error('❌ Error connecting to MongoDB:', error.message);
        console.error('❌ Error name:', error.name);
        if (error.code) {
            console.error('❌ Error code:', error.code);
        }
        
        // Clean up connection state on error
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect().catch(e => console.error('Error disconnecting:', e));
        }
        
        throw new Error(`Database connection failed: ${error.message}`);
    }
};

module.exports = connectDB;
