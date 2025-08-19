const Reminder = require('../models/Reminder');
const Task = require('../models/Task');
const Space = require('../models/Space');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { sendResponse } = require('../utils/response');
const { sendEmail } = require('../utils/email');
const logger = require('../config/logger');

// Get user reminders
exports.getReminders = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status, type, entityType, entityId } = req.query;

        let query = { userId };

        // Apply filters
        if (status) {
            if (status === 'active') {
                query.isActive = true;
            } else if (status === 'inactive') {
                query.isActive = false;
            }
        }

        if (type) {
            query.method = { $in: [type] };
        }

        if (entityType) {
            query.entityType = entityType;
        }

        if (entityId) {
            query.entityId = entityId;
        }

        const reminders = await Reminder.find(query)
            .populate('entityId', 'title name')
            .sort({ scheduledAt: 1 });

        sendResponse(res, 200, true, 'Reminders retrieved successfully', {
            reminders,
            count: reminders.length
        });
    } catch (error) {
        logger.error('Get reminders error:', error);
        sendResponse(res, 500, false, 'Server error retrieving reminders');
    }
};

// Get single reminder
exports.getReminder = async (req, res) => {
    try {
        const { id: reminderId } = req.params;
        const userId = req.user.id;

        const reminder = await Reminder.findById(reminderId)
            .populate('entityId', 'title name');

        if (!reminder) {
            return sendResponse(res, 404, false, 'Reminder not found');
        }

        if (reminder.userId.toString() !== userId.toString()) {
            return sendResponse(res, 403, false, 'Access denied');
        }

        sendResponse(res, 200, true, 'Reminder retrieved successfully', {
            reminder
        });
    } catch (error) {
        logger.error('Get reminder error:', error);
        sendResponse(res, 500, false, 'Server error retrieving reminder');
    }
};

// Create reminder
exports.createReminder = async (req, res) => {
    try {
        const { 
            title, 
            description, 
            reminderDate, 
            type = 'both', 
            taskId, 
            spaceId,
            entityType, 
            entityId, 
            recurring 
        } = req.body;
        const userId = req.user.id;

        // Validate required fields
        if (!title || !reminderDate) {
            return sendResponse(res, 400, false, 'Title and reminder date are required');
        }

        // Check access permissions
        if (taskId) {
            const task = await Task.findById(taskId);
            if (!task) {
                return sendResponse(res, 404, false, 'Task not found');
            }

            const user = await User.findById(userId);
            const userRoles = await user.getRoles();
            
            const hasAccess = userRoles.hasBoardPermission(task.board, 'canView') ||
                             userRoles.hasSpaceRole(task.space, 'member');

            if (!hasAccess) {
                return sendResponse(res, 403, false, 'Access denied to this task');
            }
        }

        if (spaceId) {
            const user = await User.findById(userId);
            const userRoles = await user.getRoles();
            
            if (!userRoles.hasSpaceRole(spaceId)) {
                return sendResponse(res, 403, false, 'Access denied to this space');
            }
        }

        // Determine entity type and ID from either format
        let finalEntityType = entityType;
        let finalEntityId = entityId;
        
        if (taskId) {
            finalEntityType = 'task';
            finalEntityId = taskId;
        } else if (spaceId) {
            finalEntityType = 'space';
            finalEntityId = spaceId;
        } else if (!entityType && !entityId) {
            finalEntityType = 'user';
            finalEntityId = userId;
        }

        const reminder = await Reminder.create({
            title,
            description,
            userId,
            entityType: finalEntityType,
            entityId: finalEntityId,
            scheduledAt: new Date(reminderDate),
            method: type === 'email' ? ['email'] : type === 'push' ? ['push'] : ['email', 'push'],
            repeat: recurring ? {
                enabled: recurring.enabled !== undefined ? recurring.enabled : true,
                frequency: recurring.pattern || recurring.frequency || 'daily',
                interval: recurring.interval || 1,
                endDate: recurring.endDate
            } : { enabled: false, frequency: 'daily', interval: 1 }
        });

        await reminder.populate('entityId', 'title name');

        logger.info(`Reminder created: ${title} for user ${userId}`);

        sendResponse(res, 201, true, 'Reminder created successfully', {
            reminder
        });
    } catch (error) {
        logger.error('Create reminder error:', error);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errorMessages = Object.values(error.errors).map(err => err.message).join(', ');
            return sendResponse(res, 400, false, `Validation error: ${errorMessages}`);
        }
        
        sendResponse(res, 500, false, 'Server error creating reminder');
    }
};

