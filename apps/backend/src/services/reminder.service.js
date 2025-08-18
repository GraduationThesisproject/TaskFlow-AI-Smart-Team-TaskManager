const Reminder = require('../models/Reminder');
const NotificationService = require('./notification.service');
const { sendEmail } = require('../utils/email');
const logger = require('../config/logger');

class ReminderService {

    // Process due reminders (called by cron job)
    static async processDueReminders() {
        try {
            const now = new Date();
            const dueReminders = await Reminder.find({
                reminderDate: { $lte: now },
                status: 'pending'
            })
            .populate('user', 'name email')
            .populate('task', 'title')
            .populate('project', 'name');

            const results = {
                processed: 0,
                failed: 0,
                reminders: []
            };

            for (const reminder of dueReminders) {
                try {
                    await this.sendReminder(reminder);
                    
                    // Handle recurring reminders
                    if (reminder.recurring.enabled) {
                        await this.createNextRecurrence(reminder);
                    }

                    // Mark as sent
                    reminder.status = 'sent';
                    reminder.sentAt = new Date();
                    await reminder.save();

                    results.processed++;
                    results.reminders.push(reminder);

                } catch (error) {
                    logger.error(`Failed to process reminder ${reminder._id}:`, error);
                    
                    reminder.status = 'failed';
                    await reminder.save();
                    results.failed++;
                }
            }

            logger.info(`Processed ${results.processed} reminders, ${results.failed} failed`);
            return results;

        } catch (error) {
            logger.error('Process due reminders error:', error);
            throw error;
        }
    }

    // Send individual reminder
    static async sendReminder(reminder) {
        try {
            // Get user preferences
            const userPrefs = await reminder.user.getPreferences();

            // Send email if enabled
            if ((reminder.type === 'email' || reminder.type === 'both') &&
                userPrefs.shouldReceiveNotification('reminder', 'dueDateReminders', 'email')) {
                
                await this.sendReminderEmail(reminder);
            }

            // Send push notification if enabled
            if ((reminder.type === 'push' || reminder.type === 'both') &&
                userPrefs.shouldReceiveNotification('reminder', 'dueDateReminders', 'push')) {
                
                await this.sendReminderNotification(reminder);
            }

        } catch (error) {
            logger.error('Send reminder error:', error);
            throw error;
        }
    }

    // Send reminder email
    static async sendReminderEmail(reminder) {
        try {
            const emailData = {
                name: reminder.user.name,
                title: reminder.title,
                description: reminder.description,
                taskTitle: reminder.task ? reminder.task.title : null,
                projectName: reminder.project ? reminder.project.name : null,
                reminderDate: reminder.reminderDate.toDateString()
            };

            await sendEmail({
                to: reminder.user.email,
                subject: `Reminder: ${reminder.title}`,
                template: 'reminder',
                data: emailData
            });

        } catch (error) {
            logger.error('Send reminder email error:', error);
            throw error;
        }
    }

    // Send reminder push notification
    static async sendReminderNotification(reminder) {
        try {
            await NotificationService.createNotification({
                title: `Reminder: ${reminder.title}`,
                message: reminder.description || 'You have a reminder due',
                type: 'due_date_reminder',
                recipient: reminder.user._id,
                relatedEntity: {
                    entityType: reminder.task ? 'Task' : (reminder.project ? 'Project' : 'Reminder'),
                    entityId: reminder.task || reminder.project || reminder._id
                },
                priority: 'medium',
                deliveryMethods: { inApp: true, push: true }
            });

        } catch (error) {
            logger.error('Send reminder notification error:', error);
            throw error;
        }
    }

