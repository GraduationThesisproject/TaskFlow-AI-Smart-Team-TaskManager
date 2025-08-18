const Notification = require('../models/Notification');
const User = require('../models/User');
const logger = require('../config/logger');

// Handle notification socket events
const handleNotificationSocket = (io) => {
    
    io.on('connection', (socket) => {
        if (!socket.user) return;

        // Join user's personal notification room
        socket.join(`notifications:${socket.userId}`);
        
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
