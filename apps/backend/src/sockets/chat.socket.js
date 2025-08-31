const jwt = require('../utils/jwt');
const Chat = require('../models/Chat');
const User = require('../models/User');
const Admin = require('../models/Admin');
const logger = require('../config/logger');

// Socket authentication middleware for chat
const authenticateChatSocket = async (socket, next) => {
    try {
        const token = socket.handshake.auth.token || socket.handshake.query.token;
        
        if (!token) {
            return next(new Error('Authentication required'));
        }

        const decoded = jwt.verifyToken(token);
        
        // Check if it's an admin or user token
        let user, admin;
        
        try {
            admin = await Admin.findById(decoded.id);
            if (admin) {
                socket.userType = 'admin';
                socket.userId = admin._id.toString();
                socket.user = {
                    id: admin._id,
                    name: admin.userName,
                    email: admin.userEmail,
                    avatar: admin.avatar
                };
            }
        } catch (error) {
            // Not an admin, try user
        }

        if (!admin) {
            try {
                user = await User.findById(decoded.id);
                if (user) {
                    socket.userType = 'user';
                    socket.userId = user._id.toString();
                    socket.user = {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        avatar: user.avatar
                    };
                }
            } catch (error) {
                // Not a user either
            }
        }

        if (!admin && !user) {
            return next(new Error('User not found'));
        }

        logger.info(`Chat socket authenticated: ${socket.user.email} (${socket.userType})`);
        next();
        
    } catch (error) {
        logger.error('Chat socket authentication error:', error);
        next(new Error('Authentication failed'));
    }
};

