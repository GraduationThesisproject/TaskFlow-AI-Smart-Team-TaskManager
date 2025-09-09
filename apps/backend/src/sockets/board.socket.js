const jwt = require('../utils/jwt');
const Board = require('../models/Board');
const Column = require('../models/Column');
const Task = require('../models/Task');
const User = require('../models/User');
const Comment = require('../models/Comment');
const logger = require('../config/logger');
const { hasPermission, getRoleLevel } = require('../config/pathPermissions');

// Helper function to check socket permissions
const checkSocketPermission = async (socket, path, method, boardId = null) => {
    try {
        const user = await User.findById(socket.userId);
        if (!user) {
            return { hasAccess: false, error: 'User not found' };
        }

        // Get user's role for the board
        let userRole = 'viewer'; // default role
        
        if (boardId) {
            const board = await Board.findById(boardId);
            if (board) {
                // Check if user is owner
                if (board.owner && board.owner.toString() === socket.userId) {
                    userRole = 'owner';
                } else {
                    // Check if user is admin or member
                    const userRoles = await user.getRoles();
                    if (userRoles.hasBoardPermission(boardId, 'canEdit')) {
                        userRole = 'admin';
                    } else if (userRoles.hasBoardPermission(boardId, 'canView')) {
                        userRole = 'member';
                    }
                }
            }
        } else {
            // For non-board specific operations, get user's general role
            const userRoles = await user.getRoles();
            if (userRoles.isAdmin) {
                userRole = 'admin';
            } else {
                userRole = 'member';
            }
        }

        const hasAccess = hasPermission(userRole, path, method);
        
        return { 
            hasAccess, 
            userRole,
            error: hasAccess ? null : 'Insufficient permissions'
        };
    } catch (error) {
        logger.error('Socket permission check error:', error);
        return { hasAccess: false, error: 'Permission check failed' };
    }
};

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
    // Create board namespace
    const boardNamespace = io.of('/board');
    
    // Apply authentication middleware
    boardNamespace.use(authenticateSocket);
    
    boardNamespace.on('connection', (socket) => {
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
                
                // Check permissions using pathPermissions
                const permissionCheck = await checkSocketPermission(
                    socket, 
                    '/board/:id/columns', 
                    'POST', 
                    boardId
                );
                
                if (!permissionCheck.hasAccess) {
                    socket.emit('error', { 
                        code: 'FORBIDDEN', 
                        message: permissionCheck.error 
                    });
                    return;
                }

                // Create column
                const column = await Column.create({
                    ...columnData,
                    board: boardId
                });

                // Broadcast to board
                boardNamespace.to(`board:${boardId}`).emit('column:created', {
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

                // Check permissions using pathPermissions
                const permissionCheck = await checkSocketPermission(
                    socket, 
                    '/board/:id/columns/:columnId', 
                    'PUT', 
                    column.board
                );
                
                if (!permissionCheck.hasAccess) {
                    socket.emit('error', { 
                        code: 'FORBIDDEN', 
                        message: permissionCheck.error 
                    });
                    return;
                }

                // Update column
                Object.assign(column, updates);
                await column.save();

                // Broadcast to board
                boardNamespace.to(`board:${column.board}`).emit('column:updated', {
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

                // Check permissions using pathPermissions
                const permissionCheck = await checkSocketPermission(
                    socket, 
                    '/board/:id/columns/:columnId', 
                    'DELETE', 
                    column.board
                );
                
                if (!permissionCheck.hasAccess) {
                    socket.emit('error', { 
                        code: 'FORBIDDEN', 
                        message: permissionCheck.error 
                    });
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
                boardNamespace.to(`board:${boardId}`).emit('column:deleted', {
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
           logger.info('columns:reorder', data);
            try {
                const { boardId, columnOrder } = data;
                
                // Check permissions using pathPermissions
                const permissionCheck = await checkSocketPermission(
                    socket, 
                    '/board/:id/columns/reorder', 
                    'PATCH', 
                    boardId
                );
                
                if (!permissionCheck.hasAccess) {
                    socket.emit('error', { 
                        code: 'FORBIDDEN', 
                        message: permissionCheck.error 
                    });
                    return;
                }

                // Update column positions
                const updatePromises = columnOrder.map(({ columnId, position }) =>
                    Column.findByIdAndUpdate(columnId, { position })
                );

                await Promise.all(updatePromises);

                // Broadcast to board
                boardNamespace.to(`board:${boardId}`).emit('columns:reordered', {
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
        
        // Handle task creation
        socket.on('task:create', async (data) => {
            try {
                const { taskData, boardId } = data;
                logger.info(`Task creation request received:`, { taskData, boardId, userId: socket.userId });
                
                // Check permissions using pathPermissions
                const permissionCheck = await checkSocketPermission(
                    socket, 
                    '/task', 
                    'POST', 
                    boardId
                );
                
                logger.info(`Permission check result:`, permissionCheck);
                
                if (!permissionCheck.hasAccess) {
                    logger.error(`Permission denied for task creation:`, permissionCheck);
                    socket.emit('error', { 
                        code: 'FORBIDDEN', 
                        message: permissionCheck.error 
                    });
                    return;
                }

                // Get board to get space ID
                const board = await Board.findById(boardId);
                if (!board) {
                    socket.emit('error', { message: 'Board not found' });
                    return;
                }

                // Create task
                const task = new Task({
                    ...taskData,
                    board: boardId,
                    space: board.space, // Get space from board
                    reporter: socket.userId,
                    lastActivity: new Date()
                });
                
                logger.info(`Creating task with data:`, task.toObject());
                await task.save();
                logger.info(`Task saved successfully: ${task._id}`);
                await task.populate('assignees', 'name email avatar');
                await task.populate('reporter', 'name email avatar');

                // Broadcast to all users in the board
                boardNamespace.to(`board:${boardId}`).emit('task:created', {
                    task: task.toObject(),
                    createdBy: socket.user,
                    timestamp: new Date()
                });

                logger.info(`Task ${task._id} created by ${socket.user.name}`);

            } catch (error) {
                logger.error('Task creation error:', error);
                socket.emit('error', { message: 'Failed to create task' });
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

                // Check permissions using pathPermissions
                const permissionCheck = await checkSocketPermission(
                    socket, 
                    '/task/:id', 
                    'PUT', 
                    boardId
                );
                
                if (!permissionCheck.hasAccess) {
                    socket.emit('error', { 
                        code: 'FORBIDDEN', 
                        message: permissionCheck.error 
                    });
                    return;
                }

                // Update task
                Object.assign(task, updates);
                task.lastActivity = new Date();
                await task.save();

                await task.populate('assignees', 'name email avatar');
                await task.populate('reporter', 'name email avatar');

                // Broadcast to all users in the board
                boardNamespace.to(`board:${boardId}`).emit('task:updated', {
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

                // Check permissions using pathPermissions
                const permissionCheck = await checkSocketPermission(
                    socket, 
                    '/task/:id/move', 
                    'POST', 
                    boardId
                );
                
                if (!permissionCheck.hasAccess) {
                    socket.emit('error', { 
                        code: 'FORBIDDEN', 
                        message: permissionCheck.error 
                    });
                    return;
                }

                // Update task position and column
                task.column = targetColumnId;
                task.position = targetPosition;
                await task.save();

                // Broadcast task movement to board
                boardNamespace.to(`board:${boardId}`).emit('task:moved', {
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

        // Handle task deletion
        socket.on('task:delete', async (data) => {
            try {
                const { taskId, boardId } = data;
                
                const task = await Task.findById(taskId);
                if (!task) {
                    socket.emit('error', { message: 'Task not found' });
                    return;
                }

                // Check permissions using pathPermissions
                const permissionCheck = await checkSocketPermission(
                    socket, 
                    '/task/:id', 
                    'DELETE', 
                    boardId
                );
                
                if (!permissionCheck.hasAccess) {
                    socket.emit('error', { 
                        code: 'FORBIDDEN', 
                        message: permissionCheck.error 
                    });
                    return;
                }

                // Delete task
                await Task.findByIdAndDelete(taskId);

                // Broadcast to all users in the board
                boardNamespace.to(`board:${boardId}`).emit('task:deleted', {
                    taskId,
                    deletedBy: socket.user,
                    timestamp: new Date()
                });

                logger.info(`Task ${taskId} deleted by ${socket.user.name}`);

            } catch (error) {
                logger.error('Task deletion error:', error);
                socket.emit('error', { message: 'Failed to delete task' });
            }
        });

        // Handle real-time comments
        socket.on('comment:add', async (data) => {
            try {
                const { taskId, content, mentions = [] } = data;
                
                const task = await Task.findById(taskId);
                if (!task) {
                    socket.emit('error', { message: 'Task not found' });
                    return;
                }

                // Check permissions using pathPermissions
                const permissionCheck = await checkSocketPermission(
                    socket, 
                    '/task/:id/comments', 
                    'POST', 
                    task.board
                );
                
                if (!permissionCheck.hasAccess) {
                    socket.emit('error', { 
                        code: 'FORBIDDEN', 
                        message: permissionCheck.error 
                    });
                    return;
                }
                
                const comment = await Comment.create({
                    content,
                    task: taskId,
                    author: socket.userId,
                    mentions
                });

                await comment.populate('author', 'name email avatar');
                await comment.populate('mentions', 'name email avatar');
                
                // Broadcast to board and mentioned users
                boardNamespace.to(`board:${task.board}`).emit('comment:added', {
                    comment: comment.toObject(),
                    taskId,
                    timestamp: new Date()
                });

                // Send notifications to mentioned users
                for (const mentionId of mentions) {
                    boardNamespace.to(`user:${mentionId}`).emit('notification', {
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
                
                // Check permissions using pathPermissions
                const permissionCheck = await checkSocketPermission(
                    socket, 
                    '/board/:id/settings', 
                    'PUT', 
                    boardId
                );
                
                if (!permissionCheck.hasAccess) {
                    socket.emit('error', { 
                        code: 'FORBIDDEN', 
                        message: permissionCheck.error 
                    });
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
                boardNamespace.to(`board:${boardId}`).emit('board:settings-updated', {
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
                
                // Check permissions using pathPermissions - using board edit permission
                const permissionCheck = await checkSocketPermission(
                    socket, 
                    '/board/:id', 
                    'PUT', 
                    boardId
                );
                
                if (!permissionCheck.hasAccess) {
                    socket.emit('error', { 
                        code: 'FORBIDDEN', 
                        message: permissionCheck.error 
                    });
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
                boardNamespace.to(`board:${boardId}`).emit('board:bulk-operation-completed', {
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
    
    boardNamespace.notifyBoard = (boardId, event, data) => {
        boardNamespace.to(`board:${boardId}`).emit(event, data);
    };

    boardNamespace.notifyBoardAdmins = async (boardId, event, data) => {
        try {
            // Find users with admin permissions for this board
            const users = await User.find({ isActive: true });
            
            for (const user of users) {
                const userRoles = await user.getRoles();
                if (userRoles.hasBoardPermission(boardId, 'canEdit')) {
                    boardNamespace.to(`notifications:${user._id}`).emit(event, data);
                }
            }
        } catch (error) {
            logger.error('Notify board admins error:', error);
        }
    };

    // Global socket utilities
    boardNamespace.notifyUser = (userId, event, data) => {
        boardNamespace.to(`user:${userId}`).emit(event, data);
    };

    boardNamespace.notifyProject = (projectId, event, data) => {
        boardNamespace.to(`project:${projectId}`).emit(event, data);
    };

    return boardNamespace;
};

module.exports = handleBoardSocket;
