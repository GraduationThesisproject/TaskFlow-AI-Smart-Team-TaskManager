/**
 * Reminder Seeder
 * Handles seeding of reminders for users and tasks
 */

const BaseSeeder = require('../base/BaseSeeder');
const { faker } = require('@faker-js/faker');
const Reminder = require('../../models/Reminder');
const User = require('../../models/User');
const Task = require('../../models/Task');

class ReminderSeeder extends BaseSeeder {
  constructor(userSeeder = null, taskSeeder = null) {
    super();
    this.userSeeder = userSeeder;
    this.taskSeeder = taskSeeder;
    this.reminderModel = Reminder;
    this.userModel = User;
    this.taskModel = Task;
  }

  /**
   * Main seeding method for reminders
   */
  async seed() {
    const users = await this.getAvailableUsers();
    
    if (users.length === 0) {
      this.log('Skipping reminder seeding (no users available)');
      return [];
    }

    const totalReminders = this.calculateTotalReminders(users);
    await this.initialize(totalReminders, 'Reminder Seeding');

    try {
      const createdReminders = [];

      for (const user of users) {
        const reminderCount = faker.number.int({ min: 1, max: 5 });

        this.log(`Creating ${reminderCount} reminders for user: ${user.name}`);

        for (let i = 0; i < reminderCount; i++) {
          const reminderData = await this.generateReminderData(user);
          
          if (this.validate(reminderData, 'validateReminder')) {
            const reminder = await this.createReminder(reminderData);
            createdReminders.push(reminder);
            
            this.addCreatedData('reminders', reminder);
            this.updateProgress(1, `Created reminder for user: ${user.name}`);
          }
        }
      }

      this.completeProgress('Reminder seeding completed');
      this.printSummary();
      
      return createdReminders;

    } catch (error) {
      this.error(`Reminder seeding failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Calculate total number of reminders to create
   */
  calculateTotalReminders(users) {
    return users.reduce((total, user) => {
      const reminderCount = faker.number.int({ min: 1, max: 5 });
      return total + reminderCount;
    }, 0);
  }

  /**
   * Generate reminder data
   */
  async generateReminderData(user) {
    const tasks = await this.getAvailableTasks();
    const task = tasks.length > 0 ? this.getRandomItem(tasks) : null;
    const type = this.getRandomReminderType();
    const priority = this.getReminderPriority(type);

    return {
      user: user._id,
      title: this.generateReminderTitle(type),
      description: this.generateReminderDescription(type, task),
      type: type,
      priority: priority,
      category: this.getReminderCategory(type),
      dueDate: this.generateReminderDueDate(),
      reminderTime: this.generateReminderTime(),
      isRecurring: faker.datatype.boolean({ probability: 0.3 }),
      recurrence: this.generateRecurrencePattern(),
      status: this.getRandomItem(['pending', 'completed', 'dismissed', 'overdue']),
      relatedEntity: {
        type: task ? 'task' : 'general',
        id: task ? task._id : null,
        name: task ? task.title : null
      },
      notifications: {
        email: faker.datatype.boolean({ probability: 0.8 }),
        push: faker.datatype.boolean({ probability: 0.6 }),
        sms: faker.datatype.boolean({ probability: 0.2 }),
        inApp: true
      },
      settings: {
        advanceNotice: this.getRandomItem([15, 30, 60, 120, 1440]), // minutes
        snoozeEnabled: faker.datatype.boolean({ probability: 0.7 }),
        maxSnoozes: faker.number.int({ min: 1, max: 5 }),
        autoComplete: faker.datatype.boolean({ probability: 0.2 })
      },
      metadata: {
        createdBy: user._id,
        lastModifiedBy: user._id,
        snoozeCount: 0,
        lastSnoozedAt: null,
        completedAt: null,
        dismissedAt: null,
        tags: this.generateReminderTags(type)
      },
      createdAt: this.getRandomPastDate(30),
      updatedAt: new Date()
    };
  }

  /**
   * Get random reminder type
   */
  getRandomReminderType() {
    const types = [
      'task_due',
      'meeting',
      'follow_up',
      'review',
      'deadline',
      'check_in',
      'maintenance',
      'backup',
      'update',
      'anniversary',
      'birthday',
      'custom'
    ];

    return this.getRandomItem(types);
  }

  /**
   * Generate reminder title
   */
  generateReminderTitle(type) {
    const titles = {
      'task_due': 'Task Due Soon',
      'meeting': 'Upcoming Meeting',
      'follow_up': 'Follow-up Required',
      'review': 'Review Needed',
      'deadline': 'Deadline Approaching',
      'check_in': 'Check-in Reminder',
      'maintenance': 'Maintenance Due',
      'backup': 'Backup Reminder',
      'update': 'Update Required',
      'anniversary': 'Anniversary Reminder',
      'birthday': 'Birthday Reminder',
      'custom': 'Custom Reminder'
    };

    return titles[type] || 'Reminder';
  }

  /**
   * Generate reminder description
   */
  generateReminderDescription(type, task) {
    const descriptions = {
      'task_due': `Task "${task ? task.title : 'Important Task'}" is due soon. Please review and update the status.`,
      'meeting': 'You have a meeting scheduled. Please prepare any necessary materials.',
      'follow_up': 'Follow up on previous communication or action items.',
      'review': 'Review pending items and provide feedback.',
      'deadline': 'Important deadline approaching. Please ensure all requirements are met.',
      'check_in': 'Time for a check-in on ongoing projects and tasks.',
      'maintenance': 'System maintenance is due. Please schedule accordingly.',
      'backup': 'Data backup reminder. Ensure all important files are backed up.',
      'update': 'Update required for system or process.',
      'anniversary': 'Anniversary reminder for important dates.',
      'birthday': 'Birthday reminder for team members.',
      'custom': 'Custom reminder for important activities.'
    };

    return descriptions[type] || 'General reminder for important activities.';
  }

  /**
   * Get reminder priority
   */
  getReminderPriority(type) {
    const priorityMap = {
      'deadline': 'high',
      'task_due': 'high',
      'meeting': 'medium',
      'follow_up': 'medium',
      'review': 'medium',
      'check_in': 'low',
      'maintenance': 'low',
      'backup': 'low',
      'update': 'low',
      'anniversary': 'low',
      'birthday': 'low',
      'custom': 'medium'
    };

    return priorityMap[type] || 'medium';
  }

  /**
   * Get reminder category
   */
  getReminderCategory(type) {
    const categoryMap = {
      'task_due': 'task',
      'meeting': 'meeting',
      'follow_up': 'communication',
      'review': 'review',
      'deadline': 'deadline',
      'check_in': 'check_in',
      'maintenance': 'maintenance',
      'backup': 'system',
      'update': 'system',
      'anniversary': 'personal',
      'birthday': 'personal',
      'custom': 'custom'
    };

    return categoryMap[type] || 'general';
  }

  /**
   * Generate reminder due date
   */
  generateReminderDueDate() {
    const now = new Date();
    const futureDate = new Date(now.getTime() + faker.number.int({ min: 1, max: 30 }) * 24 * 60 * 60 * 1000);
    return futureDate;
  }

  /**
   * Generate reminder time
   */
  generateReminderTime() {
    const hours = faker.number.int({ min: 8, max: 18 });
    const minutes = faker.number.int({ min: 0, max: 59 });
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  /**
   * Generate recurrence pattern
   */
  generateRecurrencePattern() {
    const patterns = [
      { type: 'daily', interval: 1 },
      { type: 'weekly', interval: 1, dayOfWeek: faker.number.int({ min: 0, max: 6 }) },
      { type: 'monthly', interval: 1, dayOfMonth: faker.number.int({ min: 1, max: 28 }) },
      { type: 'yearly', interval: 1 }
    ];

    return this.getRandomItem(patterns);
  }

  /**
   * Generate reminder tags
   */
  generateReminderTags(type) {
    const tags = [];
    
    if (type.includes('task')) tags.push('task-related');
    if (type.includes('meeting')) tags.push('meeting');
    if (type.includes('deadline')) tags.push('urgent');
    if (type.includes('system')) tags.push('system');
    if (type.includes('personal')) tags.push('personal');
    
    return tags;
  }

  /**
   * Create reminder in database
   */
  async createReminder(data) {
    try {
      const reminder = new this.reminderModel(data);
      const savedReminder = await reminder.save();
      
      this.success(`Created ${savedReminder.type} reminder for user`);
      return savedReminder;
      
    } catch (error) {
      this.error(`Failed to create reminder: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get available users for reminder creation
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
   * Get available tasks for reminder creation
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
   * Validate reminder data
   */
  validateReminder(data) {
    const validator = require('../utils/validator');
    const result = validator.validateReminder(data);
    
    if (result.errors.length > 0) {
      this.error(`Reminder validation errors: ${result.errors.join(', ')}`);
      return false;
    }
    
    if (result.warnings.length > 0) {
      this.warning(`Reminder validation warnings: ${result.warnings.join(', ')}`);
    }
    
    return true;
  }

  /**
   * Get created reminders
   */
  getCreatedReminders() {
    return this.getCreatedData('reminders') || [];
  }

  /**
   * Get reminders by type
   */
  getRemindersByType(type) {
    const reminders = this.getCreatedReminders();
    return reminders.filter(reminder => reminder.type === type);
  }

  /**
   * Get reminders by status
   */
  getRemindersByStatus(status) {
    const reminders = this.getCreatedReminders();
    return reminders.filter(reminder => reminder.status === status);
  }

  /**
   * Print seeding summary
   */
  printSummary() {
    const reminders = this.getCreatedReminders();
    
    this.success('\n=== Reminder Seeding Summary ===');
    this.log(`✅ Created ${reminders.length} reminders`);
    
    if (reminders.length > 0) {
      this.log('\n📋 Reminder Type Distribution:');
      const typeGroups = {};
      reminders.forEach(reminder => {
        if (!typeGroups[reminder.type]) {
          typeGroups[reminder.type] = 0;
        }
        typeGroups[reminder.type]++;
      });
      
      Object.entries(typeGroups).forEach(([type, count]) => {
        this.log(`  ${type}: ${count} reminders`);
      });

      this.log('\n📋 Reminder Status Distribution:');
      const statusGroups = {};
      reminders.forEach(reminder => {
        if (!statusGroups[reminder.status]) {
          statusGroups[reminder.status] = 0;
        }
        statusGroups[reminder.status]++;
      });
      
      Object.entries(statusGroups).forEach(([status, count]) => {
        this.log(`  ${status}: ${count} reminders`);
      });

      const recurringReminders = reminders.filter(r => r.isRecurring);
      const highPriorityReminders = reminders.filter(r => r.priority === 'high');

      this.log(`\n📋 Reminder Features:`);
      this.log(`  Recurring reminders: ${recurringReminders.length}`);
      this.log(`  High priority reminders: ${highPriorityReminders.length}`);
    }
    
    this.success('=== End Reminder Seeding Summary ===\n');
  }
}

module.exports = ReminderSeeder;
