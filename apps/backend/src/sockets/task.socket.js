const jwt = require('../utils/jwt');
const User = require('../models/User');
const Task = require('../models/Task');
const Board = require('../models/Board');
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

// Handle task socket events
const handleTaskSocket = (io) => {
    // Apply authentication middleware
    io.use(authenticateSocket);

    io.on('connection', (socket) => {
        logger.info(`User connected: ${socket.user.name} (${socket.id})`);

        // Join user to their personal room
        socket.join(`user:${socket.userId}`);

        // Handle joining project rooms
        socket.on('join:project', async (projectId) => {
            try {
                // Verify user has access to project
                const Project = require('../models/Project');
                const project = await Project.findById(projectId);
                
                if (!project) {
                    socket.emit('error', { message: 'Project not found' });
                    return;
                }

                // Check if user is member or owner
                const hasAccess = project.owner.toString() === socket.userId ||
                                project.members.some(member => member.user.toString() === socket.userId);

                if (!hasAccess) {
                    socket.emit('error', { message: 'Access denied to project' });
                    return;
                }

                socket.join(`project:${projectId}`);
                logger.info(`User ${socket.user.name} joined project ${projectId}`);
                
                // Notify other project members
                socket.to(`project:${projectId}`).emit('user:joined', {
                    user: socket.user,
                    projectId
                });

            } catch (error) {
                logger.error('Join project error:', error);
                socket.emit('error', { message: 'Failed to join project' });
            }
        });

        // Handle joining board rooms
        socket.on('join:board', async (boardId) => {
            try {
                const board = await Board.findById(boardId).populate('project');
                
                if (!board) {
                    socket.emit('error', { message: 'Board not found' });
                    return;
                }

                // Check project access (simplified - should be more robust)
                socket.join(`board:${boardId}`);
                logger.info(`User ${socket.user.name} joined board ${boardId}`);

            } catch (error) {
                logger.error('Join board error:', error);
                socket.emit('error', { message: 'Failed to join board' });
            }
        });

        // Handle task updates
        socket.on('task:update', async (data) => {
            try {
                const { taskId, updates, boardId } = data;
                
                const task = await Task.findById(taskId);
                if (!task) {
                    socket.emit('error', { message: 'Task not found' });
                    return;
                }

                // Update task (simplified - should include proper validation)
                Object.assign(task, updates);
                task.lastActivity = new Date();
                await task.save();

                await task.populate('assignees', 'name email avatar');
                await task.populate('reporter', 'name email avatar');

                // Broadcast to all users in the board
                io.to(`board:${boardId}`).emit('task:updated', {
                    task: task.toObject(),
                    updatedBy: socket.user,
                    timestamp: new Date()
                });

                logger.info(`Task ${taskId} updated by ${socket.user.name}`);

            } catch (error) {
                logger.error('Task update error:', error);
                socket.emit('error', { message: 'Failed to update task' });
            }
        });

        // Handle task movement (drag & drop)
        socket.on('task:move', async (data) => {
            try {
                const { taskId, sourceColumnId, targetColumnId, targetPosition, boardId } = data;
                
                const task = await Task.findById(taskId);
                if (!task) {
                    socket.emit('error', { message: 'Task not found' });
                    return;
                }

                // Update task position and column
                task.column = targetColumnId;
                task.position = targetPosition;
                await task.save();

                // Broadcast task movement to board
                io.to(`board:${boardId}`).emit('task:moved', {
                    taskId,
                    sourceColumnId,
                    targetColumnId,
                    targetPosition,
                    movedBy: socket.user,
                    timestamp: new Date()
                });

                logger.info(`Task ${taskId} moved by ${socket.user.name}`);

            } catch (error) {
                logger.error('Task move error:', error);
                socket.emit('error', { message: 'Failed to move task' });
            }
        });

        // Handle real-time comments
        socket.on('comment:add', async (data) => {
            try {
                const { taskId, content, mentions = [] } = data;
                
                const Comment = require('../models/Comment');
                const comment = await Comment.create({
                    content,
                    task: taskId,
                    author: socket.userId,
                    mentions
                });

                await comment.populate('author', 'name email avatar');
                await comment.populate('mentions', 'name email avatar');

                const task = await Task.findById(taskId);
                
                // Broadcast to board and mentioned users
                io.to(`board:${task.board}`).emit('comment:added', {
                    comment: comment.toObject(),
                    taskId,
                    timestamp: new Date()
                });

                // Send notifications to mentioned users
                for (const mentionId of mentions) {
                    io.to(`user:${mentionId}`).emit('notification', {
                        type: 'mention',
                        message: `${socket.user.name} mentioned you in a comment`,
                        taskId,
                        taskTitle: task.title
                    });
                }

                logger.info(`Comment added to task ${taskId} by ${socket.user.name}`);

            } catch (error) {
                logger.error('Add comment error:', error);
                socket.emit('error', { message: 'Failed to add comment' });
            }
        });

        // Handle user typing indicators
        socket.on('typing:start', (data) => {
            const { boardId, taskId } = data;
            socket.to(`board:${boardId}`).emit('user:typing', {
                user: socket.user,
                taskId,
                isTyping: true
            });
        });

        socket.on('typing:stop', (data) => {
            const { boardId, taskId } = data;
            socket.to(`board:${boardId}`).emit('user:typing', {
                user: socket.user,
                taskId,
                isTyping: false
            });
        });

        // Handle user presence
        socket.on('presence:update', (data) => {
            const { boardId, status } = data;
            socket.to(`board:${boardId}`).emit('user:presence', {
                user: socket.user,
                status,
                timestamp: new Date()
            });
        });

        // Handle disconnection
        socket.on('disconnect', (reason) => {
            logger.info(`User disconnected: ${socket.user.name} (${reason})`);
            
            // Notify all rooms user was in about disconnection
            socket.broadcast.emit('user:left', {
                user: socket.user,
                timestamp: new Date()
            });
        });

        // Handle errors
        socket.on('error', (error) => {
            logger.error('Socket error:', error);
        });

        // Send welcome message
        socket.emit('connected', {
            message: 'Successfully connected to TaskFlow',
            user: socket.user,
            timestamp: new Date()
        });
    });

    // Global socket utilities
    io.notifyUser = (userId, event, data) => {
        io.to(`user:${userId}`).emit(event, data);
    };

    io.notifyProject = (projectId, event, data) => {
        io.to(`project:${projectId}`).emit(event, data);
    };

    io.notifyBoard = (boardId, event, data) => {
        io.to(`board:${boardId}`).emit(event, data);
    };

    return io;
};

module.exports = handleTaskSocket;
