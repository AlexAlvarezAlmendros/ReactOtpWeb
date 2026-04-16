const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const connectDB = require('../utils/dbConnection');

// Health check endpoint
router.get('/health', async (req, res) => {
    const startTime = Date.now();
    
    try {
        console.log('🏥 Health check initiated');
        
        // Check MongoDB connection
        const dbStart = Date.now();
        await connectDB();
        const dbTime = Date.now() - dbStart;
        
        // Test a simple query
        const queryStart = Date.now();
        await mongoose.connection.db.admin().ping();
        const pingTime = Date.now() - queryStart;
        
        const totalTime = Date.now() - startTime;
        
        const healthData = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            mongodb: {
                connected: mongoose.connection.readyState === 1,
                readyState: mongoose.connection.readyState,
                host: mongoose.connection.host,
                name: mongoose.connection.name,
                connectionTime: `${dbTime}ms`,
                pingTime: `${pingTime}ms`
            },
            timing: {
                total: `${totalTime}ms`,
                breakdown: {
                    connection: `${dbTime}ms`,
                    ping: `${pingTime}ms`
                }
            },
            environment: process.env.NODE_ENV || 'development'
        };
        
        console.log('✅ Health check passed:', JSON.stringify(healthData, null, 2));
        
        res.status(200).json(healthData);
    } catch (error) {
        const totalTime = Date.now() - startTime;
        
        const errorData = {
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: {
                message: error.message,
                name: error.name,
                code: error.code,
                connectionTime: `${totalTime}ms`
            },
            mongodb: {
                connected: false,
                readyState: mongoose.connection.readyState,
                readyStates: {
                    0: 'disconnected',
                    1: 'connected',
                    2: 'connecting',
                    3: 'disconnecting'
                }
            }
        };
        
        console.error('❌ Health check failed:', JSON.stringify(errorData, null, 2));
        
        res.status(503).json(errorData);
    }
});

module.exports = router;
