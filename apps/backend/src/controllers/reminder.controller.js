const Reminder = require('../models/Reminder');
const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { sendResponse } = require('../utils/response');
const { sendEmail } = require('../utils/email');
const logger = require('../config/logger');

// Get user reminders
exports.getReminders = async (req, res) => {
    try {
        const { upcoming = false, limit = 50 } = req.query;
        const userId = req.user.id;

        let query = { user: userId, status: 'pending' };
        
        if (upcoming === 'true') {
            const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            query.reminderDate = { $lte: nextWeek };
        }

        const reminders = await Reminder.find(query)
            .populate('task', 'title status')
            .populate('project', 'name status')
            .sort({ reminderDate: 1 })
            .limit(parseInt(limit));

        const upcomingCount = await Reminder.countDocuments({
            user: userId,
            status: 'pending',
            reminderDate: { $lte: new Date(Date.now() + 24 * 60 * 60 * 1000) } // Next 24 hours
        });

        sendResponse(res, 200, true, 'Reminders retrieved successfully', {
            reminders,
            count: reminders.length,
            upcomingIn24h: upcomingCount
        });
    } catch (error) {
        logger.error('Get reminders error:', error);
        sendResponse(res, 500, false, 'Server error retrieving reminders');
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
            projectId,
            recurring 
        } = req.body;
        const userId = req.user.id;

        // Validate access to task/project if provided
        if (taskId) {
            const task = await Task.findById(taskId);
            if (!task) {
                return sendResponse(res, 404, false, 'Task not found');
            }

            const user = await User.findById(userId);
            const userRoles = await user.getRoles();
            
            const hasAccess = task.assignees.some(a => a.toString() === userId) ||
                             task.reporter.toString() === userId ||
                             task.watchers.some(w => w.toString() === userId) ||
                             userRoles.hasBoardPermission(task.board, 'canView');

            if (!hasAccess) {
                return sendResponse(res, 403, false, 'Access denied to this task');
            }
        }

        if (projectId) {
            const user = await User.findById(userId);
            const userRoles = await user.getRoles();
            
            if (!userRoles.hasProjectRole(projectId)) {
                return sendResponse(res, 403, false, 'Access denied to this project');
            }
        }

        const reminder = await Reminder.create({
            title,
            description,
            user: userId,
            task: taskId || null,
            project: projectId || null,
            reminderDate: new Date(reminderDate),
            type,
            recurring: recurring || { enabled: false }
        });

        await reminder.populate('task', 'title');
        await reminder.populate('project', 'name');

        // Log activity
        await ActivityLog.logActivity({
            userId,
            action: 'reminder_create',
            description: `Created reminder: ${title}`,
            entity: { type: 'Reminder', id: reminder._id, name: title },
            relatedEntities: [
                ...(taskId ? [{ type: 'Task', id: taskId, name: 'Task' }] : []),
                ...(projectId ? [{ type: 'Project', id: projectId, name: 'Project' }] : [])
            ],
            metadata: {
                reminderDate,
                type,
                isRecurring: recurring?.enabled || false,
                ipAddress: req.ip
            }
        });

        logger.info(`Reminder created: ${title} for user ${userId}`);

        sendResponse(res, 201, true, 'Reminder created successfully', {
            reminder
        });
    } catch (error) {
        logger.error('Create reminder error:', error);
        sendResponse(res, 500, false, 'Server error creating reminder');
    }
};

