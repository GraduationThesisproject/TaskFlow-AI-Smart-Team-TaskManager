const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendEmail } = require('../utils/email');
const logger = require('../config/logger');

class NotificationService {
    
    // Create and send notification
    static async createNotification(notificationData) {
        try {
            const notification = await Notification.create(notificationData);
            
            // Populate relations
            await notification.populate('sender', 'name avatar');
            await notification.populate('recipient', 'name email');
            
            // Send notification via configured delivery methods
            await this.deliverNotification(notification);
            
            return notification;
        } catch (error) {
            logger.error('Create notification error:', error);
            throw error;
        }
    }

    // Send notification based on delivery preferences
    static async deliverNotification(notification) {
        try {
            const recipient = notification.recipient;
            const userPrefs = await recipient.getPreferences();
            
            // Check if user should receive this type of notification
            const notificationType = this.mapNotificationTypeToPreference(notification.type);
            
            // In-app notification (always created)
            if (notification.deliveryMethods.inApp !== false) {
                // Already created, just emit via socket if available
                const io = global.io;
                if (io) {
                    io.sendNotification(recipient._id, notification);
                }
            }
            
            // Email notification
            if (notification.deliveryMethods.email && 
                userPrefs.shouldReceiveNotification('general', notificationType, 'email')) {
                
                await this.sendEmailNotification(notification);
            }
            
            // Push notification
            if (notification.deliveryMethods.push && 
                userPrefs.shouldReceiveNotification('general', notificationType, 'push')) {
                
                await this.sendPushNotification(notification);
            }
            
        } catch (error) {
            logger.error('Deliver notification error:', error);
            // Don't throw - notification was created, delivery is best effort
        }
    }

    // Send email notification
    static async sendEmailNotification(notification) {
        try {
            const emailTemplate = this.getEmailTemplate(notification.type);
            const emailData = this.getEmailData(notification);
            
            await sendEmail({
                to: notification.recipient.email,
                subject: notification.title,
                template: emailTemplate,
                data: emailData
            });

            // Update delivery status
            await Notification.findByIdAndUpdate(notification._id, {
                'deliveryStatus.email': 'sent'
            });
            
        } catch (error) {
            logger.error('Send email notification error:', error);
            await Notification.findByIdAndUpdate(notification._id, {
                'deliveryStatus.email': 'failed'
            });
        }
    }

    // Send push notification
    static async sendPushNotification(notification) {
        try {
            // This would integrate with your push notification service
            // For now, just update status
            await Notification.findByIdAndUpdate(notification._id, {
                'deliveryStatus.push': 'sent'
            });
            
        } catch (error) {
            logger.error('Send push notification error:', error);
            await Notification.findByIdAndUpdate(notification._id, {
                'deliveryStatus.push': 'failed'
            });
        }
    }

    // Bulk create notifications
    static async createBulkNotifications(notifications) {
        try {
            const createdNotifications = await Notification.insertMany(notifications);
            
            // Send each notification
            const deliveryPromises = createdNotifications.map(notification => 
                this.deliverNotification(notification)
            );
            
            await Promise.allSettled(deliveryPromises);
            
            return createdNotifications;
        } catch (error) {
            logger.error('Create bulk notifications error:', error);
            throw error;
        }
    }

    // Create notification for task events
    static async notifyTaskEvent(eventType, task, triggeredBy, additionalData = {}) {
        try {
            const recipients = new Set();
            
            // Add assignees
            task.assignees.forEach(assignee => recipients.add(assignee.toString()));
            
            // Add reporter
            if (task.reporter) recipients.add(task.reporter.toString());
            
            // Add watchers
            task.watchers.forEach(watcher => recipients.add(watcher.toString()));
            
            // Remove the person who triggered the event
            recipients.delete(triggeredBy.toString());
            
            if (recipients.size === 0) return;
            
            const notifications = Array.from(recipients).map(recipientId => ({
                title: this.getTaskEventTitle(eventType, task.title),
                message: this.getTaskEventMessage(eventType, task, triggeredBy),
                type: this.getTaskEventType(eventType),
                recipient: recipientId,
                sender: triggeredBy,
                relatedEntity: {
                    entityType: 'Task',
                    entityId: task._id
                },
                priority: task.priority === 'high' ? 'high' : 'medium',
                deliveryMethods: { inApp: true, email: true, push: true },
                ...additionalData
            }));
            
            return await this.createBulkNotifications(notifications);
        } catch (error) {
            logger.error('Notify task event error:', error);
            throw error;
        }
    }

    // Create notification for project events
    static async notifyProjectEvent(eventType, project, triggeredBy, additionalData = {}) {
        try {
            const recipients = new Set();
            
            // Add project team members
            project.team.forEach(member => recipients.add(member.user.toString()));
            
            // Add project owner
            if (project.owner) recipients.add(project.owner.toString());
            
            // Remove the person who triggered the event
            recipients.delete(triggeredBy.toString());
            
            if (recipients.size === 0) return;
            
            const notifications = Array.from(recipients).map(recipientId => ({
                title: this.getProjectEventTitle(eventType, project.name),
                message: this.getProjectEventMessage(eventType, project, triggeredBy),
                type: 'project_update',
                recipient: recipientId,
                sender: triggeredBy,
                relatedEntity: {
                    entityType: 'Project',
                    entityId: project._id
                },
                priority: 'medium',
                deliveryMethods: { inApp: true, email: true },
                ...additionalData
            }));
            
            return await this.createBulkNotifications(notifications);
        } catch (error) {
            logger.error('Notify project event error:', error);
            throw error;
        }
    }

