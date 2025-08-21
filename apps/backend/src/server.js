require('dotenv').config();
//for auth i use require('dotenv').config();
//👉 dotenv allows you to use a .env file to store secret information (like database passwords, API keys, JWT secrets).
const http = require('http');
const socketIo = require('socket.io');

const app = require('./app');
//for auth i use those packages from app.js
/*import express from "express";
 import cors from "cors";
import dotenv from "dotenv";
*/
//for authentication i use those packages from app.js
const connectDB = require('./config/db');
//for authentication i use (mongoose ) from connectDB/db.js



const logger = require('./config/logger');
const { initializeStorage } = require('./config/multer');
const taskSocket = require('./sockets/task.socket');
const notificationSocket = require('./sockets/notification.socket');
const workspaceSocket = require('./sockets/workspace.socket');
const boardSocket = require('./sockets/board.socket');

const PORT = process.env.PORT || 3001;

// Connect to database
connectDB();

// Initialize file storage
initializeStorage();

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.IO
const io = socketIo(server, {
    cors: {
        origin: process.env.CORS_ORIGIN || ['http://localhost:5173', 'http://localhost:5174'],
        methods: ['GET', 'POST']
    }
});

// Make io available globally for notifications
global.io = io;
app.set('io', io);

// Setup socket handlers
taskSocket(io);
notificationSocket(io);
workspaceSocket(io);
boardSocket(io);

// Start server
server.listen(PORT, () => {
    logger.info(`🚀 TaskFlow API server running on port ${PORT}`);
    logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully...');
    server.close(() => {
        logger.info('Server closed');
        process.exit(0);
    });
});

process.on('unhandledRejection', (err, promise) => {
    logger.error('Unhandled Promise Rejection:', err.message);
    server.close(() => {
        process.exit(1);
    });
});

module.exports = server;
