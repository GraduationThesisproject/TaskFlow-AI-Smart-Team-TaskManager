require('dotenv').config();
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const env = require('./config/env');
const app = require('./app');
const connectDB = require('./config/db');
const Workspace = require('./models/Workspace');
const WorkspaceService = require('./services/workspace.service');
const logger = require('./config/logger');
const { ensureDirectoriesExist } = require('./config/multer');
const { initializeSockets } = require('./sockets');

const PORT = env.PORT || 3001;

// Connect to database
connectDB();

// Initialize file storage directories
ensureDirectoriesExist();

// Create HTTP server
const server = http.createServer(app);

// Socket.IO configuration
const socketCorsOptions = {
  origin: env.BASE_URL, // use env.BASE_URL for CORS
  methods: ['GET', 'POST'],
  credentials: true,
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-Socket-ID',
    'X-Platform',
    'X-App-Version',
    'X-Device-ID'
  ]
};

const io = socketIo(server, {
  path: '/socket.io',
  cors: socketCorsOptions,
  allowEIO3: true,
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
  upgrade: true,
  rememberUpgrade: false,
  serveClient: true,
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
    skipMiddlewares: true,
  },
  allowUpgrades: true,
  perMessageDeflate: false,
  httpCompression: false,
  connectTimeout: 30000,
  ...(env.NODE_ENV === 'development' && { 
    logger: { level: 'debug', type: 'default' }
  })
});

// Make io globally available
global.io = io;
app.set('io', io);

// Initialize socket namespaces
initializeSockets(io);

// Test namespace for debugging
const testNamespace = io.of('/test');
testNamespace.on('connection', (socket) => {
  logger.info(`Test socket connected: ${socket.id}`);
  
  socket.emit('connected', {
    message: 'Test socket connected successfully',
    socketId: socket.id,
    timestamp: new Date().toISOString()
  });
  
  socket.on('ping', () => {
    socket.emit('pong', { message: 'Pong!', timestamp: new Date().toISOString() });
  });
  
  socket.on('disconnect', () => {
    logger.info(`Test socket disconnected: ${socket.id}`);
  });
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  logger.info(`🚀 TaskFlow API server running at ${env.BASE_URL}`);
  logger.info(`📊 Environment: ${env.NODE_ENV}`);
  logger.info(`🔗 Health check: ${env.BASE_URL}/health`);
});

// Periodic cleanup for archived workspaces
const CLEANUP_INTERVAL_MS = 5000;

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

const cleanupInterval = setInterval(cleanupArchivedWorkspaces, CLEANUP_INTERVAL_MS);
cleanupArchivedWorkspaces();

// Graceful shutdown
let isShuttingDown = false;

async function gracefulShutdown(signal = 'SIGTERM') {
  if (isShuttingDown) return;
  isShuttingDown = true;
  logger.info(`${signal} received, shutting down gracefully...`);

  try { if (cleanupInterval) clearInterval(cleanupInterval); } catch(e) { logger.warn(e); }

  const forceTimeout = setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);

  try { await new Promise(resolve => server.close(resolve)); logger.info('HTTP server closed'); } 
  catch(e) { logger.warn(e); }

  try { await new Promise(resolve => io.close(resolve)); logger.info('Socket.IO server closed'); } 
  catch(e) { logger.warn(e); }

  try { if (mongoose.connection.readyState !== 0) await mongoose.connection.close(false); logger.info('MongoDB closed'); } 
  catch(e) { logger.warn(e); }

  clearTimeout(forceTimeout);
  process.exit(0);
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

process.on('unhandledRejection', (err, promise) => {
  logger.error('Unhandled Promise Rejection:', { error: err.message, stack: err.stack, promise });
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', { error: err.message, stack: err.stack });
  server.close(() => process.exit(1));
});

module.exports = server;