// Update reminder
exports.updateReminder = async (req, res) => {
    try {
        const { id: reminderId } = req.params;
        const { title, description, reminderDate, type, recurring } = req.body;
        const userId = req.user.id;

        const reminder = await Reminder.findById(reminderId);
        if (!reminder) {
            return sendResponse(res, 404, false, 'Reminder not found');
        }

        if (reminder.userId.toString() !== userId.toString()) {
            return sendResponse(res, 403, false, 'Access denied');
        }

        // Update fields
        if (title) reminder.title = title;
        if (description) reminder.message = description;
        if (reminderDate) reminder.scheduledAt = new Date(reminderDate);
        if (type) reminder.method = type === 'email' ? ['email'] : type === 'push' ? ['push'] : ['email', 'push'];
        if (recurring) reminder.repeat = { ...reminder.repeat, ...recurring };
        
        // Handle priority update (from request body)
        if (req.body.priority) reminder.priority = req.body.priority;

        await reminder.save();

        sendResponse(res, 200, true, 'Reminder updated successfully', {
            reminder
        });
    } catch (error) {
        logger.error('Update reminder error:', error);
        sendResponse(res, 500, false, 'Server error updating reminder');
    }
};

// Delete reminder
exports.deleteReminder = async (req, res) => {
    try {
        const { id: reminderId } = req.params;
        const userId = req.user.id;

        const reminder = await Reminder.findById(reminderId);
        if (!reminder) {
            return sendResponse(res, 404, false, 'Reminder not found');
        }

        if (reminder.userId.toString() !== userId.toString()) {
            return sendResponse(res, 403, false, 'Access denied');
        }

        await Reminder.findByIdAndDelete(reminderId);

        sendResponse(res, 200, true, 'Reminder deleted successfully');
    } catch (error) {
        logger.error('Delete reminder error:', error);
        sendResponse(res, 500, false, 'Server error deleting reminder');
    }
};

// Snooze reminder
exports.snoozeReminder = async (req, res) => {
    try {
        const { id: reminderId } = req.params;
        const { snoozeUntil } = req.body;
        const userId = req.user.id;

        const reminder = await Reminder.findById(reminderId);
        if (!reminder) {
            return sendResponse(res, 404, false, 'Reminder not found');
        }

        if (reminder.userId.toString() !== userId.toString()) {
            return sendResponse(res, 403, false, 'Access denied');
        }

        reminder.scheduledAt = new Date(snoozeUntil);
        await reminder.save();

        sendResponse(res, 200, true, 'Reminder snoozed successfully', {
            reminder
        });
    } catch (error) {
        logger.error('Snooze reminder error:', error);
        sendResponse(res, 500, false, 'Server error snoozing reminder');
    }
};

// Dismiss reminder
exports.dismissReminder = async (req, res) => {
    try {
        const { id: reminderId } = req.params;
        const userId = req.user.id;

        const reminder = await Reminder.findById(reminderId);
        if (!reminder) {
            return sendResponse(res, 404, false, 'Reminder not found');
        }

        if (reminder.userId.toString() !== userId.toString()) {
            return sendResponse(res, 403, false, 'Access denied');
        }

        reminder.isActive = false;
        reminder.dismissedAt = new Date();
        await reminder.save();

        sendResponse(res, 200, true, 'Reminder dismissed successfully', {
            reminder
        });
    } catch (error) {
        logger.error('Dismiss reminder error:', error);
        sendResponse(res, 500, false, 'Server error dismissing reminder');
    }
};

