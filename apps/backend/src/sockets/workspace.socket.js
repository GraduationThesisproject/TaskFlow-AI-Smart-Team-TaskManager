const jwt = require('../utils/jwt');
const Workspace = require('../models/Workspace');
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

        logger.info(`Socket authenticated: ${user.email}`);
        next();
        
    } catch (error) {
        logger.error('Socket authentication error:', error);
        next(new Error('Authentication failed'));
    }
};

// Handle workspace socket events with dedicated namespace
const handleWorkspaceSocket = (io) => {
    // Create workspace namespace
    const workspaceNamespace = io.of('/workspace');
    
    // Apply authentication middleware
    workspaceNamespace.use(authenticateSocket);
    
    workspaceNamespace.on('connection', (socket) => {
        logger.info(`User connected: ${socket.user.name} (${socket.id})`);

        // Join user's personal room for notifications
        socket.join(`user:${socket.userId}`);

        // Join workspace rooms
        socket.on('workspace:join', async (data) => {
            try {
                const { workspaceId } = data;
                
                // Verify user has access to workspace
                const user = await User.findById(socket.userId);
                const userRoles = await user.getRoles();
                
                if (!userRoles.hasWorkspaceRole(workspaceId)) {
                    socket.emit('error', { message: 'Access denied to workspace' });
                    return;
                }

                socket.join(`workspace:${workspaceId}`);
                
                // Notify other workspace members
                socket.to(`workspace:${workspaceId}`).emit('workspace:user-joined', {
                    user: socket.user,
                    timestamp: new Date()
                });

                logger.info(`User ${socket.user.name} joined workspace ${workspaceId}`);
                
            } catch (error) {
                logger.error('Join workspace error:', error);
                socket.emit('error', { message: 'Failed to join workspace' });
            }
        });

        // Leave workspace room
        socket.on('workspace:leave', (data) => {
            const { workspaceId } = data;
            socket.leave(`workspace:${workspaceId}`);
            
            socket.to(`workspace:${workspaceId}`).emit('workspace:user-left', {
                user: socket.user,
                timestamp: new Date()
            });
        });

        // Workspace member updates
        socket.on('workspace:member-update', async (data) => {
            try {
                const { workspaceId, memberId, updates } = data;
                
                // Verify permissions
                const user = await User.findById(socket.userId);
                const userRoles = await user.getRoles();
                
                if (!userRoles.hasWorkspaceRole(workspaceId, 'admin')) {
                    socket.emit('error', { message: 'Admin permissions required' });
                    return;
                }

                // Broadcast member update
                workspaceNamespace.to(`workspace:${workspaceId}`).emit('workspace:member-updated', {
                    memberId,
                    updates,
                    updatedBy: socket.user,
                    timestamp: new Date()
                });

            } catch (error) {
                logger.error('Workspace member update error:', error);
                socket.emit('error', { message: 'Failed to update member' });
            }
        });

        // Workspace settings updates
        socket.on('workspace:settings-update', async (data) => {
            try {
                const { workspaceId, settings } = data;
                
                // Verify permissions
                const user = await User.findById(socket.userId);
                const userRoles = await user.getRoles();
                
                if (!userRoles.hasWorkspaceRole(workspaceId, 'admin')) {
                    socket.emit('error', { message: 'Admin permissions required' });
                    return;
                }

                // Broadcast settings update
                workspaceNamespace.to(`workspace:${workspaceId}`).emit('workspace:settings-updated', {
                    settings,
                    updatedBy: socket.user,
                    timestamp: new Date()
                });

            } catch (error) {
                logger.error('Workspace settings update error:', error);
                socket.emit('error', { message: 'Failed to update settings' });
            }
        });

        // Usage limit notifications
        socket.on('workspace:check-limits', async (data) => {
            try {
                const { workspaceId } = data;
                
                const workspace = await Workspace.findById(workspaceId);
                if (!workspace) {
                    socket.emit('error', { message: 'Workspace not found' });
                    return;
                }

                const warnings = [];
                
                // Check various limits
                if (workspace.usage.membersCount >= workspace.limits.maxMembers * 0.9) {
                    warnings.push({
                        type: 'member_limit',
                        message: 'Approaching member limit',
                        current: workspace.usage.membersCount,
                        limit: workspace.limits.maxMembers
                    });
                }

                if (workspace.usage.storageUsed >= workspace.limits.maxStorage * 0.9) {
                    warnings.push({
                        type: 'storage_limit',
                        message: 'Approaching storage limit',
                        current: workspace.usage.storageUsed,
                        limit: workspace.limits.maxStorage
                    });
                }

                if (warnings.length > 0) {
                    socket.emit('workspace:limit-warnings', { warnings });
                }

            } catch (error) {
                logger.error('Check workspace limits error:', error);
                socket.emit('error', { message: 'Failed to check workspace limits' });
            }
        });
    });

    // Global workspace utilities
    workspaceNamespace.notifyWorkspace = (workspaceId, event, data) => {
        workspaceNamespace.to(`workspace:${workspaceId}`).emit(event, data);
    };

    workspaceNamespace.notifyWorkspaceAdmins = async (workspaceId, event, data) => {
        try {
            const workspace = await Workspace.findById(workspaceId)
                .populate('owner', '_id')
                .populate('members.user', '_id');

            // Notify owner
            workspaceNamespace.to(`notifications:${workspace.owner._id}`).emit(event, data);

            // Notify admin members
            const adminMembers = workspace.members.filter(member => member.role === 'admin');
            adminMembers.forEach(member => {
                workspaceNamespace.to(`notifications:${member.user._id}`).emit(event, data);
            });

        } catch (error) {
            logger.error('Notify workspace admins error:', error);
        }
    };

    return workspaceNamespace;
};

module.exports = handleWorkspaceSocket;