// Update reminder
exports.updateReminder = async (req, res) => {
    try {
        const { id: reminderId } = req.params;
        const { title, description, reminderDate, type, recurring } = req.body;
        const userId = req.user.id;

        const reminder = await Reminder.findOne({ _id: reminderId, user: userId });
        if (!reminder) {
            return sendResponse(res, 404, false, 'Reminder not found');
        }

        // Update fields
        if (title) reminder.title = title;
        if (description) reminder.description = description;
        if (reminderDate) reminder.reminderDate = new Date(reminderDate);
        if (type) reminder.type = type;
        if (recurring) reminder.recurring = recurring;

        await reminder.save();

        // Log activity
        await ActivityLog.logActivity({
            userId,
            action: 'reminder_update',
            description: `Updated reminder: ${reminder.title}`,
            entity: { type: 'Reminder', id: reminderId, name: reminder.title },
            metadata: { ipAddress: req.ip }
        });

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

        const reminder = await Reminder.findOne({ _id: reminderId, user: userId });
        if (!reminder) {
            return sendResponse(res, 404, false, 'Reminder not found');
        }

        await Reminder.findByIdAndDelete(reminderId);

        // Log activity
        await ActivityLog.logActivity({
            userId,
            action: 'reminder_delete',
            description: `Deleted reminder: ${reminder.title}`,
            entity: { type: 'Reminder', id: reminderId, name: reminder.title },
            metadata: { ipAddress: req.ip },
            severity: 'warning'
        });

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
        const { minutes = 60 } = req.body; // Default snooze for 1 hour
        const userId = req.user.id;

        const reminder = await Reminder.findOne({ _id: reminderId, user: userId });
        if (!reminder) {
            return sendResponse(res, 404, false, 'Reminder not found');
        }

        // Update reminder date
        const newReminderDate = new Date(Date.now() + minutes * 60 * 1000);
        reminder.reminderDate = newReminderDate;
        await reminder.save();

        sendResponse(res, 200, true, 'Reminder snoozed successfully', {
            reminder,
            snoozedUntil: newReminderDate
        });
    } catch (error) {
        logger.error('Snooze reminder error:', error);
        sendResponse(res, 500, false, 'Server error snoozing reminder');
    }
};

// Process due reminders (called by cron job)
exports.processDueReminders = async (req, res) => {
    try {
        const now = new Date();
        
        const dueReminders = await Reminder.find({
            reminderDate: { $lte: now },
            status: 'pending'
        })
        .populate('user', 'name email')
        .populate('task', 'title board')
        .populate('project', 'name');

        const processedReminders = [];

        for (const reminder of dueReminders) {
            try {
                // Check user notification preferences
                const userPrefs = await reminder.user.getPreferences();
                
                // Send email if enabled
                if ((reminder.type === 'email' || reminder.type === 'both') && 
                    userPrefs.shouldReceiveNotification('reminder', 'dueDateReminders', 'email')) {
                    
                    await sendEmail({
                        to: reminder.user.email,
                        subject: `Reminder: ${reminder.title}`,
                        template: 'reminder',
                        data: {
                            name: reminder.user.name,
                            title: reminder.title,
                            description: reminder.description,
                            taskTitle: reminder.task ? reminder.task.title : null,
                            projectName: reminder.project ? reminder.project.name : null
                        }
                    });
                }

                // Send push notification if enabled
                if ((reminder.type === 'push' || reminder.type === 'both') &&
                    userPrefs.shouldReceiveNotification('reminder', 'dueDateReminders', 'push')) {
                    
                    // Create in-app notification
                    const Notification = require('../models/Notification');
                    await Notification.create({
                        title: `Reminder: ${reminder.title}`,
                        message: reminder.description || 'You have a reminder due',
                        type: 'due_date_reminder',
                        recipient: reminder.user._id,
                        relatedEntity: {
                            entityType: reminder.task ? 'Task' : (reminder.project ? 'Project' : 'Reminder'),
                            entityId: reminder.task || reminder.project || reminder._id
                        }
                    });

                    // Send real-time notification
                    const io = req.app.get('io');
                    if (io) {
                        io.notifyUser(reminder.user._id, 'reminder:due', {
                            reminder: reminder.toObject()
                        });
                    }
                }

                // Update reminder status
                reminder.status = 'sent';
                reminder.sentAt = new Date();

                // Handle recurring reminders
                if (reminder.recurring.enabled) {
                    const nextDate = new Date(reminder.reminderDate);
                    
                    switch (reminder.recurring.pattern) {
                        case 'daily':
                            nextDate.setDate(nextDate.getDate() + reminder.recurring.interval);
                            break;
                        case 'weekly':
                            nextDate.setDate(nextDate.getDate() + (7 * reminder.recurring.interval));
                            break;
                        case 'monthly':
                            nextDate.setMonth(nextDate.getMonth() + reminder.recurring.interval);
                            break;
                        case 'yearly':
                            nextDate.setFullYear(nextDate.getFullYear() + reminder.recurring.interval);
                            break;
                    }

                    // Check if recurring should continue
                    if (!reminder.recurring.endDate || nextDate <= reminder.recurring.endDate) {
                        // Create new reminder for next occurrence
                        await Reminder.create({
                            title: reminder.title,
                            description: reminder.description,
                            user: reminder.user._id,
                            task: reminder.task,
                            project: reminder.project,
                            reminderDate: nextDate,
                            type: reminder.type,
                            recurring: reminder.recurring
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