// Process due reminders (called by cron job)
exports.processDueReminders = async (req, res) => {
    try {
        const now = new Date();
        
        const dueReminders = await Reminder.find({
            scheduledAt: { $lte: now },
            status: 'scheduled'
        })
        .populate('userId', 'name email')
        .populate('entityId', 'title board name');

        const processedReminders = [];

        for (const reminder of dueReminders) {
            try {
                // Check user notification preferences
                const userPrefs = await reminder.userId.getPreferences();
                
                // Send email if enabled
                if (reminder.method.includes('email') && 
                    userPrefs.shouldReceiveNotification('reminder', 'dueDateReminders', 'email')) {
                    
                    await sendEmail({
                        to: reminder.userId.email,
                        subject: `Reminder: ${reminder.title}`,
                        template: 'reminder',
                        data: {
                            name: reminder.userId.name,
                            title: reminder.title,
                            description: reminder.message,
                            taskTitle: reminder.entityType === 'task' ? reminder.entityId.title : null,
                            spaceName: reminder.entityType === 'space' ? reminder.entityId.name : null
                        }
                    });
                }

                // Send push notification if enabled
                if (reminder.method.includes('push') &&
                    userPrefs.shouldReceiveNotification('reminder', 'dueDateReminders', 'push')) {
                    
                    // Create in-app notification
                    const Notification = require('../models/Notification');
                    await Notification.create({
                        title: `Reminder: ${reminder.title}`,
                        message: reminder.message || 'You have a reminder due',
                        type: 'due_date_reminder',
                        recipient: reminder.userId._id,
                        relatedEntity: {
                            entityType: reminder.entityType === 'task' ? 'Task' : (reminder.entityType === 'space' ? 'Space' : 'Reminder'),
                            entityId: reminder.entityId || reminder._id
                        }
                    });

                    // Send real-time notification
                    const io = req.app.get('io');
                    if (io) {
                        io.notifyUser(reminder.userId._id, 'reminder:due', {
                            reminder: reminder.toObject()
                        });
                    }
                }

                // Update reminder status
                reminder.status = 'sent';
                reminder.sentAt = new Date();

                // Handle recurring reminders
                if (reminder.repeat.enabled) {
                    const nextDate = new Date(reminder.scheduledAt);
                    
                    switch (reminder.repeat.frequency) {
                        case 'daily':
                            nextDate.setDate(nextDate.getDate() + reminder.repeat.interval);
                            break;
                        case 'weekly':
                            nextDate.setDate(nextDate.getDate() + (7 * reminder.repeat.interval));
                            break;
                        case 'monthly':
                            nextDate.setMonth(nextDate.getMonth() + reminder.repeat.interval);
                            break;
                        case 'yearly':
                            nextDate.setFullYear(nextDate.getFullYear() + reminder.repeat.interval);
                            break;
                    }

                    // Check if recurring should continue
                    if (!reminder.repeat.endDate || nextDate <= reminder.repeat.endDate) {
                        // Create new reminder for next occurrence
                        await Reminder.create({
                            title: reminder.title,
                            message: reminder.message,
                            userId: reminder.userId._id,
                            entityType: reminder.entityType,
                            entityId: reminder.entityId,
                            scheduledAt: nextDate,
                            method: reminder.method,
                            repeat: reminder.repeat
                        });
                    }
                }

                await reminder.save();
                processedReminders.push(reminder);

            } catch (reminderError) {
                logger.error(`Error processing reminder ${reminder._id}:`, reminderError);
                
                // Mark as failed
                reminder.status = 'cancelled';
                await reminder.save();
            }
        }

        if (req.route) {
            // Called via API
            sendResponse(res, 200, true, 'Due reminders processed successfully', {
                processed: processedReminders.length,
                reminders: processedReminders
            });
        } else {
            // Called programmatically
            return {
                processed: processedReminders.length,
                reminders: processedReminders
            };
        }
    } catch (error) {
        logger.error('Process due reminders error:', error);
        if (req.route) {
            sendResponse(res, 500, false, 'Server error processing due reminders');
        } else {
            throw error;
        }
    }
};
