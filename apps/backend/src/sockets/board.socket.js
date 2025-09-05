const jwt = require('../utils/jwt');
const Board = require('../models/Board');
const Column = require('../models/Column');
const Task = require('../models/Task');
const User = require('../models/User');
const Comment = require('../models/Comment');
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

// Handle unified board and task socket events
const handleBoardSocket = (io) => {
    // Apply authentication middleware
    io.use(authenticateSocket);
    
    io.on('connection', (socket) => {
        logger.info(`User connected: ${socket.user.name} (${socket.id})`);

        // Join user's personal room for notifications
        socket.join(`user:${socket.userId}`);

        // ===== BOARD OPERATIONS =====
        
        // Join board room
        socket.on('board:join', async (data) => {
            try {
                const { boardId } = data || {};
                
                // Validate input
                if (!boardId || typeof boardId !== 'string') {
                    socket.emit('error', { message: 'Board ID is required and must be a string' });
                    return;
                }
                
                const board = await Board.findById(boardId);
                if (!board) {
                    socket.emit('error', { message: 'Board not found' });
                    return;
                }

                // Check if user is a member of the board
                const isMember = await Board.isMember(boardId, socket.userId);
                if (!isMember) {
                    socket.emit('error', { code: 'FORBIDDEN', message: 'Access denied to board' });
                    return;
                }

                socket.join(`board:${boardId}`);
                
                // Notify other board users
                socket.to(`board:${boardId}`).emit('board:user-joined', {
                    user: socket.user,
                    boardId,
                    timestamp: new Date()
                });

                // Send current board state
                const columns = await Column.findByBoard(boardId);
                const tasks = await Task.find({ board: boardId, archived: false })
                    .populate('assignees', 'name avatar')
                    .sort({ position: 1 });

                socket.emit('board:state', {
                    board: board.toObject(),
                    columns,
                    tasks,
                    timestamp: new Date()
                });

                logger.info(`User ${socket.user.name} joined board ${boardId}`);
                
            } catch (error) {
                logger.error('Join board error:', error);
                socket.emit('error', { message: 'Failed to join board' });
            }
        });

        // Leave board room
        socket.on('board:leave', (data) => {
            const { boardId } = data;
            socket.leave(`board:${boardId}`);
            
            socket.to(`board:${boardId}`).emit('board:user-left', {
                user: socket.user,
                boardId,
                timestamp: new Date()
            });
        });

        // ===== COLUMN OPERATIONS =====
        
        socket.on('column:create', async (data) => {
            try {
                const { boardId, columnData } = data;
                
                // Verify permissions
                const user = await User.findById(socket.userId);
                const userRoles = await user.getRoles();
                
                if (!userRoles.hasBoardPermission(boardId, 'canEdit')) {
                    socket.emit('error', { message: 'Insufficient permissions to create columns' });
                    return;
                }

                // Create column
                const column = await Column.create({
                    ...columnData,
                    board: boardId
                });

                // Broadcast to board
                io.to(`board:${boardId}`).emit('column:created', {
                    column: column.toObject(),
                    createdBy: socket.user,
                    timestamp: new Date()
                });

            } catch (error) {
                logger.error('Create column error:', error);
                socket.emit('error', { message: 'Failed to create column' });
            }
        });

        socket.on('column:update', async (data) => {
            try {
                const { columnId, updates } = data;
                
                const column = await Column.findById(columnId);
                if (!column) {
                    socket.emit('error', { message: 'Column not found' });
                    return;
                }

                // Verify permissions
                const user = await User.findById(socket.userId);
                const userRoles = await user.getRoles();
                
                if (!userRoles.hasBoardPermission(column.board, 'canEdit')) {
                    socket.emit('error', { message: 'Insufficient permissions to update columns' });
                    return;
                }

                // Update column
                Object.assign(column, updates);
                await column.save();

                // Broadcast to board
                io.to(`board:${column.board}`).emit('column:updated', {
                    column: column.toObject(),
                    updatedBy: socket.user,
                    timestamp: new Date()
                });

            } catch (error) {
                logger.error('Update column error:', error);
                socket.emit('error', { message: 'Failed to update column' });
            }
        });

        socket.on('column:delete', async (data) => {
            try {
                const { columnId } = data;
                
                const column = await Column.findById(columnId);
                if (!column) {
                    socket.emit('error', { message: 'Column not found' });
                    return;
                }

                // Verify permissions
                const user = await User.findById(socket.userId);
                const userRoles = await user.getRoles();
                
                if (!userRoles.hasBoardPermission(column.board, 'canEdit')) {
                    socket.emit('error', { message: 'Insufficient permissions to delete columns' });
                    return;
                }

                // Check if column has tasks
                const taskCount = await Task.countDocuments({ column: columnId });
                if (taskCount > 0) {
                    socket.emit('error', { message: 'Cannot delete column with tasks' });
                    return;
                }

                const boardId = column.board;
                await Column.findByIdAndDelete(columnId);

                // Broadcast to board
                io.to(`board:${boardId}`).emit('column:deleted', {
                    columnId,
                    deletedBy: socket.user,
                    timestamp: new Date()
                });

            } catch (error) {
                logger.error('Delete column error:', error);
                socket.emit('error', { message: 'Failed to delete column' });
            }
        });

        // Column reordering
        socket.on('columns:reorder', async (data) => {
            try {
                const { boardId, columnOrder } = data;
                
                // Verify permissions
                const user = await User.findById(socket.userId);
                const userRoles = await user.getRoles();
                
                if (!userRoles.hasBoardPermission(boardId, 'canEdit')) {
                    socket.emit('error', { message: 'Insufficient permissions to reorder columns' });
                    return;
                }

                // Update column positions
                const updatePromises = columnOrder.map(({ columnId, position }) =>
                    Column.findByIdAndUpdate(columnId, { position })
                );

                await Promise.all(updatePromises);

                // Broadcast to board
                io.to(`board:${boardId}`).emit('columns:reordered', {
                    columnOrder,
                    reorderedBy: socket.user,
                    timestamp: new Date()
                });

            } catch (error) {
                logger.error('Reorder columns error:', error);
                socket.emit('error', { message: 'Failed to reorder columns' });
            }
        });

        // ===== TASK OPERATIONS =====
        
        // Handle task updates
        socket.on('task:update', async (data) => {
            try {
                const { taskId, updates, boardId } = data;
                
                const task = await Task.findById(taskId);
                if (!task) {
                    socket.emit('error', { message: 'Task not found' });
                    return;
                }

                // Update task
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

        // ===== BOARD SETTINGS & UTILITIES =====
        
        // Board settings updates
        socket.on('board:settings-update', async (data) => {
            try {
                const { boardId, settings } = data;
                
                // Verify permissions
                const user = await User.findById(socket.userId);
                const userRoles = await user.getRoles();
                
                if (!userRoles.hasBoardPermission(boardId, 'canEdit')) {
                    socket.emit('error', { message: 'Insufficient permissions to update board settings' });
                    return;
                }

                const board = await Board.findById(boardId);
                if (!board) {
                    socket.emit('error', { message: 'Board not found' });
                    return;
                }

                // Update settings
                Object.assign(board.settings, settings);
                await board.save();

                // Broadcast to board
                io.to(`board:${boardId}`).emit('board:settings-updated', {
                    settings: board.settings,
                    updatedBy: socket.user,
                    timestamp: new Date()
                });

            } catch (error) {
                logger.error('Update board settings error:', error);
                socket.emit('error', { message: 'Failed to update board settings' });
            }
        });

        // Board view tracking
        socket.on('board:view', async (data) => {
            try {
                const { boardId } = data;
                
                // Track board view for analytics
                const Analytics = require('../models/Analytics');
                await Analytics.create({
                    scopeType: 'board',
                    scopeId: boardId,
                    kind: 'custom',
                    data: {
                        event: 'board_visited',
                        boardId
                    },
                    period: {
                        startDate: new Date(),
                        endDate: new Date(),
                        type: 'custom'
                    }
                });

                // Update user presence
                socket.to(`board:${boardId}`).emit('board:user-viewing', {
                    user: socket.user,
                    timestamp: new Date()
                });

            } catch (error) {
                logger.error('Board view tracking error:', error);
            }
        });

        // Bulk operations
        socket.on('board:bulk-operation', async (data) => {
            try {
                const { boardId, operation, targets, options } = data;
                
                // Verify permissions
                const user = await User.findById(socket.userId);
                const userRoles = await user.getRoles();
                
                if (!userRoles.hasBoardPermission(boardId, 'canEdit')) {
                    socket.emit('error', { message: 'Insufficient permissions for bulk operations' });
                    return;
                }

                let result;
                
                switch (operation) {
                    case 'move_tasks':
                        // Move multiple tasks to different column
                        const { targetColumnId } = options;
                        // Mock board service for testing
                        result = { movedTasks: targets.length, targetColumnId };
                        break;
                        
                    case 'update_tasks':
                        // Bulk update task properties
                        const { updates } = options;
                        // Mock task service for testing
                        result = { updatedTasks: targets.length, updates };
                        break;
                        
                    default:
                        socket.emit('error', { message: 'Unknown bulk operation' });
                        return;
                }

                // Broadcast bulk operation result
                io.to(`board:${boardId}`).emit('board:bulk-operation-completed', {
                    operation,
                    targets,
                    result,
                    performedBy: socket.user,
                    timestamp: new Date()
                });

            } catch (error) {
                logger.error('Board bulk operation error:', error);
                socket.emit('error', { message: 'Bulk operation failed' });
            }
        });

        // ===== USER INTERACTION FEATURES =====
        
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
            message: 'Successfully connected to TaskFlow Board',
            user: socket.user,
            timestamp: new Date()
        });
    });

    // ===== GLOBAL BOARD UTILITIES =====
    
    io.notifyBoard = (boardId, event, data) => {
        io.to(`board:${boardId}`).emit(event, data);
    };

    io.notifyBoardAdmins = async (boardId, event, data) => {
        try {
            // Find users with admin permissions for this board
            const users = await User.find({ isActive: true });
            
            for (const user of users) {
                const userRoles = await user.getRoles();
                if (userRoles.hasBoardPermission(boardId, 'canEdit')) {
                    io.to(`notifications:${user._id}`).emit(event, data);
                }
            }
        } catch (error) {
            logger.error('Notify board admins error:', error);
        }
    };

    // Global socket utilities
    io.notifyUser = (userId, event, data) => {
        io.to(`user:${userId}`).emit(event, data);
    };

    io.notifyProject = (projectId, event, data) => {
        io.to(`project:${projectId}`).emit(event, data);
    };

    return io;
};

module.exports = handleBoardSocket;
