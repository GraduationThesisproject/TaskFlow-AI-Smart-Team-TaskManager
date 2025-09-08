require('dotenv').config();
//for auth i use require('dotenv').config();
//👉 dotenv allows you to use a .env file to store secret information (like database passwords, API keys, JWT secrets).
const http = require('http');
const socketIo = require('socket.io');
const env = require('./config/env');
const app = require('./app');
const connectDB = require('./config/db');
const config = require('./config/env');
const Workspace = require('./models/Workspace');
const WorkspaceService = require('./services/workspace.service');
//for authentication i use (mongoose ) from connectDB/db.js



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
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // CORS_ORIGIN is already processed as an array in env.js
        let allowedOrigins = env.CORS_ORIGIN || [];
        
        // Ensure allowedOrigins is always an array
        if (!Array.isArray(allowedOrigins)) {
            allowedOrigins = [];
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
    path: '/socket.io',
    cors: socketCorsOptions,
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
    logger.info(`🔗 Health check (local): http://localhost:${PORT}/health`);

    // Log LAN URLs to help mobile devices connect
    const ifaces = os.networkInterfaces();
    const lanAddrs = Object.values(ifaces)
      .flat()
      .filter((i) => i && i.family === 'IPv4' && !i.internal)
      .map((i) => i.address);
    lanAddrs.forEach((addr) => {
      logger.info(`🔗 Health check (LAN): http://${addr}:${PORT}/health`);
      logger.info(`🔌 Socket.IO (LAN):   http://${addr}:${PORT}/socket.io`);
    });
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
setInterval(cleanupArchivedWorkspaces, CLEANUP_INTERVAL_MS);
// Also run once on startup
cleanupArchivedWorkspaces();

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
