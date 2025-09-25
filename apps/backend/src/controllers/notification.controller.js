const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { sendResponse } = require('../utils/response');
const logger = require('../config/logger');

// Get user notifications
exports.getNotifications = async (req, res) => {
    try {
        const { limit = 50, page = 1, isRead, types, priority, entityType, entityId} = req.query;
        const userId = req.user.id;

        // Reduced noisy logs; keep minimal in debug if needed

        let query = { recipient: userId };
        
        // Filter by read status
        if (isRead !== undefined) {
            query.isRead = isRead === 'true';
        }
        
        // Filter by type (multiple)
        if (types) {
            query.type = { $in: types.split(',') };
        }
        
        // Filter by priority
        if (priority) {
            query.priority = priority;
        }

        // Filter by related entity
        if (entityType && entityId) {
            query['relatedEntity.entityType'] = entityType;
            query['relatedEntity.entityId'] = entityId;
        }

        const notifications = await Notification.find(query)
            .populate('sender', 'name avatar')
            .populate('relatedEntity.entityId')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await Notification.countDocuments(query);
        const unreadCount = await Notification.countDocuments({ recipient: userId, isRead: false });

        // Optionally log with proper logger at debug level instead of console

        sendResponse(res, 200, true, 'Notifications retrieved successfully', {
            notifications,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalItems: total,
                currentPage: parseInt(page),
                pages: Math.ceil(total / parseInt(limit))
            },
            unreadCount
        });
    } catch (error) {
        logger.error('Get notifications error:', error);
        sendResponse(res, 500, false, 'Server error retrieving notifications');
    }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
    try {
        const { id: notificationId } = req.params;
        const userId = req.user.id;

        // logger.debug(`[markAsRead] notificationId: ${notificationId} userId: ${userId}`);

        const notification = await Notification.findById(notificationId);

        if (!notification) {
            // logger.debug(`[markAsRead] notification not found: ${notificationId}`);
            return sendResponse(res, 404, false, 'Notification not found');
        }

        // Check if user owns the notification
        if (notification.recipient.toString() !== userId.toString()) {
            // logger.debug(`[markAsRead] access denied - wrong owner: ${notification.recipient.toString()} vs ${userId.toString()}`);
            return sendResponse(res, 403, false, 'Access denied - not notification owner');
        }

        if (!notification.isRead) {
            notification.isRead = true;
            notification.readAt = new Date();
            await notification.save();
            // logger.debug(`[markAsRead] marked as read: ${notificationId}`);
        }

        // Emit unread count update so clients refresh state
        try {
            const io = req.app.get('io') || global.io;
            if (io) {
                io.notifyUser(userId, 'notifications:unreadCount', {});
                // logger.debug(`[markAsRead] emitted unreadCount to: ${userId}`);
            }
        } catch (e) {
            logger.warn('Socket emit failed (markAsRead unreadCount):', e);
        }

        sendResponse(res, 200, true, 'Notification marked as read', {
            notification
        });
    } catch (error) {
        logger.error('Mark notification as read error:', error);
        sendResponse(res, 500, false, 'Server error marking notification as read');
    }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await Notification.updateMany(
            { recipient: userId, isRead: false },
            { isRead: true, readAt: new Date() }
        );

        // Emit unread count update so clients refresh state
        try {
            const io = req.app.get('io') || global.io;
            if (io) {
                io.notifyUser(userId, 'notifications:unreadCount', {});
            }
        } catch (e) {
            logger.warn('Socket emit failed (markAllAsRead unreadCount):', e);
        }

        sendResponse(res, 200, true, 'All notifications marked as read', {
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        logger.error('Mark all notifications as read error:', error);
        sendResponse(res, 500, false, 'Server error marking all notifications as read');
    }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
    try {
        const { id: notificationId } = req.params;
        const userId = req.user.id;

        console.log(' [deleteNotification] notificationId:', notificationId, 'userId:', userId);

        const notification = await Notification.findById(notificationId);

        if (!notification) {
            console.log(' [deleteNotification] notification not found:', notificationId);
            return sendResponse(res, 404, false, 'Notification not found');
        }

        // Check if user owns the notification
        if (notification.recipient.toString() !== userId.toString()) {
            console.log(' [deleteNotification] access denied - wrong owner:', notification.recipient.toString(), 'vs', userId.toString());
            return sendResponse(res, 403, false, 'Access denied - not notification owner');
        }

        await Notification.findByIdAndDelete(notificationId);
        console.log(' [deleteNotification] deleted:', notificationId);

        // Emit deletion and unread count update so clients refresh state
        try {
            const io = req.app.get('io') || global.io;
            if (io) {
                io.notifyUser(userId, 'notifications:deleted', { notificationId });
                io.notifyUser(userId, 'notifications:unreadCount', {});
                console.log(' [deleteNotification] emitted deleted + unreadCount to:', userId);
            }
        } catch (e) {
            logger.warn('Socket emit failed (deleteNotification):', e);
        }

        sendResponse(res, 200, true, 'Notification deleted successfully');
    } catch (error) {
        logger.error('Delete notification error:', error);
        sendResponse(res, 500, false, 'Server error deleting notification');
    }
};

