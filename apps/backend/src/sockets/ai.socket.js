const jwt = require('../utils/jwt');
const User = require('../models/User');
const Board = require('../models/Board');
const logger = require('../config/logger');
const googleAIClient = require('../ai/google-ai.client');
const boardGenerationPipeline = require('../ai/board-generation.pipeline');
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
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        };
    } catch (error) {
        logger.error('Socket permission check error:', error);
        return { hasAccess: false, error: 'Permission check failed' };
    }
};

// Helper function to emit error to socket
const emitError = (socket, event, error, message = 'An error occurred') => {
    socket.emit(event, {
        success: false,
        error: message,
        details: error.message || error,
        timestamp: new Date().toISOString()
    });
};

// Helper function to emit success to socket
const emitSuccess = (socket, event, data, message = 'Success') => {
    socket.emit(event, {
        success: true,
        data,
        message,
        timestamp: new Date().toISOString()
    });
};

/**
 * AI Socket Handler
 * Handles real-time AI functionality including board generation, auto-completion, and suggestions
 */
const aiSocket = (io) => {
    const aiNamespace = io.of('/ai');
    
    // Middleware for authentication
    aiNamespace.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
            
            
            if (!token) {
                return next(new Error('Authentication token required'));
            }

            const decoded = jwt.verifyToken(token);
            // Handle both 'userId' and 'id' fields in JWT payload
            const userId = decoded?.userId || decoded?.id;
            if (!decoded || !userId) {
                return next(new Error('Invalid token'));
            }

            // Verify user exists
            const user = await User.findById(userId);
            if (!user) {
                return next(new Error('User not found'));
            }

            socket.userId = userId;
            socket.user = user;
            next();
        } catch (error) {
            logger.error('AI socket authentication error:', error);
            next(new Error('Authentication failed'));
        }
    });

    // Connection handler
    aiNamespace.on('connection', async (socket) => {
        logger.info(`AI socket connected: ${socket.id} (User: ${socket.userId})`);

        // Join user to their personal room
        socket.join(`user_${socket.userId}`);

        // Send connection confirmation
        emitSuccess(socket, 'connected', {
            socketId: socket.id,
            userId: socket.userId,
            features: googleAIClient.getModelInfo().features
        }, 'Connected to AI namespace');

        /**
         * Generate board using AI pipeline
         */
        socket.on('generate_board', async (data) => {
            try {
                const { prompt, options = {} } = data;
                
                if (!prompt || typeof prompt !== 'string') {
                    return emitError(socket, 'board_generation_error', 
                        new Error('Prompt is required'), 'Invalid prompt provided');
                }

                // Check permissions
                const permission = await checkSocketPermission(socket, '/ai/generate', 'POST');
                if (!permission.hasAccess) {
                    return emitError(socket, 'board_generation_error', 
                        new Error('Insufficient permissions'), 'Permission denied');
                }

                // Emit generation started event
                socket.emit('board_generation_started', {
                    prompt: prompt.substring(0, 100) + '...',
                    timestamp: new Date().toISOString()
                });

                // Generate board using pipeline
                const result = await boardGenerationPipeline.generateBoard(prompt, options);

                if (result.success) {
                    emitSuccess(socket, 'board_generated', result.data, 'Board generated successfully');
                } else {
                    // Check if it's an AI service overload error
                    const hasOverloadError = result.errors.some(error => 
                        error.includes('overloaded') || error.includes('503') || error.includes('Service Unavailable')
                    );
                    
                    if (hasOverloadError) {
                        emitError(socket, 'board_generation_error', 
                            new Error('AI service is temporarily overloaded. Please try again in a few minutes.'), 
                            'AI Service Overloaded');
                    } else {
                        emitError(socket, 'board_generation_error', 
                            new Error(result.errors.join(', ')), 'Board generation failed');
                    }
                }

            } catch (error) {
                logger.error('Board generation socket error:', error);
                
                // Check if it's an AI service overload error
                const isOverloadError = error.message && (
                    error.message.includes('overloaded') || 
                    error.message.includes('503') || 
                    error.message.includes('Service Unavailable')
                );
                
                if (isOverloadError) {
                    emitError(socket, 'board_generation_error', 
                        new Error('AI service is temporarily overloaded. Please try again in a few minutes.'), 
                        'AI Service Overloaded');
                } else {
                    emitError(socket, 'board_generation_error', error, 'Board generation failed');
                }
            }
        });

        /**
         * Auto-complete user prompts
         */
        socket.on('auto_complete_prompt', async (data) => {
            try {
                const { partialPrompt, context = {} } = data;
                
                if (!partialPrompt || typeof partialPrompt !== 'string') {
                    return emitError(socket, 'auto_complete_error', 
                        new Error('Partial prompt is required'), 'Invalid prompt provided');
                }

                // Check permissions
                const permission = await checkSocketPermission(socket, '/ai/auto-complete', 'POST');
                if (!permission.hasAccess) {
                    return emitError(socket, 'auto_complete_error', 
                        new Error('Insufficient permissions'), 'Permission denied');
                }

                // Get auto-completion suggestions
                const suggestions = await googleAIClient.autoCompletePrompt(partialPrompt, context);

                emitSuccess(socket, 'auto_complete_suggestions', suggestions, 'Auto-completion suggestions generated');

            } catch (error) {
                logger.error('Auto-complete socket error:', error);
                emitError(socket, 'auto_complete_error', error, 'Auto-completion failed');
            }
        });

        /**
         * Get smart suggestions
         */
        socket.on('get_smart_suggestions', async (data) => {
            try {
                const { input, type = 'board' } = data;
                
                if (!input || typeof input !== 'string') {
                    return emitError(socket, 'smart_suggestions_error', 
                        new Error('Input is required'), 'Invalid input provided');
                }

                // Check permissions
                const permission = await checkSocketPermission(socket, '/ai/suggestions', 'POST');
                if (!permission.hasAccess) {
                    return emitError(socket, 'smart_suggestions_error', 
                        new Error('Insufficient permissions'), 'Permission denied');
                }

                // Get smart suggestions
                const suggestions = await googleAIClient.getSmartSuggestions(input, type);

                emitSuccess(socket, 'smart_suggestions', suggestions, 'Smart suggestions generated');

            } catch (error) {
                logger.error('Smart suggestions socket error:', error);
                emitError(socket, 'smart_suggestions_error', error, 'Smart suggestions failed');
            }
        });

        /**
         * Generate quick templates
         */
        socket.on('get_quick_templates', async (data) => {
            try {
                const { category = 'general', count = 5 } = data;

                // Check permissions
                const permission = await checkSocketPermission(socket, '/ai/templates', 'GET');
                if (!permission.hasAccess) {
                    return emitError(socket, 'quick_templates_error', 
                        new Error('Insufficient permissions'), 'Permission denied');
                }

                // Get quick templates
                const templates = await googleAIClient.generateQuickTemplates(category, count);

                emitSuccess(socket, 'quick_templates', templates, 'Quick templates generated');

            } catch (error) {
                logger.error('Quick templates socket error:', error);
                emitError(socket, 'quick_templates_error', error, 'Quick templates failed');
            }
        });

        /**
         * Generate additional tasks for existing board
         */
        socket.on('generate_additional_tasks', async (data) => {
            try {
                const { boardId, columnName, count = 3 } = data;
                
                if (!boardId || !columnName) {
                    return emitError(socket, 'additional_tasks_error', 
                        new Error('Board ID and column name are required'), 'Invalid parameters');
                }

                // Check permissions
                const permission = await checkSocketPermission(socket, '/ai/tasks', 'POST', boardId);
                if (!permission.hasAccess) {
                    return emitError(socket, 'additional_tasks_error', 
                        new Error('Insufficient permissions'), 'Permission denied');
                }

                // Get board context
                const board = await Board.findById(boardId).populate('columns').populate('tags');
                if (!board) {
                    return emitError(socket, 'additional_tasks_error', 
                        new Error('Board not found'), 'Board not found');
                }

                // Generate additional tasks
                const tasks = await googleAIClient.generateAdditionalTasks(board, columnName, count);

                emitSuccess(socket, 'additional_tasks_generated', tasks, 'Additional tasks generated');

            } catch (error) {
                logger.error('Additional tasks socket error:', error);
                emitError(socket, 'additional_tasks_error', error, 'Additional tasks generation failed');
            }
        });

        /**
         * Get board improvement suggestions
         */
        socket.on('get_improvement_suggestions', async (data) => {
            try {
                const { boardId } = data;
                
                if (!boardId) {
                    return emitError(socket, 'improvement_suggestions_error', 
                        new Error('Board ID is required'), 'Invalid parameters');
                }

                // Check permissions
                const permission = await checkSocketPermission(socket, '/ai/improvements', 'POST', boardId);
                if (!permission.hasAccess) {
                    return emitError(socket, 'improvement_suggestions_error', 
                        new Error('Insufficient permissions'), 'Permission denied');
                }

                // Get board data
                const board = await Board.findById(boardId)
                    .populate('columns')
                    .populate('tags')
                    .populate({
                        path: 'columns',
                        populate: {
                            path: 'taskIds.task',
                            model: 'Task'
                        }
                    });

                if (!board) {
                    return emitError(socket, 'improvement_suggestions_error', 
                        new Error('Board not found'), 'Board not found');
                }

                // Get improvement suggestions
                const suggestions = await googleAIClient.suggestImprovements(board);

                emitSuccess(socket, 'improvement_suggestions', suggestions, 'Improvement suggestions generated');

            } catch (error) {
                logger.error('Improvement suggestions socket error:', error);
                emitError(socket, 'improvement_suggestions_error', error, 'Improvement suggestions failed');
            }
        });

        /**
         * Moderate content
         */
        socket.on('moderate_content', async (data) => {
            try {
                const { text } = data;
                
                if (!text || typeof text !== 'string') {
                    return emitError(socket, 'content_moderation_error', 
                        new Error('Text is required'), 'Invalid text provided');
                }

                // Check permissions
                const permission = await checkSocketPermission(socket, '/ai/moderate', 'POST');
                if (!permission.hasAccess) {
                    return emitError(socket, 'content_moderation_error', 
                        new Error('Insufficient permissions'), 'Permission denied');
                }

                // Moderate content
                const moderation = await googleAIClient.moderateContent(text);

                emitSuccess(socket, 'content_moderated', moderation, 'Content moderation completed');

            } catch (error) {
                logger.error('Content moderation socket error:', error);
                emitError(socket, 'content_moderation_error', error, 'Content moderation failed');
            }
        });

        /**
         * Get AI model information
         */
        socket.on('get_model_info', async () => {
            try {
                // Check permissions
                const permission = await checkSocketPermission(socket, '/ai/model-info', 'GET');
                if (!permission.hasAccess) {
                    return emitError(socket, 'model_info_error', 
                        new Error('Insufficient permissions'), 'Permission denied');
                }

                const modelInfo = googleAIClient.getModelInfo();

                emitSuccess(socket, 'model_info', modelInfo, 'Model information retrieved');

            } catch (error) {
                logger.error('Model info socket error:', error);
                emitError(socket, 'model_info_error', error, 'Model info retrieval failed');
            }
        });

        /**
         * Join board room for real-time updates
         */
        socket.on('join_board_room', async (data) => {
            try {
                const { boardId } = data;
                
                if (!boardId) {
                    return emitError(socket, 'join_board_error', 
                        new Error('Board ID is required'), 'Invalid board ID');
                }

                // Check permissions
                const permission = await checkSocketPermission(socket, '/ai/board', 'GET', boardId);
                if (!permission.hasAccess) {
                    return emitError(socket, 'join_board_error', 
                        new Error('Insufficient permissions'), 'Permission denied');
                }

                // Join board room
                socket.join(`board_${boardId}`);
                
                emitSuccess(socket, 'joined_board_room', { boardId }, 'Joined board room');

            } catch (error) {
                logger.error('Join board room socket error:', error);
                emitError(socket, 'join_board_error', error, 'Failed to join board room');
            }
        });

        /**
         * Leave board room
         */
        socket.on('leave_board_room', async (data) => {
            try {
                const { boardId } = data;
                
                if (boardId) {
                    socket.leave(`board_${boardId}`);
                    emitSuccess(socket, 'left_board_room', { boardId }, 'Left board room');
                } else {
                    // Leave all board rooms
                    const rooms = Array.from(socket.rooms).filter(room => room.startsWith('board_'));
                    rooms.forEach(room => socket.leave(room));
                    emitSuccess(socket, 'left_all_board_rooms', { rooms }, 'Left all board rooms');
                }

            } catch (error) {
                logger.error('Leave board room socket error:', error);
                emitError(socket, 'leave_board_error', error, 'Failed to leave board room');
            }
        });

        /**
         * Handle disconnection
         */
        socket.on('disconnect', (reason) => {
            logger.info(`AI socket disconnected: ${socket.id} (User: ${socket.userId}) - Reason: ${reason}`);
        });

        /**
         * Handle errors
         */
        socket.on('error', (error) => {
            logger.error(`AI socket error: ${socket.id}`, error);
        });
    });

    // Utility functions for external use
    aiNamespace.notifyUser = (userId, event, data) => {
        aiNamespace.to(`user_${userId}`).emit(event, data);
    };

    aiNamespace.notifyBoard = (boardId, event, data) => {
        aiNamespace.to(`board_${boardId}`).emit(event, data);
    };

    aiNamespace.broadcastToAll = (event, data) => {
        aiNamespace.emit(event, data);
    };

    aiNamespace.getConnectedUsers = () => {
        return Array.from(aiNamespace.sockets.keys()).map(socketId => {
            const socket = aiNamespace.sockets.get(socketId);
            return {
                socketId,
                userId: socket.userId,
                connectedAt: socket.connectedAt
            };
        });
    };

    return aiNamespace;
};

module.exports = aiSocket;
