require('dotenv').config();
//for auth i use require('dotenv').config();
//👉 dotenv allows you to use a .env file to store secret information (like database passwords, API keys, JWT secrets).
const http = require('http');
const socketIo = require('socket.io');

const app = require('./app');
const connectDB = require('./config/db');
const config = require('./config/env');
//for authentication i use (mongoose ) from connectDB/db.js



const logger = require('./config/logger');
const { ensureDirectoriesExist } = require('./config/multer');
const taskSocket = require('./sockets/task.socket');
const notificationSocket = require('./sockets/notification.socket');
const workspaceSocket = require('./sockets/workspace.socket');
const boardSocket = require('./sockets/board.socket');
const chatSocket = require('./sockets/chat.socket');

const PORT = config.PORT || 3001;

// Connect to database
connectDB();

// Initialize file storage directories
ensureDirectoriesExist();

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.IO with CORS for WebSocket requests only
const socketCorsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // Parse CORS_ORIGIN from environment or use defaults
        let allowedOrigins;
        if (process.env.CORS_ORIGIN) {
            allowedOrigins = process.env.CORS_ORIGIN.split(',').map(origin => origin.trim());
        } else {
            allowedOrigins = config.CORS_ORIGIN;
        }
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error(`Origin ${origin} not allowed by Socket.IO CORS. Allowed: ${allowedOrigins.join(', ')}`));
        }
    },
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Socket-ID']
};



const io = socketIo(server, {
    cors: socketCorsOptions
});

// Make io available globally for notifications
global.io = io;
app.set('io', io);

// Setup socket handlers
taskSocket(io);
notificationSocket(io);
workspaceSocket(io);
boardSocket(io);
chatSocket(io);

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

// Handle unhandled promise rejections without crashing
process.on('unhandledRejection', (err, promise) => {
    logger.error('Unhandled Promise Rejection:', {
        error: err.message,
        stack: err.stack,
        promise: promise
    });
    // Don't crash the server, just log the error
    // The server will continue running
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', {
        error: err.message,
        stack: err.stack
    });
    // Only exit for uncaught exceptions (not promise rejections)
    server.close(() => {
        logger.error('Server closed due to uncaught exception');
        process.exit(1);
    });
});

module.exports = server;