// Handle chat socket events
const handleChatSocket = (io) => {
    // Create a separate namespace for chat with authentication
    const chatNamespace = io.of('/chat');
    
    // Apply authentication middleware only to chat namespace
    chatNamespace.use(authenticateChatSocket);
    
    chatNamespace.on('connection', (socket) => {
        logger.info(`${socket.userType} connected to chat: ${socket.user.name} (${socket.id})`);

        // Join user's personal chat room
        socket.join(`user:${socket.userId}`);
        
        // Join admin room if admin
        if (socket.userType === 'admin') {
            socket.join('admins');
        }

        // Get user's active chats and join chat rooms
        socket.on('chat:join-rooms', async () => {
            try {
                let chats;
                
                if (socket.userType === 'admin') {
                    chats = await Chat.find({
                        'participants.id': socket.userId,
                        'participants.model': 'Admin'
                    }).select('_id chatId');
                } else {
                    chats = await Chat.find({
                        'participants.id': socket.userId,
                        'participants.model': 'User'
                    }).select('_id chatId');
                }

                // Join all chat rooms
                chats.forEach(chat => {
                    socket.join(`chat:${chat._id}`);
                    socket.join(`chat:${chat.chatId}`);
                });

                socket.emit('chat:rooms-joined', { 
                    count: chats.length,
                    chats: chats.map(c => ({ id: c._id, chatId: c.chatId }))
                });

                logger.info(`${socket.user.name} joined ${chats.length} chat rooms`);
            } catch (error) {
                logger.error('Error joining chat rooms:', error);
                socket.emit('error', { message: 'Failed to join chat rooms' });
            }
        });

        // Join specific chat room
        socket.on('chat:join', async (data) => {
            try {
                const { chatId } = data;
                
                if (!chatId) {
                    socket.emit('error', { message: 'Chat ID is required' });
                    return;
                }

                // Verify user is participant in this chat
                const chat = await Chat.findOne({
                    $or: [
                        { _id: chatId },
                        { chatId: chatId }
                    ],
                    'participants.id': socket.userId
                });

                if (!chat) {
                    socket.emit('error', { message: 'Chat not found or access denied' });
                    return;
                }

                socket.join(`chat:${chat._id}`);
                socket.join(`chat:${chat.chatId}`);
                
                // Mark messages as read
                await Chat.findByIdAndUpdate(chat._id, {
                    $set: {
                        'messages.$[elem].isRead': true,
                        'messages.$[elem].readAt': new Date()
                    }
                }, {
                    arrayFilters: [
                        {
                            'elem.sender.id': { $ne: socket.userId },
                            'elem.isRead': false
                        }
                    ]
                });

                socket.emit('chat:joined', { 
                    chatId: chat._id,
                    chatIdString: chat.chatId
                });

                // Notify other participants
                socket.to(`chat:${chat._id}`).emit('chat:user-joined', {
                    chatId: chat._id,
                    user: {
                        id: socket.userId,
                        name: socket.user.name,
                        type: socket.userType
                    }
                });

                logger.info(`${socket.user.name} joined chat ${chat.chatId}`);
            } catch (error) {
                logger.error('Error joining chat:', error);
                socket.emit('error', { message: 'Failed to join chat' });
            }
        });

        // Leave chat room
        socket.on('chat:leave', async (data) => {
            try {
                const { chatId } = data;
                
                if (!chatId) {
                    socket.emit('error', { message: 'Chat ID is required' });
                    return;
                }

                socket.leave(`chat:${chatId}`);
                
                // Notify other participants
                socket.to(`chat:${chatId}`).emit('chat:user-left', {
                    chatId,
                    user: {
                        id: socket.userId,
                        name: socket.user.name,
                        type: socket.userType
                    }
                });

                socket.emit('chat:left', { chatId });
                logger.info(`${socket.user.name} left chat ${chatId}`);
            } catch (error) {
                logger.error('Error leaving chat:', error);
                socket.emit('error', { message: 'Failed to leave chat' });
            }
        });

        // Typing indicator
        socket.on('chat:typing', (data) => {
            const { chatId, isTyping } = data;
            
            if (chatId) {
                socket.to(`chat:${chatId}`).emit('chat:user-typing', {
                    chatId,
                    user: {
                        id: socket.userId,
                        name: socket.user.name,
                        type: socket.userType
                    },
                    isTyping
                });
            }
        });

        // Mark message as read
        socket.on('chat:mark-read', async (data) => {
            try {
                const { chatId, messageIds } = data;
                
                if (!chatId || !messageIds || !Array.isArray(messageIds)) {
                    socket.emit('error', { message: 'Invalid parameters' });
                    return;
                }

                // Verify user is participant in this chat
                const chat = await Chat.findOne({
                    $or: [
                        { _id: chatId },
                        { chatId: chatId }
                    ],
                    'participants.id': socket.userId
                });

                if (!chat) {
                    socket.emit('error', { message: 'Chat not found or access denied' });
                    return;
                }

                // Mark messages as read
                await Chat.findByIdAndUpdate(chat._id, {
                    $set: {
                        'messages.$[elem].isRead': true,
                        'messages.$[elem].readAt': new Date()
                    }
                }, {
                    arrayFilters: [
                        {
                            '_id': { $in: messageIds },
                            'elem.sender.id': { $ne: socket.userId }
                        }
                    ]
                });

                // Notify other participants
                socket.to(`chat:${chatId}`).emit('chat:messages-read', {
                    chatId,
                    messageIds,
                    readBy: socket.userId
                });

                socket.emit('chat:marked-read', { chatId, messageIds });
            } catch (error) {
                logger.error('Error marking messages as read:', error);
                socket.emit('error', { message: 'Failed to mark messages as read' });
            }
        });

        // Get chat participants
        socket.on('chat:get-participants', async (data) => {
            try {
                const { chatId } = data;
                
                if (!chatId) {
                    socket.emit('error', { message: 'Chat ID is required' });
                    return;
                }

                const chat = await Chat.findOne({
                    $or: [
                        { _id: chatId },
                        { chatId: chatId }
                    ]
                }).populate('participants.id', 'name avatar email isOnline lastSeen');

                if (!chat) {
                    socket.emit('error', { message: 'Chat not found' });
                    return;
                }

                socket.emit('chat:participants', {
                    chatId,
                    participants: chat.participants
                });
            } catch (error) {
                logger.error('Error getting chat participants:', error);
                socket.emit('error', { message: 'Failed to get participants' });
            }
        });

        // Update user online status
        socket.on('chat:update-status', async (data) => {
            try {
                const { isOnline } = data;
                
                if (socket.userType === 'admin') {
                    await Admin.findByIdAndUpdate(socket.userId, {
                        isOnline,
                        lastSeen: isOnline ? undefined : new Date()
                    });
                } else {
                    await User.findByIdAndUpdate(socket.userId, {
                        isOnline,
                        lastSeen: isOnline ? undefined : new Date()
                    });
                }

                // Notify all chat rooms user is in
                socket.rooms.forEach(room => {
                    if (room.startsWith('chat:')) {
                        socket.to(room).emit('chat:user-status', {
                            chatId: room.replace('chat:', ''),
                            user: {
                                id: socket.userId,
                                name: socket.user.name,
                                type: socket.userType,
                                isOnline,
                                lastSeen: isOnline ? undefined : new Date()
                            }
                        });
                    }
                });

                logger.info(`${socket.user.name} status updated: ${isOnline ? 'online' : 'offline'}`);
            } catch (error) {
                logger.error('Error updating user status:', error);
                socket.emit('error', { message: 'Failed to update status' });
            }
        });

        // Handle disconnection
        socket.on('disconnect', async () => {
            try {
                // Update user offline status
                if (socket.userType === 'admin') {
                    await Admin.findByIdAndUpdate(socket.userId, {
                        isOnline: false,
                        lastSeen: new Date()
                    });
                } else {
                    await User.findByIdAndUpdate(socket.userId, {
                        isOnline: false,
                        lastSeen: new Date()
                    });
                }

                // Notify all chat rooms user was in
                socket.rooms.forEach(room => {
                    if (room.startsWith('chat:')) {
                        socket.to(room).emit('chat:user-status', {
                            chatId: room.replace('chat:', ''),
                            user: {
                                id: socket.userId,
                                name: socket.user.name,
                                type: socket.userType,
                                isOnline: false,
                                lastSeen: new Date()
                            }
                        });
                    }
                });

                logger.info(`${socket.user.name} disconnected from chat socket`);
            } catch (error) {
                logger.error('Error handling disconnect:', error);
            }
        });

        logger.info(`${socket.user.name} connected to chat socket`);
    });

    // Global chat utilities for the application
    io.sendChatMessage = async (chatId, messageData) => {
        try {
            // Emit message to all participants in the chat room
            io.to(`chat:${chatId}`).emit('chat:message', {
                message: messageData,
                chatId
            });

            logger.info(`Chat message sent to room ${chatId}`);
        } catch (error) {
            logger.error('Error sending chat message:', error);
            throw error;
        }
    };

    io.updateChatStatus = async (chatId, statusData) => {
        try {
            // Emit status update to all participants in the chat room
            io.to(`chat:${chatId}`).emit('chat:status-updated', {
                chatId,
                ...statusData
            });

            logger.info(`Chat status updated for room ${chatId}`);
        } catch (error) {
            logger.error('Error updating chat status:', error);
            throw error;
        }
    };

    io.assignChat = async (chatId, assignmentData) => {
        try {
            // Emit assignment update to all participants in the chat room
            io.to(`chat:${chatId}`).emit('chat:assigned', {
                chatId,
                ...assignmentData
            });

            logger.info(`Chat assigned for room ${chatId}`);
        } catch (error) {
            logger.error('Error assigning chat:', error);
            throw error;
        }
    };

    return io;
};

module.exports = handleChatSocket;
