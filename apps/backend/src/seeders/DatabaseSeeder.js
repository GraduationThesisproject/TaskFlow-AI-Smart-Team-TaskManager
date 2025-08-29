/**
 * Main Database Seeder
 * Orchestrates all modular seeders and provides comprehensive seeding functionality
 */

const mongoose = require('mongoose');
const { MultiStepProgressTracker } = require('./utils/progress');
const BackupManager = require('./utils/backup');
const seederConfig = require('./config/seeder.config');

// Import modular seeders
const UserSeeder = require('./modules/UserSeeder');
const WorkspaceSeeder = require('./modules/WorkspaceSeeder');
const BoardSeeder = require('./modules/BoardSeeder');
const BoardTemplateSeeder = require('./modules/BoardTemplateSeeder');
const TagSeeder = require('./modules/TagSeeder');
const TaskSeeder = require('./modules/TaskSeeder');
const CommentSeeder = require('./modules/CommentSeeder');
const NotificationSeeder = require('./modules/NotificationSeeder');
const ReminderSeeder = require('./modules/ReminderSeeder');
const FileSeeder = require('./modules/FileSeeder');
const InvitationSeeder = require('./modules/InvitationSeeder');
const AnalyticsSeeder = require('./modules/AnalyticsSeeder');

class DatabaseSeeder {
  constructor() {
    this.environment = process.env.NODE_ENV || 'development';
    this.config = seederConfig.environments[this.environment];
    this.backupManager = new BackupManager();
    this.progress = null;
    
    // Initialize seeders
    this.userSeeder = new UserSeeder();
    this.workspaceSeeder = new WorkspaceSeeder(this.userSeeder);
    this.boardSeeder = new BoardSeeder(this.workspaceSeeder);
    this.boardTemplateSeeder = new BoardTemplateSeeder(this.userSeeder);
    this.tagSeeder = new TagSeeder(this.userSeeder);
    this.taskSeeder = new TaskSeeder(this.boardSeeder, this.tagSeeder);
    this.commentSeeder = new CommentSeeder(this.taskSeeder);
    this.notificationSeeder = new NotificationSeeder(this.userSeeder, this.taskSeeder);
    this.reminderSeeder = new ReminderSeeder(this.userSeeder, this.taskSeeder);
    this.fileSeeder = new FileSeeder(this.userSeeder, this.taskSeeder);
    this.invitationSeeder = new InvitationSeeder(this.userSeeder, this.workspaceSeeder);
    this.analyticsSeeder = new AnalyticsSeeder(this.userSeeder, this.workspaceSeeder, this.taskSeeder);
    
    // Store created data for cross-seeder dependencies
    this.createdData = {
      users: [],
      workspaces: [],
      spaces: [],
      boards: [],
      boardTemplates: [],
      tasks: [],
      tags: [],
      comments: [],
      notifications: [],
      reminders: [],
      files: [],
      invitations: [],
      analytics: []
    };
  }

  /**
   * Main seeding method
   */
  async seed(options = {}) {
    const {
      skipBackup = false,
      skipValidation = false,
      skipProgress = false,
      modules = null // Array of specific modules to seed
    } = options;

    try {
      console.log('🌱 Starting TaskFlow Database Seeding');
      console.log('==========================================');
      console.log(`Environment: ${this.environment}`);
      console.log(`Configuration: ${JSON.stringify(this.config, null, 2)}`);
      console.log('==========================================\n');

      // Create backup if enabled
      if (!skipBackup && seederConfig.rollback.backupBeforeSeed) {
        await this.backupManager.createBackup('Pre-seeding backup');
      }

      // Initialize progress tracking
      const steps = this.getSeedingSteps(modules);
      this.progress = new MultiStepProgressTracker(steps);

      // Execute seeding steps
      await this.executeSeedingSteps(steps, { skipValidation, skipProgress });

      // Print final summary
      this.printFinalSummary();

      console.log('\n🎉 Database seeding completed successfully!');
      return this.createdData;

    } catch (error) {
      console.error('\n❌ Database seeding failed:', error.message);
      throw error;
    }
  }

