const jwt = require('../utils/jwt');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Admin = require('../models/Admin');
const logger = require('../config/logger');

// Socket authentication middleware
const authenticateSocket = async (socket, next) => {
    try {
        const token = socket.handshake.auth.token || socket.handshake.query.token;
        
        if (!token) {
            return next(new Error('Authentication required'));
        }

        logger.info(`Socket auth: Verifying token: ${token.substring(0, 20)}...`);
        
        const decoded = jwt.verifyToken(token);
        logger.info(`Socket auth: Token decoded:`, decoded);
        
        // Try to find user in User model first
        let user = await User.findById(decoded.id);
        let isAdmin = false;
        
        if (user) {
            logger.info(`Socket auth: Found user: ${user.email}`);
        } else {
            logger.info(`Socket auth: User not found, trying Admin model...`);
            logger.info(`Socket auth: Admin model type: ${typeof Admin}`);
            logger.info(`Socket auth: Admin model: ${Admin}`);
            
            // If not found in User model, try Admin model
            try {
                const admin = await Admin.findById(decoded.id);
                logger.info(`Socket auth: Admin query result: ${admin}`);
                
                if (admin) {
                    user = admin;
                    isAdmin = true;
                    logger.info(`Socket auth: Found admin: ${admin.userEmail}`);
                } else {
                    logger.info(`Socket auth: Admin not found either`);
                }
            } catch (adminError) {
                logger.error(`Socket auth: Error querying Admin model:`, adminError);
            }
        }
        
        if (!user) {
            logger.error(`Socket auth: No user or admin found for ID: ${decoded.id}`);
            return next(new Error('User not found'));
        }

        socket.userId = user._id.toString();
        socket.user = {
            id: user._id,
            name: isAdmin ? user.userName : user.name,
            email: isAdmin ? user.userEmail : user.email,
            avatar: user.avatar,
            isAdmin: isAdmin
        };

        logger.info(`Socket authenticated: ${isAdmin ? user.userEmail : user.email} (${isAdmin ? 'Admin' : 'User'})`);
        next();
        
    } catch (error) {
        logger.error('Socket authentication error:', error);
        next(new Error('Authentication failed'));
    }
};

