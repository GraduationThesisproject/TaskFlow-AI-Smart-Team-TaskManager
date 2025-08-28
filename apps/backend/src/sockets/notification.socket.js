const jwt = require('../utils/jwt');
const Notification = require('../models/Notification');
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

// Handle notification socket events
const handleNotificationSocket = (io) => {
    // Apply authentication middleware
    io.use(authenticateSocket);
    
    io.on('connection', (socket) => {
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

        // Mark notification as read (DEPRECATED - use REST endpoint instead)
        socket.on('notifications:markRead', async (data) => {
            try {
                // Deprecated: do not auto-mark read via socket anymore
                socket.emit('notifications:error', { message: 'Deprecated: use PATCH /api/notifications/:id/read' });
            } catch (error) {
                logger.error('Mark notification as read (socket) error:', error);
            }
        });

        // Mark all notifications as read (DEPRECATED - use REST endpoint instead)
        socket.on('notifications:markAllRead', async () => {
            try {
                // Deprecated: do not auto-mark read via socket anymore
                socket.emit('notifications:error', { message: 'Deprecated: use PATCH /api/notifications/read-all' });
            } catch (error) {
                logger.error('Mark all notifications as read (socket) error:', error);
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
            let notificationDoc;
            const readOption = notificationData?.readOption; // 'mark_read' | 'delete' | undefined
 
             // If notification already exists (has _id), don't recreate it
             if (notificationData && notificationData._id) {
                 // Ensure we have a plain object to emit
                 const notifObj = notificationData.toObject ? notificationData.toObject() : notificationData;
                 notificationDoc = notifObj;
             } else {
                 // Create notification in database
                 const created = await Notification.create({
                     ...notificationData,
                     recipient: recipientId
                 });

                 await created.populate('sender', 'name avatar');
                 notificationDoc = created.toObject();
             }
 
             // Apply read/delete option BEFORE emitting
             let deleted = false;
             const notifId = notificationDoc._id || notificationData._id;
             if (readOption === 'delete' && notifId) {
                 await Notification.findOneAndDelete({ _id: notifId, recipient: recipientId });
                 deleted = true;
                 // Inform client of deletion instead of sending 'new'
                 io.to(`notifications:${recipientId}`).emit('notifications:deleted', { id: notifId });
             } else if (readOption === 'mark_read' && notifId) {
                 await Notification.findOneAndUpdate(
                     { _id: notifId, recipient: recipientId },
                     { isRead: true, readAt: new Date() },
                     { new: false }
                 );
                 // Reflect locally for emission
                 notificationDoc.isRead = true;
                 notificationDoc.readAt = new Date();
             }
 
             // Emit 'new' only if not deleted
             if (!deleted) {
                 io.to(`notifications:${recipientId}`).emit('notification:new', {
                     notification: notificationDoc
                 });
                 // Send to specific type subscribers
                 if (notificationData.type) {
                     io.to(`notifications:${recipientId}:${notificationData.type}`).emit('notification:typed', {
                         notification: notificationDoc,
                         type: notificationData.type
                     });
                 }
             }
 
             // Update unread count
             const unreadCount = await Notification.countDocuments({
                 recipient: recipientId,
                 isRead: false
             });
 
             io.to(`notifications:${recipientId}`).emit('notifications:unreadCount', { 
                 count: unreadCount 
             });
 
             return notificationDoc;
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
