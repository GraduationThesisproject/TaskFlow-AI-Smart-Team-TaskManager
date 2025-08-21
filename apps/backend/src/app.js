const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Import all models to ensure they are registered with Mongoose
require('./models');

// Import middleware
const errorMiddleware = require('./middlewares/error.middleware');
const authMiddleware = require('./middlewares/auth.middleware');
const { fileServeMiddleware } = require('./middlewares/serve.middleware');

// Import routes
const authRoutes = require('./routes/auth.routes');
const workspaceRoutes = require('./routes/workspace.routes');
const spaceRoutes = require('./routes/space.routes');
const boardRoutes = require('./routes/board.routes');
const taskRoutes = require('./routes/task.routes');
const fileRoutes = require('./routes/file.routes');
const notificationRoutes = require('./routes/notification.routes');
const checklistRoutes = require('./routes/checklist.routes');
const reminderRoutes = require('./routes/reminder.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const tagRoutes = require('./routes/tag.routes');
const invitationRoutes = require('./routes/invitation.routes');
const aiRoutes = require('./routes/ai.routes');

const app = express();



// Security & CORS
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true
}));


// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        message: 'TaskFlow API is running',
        timestamp: new Date().toISOString()
    });
});

// Static file serving for uploads - minimal version
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', authMiddleware, workspaceRoutes);
app.use('/api/spaces', authMiddleware, spaceRoutes);
app.use('/api/boards', authMiddleware, boardRoutes);
app.use('/api/tasks', authMiddleware, taskRoutes);
app.use('/api/files', authMiddleware, fileRoutes);
app.use('/api/notifications', authMiddleware, notificationRoutes);
app.use('/api/checklists', authMiddleware, checklistRoutes);
app.use('/api/reminders', authMiddleware, reminderRoutes);
app.use('/api/analytics', authMiddleware, analyticsRoutes);
app.use('/api/tags', authMiddleware, tagRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/ai', authMiddleware, aiRoutes);

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