// Handle notification socket events
const handleNotificationSocket = (io) => {
    // Create a separate namespace for notifications with authentication
    const notificationNamespace = io.of('/notifications');
    
    // Apply authentication middleware only to notification namespace
    notificationNamespace.use(authenticateSocket);
    
    notificationNamespace.on('connection', (socket) => {
        logger.info(`User connected: ${socket.user.name} (${socket.id})`);

        // Join user's personal notification room
        socket.join(`notifications:${socket.userId}`);
        // Also join user's activity room for real-time activity stream
        socket.join(`activities:${socket.userId}`);
        
        // Send unread notification count on connection
        socket.on('notifications:getUnreadCount', async () => {
            try {
                const count = await Notification.countDocuments({
                    recipient: socket.userId,
                    isRead: false
                });

                socket.emit('notifications:unreadCount', { count });
            } catch (error) {
                logger.error('Get unread count error:', error);
                socket.emit('error', { message: 'Failed to get unread count' });
            }
        });

        // Mark notification as read
        socket.on('notifications:markRead', async (data) => {
            try {
                const { notificationId } = data;
                
                const notification = await Notification.findOne({
                    _id: notificationId,
                    recipient: socket.userId
                });

                if (notification && !notification.isRead) {
                    notification.isRead = true;
                    notification.readAt = new Date();
                    await notification.save();

                    // Emit updated unread count
                    const unreadCount = await Notification.countDocuments({
                        recipient: socket.userId,
                        isRead: false
                    });

                    socket.emit('notifications:unreadCount', { count: unreadCount });
                    socket.emit('notifications:marked-read', { notificationId });
                }
            } catch (error) {
                logger.error('Mark notification as read error:', error);
                socket.emit('error', { message: 'Failed to mark notification as read' });
            }
        });

        // Mark all notifications as read
        socket.on('notifications:markAllRead', async () => {
            try {
                await Notification.updateMany(
                    { recipient: socket.userId, isRead: false },
                    { isRead: true, readAt: new Date() }
                );

                socket.emit('notifications:unreadCount', { count: 0 });
                socket.emit('notifications:all-marked-read');
            } catch (error) {
                logger.error('Mark all notifications as read error:', error);
                socket.emit('error', { message: 'Failed to mark all notifications as read' });
            }
        });

        // Get recent notifications
        socket.on('notifications:getRecent', async (data) => {
            try {
                const { limit = 10 } = data || {};
                
                const notifications = await Notification.find({
                    recipient: socket.userId
                })
                .populate('sender', 'name avatar')
                .sort({ createdAt: -1 })
                .limit(limit);

                socket.emit('notifications:recent', { notifications });
            } catch (error) {
                logger.error('Get recent notifications error:', error);
                socket.emit('error', { message: 'Failed to get recent notifications' });
            }
        });

        // Subscribe to specific notification types
        socket.on('notifications:subscribe', async (data) => {
            try {
                const { types = [] } = data;
                
                // Join rooms for specific notification types
                types.forEach(type => {
                    socket.join(`notifications:${socket.userId}:${type}`);
                });

                socket.emit('notifications:subscribed', { types });
                logger.info(`User ${socket.user.name} subscribed to notification types: ${types.join(', ')}`);
            } catch (error) {
                logger.error('Subscribe to notifications error:', error);
                socket.emit('error', { message: 'Failed to subscribe to notifications' });
            }
        });

        // Unsubscribe from notification types
        socket.on('notifications:unsubscribe', async (data) => {
            try {
                const { types = [] } = data;
                
                types.forEach(type => {
                    socket.leave(`notifications:${socket.userId}:${type}`);
                });

                socket.emit('notifications:unsubscribed', { types });
            } catch (error) {
                logger.error('Unsubscribe from notifications error:', error);
                socket.emit('error', { message: 'Failed to unsubscribe from notifications' });
            }
        });

        // Update notification delivery status
        socket.on('notifications:delivered', async (data) => {
            try {
                const { notificationId, deliveryMethod } = data;
                
                await Notification.findByIdAndUpdate(notificationId, {
                    [`deliveryStatus.${deliveryMethod}`]: 'delivered'
                });
            } catch (error) {
                logger.error('Update delivery status error:', error);
            }
        });

        // Test event for direct notification testing
        socket.on('notifications:test', async (data) => {
            try {
                const { title, message, type, recipient } = data;
                
                logger.info(`Test notification requested: ${title} for recipient ${recipient}`);
                
                // Create test notification in database
                const notification = await Notification.create({
                    title,
                    message,
                    type: type || 'system_alert',
                    recipient: recipient || socket.userId,
                    sender: socket.userId,
                    category: 'system',
                    priority: 'medium',
                    relatedEntity: {
                        entityType: 'user',
                        entityId: socket.userId
                    }
                });

                await notification.populate('sender', 'name avatar');

                // Send real-time notification
                notificationNamespace.to(`notifications:${recipient || socket.userId}`).emit('notification:new', {
                    notification: notification.toObject()
                });

                // Update unread count
                const unreadCount = await Notification.countDocuments({
                    recipient: recipient || socket.userId,
                    isRead: false
                });

                notificationNamespace.to(`notifications:${recipient || socket.userId}`).emit('notifications:unreadCount', { 
                    count: unreadCount 
                });

                logger.info(`Test notification sent successfully: ${notification._id}`);
                
            } catch (error) {
                logger.error('Test notification error:', error);
                socket.emit('error', { message: 'Failed to send test notification' });
            }
        });

        logger.info(`User ${socket.user.name} connected to notification socket`);
    });

    // Global notification utilities for the application
    io.sendNotification = async (recipientId, notificationData) => {
        try {
            // Create notification in database
            const notification = await Notification.create({
                ...notificationData,
                recipient: recipientId
            });

            await notification.populate('sender', 'name avatar');

            // Send real-time notification
            io.to(`notifications:${recipientId}`).emit('notification:new', {
                notification: notification.toObject()
            });

            // Send to specific type subscribers
            if (notificationData.type) {
                io.to(`notifications:${recipientId}:${notificationData.type}`).emit('notification:typed', {
                    notification: notification.toObject(),
                    type: notificationData.type
                });
            }

            // Update unread count
            const unreadCount = await Notification.countDocuments({
                recipient: recipientId,
                isRead: false
            });

            io.to(`notifications:${recipientId}`).emit('notifications:unreadCount', { 
                count: unreadCount 
            });

            return notification;
        } catch (error) {
            logger.error('Send notification error:', error);
            throw error;
        }
    };

    // Bulk notification sender
    io.sendBulkNotifications = async (notifications) => {
        try {
            const results = [];
            
            for (const notifData of notifications) {
                try {
                    const notification = await io.sendNotification(notifData.recipient, notifData);
                    results.push({ success: true, notification });
                } catch (error) {
                    results.push({ success: false, error: error.message, recipient: notifData.recipient });
                }
            }

            return results;
        } catch (error) {
            logger.error('Send bulk notifications error:', error);
            throw error;
        }
    };

    // System-wide notification broadcast
    io.broadcastSystemNotification = async (notificationData, userFilter = {}) => {
        try {
            // Find users matching filter
            const users = await User.find({ isActive: true, ...userFilter }).select('_id');
            
            const notifications = users.map(user => ({
                ...notificationData,
                recipient: user._id
            }));

            return await io.sendBulkNotifications(notifications);
        } catch (error) {
            logger.error('Broadcast system notification error:', error);
            throw error;
        }
    };

    return io;
};

module.exports = handleNotificationSocket;
