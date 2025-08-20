/**
 * Notification Seeder
 * Handles seeding of notifications for users
 */

const BaseSeeder = require('../base/BaseSeeder');
const { faker } = require('@faker-js/faker');
const Notification = require('../../models/Notification');
const User = require('../../models/User');
const Task = require('../../models/Task');

class NotificationSeeder extends BaseSeeder {
  constructor(userSeeder = null, taskSeeder = null) {
    super();
    this.userSeeder = userSeeder;
    this.taskSeeder = taskSeeder;
    this.notificationModel = Notification;
    this.userModel = User;
    this.taskModel = Task;
  }

  /**
   * Main seeding method for notifications
   */
  async seed() {
    const config = this.getConfig('notifications');
    const users = await this.getAvailableUsers();
    
    if (users.length === 0) {
      this.log('Skipping notification seeding (no users available)');
      return [];
    }

    const totalNotifications = this.calculateTotalNotifications(users, config);
    await this.initialize(totalNotifications, 'Notification Seeding');

    try {
      const createdNotifications = [];

      for (const user of users) {
        const notificationCount = faker.number.int({
          min: config.perUser.min,
          max: config.perUser.max
        });

        this.log(`Creating ${notificationCount} notifications for user: ${user.name}`);

        for (let i = 0; i < notificationCount; i++) {
          const notificationData = await this.generateNotificationData(user);
          
          if (this.validate(notificationData, 'validateNotification')) {
            const notification = await this.createNotification(notificationData);
            createdNotifications.push(notification);
            
            this.addCreatedData('notifications', notification);
            this.updateProgress(1, `Created notification for user: ${user.name}`);
          }
        }
      }

      this.completeProgress('Notification seeding completed');
      this.printSummary();
      
      return createdNotifications;

    } catch (error) {
      this.error(`Notification seeding failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Calculate total number of notifications to create
   */
  calculateTotalNotifications(users, config) {
    return users.reduce((total, user) => {
      const notificationCount = faker.number.int({
        min: config.perUser.min,
        max: config.perUser.max
      });
      return total + notificationCount;
    }, 0);
  }

  /**
   * Generate notification data
   */
  async generateNotificationData(user) {
    const tasks = await this.getAvailableTasks();
    const task = tasks.length > 0 ? this.getRandomItem(tasks) : null;
    const type = this.getRandomNotificationType();
    const priority = this.getNotificationPriority(type);

    return {
      recipient: user._id,
      type: type,
      title: this.generateNotificationTitle(type),
      message: this.generateNotificationMessage(type, task),
      priority: priority,
      category: this.getNotificationCategory(type),
      data: this.generateNotificationData(type, task),
      source: {
        type: this.getSourceType(type),
        id: task ? task._id : null,
        name: task ? task.title : null
      },
      actions: this.generateNotificationActions(type),
      metadata: {
        isRead: faker.datatype.boolean({ probability: 0.3 }),
        isArchived: faker.datatype.boolean({ probability: 0.1 }),
        isPinned: faker.datatype.boolean({ probability: 0.05 }),
        readAt: null,
        archivedAt: null,
        expiresAt: this.getNotificationExpiry(type),
        tags: this.generateNotificationTags(type)
      },
      settings: {
        emailSent: faker.datatype.boolean({ probability: 0.7 }),
        pushSent: faker.datatype.boolean({ probability: 0.5 }),
        inAppShown: true,
        soundPlayed: faker.datatype.boolean({ probability: 0.3 })
      },
      createdAt: this.getRandomPastDate(30),
      updatedAt: new Date()
    };
  }

  /**
   * Get random notification type
   */
  getRandomNotificationType() {
    const types = [
      'task_assigned',
      'task_completed',
      'task_overdue',
      'comment_added',
      'mention_received',
      'due_date_approaching',
      'workspace_invitation',
      'board_shared',
      'file_uploaded',
      'reminder_set',
      'achievement_unlocked',
      'system_update',
      'security_alert',
      'backup_completed',
      'integration_connected'
    ];

    return this.getRandomItem(types);
  }

  /**
   * Generate notification title
   */
  generateNotificationTitle(type) {
    const titles = {
      'task_assigned': 'New Task Assigned',
      'task_completed': 'Task Completed',
      'task_overdue': 'Task Overdue',
      'comment_added': 'New Comment',
      'mention_received': 'You were mentioned',
      'due_date_approaching': 'Due Date Approaching',
      'workspace_invitation': 'Workspace Invitation',
      'board_shared': 'Board Shared with You',
      'file_uploaded': 'File Uploaded',
      'reminder_set': 'Reminder Set',
      'achievement_unlocked': 'Achievement Unlocked',
      'system_update': 'System Update',
      'security_alert': 'Security Alert',
      'backup_completed': 'Backup Completed',
      'integration_connected': 'Integration Connected'
    };

    return titles[type] || 'Notification';
  }

  /**
   * Generate notification message
   */
  generateNotificationMessage(type, task) {
    const messages = {
      'task_assigned': `You have been assigned a new task: ${task ? task.title : 'New Task'}`,
      'task_completed': `Task "${task ? task.title : 'Task'}" has been completed successfully.`,
      'task_overdue': `Task "${task ? task.title : 'Task'}" is overdue. Please update the status.`,
      'comment_added': `A new comment was added to task "${task ? task.title : 'Task'}".`,
      'mention_received': `You were mentioned in a comment on task "${task ? task.title : 'Task'}".`,
      'due_date_approaching': `Task "${task ? task.title : 'Task'}" is due soon.`,
      'workspace_invitation': 'You have been invited to join a new workspace.',
      'board_shared': 'A board has been shared with you.',
      'file_uploaded': 'A new file has been uploaded to your workspace.',
      'reminder_set': 'A reminder has been set for you.',
      'achievement_unlocked': 'Congratulations! You have unlocked a new achievement.',
      'system_update': 'A system update is available. Please review the changes.',
      'security_alert': 'Security alert: Please review your account settings.',
      'backup_completed': 'Your data backup has been completed successfully.',
      'integration_connected': 'A new integration has been connected to your workspace.'
    };

    return messages[type] || 'You have a new notification.';
  }

  /**
   * Get notification priority
   */
  getNotificationPriority(type) {
    const priorityMap = {
      'task_overdue': 'high',
      'security_alert': 'high',
      'due_date_approaching': 'medium',
      'task_assigned': 'medium',
      'mention_received': 'medium',
      'task_completed': 'low',
      'comment_added': 'low',
      'workspace_invitation': 'low',
      'board_shared': 'low',
      'file_uploaded': 'low',
      'reminder_set': 'low',
      'achievement_unlocked': 'low',
      'system_update': 'low',
      'backup_completed': 'low',
      'integration_connected': 'low'
    };

    return priorityMap[type] || 'low';
  }

  /**
   * Get notification category
   */
  getNotificationCategory(type) {
    const categoryMap = {
      'task_assigned': 'task',
      'task_completed': 'task',
      'task_overdue': 'task',
      'comment_added': 'communication',
      'mention_received': 'communication',
      'due_date_approaching': 'reminder',
      'workspace_invitation': 'invitation',
      'board_shared': 'sharing',
      'file_uploaded': 'file',
      'reminder_set': 'reminder',
      'achievement_unlocked': 'achievement',
      'system_update': 'system',
      'security_alert': 'security',
      'backup_completed': 'system',
      'integration_connected': 'integration'
    };

    return categoryMap[type] || 'general';
  }

  /**
   * Generate notification data
   */
  generateNotificationData(type, task) {
    const baseData = {
      timestamp: new Date(),
      userId: task ? task.assignee : null,
      taskId: task ? task._id : null,
      workspaceId: task ? task.workspace : null
    };

    switch (type) {
      case 'task_assigned':
        return {
          ...baseData,
          assigner: task ? task.reporter : null,
          dueDate: task ? task.dueDate : null,
          priority: task ? task.priority : 'medium'
        };
      case 'task_completed':
        return {
          ...baseData,
          completedBy: task ? task.assignee : null,
          completionTime: new Date(),
          timeSpent: task ? task.actualHours : 0
        };
      case 'comment_added':
        return {
          ...baseData,
          commentAuthor: faker.person.fullName(),
          commentPreview: faker.lorem.sentence()
        };
      default:
        return baseData;
    }
  }

  /**
   * Get source type
   */
  getSourceType(type) {
    const sourceMap = {
      'task_assigned': 'task',
      'task_completed': 'task',
      'task_overdue': 'task',
      'comment_added': 'comment',
      'mention_received': 'comment',
      'due_date_approaching': 'task',
      'workspace_invitation': 'workspace',
      'board_shared': 'board',
      'file_uploaded': 'file',
      'reminder_set': 'reminder',
      'achievement_unlocked': 'achievement',
      'system_update': 'system',
      'security_alert': 'system',
      'backup_completed': 'system',
      'integration_connected': 'integration'
    };

    return sourceMap[type] || 'system';
  }

  /**
   * Generate notification actions
   */
  generateNotificationActions(type) {
    const actions = {
      'task_assigned': [
        { label: 'View Task', action: 'view_task', url: '/tasks/{taskId}' },
        { label: 'Mark as Read', action: 'mark_read', url: null }
      ],
      'task_completed': [
        { label: 'View Task', action: 'view_task', url: '/tasks/{taskId}' },
        { label: 'View Report', action: 'view_report', url: '/reports/task/{taskId}' }
      ],
      'task_overdue': [
        { label: 'Update Status', action: 'update_status', url: '/tasks/{taskId}/edit' },
        { label: 'Request Extension', action: 'request_extension', url: '/tasks/{taskId}/extend' }
      ],
      'comment_added': [
        { label: 'View Comment', action: 'view_comment', url: '/tasks/{taskId}#comment' },
        { label: 'Reply', action: 'reply', url: '/tasks/{taskId}/comment' }
      ],
      'mention_received': [
        { label: 'View Mention', action: 'view_mention', url: '/tasks/{taskId}#comment' },
        { label: 'Reply', action: 'reply', url: '/tasks/{taskId}/comment' }
      ],
      'workspace_invitation': [
        { label: 'Accept', action: 'accept_invitation', url: '/invitations/accept' },
        { label: 'Decline', action: 'decline_invitation', url: '/invitations/decline' }
      ]
    };

    return actions[type] || [
      { label: 'View Details', action: 'view_details', url: '/notifications/{id}' },
      { label: 'Mark as Read', action: 'mark_read', url: null }
    ];
  }

  /**
   * Get notification expiry
   */
  getNotificationExpiry(type) {
    const highPriorityTypes = ['task_overdue', 'security_alert'];
    const mediumPriorityTypes = ['due_date_approaching', 'task_assigned'];
    
    if (highPriorityTypes.includes(type)) {
      return faker.date.future({ years: 0.1 }); // 10 days
    } else if (mediumPriorityTypes.includes(type)) {
      return faker.date.future({ years: 0.05 }); // 5 days
    } else {
      return faker.date.future({ years: 0.02 }); // 2 days
    }
  }

  /**
   * Generate notification tags
   */
  generateNotificationTags(type) {
    const tags = [];
    
    if (type.includes('task')) tags.push('task-related');
    if (type.includes('comment')) tags.push('communication');
    if (type.includes('overdue') || type.includes('approaching')) tags.push('urgent');
    if (type.includes('security')) tags.push('security');
    if (type.includes('system')) tags.push('system');
    
    return tags;
  }

  /**
   * Create notification in database
   */
  async createNotification(data) {
    try {
      const notification = new this.notificationModel(data);
      const savedNotification = await notification.save();
      
      this.success(`Created ${savedNotification.type} notification for user`);
      return savedNotification;
      
    } catch (error) {
      this.error(`Failed to create notification: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get available users for notification creation
   */
  async getAvailableUsers() {
    // First try to get users from the user seeder if available
    if (this.userSeeder && this.userSeeder.getCreatedData('user')) {
      const userData = this.userSeeder.getCreatedData('user');
      return userData.map(data => data.user);
    }

    // Fallback to database query
    try {
      const users = await this.userModel.find({}).limit(50);
      return users;
    } catch (error) {
      this.error(`Failed to fetch users: ${error.message}`);
      return [];
    }
  }

  /**
   * Get available tasks for notification creation
   */
  async getAvailableTasks() {
    // First try to get tasks from the task seeder if available
    if (this.taskSeeder && this.taskSeeder.getCreatedTasks()) {
      return this.taskSeeder.getCreatedTasks();
    }

    // Fallback to database query
    try {
      const tasks = await this.taskModel.find({}).limit(50);
      return tasks;
    } catch (error) {
      this.warning(`Failed to fetch tasks: ${error.message}`);
      return [];
    }
  }

  /**
   * Get configuration for this seeder
   */
  getConfig(path) {
    const config = require('../config/seeder.config');
    const environment = process.env.NODE_ENV || 'development';
    const envConfig = config.environments[environment];
    return path ? path.split('.').reduce((obj, key) => obj?.[key], envConfig) : envConfig;
  }

  /**
   * Validate notification data
   */
  validateNotification(data) {
    const validator = require('../utils/validator');
    const result = validator.validateNotification(data);
    
    if (result.errors.length > 0) {
      this.error(`Notification validation errors: ${result.errors.join(', ')}`);
      return false;
    }
    
    if (result.warnings.length > 0) {
      this.warning(`Notification validation warnings: ${result.warnings.join(', ')}`);
    }
    
    return true;
  }

  /**
   * Get created notifications
   */
  getCreatedNotifications() {
    return this.getCreatedData('notifications') || [];
  }

  /**
   * Get notifications by type
   */
  getNotificationsByType(type) {
    const notifications = this.getCreatedNotifications();
    return notifications.filter(notification => notification.type === type);
  }

  /**
   * Get notifications by priority
   */
  getNotificationsByPriority(priority) {
    const notifications = this.getCreatedNotifications();
    return notifications.filter(notification => notification.priority === priority);
  }

  /**
   * Print seeding summary
   */
  printSummary() {
    const notifications = this.getCreatedNotifications();
    
    this.success('\n=== Notification Seeding Summary ===');
    this.log(`✅ Created ${notifications.length} notifications`);
    
    if (notifications.length > 0) {
      this.log('\n📋 Notification Type Distribution:');
      const typeGroups = {};
      notifications.forEach(notification => {
        if (!typeGroups[notification.type]) {
          typeGroups[notification.type] = 0;
        }
        typeGroups[notification.type]++;
      });
      
      Object.entries(typeGroups).forEach(([type, count]) => {
        this.log(`  ${type}: ${count} notifications`);
      });

      this.log('\n📋 Notification Priority Distribution:');
      const priorityGroups = {};
      notifications.forEach(notification => {
        if (!priorityGroups[notification.priority]) {
          priorityGroups[notification.priority] = 0;
        }
        priorityGroups[notification.priority]++;
      });
      
      Object.entries(priorityGroups).forEach(([priority, count]) => {
        this.log(`  ${priority}: ${count} notifications`);
      });

      const readNotifications = notifications.filter(n => n.metadata.isRead);
      const archivedNotifications = notifications.filter(n => n.metadata.isArchived);
      const pinnedNotifications = notifications.filter(n => n.metadata.isPinned);

      this.log(`\n📋 Notification Status:`);
      this.log(`  Read: ${readNotifications.length}`);
      this.log(`  Archived: ${archivedNotifications.length}`);
      this.log(`  Pinned: ${pinnedNotifications.length}`);
    }
    
    this.success('=== End Notification Seeding Summary ===\n');
  }
}

module.exports = NotificationSeeder;
