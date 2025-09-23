const jwt = require('../utils/jwt');
const User = require('../models/User');
const logger = require('../config/logger');

// Socket authentication middleware
const authenticateSocket = async (socket, next) => {
    try {
        const token = socket.handshake.auth.token || socket.handshake.query.token;
        
        if (!token) {
            return next(new Error('Authentication required'));
        }

        const decoded = jwt.verifyToken(token);
        const user = await User.findById(decoded.id);
        
        if (!user) {
            return next(new Error('User not found'));
        }

        socket.userId = user._id.toString();
        socket.user = {
            id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar
        };

        next();
    } catch (error) {
        logger.error('Workspace socket authentication error:', error);
        next(new Error('Authentication failed'));
    }
};

const handleWorkspaceSocket = (io) => {
    // Create workspace namespace
    const workspaceNamespace = io.of('/workspace');
    
    // Apply authentication middleware
    workspaceNamespace.use(authenticateSocket);
    
    workspaceNamespace.on('connection', (socket) => {
        logger.info(`User connected to workspace namespace: ${socket.user?.email || 'Unknown'} (${socket.id})`);

        // Join workspace room when user joins a workspace
        socket.on('join_workspace', (workspaceId) => {
            if (workspaceId) {
                socket.join(workspaceId);
                logger.info(`User ${socket.user?.email} joined workspace room: ${workspaceId}`);
                console.log(`🔔 User ${socket.user?.email} joined workspace room: ${workspaceId}`);
                
                // Send confirmation back to client
                socket.emit('workspace_joined', { workspaceId, success: true });
            }
        });

        // Leave workspace room when user leaves a workspace
        socket.on('leave_workspace', (workspaceId) => {
            if (workspaceId) {
                socket.leave(workspaceId);
                logger.info(`User ${socket.user?.email} left workspace room: ${workspaceId}`);
                console.log(`🔔 User ${socket.user?.email} left workspace room: ${workspaceId}`);
            }
        });

        // Handle workspace updates
        socket.on('workspace_update', (data) => {
            logger.info(`Workspace update from ${socket.user?.email}:`, data);
            console.log(`🔔 Backend received workspace_update event:`, data);
        });

        // Debug: Listen for any event
        socket.onAny((eventName, ...args) => {
            console.log(`🔔 Workspace socket received event: ${eventName}`, args);
        });

        socket.on('disconnect', (reason) => {
            logger.info(`User disconnected from workspace namespace: ${socket.user?.email || 'Unknown'} (${reason})`);
        });
    });

    // Add workspace-specific methods
    workspaceNamespace.joinWorkspace = (socketId, workspaceId) => {
        const socket = workspaceNamespace.sockets.get(socketId);
        if (socket) {
            socket.join(workspaceId);
            logger.info(`Socket ${socketId} joined workspace room: ${workspaceId}`);
        }
    };

    workspaceNamespace.leaveWorkspace = (socketId, workspaceId) => {
        const socket = workspaceNamespace.sockets.get(socketId);
        if (socket) {
            socket.leave(workspaceId);
            logger.info(`Socket ${socketId} left workspace room: ${workspaceId}`);
        }
    };

    // Make workspace namespace available globally
    global.workspaceNamespace = workspaceNamespace;

    return workspaceNamespace;
};

module.exports = handleWorkspaceSocket;