  /**
   * Get seeding steps based on configuration and options
   */
  getSeedingSteps(modules = null) {
    const allSteps = [
      'Clear Database',
      'Create Users',
      'Create Workspaces',
      'Create Spaces',
      'Create Boards',
      'Create Board Templates',
      'Create Tags',
      'Create Tasks',
      'Create Comments',
      'Create Notifications',
      'Create Reminders',
      'Create Files',
      'Create Invitations',
      'Create Analytics',
      'Update Statistics'
    ];

    if (modules) {
      return allSteps.filter(step => 
        modules.some(module => 
          step.toLowerCase().includes(module.toLowerCase())
        )
      );
    }

    // Filter steps based on environment configuration
    const enabledSteps = [];
    
    if (this.config.users.count > 0) enabledSteps.push('Create Users');
    if (this.config.workspaces.count > 0) enabledSteps.push('Create Workspaces');
    if (this.config.spaces.perWorkspace.min > 0) enabledSteps.push('Create Spaces');
    if (this.config.boards.perSpace.min > 0) enabledSteps.push('Create Boards');
    if (this.config.boardTemplates && this.config.boardTemplates.count > 0) enabledSteps.push('Create Board Templates');
    if (this.config.tasks.perBoard.min > 0) enabledSteps.push('Create Tags', 'Create Tasks');
    if (this.config.comments.perTask.min > 0) enabledSteps.push('Create Comments');
    if (this.config.notifications.perUser.min > 0) enabledSteps.push('Create Notifications');
    if (this.config.files.count > 0) enabledSteps.push('Create Files');
    
    // Always include these steps
    enabledSteps.push('Create Reminders', 'Create Invitations', 'Create Analytics', 'Update Statistics');

    return enabledSteps;
  }

  /**
   * Execute seeding steps
   */
  async executeSeedingSteps(steps, options = {}) {
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      
      try {
        this.progress.startStep(i, 1);
        
        switch (step) {
          case 'Clear Database':
            await this.clearDatabase();
            break;
            
          case 'Create Users':
            await this.seedUsers();
            break;
            
          case 'Create Workspaces':
            await this.seedWorkspaces();
            break;
            
          case 'Create Spaces':
            await this.seedSpaces();
            break;
            
          case 'Create Boards':
            await this.seedBoards();
            break;
            
          case 'Create Board Templates':
            await this.seedBoardTemplates();
            break;
            
          case 'Create Tags':
            await this.seedTags();
            break;
            
          case 'Create Tasks':
            await this.seedTasks();
            break;
            
          case 'Create Comments':
            await this.seedComments();
            break;
            
          case 'Create Notifications':
            await this.seedNotifications();
            break;
            
          case 'Create Reminders':
            await this.seedReminders();
            break;
            
          case 'Create Files':
            await this.seedFiles();
            break;
            
          case 'Create Invitations':
            await this.seedInvitations();
            break;
            
          case 'Create Analytics':
            await this.seedAnalytics();
            break;
            
          case 'Update Statistics':
            await this.updateStatistics();
            break;
            
          default:
            console.warn(`⚠️  Unknown seeding step: ${step}`);
        }
        
        this.progress.completeStep(`Completed: ${step}`);
        
      } catch (error) {
        this.progress.error(`Failed to execute step '${step}': ${error.message}`);
        throw error;
      }
    }
    