    // Create due date reminders
    static async createDueDateReminders() {
        try {
            const Task = require('../models/Task');
            
            // Find tasks due in next 24 hours
            const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
            const today = new Date();
            
            const dueTasks = await Task.find({
                dueDate: { $gte: today, $lte: tomorrow },
                status: { $ne: 'completed' }
            })
            .populate('assignees', '_id name email')
            .populate('reporter', '_id name email');
            
            const notifications = [];
            
            for (const task of dueTasks) {
                const recipients = new Set();
                
                // Notify assignees
                task.assignees.forEach(assignee => recipients.add(assignee._id.toString()));
                
                // Notify reporter
                if (task.reporter) recipients.add(task.reporter._id.toString());
                
                // Create notifications for each recipient
                recipients.forEach(recipientId => {
                    notifications.push({
                        title: `Task due soon: ${task.title}`,
                        message: `Your task "${task.title}" is due ${task.dueDate.toDateString()}`,
                        type: 'due_date_reminder',
                        recipient: recipientId,
                        relatedEntity: {
                            entityType: 'Task',
                            entityId: task._id
                        },
                        priority: 'high',
                        deliveryMethods: { inApp: true, email: true, push: true }
                    });
                });
            }
            
            if (notifications.length > 0) {
                return await this.createBulkNotifications(notifications);
            }
            
            return [];
        } catch (error) {
            logger.error('Create due date reminders error:', error);
            throw error;
        }
    }

    // Helper methods
    static getTaskEventTitle(eventType, taskTitle) {
        const titles = {
            'task_assigned': `You've been assigned to: ${taskTitle}`,
            'task_completed': `Task completed: ${taskTitle}`,
            'task_comment': `New comment on: ${taskTitle}`,
            'task_updated': `Task updated: ${taskTitle}`,
            'task_due_soon': `Task due soon: ${taskTitle}`
        };
        
        return titles[eventType] || `Task notification: ${taskTitle}`;
    }

    static getTaskEventMessage(eventType, task, triggeredBy) {
        const user = triggeredBy.name || 'Someone';
        const messages = {
            'task_assigned': `${user} assigned you to task "${task.title}"`,
            'task_completed': `${user} marked task "${task.title}" as completed`,
            'task_comment': `${user} commented on task "${task.title}"`,
            'task_updated': `${user} updated task "${task.title}"`,
            'task_due_soon': `Task "${task.title}" is due soon`
        };
        
        return messages[eventType] || `${user} performed an action on task "${task.title}"`;
    }

    static getTaskEventType(eventType) {
        const typeMap = {
            'task_assigned': 'task_assigned',
            'task_completed': 'task_completed',
            'task_comment': 'comment_added',
            'task_updated': 'task_updated',
            'task_due_soon': 'due_date_reminder'
        };
        
        return typeMap[eventType] || 'task_updated';
    }

    static getProjectEventTitle(eventType, projectName) {
        const titles = {
            'project_created': `New project: ${projectName}`,
            'project_updated': `Project updated: ${projectName}`,
            'member_added': `Added to project: ${projectName}`,
            'member_removed': `Removed from project: ${projectName}`
        };
        
        return titles[eventType] || `Project notification: ${projectName}`;
    }

    static getProjectEventMessage(eventType, project, triggeredBy) {
        const user = triggeredBy.name || 'Someone';
        const messages = {
            'project_created': `${user} created project "${project.name}"`,
            'project_updated': `${user} updated project "${project.name}"`,
            'member_added': `${user} added you to project "${project.name}"`,
            'member_removed': `${user} removed you from project "${project.name}"`
        };
        
        return messages[eventType] || `${user} performed an action on project "${project.name}"`;
    }

    static mapNotificationTypeToPreference(notificationType) {
        const typeMap = {
            'task_assigned': 'taskAssignments',
            'task_completed': 'taskUpdates',
            'comment_added': 'comments',
            'due_date_reminder': 'dueDateReminders',
            'project_update': 'projectUpdates',
            'mention': 'mentions'
        };
        
        return typeMap[notificationType] || 'general';
    }

    static getEmailTemplate(notificationType) {
        const templateMap = {
            'task_assigned': 'task-assigned',
            'task_completed': 'task-completed',
            'comment_added': 'comment-added',
            'due_date_reminder': 'due-date-reminder',
            'project_update': 'project-update',
            'mention': 'mention'
        };
        
        return templateMap[notificationType] || 'notification';
    }

    static getEmailData(notification) {
        return {
            title: notification.title,
            message: notification.message,
            recipientName: notification.recipient.name,
            senderName: notification.sender ? notification.sender.name : 'TaskFlow',
            actionUrl: this.getActionUrl(notification),
            priority: notification.priority
        };
    }

    static getActionUrl(notification) {
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        
        if (notification.relatedEntity) {
            switch (notification.relatedEntity.entityType) {
                case 'Task':
                    return `${baseUrl}/tasks/${notification.relatedEntity.entityId}`;
                case 'Project':
                    return `${baseUrl}/projects/${notification.relatedEntity.entityId}`;
                case 'Board':
                    return `${baseUrl}/boards/${notification.relatedEntity.entityId}`;
                default:
                    return baseUrl;
            }
        }
        
        return baseUrl;
    }
}

module.exports = NotificationService;