// Update notification preferences
exports.updatePreferences = async (req, res) => {
    try {
        const { preferences } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);
        const userPrefs = await user.getPreferences();

        // Update notification preferences
        if (preferences.email) {
            Object.assign(userPrefs.notifications.email, preferences.email);
        }
        if (preferences.push) {
            Object.assign(userPrefs.notifications.push, preferences.push);
        }
        if (preferences.inApp) {
            Object.assign(userPrefs.notifications.inApp, preferences.inApp);
        }

        await userPrefs.save();

        sendResponse(res, 200, true, 'Notification preferences updated successfully', {
            preferences: userPrefs.notifications
        });
    } catch (error) {
        logger.error('Update notification preferences error:', error);
        sendResponse(res, 500, false, 'Server error updating notification preferences');
    }
};

// Get notification statistics
exports.getNotificationStats = async (req, res) => {
    try {
        const userId = req.user.id;

        const stats = await Notification.aggregate([
            { $match: { recipient: new mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: '$type',
                    total: { $sum: 1 },
                    unread: {
                        $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] }
                    }
                }
            }
        ]);

        const totalStats = await Notification.aggregate([
            { $match: { recipient: new mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    unread: {
                        $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] }
                    },
                    thisWeek: {
                        $sum: {
                            $cond: [
                                { $gte: ['$createdAt', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)] },
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        // Transform stats to match test expectations
        const byType = {};
        stats.forEach(stat => {
            byType[stat._id] = stat.total;
        });

        const byPriority = await Notification.aggregate([
            { $match: { recipient: new mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: '$priority',
                    total: { $sum: 1 },
                    unread: {
                        $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] }
                    }
                }
            }
        ]);

        const byPriorityObj = {};
        byPriority.forEach(stat => {
            byPriorityObj[stat._id] = stat.total;
        });

        sendResponse(res, 200, true, 'Notification statistics retrieved successfully', {
            stats: {
                total: totalStats[0]?.total || 0,
                unread: totalStats[0]?.unread || 0,
                byType,
                byPriority: byPriorityObj
            }
        });
    } catch (error) {
        logger.error('Get notification stats error:', error);
        sendResponse(res, 500, false, 'Server error retrieving notification statistics');
    }
};

// Create manual notification (admin feature)
exports.createNotification = async (req, res) => {
    try {
        const { 
            title, 
            message, 
            type, 
            recipientId, 
            relatedEntity,
            priority = 'medium',
            deliveryMethods 
        } = req.body;
        const senderId = req.user.id;

        // Check if sender has permission to send notifications
        const user = await User.findById(senderId);
        const userRoles = await user.getRoles();
        
        // Only system admins can create manual notifications
        if (userRoles.systemRole !== 'admin' && userRoles.systemRole !== 'super_admin') {
            return sendResponse(res, 403, false, 'Admin permissions required to create notifications');
        }

        const notification = await Notification.create({
            title,
            message,
            type: type || 'space_update',
            recipient: recipientId,
            sender: senderId,
            relatedEntity,
            priority,
            deliveryMethods: deliveryMethods || { inApp: true }
        });

        await notification.populate('sender', 'name avatar');
        await notification.populate('recipient', 'name email');

        // Send real-time notification via socket
        const io = req.app.get('io');
        if (io) {
            io.notifyUser(recipientId, 'notification:new', {
                notification: notification.toObject()
            });
        }

        // Log activity
        await ActivityLog.logActivity({
            userId: senderId,
            action: 'notification_create',
            description: `Created notification: ${title}`,
            entity: { type: 'Notification', id: notification._id, name: title },
            relatedEntities: [{ type: 'User', id: recipientId, name: 'Recipient' }],
            metadata: {
                notificationType: type,
                priority,
                ipAddress: req.ip
            }
        });

        sendResponse(res, 201, true, 'Notification created successfully', {
            notification
        });
    } catch (error) {
        logger.error('Create notification error:', error);
        sendResponse(res, 500, false, 'Server error creating notification');
    }
};

