const express = require('express');
//👉 Express is a framework that makes building APIs easy.
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const env = require('./config/env');
//Import all models to ensure they are registered with Mongoose


require('./models');

// Import passport configuration for OAuth
const passport = require('passport');
require('./config/passport');

// Import middleware
const errorMiddleware = require('./middlewares/error.middleware');
const { authMiddleware } = require('./middlewares/auth.middleware');
const { fileServeMiddleware } = require('./middlewares/serve.middleware');

// Import routes
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const workspaceRoutes = require('./routes/workspace.routes');
const spaceRoutes = require('./routes/space.routes');
const boardRoutes = require('./routes/board.routes');
const taskRoutes = require('./routes/task.routes');
const fileRoutes = require('./routes/file.routes');
const notificationRoutes = require('./routes/notification.routes');
const checklistRoutes = require('./routes/checklist.routes');
const reminderRoutes = require('./routes/reminder.routes');

const tagRoutes = require('./routes/tag.routes');
const invitationRoutes = require('./routes/invitation.routes');
const aiRoutes = require('./routes/ai.routes');
const templateRoutes = require('./routes/template.routes');
const app = express();



// Security
app.use(helmet());

// CORS configuration for HTTP requests (Socket.IO handles WebSocket CORS)
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // Parse CORS_ORIGIN from environment or use defaults
        let allowedOrigins;
        if (process.env.CORS_ORIGIN) {
            allowedOrigins = process.env.CORS_ORIGIN.split(',').map(origin => origin.trim());
        } else {
            allowedOrigins = env.CORS_ORIGIN;
        }
        
        console.log('Allowed CORS origins:', allowedOrigins);
        console.log('Request origin:', origin);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            callback(new Error(`Origin ${origin} not allowed by CORS. Allowed: ${allowedOrigins.join(', ')}`));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Socket-ID'],
    exposedHeaders: ['X-Socket-ID']
};

console.log('CORS Configuration:', corsOptions);
app.use(cors(corsOptions));


// Logging
app.use(morgan('combined'));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        message: 'TaskFlow API is running',
        timestamp: new Date().toISOString()
    });
});

// CORS test endpoint
app.get('/cors-test', (req, res) => {
    res.status(200).json({ 
        message: 'CORS is working!',
        origin: req.headers.origin,
        timestamp: new Date().toISOString()
    });
});

// Static file serving for uploads - handle subdirectories properly
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'), {
  setHeaders: (res, path) => {
    // Set CORS headers for static files
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Set proper headers for different file types
    if (path.endsWith('.jpg') || path.endsWith('.jpeg') || path.endsWith('.png') || path.endsWith('.gif') || path.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/*');
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache images for 1 year
    } else if (path.endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache other files for 1 day
    }
  }
}));

// Body parsing middleware for all routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize passport middleware
app.use(passport.initialize());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/files', authMiddleware, fileRoutes);
app.use('/api/workspaces', authMiddleware, workspaceRoutes);
app.use('/api/spaces', authMiddleware, spaceRoutes);
app.use('/api/boards', authMiddleware, boardRoutes);
app.use('/api/tasks', authMiddleware, taskRoutes);
app.use('/api/notifications', authMiddleware, notificationRoutes);
app.use('/api/checklists', authMiddleware, checklistRoutes);
app.use('/api/reminders', authMiddleware, reminderRoutes);

app.use('/api/tags', authMiddleware, tagRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/ai', authMiddleware, aiRoutes);
// Make templates routes publicly accessible for GET requests.
// Controller methods still enforce auth for mutations (create/update/delete/like).
app.use('/api/templates', templateRoutes);

// 404 handler - using catch-all middleware instead of wildcard
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found'
    });
});

// Global error handler
app.use(errorMiddleware);

module.exports = app;
