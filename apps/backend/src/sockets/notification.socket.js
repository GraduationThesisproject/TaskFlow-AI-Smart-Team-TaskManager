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
        
        // Basic connection diagnostics for stability and troubleshooting
        socket.on('connect_error', (err) => {
            logger.error(`Notification socket connect_error for ${socket.user.email}: ${err.message}`, err);
        });
        socket.on('error', (err) => {
            logger.error(`Notification socket error for ${socket.user.email}: ${err.message}`, err);
        });
        socket.on('disconnect', (reason) => {
            logger.info(`Notification socket disconnected for ${socket.user.email}: ${reason}`);
        });
        
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
                 notificationNamespace.to(`notifications:${recipientId}`).emit('notifications:deleted', { id: notifId });
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
                 notificationNamespace.to(`notifications:${recipientId}`).emit('notification:new', {
                     notification: notificationDoc
                 });
                 // Send to specific type subscribers
                 if (notificationData.type) {
                     notificationNamespace.to(`notifications:${recipientId}:${notificationData.type}`).emit('notification:typed', {
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

             notificationNamespace.to(`notifications:${recipientId}`).emit('notifications:unreadCount', { 
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

    // Helper used by controllers to emit arbitrary events to a user within the notifications namespace
    io.notifyUser = (recipientId, event, payload) => {
        try {
            notificationNamespace.to(`notifications:${recipientId}`).emit(event, payload);
        } catch (err) {
            logger.error(`notifyUser emit error for ${recipientId} on event ${event}: ${err.message}`, err);
        }
    };

    return io;
};

module.exports = handleNotificationSocket;
