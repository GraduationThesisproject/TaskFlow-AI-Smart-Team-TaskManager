const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { sendResponse } = require('../utils/response');
const logger = require('../config/logger');

// Get user notifications
exports.getNotifications = async (req, res) => {
    try {
        const { limit = 50, page = 1, unreadOnly = false } = req.query;
        const userId = req.user.id;

        let query = { recipient: userId };
        if (unreadOnly === 'true') {
            query.isRead = false;
        }

        const notifications = await Notification.find(query)
            .populate('sender', 'name avatar')
            .populate('relatedEntity.entityId')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await Notification.countDocuments(query);
        const unreadCount = await Notification.countDocuments({ recipient: userId, isRead: false });

        sendResponse(res, 200, true, 'Notifications retrieved successfully', {
            notifications,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
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

        const notification = await Notification.findOne({
            _id: notificationId,
            recipient: userId
        });

        if (!notification) {
            return sendResponse(res, 404, false, 'Notification not found');
        }

        if (!notification.isRead) {
            notification.isRead = true;
            notification.readAt = new Date();
            await notification.save();
        }

        sendResponse(res, 200, true, 'Notification marked as read');
    } catch (error) {
        logger.error('Mark notification as read error:', error);
        sendResponse(res, 500, false, 'Server error marking notification as read');
    }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;

        await Notification.updateMany(
            { recipient: userId, isRead: false },
            { isRead: true, readAt: new Date() }
        );

        sendResponse(res, 200, true, 'All notifications marked as read');
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

        const notification = await Notification.findOne({
            _id: notificationId,
            recipient: userId
        });

        if (!notification) {
            return sendResponse(res, 404, false, 'Notification not found');
        }

        await Notification.findByIdAndDelete(notificationId);

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
            { $match: { recipient: mongoose.Types.ObjectId(userId) } },
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
            { $match: { recipient: mongoose.Types.ObjectId(userId) } },
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

        sendResponse(res, 200, true, 'Notification statistics retrieved successfully', {
            byType: stats,
            overall: totalStats[0] || { total: 0, unread: 0, thisWeek: 0 }
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
            type: type || 'project_update',
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
