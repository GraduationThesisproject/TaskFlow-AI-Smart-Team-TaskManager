/**
 * Comment Seeder
 * Handles seeding of comments for tasks
 */

const BaseSeeder = require('../base/BaseSeeder');
const { faker } = require('@faker-js/faker');
const Comment = require('../../models/Comment');
const Task = require('../../models/Task');
const User = require('../../models/User');

class CommentSeeder extends BaseSeeder {
  constructor(taskSeeder = null) {
    super();
    this.taskSeeder = taskSeeder;
    this.commentModel = Comment;
    this.taskModel = Task;
    this.userModel = User;
  }

  /**
   * Main seeding method for comments
   */
  async seed() {
    const config = this.getConfig('comments');
    const tasks = await this.getAvailableTasks();
    
    if (tasks.length === 0) {
      this.log('Skipping comment seeding (no tasks available)');
      return [];
    }

    const totalComments = this.calculateTotalComments(tasks, config);
    await this.initialize(totalComments, 'Comment Seeding');

    try {
      const createdComments = [];

      for (const task of tasks) {
        const commentCount = faker.number.int({
          min: config.perTask.min,
          max: config.perTask.max
        });

        this.log(`Creating ${commentCount} comments for task: ${task.title}`);

        for (let i = 0; i < commentCount; i++) {
          const commentData = this.generateCommentData(task);
          
          if (this.validate(commentData, 'validateComment')) {
            const comment = await this.createComment(commentData);
            createdComments.push(comment);
            
            this.addCreatedData('comments', comment);
            this.updateProgress(1, `Created comment for task: ${task.title}`);
          }
        }
      }

      this.completeProgress('Comment seeding completed');
      this.printSummary();
      
      return createdComments;

    } catch (error) {
      this.error(`Comment seeding failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Calculate total number of comments to create
   */
  calculateTotalComments(tasks, config) {
    return tasks.reduce((total, task) => {
      const commentCount = faker.number.int({
        min: config.perTask.min,
        max: config.perTask.max
      });
      return total + commentCount;
    }, 0);
  }

  /**
   * Generate comment data
   */
  generateCommentData(task) {
    const author = this.getRandomItem([task.assignee, task.reporter, ...task.watchers]);
    const mentions = this.getRandomMentions(task);
    const attachments = this.generateCommentAttachments();

    return {
      content: this.generateCommentContent(),
      task: task._id,
      board: task.board,
      space: task.space,
      workspace: task.workspace,
      author: author,
      mentions: mentions,
      attachments: attachments,
      type: this.getRandomItem(['comment', 'update', 'question', 'suggestion', 'review']),
      isInternal: faker.datatype.boolean({ probability: 0.2 }),
      isResolved: faker.datatype.boolean({ probability: 0.1 }),
      parentComment: null,
      replies: [],
      reactions: this.generateCommentReactions(),
      metadata: {
        edited: faker.datatype.boolean({ probability: 0.1 }),
        editHistory: [],
        isPinned: faker.datatype.boolean({ probability: 0.05 }),
        isSystemGenerated: false,
        context: {
          taskStatus: task.status,
          taskPriority: task.priority,
          column: task.column
        }
      },
      createdAt: this.getRandomPastDate(30),
      updatedAt: new Date()
    };
  }

  /**
   * Generate comment content
   */
  generateCommentContent() {
    const commentTemplates = [
      'I\'ve started working on this task. Will update progress soon.',
      'This looks good! I have a few suggestions for improvement.',
      'Can you clarify the requirements for this feature?',
      'I\'ve completed the initial implementation. Ready for review.',
      'There are some technical challenges we need to address.',
      'Great work! This implementation meets all the requirements.',
      'I\'ve identified a potential issue that needs attention.',
      'The code review is complete. Please address the feedback.',
      'This task is blocked due to dependencies. Need to resolve first.',
      'I\'ve updated the documentation as requested.',
      'The testing is complete. All scenarios are covered.',
      'This feature is ready for deployment to staging.',
      'I\'ve optimized the performance as discussed.',
      'The integration with the external service is working well.',
      'I\'ve added the requested error handling and validation.',
      'This task is taking longer than expected due to complexity.',
      'I\'ve created a pull request for this implementation.',
      'The design review feedback has been incorporated.',
      'I\'ve fixed the bugs that were reported.',
      'This task is now complete and ready for final review.'
    ];

    return this.getRandomItem(commentTemplates);
  }

  /**
   * Get random mentions
   */
  getRandomMentions(task) {
    const availableUsers = [task.assignee, task.reporter, ...task.watchers];
    const hasMentions = faker.datatype.boolean({ probability: 0.3 });
    
    if (!hasMentions || availableUsers.length === 0) return [];

    const numMentions = faker.number.int({ min: 1, max: Math.min(2, availableUsers.length) });
    return this.getRandomItems(availableUsers, { min: numMentions, max: numMentions });
  }

  /**
   * Generate comment attachments
   */
  generateCommentAttachments() {
    const hasAttachments = faker.datatype.boolean({ probability: 0.1 });
    if (!hasAttachments) return [];

    // For now, return empty array since we don't have a FileSeeder dependency
    // In a real implementation, this would reference actual File documents
    return [];
  }

  /**
   * Generate comment reactions
   */
  generateCommentReactions() {
    const reactions = ['👍', '👎', '❤️', '😄', '😮', '😢', '🎉', '🚀'];
    const hasReactions = faker.datatype.boolean({ probability: 0.4 });
    
    if (!hasReactions) return [];

    const numReactions = faker.number.int({ min: 1, max: 3 });
    const selectedReactions = this.getRandomItems(reactions, { min: numReactions, max: numReactions });

    return selectedReactions.map(reaction => ({
      emoji: reaction,
      users: [], // Will be populated when users react
      count: faker.number.int({ min: 1, max: 5 })
    }));
  }

  /**
   * Create comment in database
   */
  async createComment(data) {
    try {
      const comment = new this.commentModel(data);
      const savedComment = await comment.save();
      
      this.success(`Created comment by ${savedComment.author} on task`);
      return savedComment;
      
    } catch (error) {
      this.error(`Failed to create comment: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get available tasks for comment creation
   */
  async getAvailableTasks() {
    // First try to get tasks from the task seeder if available
    if (this.taskSeeder && this.taskSeeder.getCreatedTasks()) {
      return this.taskSeeder.getCreatedTasks();
    }

    // Fallback to database query
    try {
      const tasks = await this.taskModel.find({})
        .populate('assignee')
        .populate('reporter')
        .populate('watchers')
        .limit(50);
      return tasks;
    } catch (error) {
      this.error(`Failed to fetch tasks: ${error.message}`);
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
   * Validate comment data
   */
  validateComment(data) {
    const validator = require('../utils/validator');
    const result = validator.validateComment(data);
    
    if (result.errors.length > 0) {
      this.error(`Comment validation errors: ${result.errors.join(', ')}`);
      return false;
    }
    
    if (result.warnings.length > 0) {
      this.warning(`Comment validation warnings: ${result.warnings.join(', ')}`);
    }
    
    return true;
  }

  /**
   * Get created comments
   */
  getCreatedComments() {
    return this.getCreatedData('comments') || [];
  }

  /**
   * Get comments by type
   */
  getCommentsByType(type) {
    const comments = this.getCreatedComments();
    return comments.filter(comment => comment.type === type);
  }

  /**
   * Print seeding summary
   */
  printSummary() {
    const comments = this.getCreatedComments();
    
    this.success('\n=== Comment Seeding Summary ===');
    this.log(`✅ Created ${comments.length} comments`);
    
    if (comments.length > 0) {
      this.log('\n📋 Comment Type Distribution:');
      const typeGroups = {};
      comments.forEach(comment => {
        if (!typeGroups[comment.type]) {
          typeGroups[comment.type] = 0;
        }
        typeGroups[comment.type]++;
      });
      
      Object.entries(typeGroups).forEach(([type, count]) => {
        this.log(`  ${type}: ${count} comments`);
      });

      const commentsWithMentions = comments.filter(comment => comment.mentions && comment.mentions.length > 0);
      const commentsWithAttachments = comments.filter(comment => comment.attachments && comment.attachments.length > 0);
      const commentsWithReactions = comments.filter(comment => comment.reactions && comment.reactions.length > 0);

      this.log(`\n📋 Comment Features:`);
      this.log(`  Comments with mentions: ${commentsWithMentions.length}`);
      this.log(`  Comments with attachments: ${commentsWithAttachments.length}`);
      this.log(`  Comments with reactions: ${commentsWithReactions.length}`);
    }
    
    this.success('=== End Comment Seeding Summary ===\n');
  }
}

module.exports = CommentSeeder;
