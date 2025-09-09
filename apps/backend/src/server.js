require('dotenv').config();
//for auth i use require('dotenv').config();
//👉 dotenv allows you to use a .env file to store secret information (like database passwords, API keys, JWT secrets).
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const env = require('./config/env');
const app = require('./app');
const connectDB = require('./config/db');
const config = require('./config/env');
const Workspace = require('./models/Workspace');
const WorkspaceService = require('./services/workspace.service');
//for authentication i use (mongoose ) from connectDB/db.js)



const logger = require('./config/logger');
const os = require('os');
const { ensureDirectoriesExist } = require('./config/multer');
const { initializeSockets } = require('./sockets');

const PORT = env.PORT || 3001;

// Connect to database
connectDB();

// Initialize file storage directories
ensureDirectoriesExist();

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.IO with CORS for WebSocket requests only
const socketCorsOptions = {
    origin: true, // Allow all origins in development
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Socket-ID', 'X-Platform', 'X-App-Version', 'X-Device-ID', 'X-Device-Id']
};


const io = socketIo(server, {
    path: '/socket.io',
    cors: socketCorsOptions,
    // Add additional options for better React Native compatibility
    allowEIO3: true,
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
    // Add React Native specific options
    upgrade: true,
    rememberUpgrade: false,
    // Ensure proper WebSocket handling
    serveClient: true,
    // Add connection state recovery
    connectionStateRecovery: {
        maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
        skipMiddlewares: true,
    },
    // Additional mobile-friendly options
    allowUpgrades: true,
    perMessageDeflate: false, // Disable compression for better mobile compatibility
    httpCompression: false,   // Disable HTTP compression
    // Better error handling
    connectTimeout: 30000,
    // Enable debugging in development
    ...(env.NODE_ENV === 'development' && { 
        logger: {
            level: 'debug',
            type: 'default'
        }
    })
});

// Make io available globally for notifications
global.io = io;
app.set('io', io);

// Setup socket handlers
const socketNamespaces = initializeSockets(io);

// Add test socket namespace for debugging (no authentication required)
const testNamespace = io.of('/test');
testNamespace.on('connection', (socket) => {
    logger.info(`Test socket connected: ${socket.id}`);
    
    socket.emit('connected', {
        message: 'Test socket connected successfully',
        socketId: socket.id,
        timestamp: new Date().toISOString()
    });
    
    socket.on('ping', () => {
        socket.emit('pong', {
            message: 'Pong!',
            timestamp: new Date().toISOString()
        });
    });
    
    socket.on('disconnect', () => {
        logger.info(`Test socket disconnected: ${socket.id}`);
    });
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
    logger.info(`🚀 TaskFlow API server running on port ${PORT}`);
    logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
    logger.info(`🌐 Network access: http://192.168.1.64:${PORT}/health`);
});

// Periodic cleanup: permanently delete archived workspaces whose countdown reached 0
const CLEANUP_INTERVAL_MS = 5 * 1000; // every 5 seconds
async function cleanupArchivedWorkspaces() {
    try {
        const now = new Date();
        const expired = await Workspace.find({
            status: 'archived',
            archiveExpiresAt: { $lte: now }
        }).select('_id owner name');

        if (expired.length > 0) {
            logger.info(`Auto-cleanup: deleting ${expired.length} archived workspace(s)`);
        }

        for (const ws of expired) {
            try {
                await WorkspaceService.deleteWorkspace(ws._id, ws.owner);
                logger.info(`Auto-deleted workspace ${ws._id} (${ws.name})`);
            } catch (e) {
                logger.warn('Auto-delete workspace failed', {
                    workspaceId: ws?._id?.toString?.(),
                    error: e?.message
                });
            }
        }
    } catch (e) {
        logger.error('Cleanup archived workspaces error', { error: e?.message, stack: e?.stack });
    }
}

// Kick off periodic cleanup
const cleanupInterval = setInterval(cleanupArchivedWorkspaces, CLEANUP_INTERVAL_MS);
// Also run once on startup
cleanupArchivedWorkspaces();

// Graceful shutdown
let isShuttingDown = false;
async function gracefulShutdown(signal = 'SIGTERM') {
    if (isShuttingDown) return;
    isShuttingDown = true;
    logger.info(`${signal} received, shutting down gracefully...`);

    try {
        // Stop periodic timers
        if (cleanupInterval) clearInterval(cleanupInterval);
    } catch (e) {
        logger.warn('Error clearing cleanup interval', { error: e?.message });
    }

    const forceTimeout = setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
    }, 10000);

    // Close HTTP server (stops accepting new connections)
    try {
        await new Promise((resolve) => server.close(resolve));
        logger.info('HTTP server closed');
    } catch (e) {
        logger.warn('Error closing HTTP server', { error: e?.message });
    }

    // Close Socket.IO connections
    try {
        await new Promise((resolve) => io.close(resolve));
        logger.info('Socket.IO server closed');
    } catch (e) {
        logger.warn('Error closing Socket.IO', { error: e?.message });
    }

    // Close MongoDB connection
    try {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close(false);
            logger.info('MongoDB connection closed');
        }
    } catch (e) {
        logger.warn('Error closing MongoDB connection', { error: e?.message });
    }

    clearTimeout(forceTimeout);
    process.exit(0);
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

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