    this.progress.complete('All seeding steps completed');
  }

  /**
   * Clear database
   */
  async clearDatabase() {
    console.log('🗑️  Clearing database...');
    
    const collections = await mongoose.connection.db.collections();
    
    for (const collection of collections) {
      await collection.deleteMany({});
    }
    
    console.log('✅ Database cleared successfully');
  }

  /**
   * Seed users
   */
  async seedUsers() {
    console.log('👥 Seeding users...');
    
    const users = await this.userSeeder.seed();
    this.createdData.users = users;
    
    console.log(`✅ Created ${users.length} users`);
  }

  /**
   * Seed workspaces
   */
  async seedWorkspaces() {
    console.log('🏢 Seeding workspaces...');
    
    const workspaces = await this.workspaceSeeder.seed();
    this.createdData.workspaces = workspaces;
    this.createdData.spaces = this.workspaceSeeder.getCreatedSpaces();
    
    console.log(`✅ Created ${workspaces.length} workspaces and ${this.createdData.spaces.length} spaces`);
  }

  /**
   * Seed spaces
   */
  async seedSpaces() {
    console.log('🏠 Seeding spaces...');
    
    // Spaces are now created as part of workspace seeding
    // This method is kept for backward compatibility
    if (this.createdData.spaces.length === 0) {
      console.log('⚠️  No spaces available. Run workspace seeding first.');
    } else {
      console.log(`✅ ${this.createdData.spaces.length} spaces already created with workspaces`);
    }
  }

  /**
   * Seed boards
   */
  async seedBoards() {
    console.log('📋 Seeding boards...');
    
    const boards = await this.boardSeeder.seed();
    this.createdData.boards = boards;
    
    console.log(`✅ Created ${boards.length} boards`);
  }

  /**
   * Seed board templates
   */
  async seedBoardTemplates() {
    console.log('📋 Seeding board templates...');
    
    const boardTemplates = await this.boardTemplateSeeder.seed();
    this.createdData.boardTemplates = boardTemplates;
    
    console.log(`✅ Created ${boardTemplates.length} board templates`);
  }

  /**
   * Seed tags
   */
  async seedTags() {
    console.log('🏷️  Seeding tags...');
    
    const tags = await this.tagSeeder.seed();
    this.createdData.tags = tags;
    
    console.log(`✅ Created ${tags.length} tags`);
  }

  /**
   * Seed tasks
   */
  async seedTasks() {
    console.log('📝 Seeding tasks...');
    
    const tasks = await this.taskSeeder.seed();
    this.createdData.tasks = tasks;
    
    console.log(`✅ Created ${tasks.length} tasks`);
  }

  /**
   * Seed comments
   */
  async seedComments() {
    console.log('💬 Seeding comments...');
    
    const comments = await this.commentSeeder.seed();
    this.createdData.comments = comments;
    
    console.log(`✅ Created ${comments.length} comments`);
  }

  /**
   * Seed notifications
   */
  async seedNotifications() {
    console.log('🔔 Seeding notifications...');
    
    const notifications = await this.notificationSeeder.seed();
    this.createdData.notifications = notifications;
    
    console.log(`✅ Created ${notifications.length} notifications`);
  }

  /**
   * Seed reminders
   */
  async seedReminders() {
    console.log('⏰ Seeding reminders...');
    
    const reminders = await this.reminderSeeder.seed();
    this.createdData.reminders = reminders;
    
    console.log(`✅ Created ${reminders.length} reminders`);
  }

  /**
   * Seed files
   */
  async seedFiles() {
    console.log('📁 Seeding files...');
    
    const files = await this.fileSeeder.seed();
    this.createdData.files = files;
    
    console.log(`✅ Created ${files.length} files`);
  }

  /**
   * Seed invitations
   */
  async seedInvitations() {
    console.log('📧 Seeding invitations...');
    
    const invitations = await this.invitationSeeder.seed();
    this.createdData.invitations = invitations;
    
    console.log(`✅ Created ${invitations.length} invitations`);
  }

  /**
   * Seed analytics
   */
  async seedAnalytics() {
    console.log('📈 Seeding analytics...');
    
    const analytics = await this.analyticsSeeder.seed();
    this.createdData.analytics = analytics;
    
    console.log(`✅ Created ${analytics.length} analytics records`);
  }

  /**
   * Update statistics
   */
  async updateStatistics() {
    console.log('🔄 Updating statistics...');
    
    // This will be implemented when StatisticsSeeder is created
    console.log('⚠️  Statistics update not yet implemented');
  }

  /**
   * Print final summary
   */
  printFinalSummary() {
    console.log('\n📊 Final Seeding Summary');
    console.log('==========================================');
    
    Object.entries(this.createdData).forEach(([type, data]) => {
      if (Array.isArray(data) && data.length > 0) {
        console.log(`  • ${type}: ${data.length}`);
      }
    });
    
    // Print test user credentials
    if (this.createdData.users.length > 0) {
      console.log('\n📧 Test User Credentials:');
      const testUsers = this.config.users.testUsers;
      testUsers.forEach(user => {
        console.log(`  • ${user.email} (password: ${user.password})`);
      });
    }
    
    console.log('==========================================');
  }

  /**
   * Get seeding statistics
   */
  getSeedingStats() {
    const stats = {};
    
    Object.entries(this.createdData).forEach(([type, data]) => {
      stats[type] = Array.isArray(data) ? data.length : 0;
    });
    
    return stats;
  }

  /**
   * Rollback to previous backup
   */
  async rollback(backupId = null) {
    try {
      if (!backupId) {
        const backups = await this.backupManager.listBackups();
        if (backups.length === 0) {
          throw new Error('No backups available for rollback');
        }
        backupId = backups[0].id; // Use most recent backup
      }
      
      console.log(`🔄 Rolling back to backup: ${backupId}`);
      await this.backupManager.restoreBackup(backupId);
      console.log('✅ Rollback completed successfully');
      
    } catch (error) {
      console.error('❌ Rollback failed:', error.message);
      throw error;
    }
  }

  /**
   * List available backups
   */
  async listBackups() {
    return await this.backupManager.listBackups();
  }

  /**
   * Get backup statistics
   */
  async getBackupStats() {
    return await this.backupManager.getBackupStats();
  }

  /**
   * Cleanup old backups
   */
  async cleanupBackups(maxAge = 7 * 24 * 60 * 60 * 1000) {
    return await this.backupManager.cleanupOldBackups(maxAge);
  }

  /**
   * Validate seeding configuration
   */
  validateConfiguration() {
    const errors = [];
    const warnings = [];

    // Check environment configuration
    if (!this.config) {
      errors.push('No configuration found for current environment');
    }

    // Check user configuration
    if (this.config.users.count < this.config.users.testUsers.length) {
      errors.push('User count cannot be less than test users count');
    }

    // Check workspace configuration
    if (this.config.workspaces.count > 0 && this.createdData.users.length === 0) {
      warnings.push('No users available for workspace creation');
    }

    // Check space configuration
    if (this.config.spaces.perWorkspace.min > 0 && this.createdData.workspaces.length === 0) {
      warnings.push('No workspaces available for space creation');
    }

    // Check board configuration
    if (this.config.boards.perSpace.min > 0 && this.createdData.spaces.length === 0) {
      warnings.push('No spaces available for board creation');
    }

    // Check task configuration
    if (this.config.tasks.perBoard.min > 0 && this.createdData.boards.length === 0) {
      warnings.push('No boards available for task creation');
    }

    if (errors.length > 0) {
      console.error('❌ Configuration validation errors:');
      errors.forEach(error => console.error(`  • ${error}`));
    }

    if (warnings.length > 0) {
      console.warn('⚠️  Configuration validation warnings:');
      warnings.forEach(warning => console.warn(`  • ${warning}`));
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Get created data by type
   */
  getCreatedData(type) {
    return this.createdData[type] || [];
  }

  /**
   * Get all created data
   */
  getAllCreatedData() {
    return this.createdData;
  }
}

module.exports = DatabaseSeeder;