// Bulk mark notifications as read
exports.bulkMarkAsRead = async (req, res) => {
    try {
        const { notificationIds } = req.body;
        const userId = req.user.id;

        if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
            return sendResponse(res, 400, false, 'Notification IDs array is required');
        }

        const result = await Notification.updateMany(
            { 
                _id: { $in: notificationIds },
                recipient: userId,
                isRead: false
            },
            { isRead: true, readAt: new Date() }
        );

        sendResponse(res, 200, true, 'Notifications marked as read', {
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        logger.error('Bulk mark as read error:', error);
        sendResponse(res, 500, false, 'Server error marking notifications as read');
    }
};

// Delete all read notifications
exports.deleteReadNotifications = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await Notification.deleteMany({
            recipient: userId,
            isRead: true
        });

        sendResponse(res, 200, true, 'Read notifications deleted successfully', {
            deletedCount: result.deletedCount
        });
    } catch (error) {
        logger.error('Delete read notifications error:', error);
        sendResponse(res, 500, false, 'Server error deleting read notifications');
    }
};

// Delete all notifications (both read and unread)
exports.clearAllNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        
        console.log(' [clearAllNotifications] Clearing all notifications for userId:', userId);

        const result = await Notification.deleteMany({
            recipient: userId
        });

        console.log(' [clearAllNotifications] Deleted count:', result.deletedCount);

        // Emit unread count update so clients refresh state
        try {
            const io = req.app.get('io') || global.io;
            if (io) {
                io.notifyUser(userId, 'notifications:unreadCount', {});
                console.log(' [clearAllNotifications] emitted unreadCount to:', userId);
            }
        } catch (e) {
            logger.warn('Socket emit failed (clearAllNotifications unreadCount):', e);
        }

        sendResponse(res, 200, true, 'All notifications cleared successfully', {
            deletedCount: result.deletedCount
        });
    } catch (error) {
        logger.error('Clear all notifications error:', error);
        sendResponse(res, 500, false, 'Server error clearing all notifications');
    }
};

// Clear workspace-related notifications (archived/restored)
exports.clearWorkspaceNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        
        console.log(' [clearWorkspaceNotifications] Clearing workspace notifications for userId:', userId);

        const result = await Notification.deleteMany({
            recipient: userId,
            type: { $in: ['workspace_archived', 'workspace_restored'] }
        });

        console.log(' [clearWorkspaceNotifications] Deleted count:', result.deletedCount);

        // Emit unread count update so clients refresh state
        try {
            const io = req.app.get('io') || global.io;
            if (io) {
                io.notifyUser(userId, 'notifications:unreadCount', {});
                console.log(' [clearWorkspaceNotifications] emitted unreadCount to:', userId);
            }
        } catch (e) {
            logger.warn('Socket emit failed (clearWorkspaceNotifications unreadCount):', e);
        }

        sendResponse(res, 200, true, 'Workspace notifications cleared successfully', {
            deletedCount: result.deletedCount
        });
    } catch (error) {
        logger.error('Clear workspace notifications error:', error);
        sendResponse(res, 500, false, 'Server error clearing workspace notifications');
    }
};

// Create payment notification (for payment success/failure)
exports.createPaymentNotification = async (req, res) => {
    try {
        const { title, message, type, category, metadata } = req.body;
        const userId = req.user.id;

        console.log(' [createPaymentNotification] userId:', userId, 'type:', type, 'category:', category);

        const notification = await Notification.create({
            title,
            message,
            type: 'payment_update',
            recipient: userId,
            priority: type === 'error' ? 'high' : 'medium',
            deliveryMethods: { inApp: true },
            metadata: {
                category,
                paymentType: type,
                ...metadata
            }
        });

        await notification.populate('recipient', 'name email');

        // Send real-time notification via socket
        try {
            const io = req.app.get('io') || global.io;
            if (io) {
                io.notifyUser(userId, 'notification:new', {
                    notification: notification.toObject()
                });
                console.log(' [createPaymentNotification] emitted notification to:', userId);
            }
        } catch (e) {
            logger.warn('Socket emit failed (createPaymentNotification):', e);
        }

        // Log activity
        await ActivityLog.logActivity({
            userId,
            action: 'payment_notification_create',
            description: `Payment notification: ${title}`,
            entity: { type: 'Notification', id: notification._id, name: title },
            metadata: {
                category,
                paymentType: type,
                ipAddress: req.ip
            }
        });

        sendResponse(res, 201, true, 'Payment notification created successfully', {
            notification
        });
    } catch (error) {
        logger.error('Create payment notification error:', error);
        sendResponse(res, 500, false, 'Server error creating payment notification');
    }
};