    // Create next recurring reminder
    static async createNextRecurrence(reminder) {
        try {
            const nextDate = new Date(reminder.reminderDate);

            // Calculate next occurrence
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
                default:
                    throw new Error(`Unknown recurring pattern: ${reminder.recurring.pattern}`);
            }

            // Check if recurring should continue
            if (reminder.recurring.endDate && nextDate > reminder.recurring.endDate) {
                return null;
            }

            // Create next reminder
            const nextReminder = await Reminder.create({
                title: reminder.title,
                description: reminder.description,
                user: reminder.user,
                task: reminder.task,
                project: reminder.project,
                reminderDate: nextDate,
                type: reminder.type,
                recurring: reminder.recurring
            });

            return nextReminder;

        } catch (error) {
            logger.error('Create next recurrence error:', error);
            throw error;
        }
    }

    // Create reminder for task due date
    static async createTaskDueDateReminder(task, userId, reminderOffset = 24) {
        try {
            if (!task.dueDate) return null;

            const reminderDate = new Date(task.dueDate);
            reminderDate.setHours(reminderDate.getHours() - reminderOffset);

            // Don't create reminder if it's in the past
            if (reminderDate <= new Date()) return null;

            const reminder = await Reminder.create({
                title: `Task due: ${task.title}`,
                description: `Task "${task.title}" is due on ${task.dueDate.toDateString()}`,
                user: userId,
                task: task._id,
                reminderDate,
                type: 'both'
            });

            return reminder;

        } catch (error) {
            logger.error('Create task due date reminder error:', error);
            throw error;
        }
    }

    // Create reminder for project milestone
    static async createProjectMilestoneReminder(project, milestone, userId) {
        try {
            const reminderDate = new Date(milestone.dueDate);
            reminderDate.setDate(reminderDate.getDate() - 3); // 3 days before

            if (reminderDate <= new Date()) return null;

            const reminder = await Reminder.create({
                title: `Milestone due: ${milestone.title}`,
                description: `Project "${project.name}" milestone "${milestone.title}" is due on ${milestone.dueDate.toDateString()}`,
                user: userId,
                project: project._id,
                reminderDate,
                type: 'both'
            });

            return reminder;

        } catch (error) {
            logger.error('Create project milestone reminder error:', error);
            throw error;
        }
    }

    // Bulk create reminders for team members
    static async createBulkReminders(reminderData, userIds) {
        try {
            const reminders = userIds.map(userId => ({
                ...reminderData,
                user: userId
            }));

            const createdReminders = await Reminder.insertMany(reminders);
            return createdReminders;

        } catch (error) {
            logger.error('Create bulk reminders error:', error);
            throw error;
        }
    }

    // Get upcoming reminders for user
    static async getUpcomingReminders(userId, hours = 24) {
        try {
            const cutoffDate = new Date(Date.now() + hours * 60 * 60 * 1000);

            const reminders = await Reminder.find({
                user: userId,
                status: 'pending',
                reminderDate: { $lte: cutoffDate }
            })
            .populate('task', 'title status')
            .populate('project', 'name status')
            .sort({ reminderDate: 1 });

            return reminders;

        } catch (error) {
            logger.error('Get upcoming reminders error:', error);
            throw error;
        }
    }

    // Snooze reminder
    static async snoozeReminder(reminderId, minutes = 60) {
        try {
            const reminder = await Reminder.findById(reminderId);
            if (!reminder) {
                throw new Error('Reminder not found');
            }

            const newReminderDate = new Date(Date.now() + minutes * 60 * 1000);
            reminder.reminderDate = newReminderDate;
            reminder.status = 'pending'; // Reset status if it was changed

            await reminder.save();
            return reminder;

        } catch (error) {
            logger.error('Snooze reminder error:', error);
            throw error;
        }
    }

    // Cancel recurring reminder series
    static async cancelRecurringSeries(reminderId) {
        try {
            const reminder = await Reminder.findById(reminderId);
            if (!reminder) {
                throw new Error('Reminder not found');
            }

            if (!reminder.recurring.enabled) {
                throw new Error('Reminder is not recurring');
            }

            // Find all future reminders in the series
            const futureReminders = await Reminder.find({
                title: reminder.title,
                user: reminder.user,
                reminderDate: { $gt: new Date() },
                'recurring.enabled': true,
                status: 'pending'
            });

            // Cancel all future reminders
            await Reminder.updateMany(
                { _id: { $in: futureReminders.map(r => r._id) } },
                { status: 'cancelled' }
            );

            return futureReminders.length;

        } catch (error) {
            logger.error('Cancel recurring series error:', error);
            throw error;
        }
    }

    // Get reminder statistics for user
    static async getUserReminderStats(userId) {
        try {
            const stats = await Reminder.aggregate([
                { $match: { user: mongoose.Types.ObjectId(userId) } },
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]);

            const result = {
                pending: 0,
                sent: 0,
                cancelled: 0,
                failed: 0,
                total: 0
            };

            stats.forEach(stat => {
                result[stat._id] = stat.count;
                result.total += stat.count;
            });

            return result;

        } catch (error) {
            logger.error('Get user reminder stats error:', error);
            throw error;
        }
    }
}

module.exports = ReminderService;
