/**
 * Task Seeder
 * Handles seeding of tasks with dependencies on boards, users, and tags
 */

const BaseSeeder = require('../base/BaseSeeder');
const { faker } = require('@faker-js/faker');
const Task = require('../../models/Task');
const Board = require('../../models/Board');
const User = require('../../models/User');
const Tag = require('../../models/Tag');
const Column = require('../../models/Column');

class TaskSeeder extends BaseSeeder {
  constructor(boardSeeder = null, tagSeeder = null) {
    super();
    this.boardSeeder = boardSeeder;
    this.tagSeeder = tagSeeder;
    this.taskModel = Task;
    this.boardModel = Board;
    this.userModel = User;
    this.tagModel = Tag;
    this.columnModel = Column;
  }

  /**
   * Main seeding method for tasks
   */
  async seed() {
    const config = this.getConfig('tasks');
    const boards = await this.getAvailableBoards();
    
    if (boards.length === 0) {
      this.log('Skipping task seeding (no boards available)');
      return [];
    }

    const totalTasks = this.calculateTotalTasks(boards, config);
    await this.initialize(totalTasks, 'Task Seeding');

    try {
      const createdTasks = [];

      for (const board of boards) {
        // Ensure columns exist for this board
        await this.ensureColumnsForBoard(board);
        
        const taskCount = faker.number.int({
          min: config.perBoard.min,
          max: config.perBoard.max
        });

        this.log(`Creating ${taskCount} tasks for board: ${board.name}`);

        for (let i = 0; i < taskCount; i++) {
          const taskData = await this.generateTaskData(board);
          
          if (this.validate(taskData, 'validateTask')) {
            const task = await this.createTask(taskData);
            createdTasks.push(task);
            
            this.addCreatedData('tasks', task);
            this.updateProgress(1, `Created task: ${task.title} in ${board.name}`);
          }
        }
      }

      this.completeProgress('Task seeding completed');
      this.printSummary();
      
      return createdTasks;

    } catch (error) {
      this.error(`Task seeding failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Calculate total number of tasks to create
   */
  calculateTotalTasks(boards, config) {
    return boards.reduce((total, board) => {
      const taskCount = faker.number.int({
        min: config.perBoard.min,
        max: config.perBoard.max
      });
      return total + taskCount;
    }, 0);
  }

  /**
   * Generate task data
   */
  async generateTaskData(board) {
    const assignee = this.getRandomItem(board.members.map(m => m.user));
    const reporter = this.getRandomItem(board.members.map(m => m.user));
    const watchers = this.getRandomItems(board.members.map(m => m.user), {
      min: 0,
      max: Math.min(3, board.members.length),
      exclude: [assignee, reporter]
    });

    const tags = await this.getRandomTags();
    const columns = board.columns || [];
    if (columns.length === 0) {
      throw new Error(`No columns available for board: ${board.name}`);
    }
    const column = this.getRandomItem(columns);
    const priority = this.getRandomItem(['low', 'medium', 'high', 'urgent']);
    const status = this.getTaskStatusFromColumn(column);

    return {
      title: this.generateTaskTitle(),
      description: this.generateTaskDescription(),
      board: board._id,
      space: board.space,
      workspace: board.workspace,
      column: column._id,
      assignee: assignee,
      reporter: reporter,
      watchers: watchers,
      tags: tags.map(tag => tag._id),
      priority: priority,
      status: status,
      type: this.getRandomItem(['task', 'bug', 'feature', 'story', 'epic']),
      storyPoints: this.getRandomStoryPoints(),
      dueDate: this.getRandomDueDate(),
      estimatedHours: this.getRandomEstimatedHours(),
      actualHours: 0,
      labels: this.generateTaskLabels(),
      attachments: [],
      checklists: this.generateTaskChecklists(),
      comments: [],
      activity: [],
      metadata: {
        createdBy: reporter,
        lastModifiedBy: assignee,
        timeSpent: 0,
        timeRemaining: this.getRandomEstimatedHours(),
        isSubtask: faker.datatype.boolean({ probability: 0.2 }),
        parentTask: null,
        subtasks: [],
        dependencies: [],
        blockers: []
      },
      settings: {
        allowComments: faker.datatype.boolean({ probability: 0.9 }),
        allowAttachments: faker.datatype.boolean({ probability: 0.8 }),
        allowTimeTracking: faker.datatype.boolean({ probability: 0.7 }),
        notifyOnChanges: faker.datatype.boolean({ probability: 0.8 }),
        autoAssign: faker.datatype.boolean({ probability: 0.3 })
      },
      createdAt: this.getRandomPastDate(60),
      updatedAt: new Date(),
      startedAt: status === 'in_progress' ? this.getRandomPastDate(30) : null,
      completedAt: status === 'completed' ? this.getRandomPastDate(7) : null
    };
  }

  /**
   * Generate task title
   */
  generateTaskTitle() {
    const taskTypes = [
      'Implement user authentication system',
      'Fix responsive design issues',
      'Add data validation to forms',
      'Optimize database queries',
      'Create API documentation',
      'Update user interface components',
      'Implement error handling',
      'Add unit tests for modules',
      'Refactor legacy code',
      'Design new dashboard layout',
      'Integrate third-party service',
      'Fix cross-browser compatibility',
      'Add search functionality',
      'Implement caching mechanism',
      'Create admin panel',
      'Add export functionality',
      'Fix performance issues',
      'Update dependencies',
      'Add notification system',
      'Implement file upload feature'
    ];

    return this.getRandomItem(taskTypes);
  }

  /**
   * Generate task description
   */
  generateTaskDescription() {
    const descriptions = [
      'This task involves implementing the required functionality with proper error handling and validation.',
      'Need to ensure the feature works across different browsers and devices.',
      'The implementation should follow the established coding standards and best practices.',
      'Include comprehensive testing to ensure reliability and performance.',
      'Consider user experience and accessibility requirements in the implementation.',
      'Document the changes and update relevant documentation.',
      'Coordinate with the design team to ensure visual consistency.',
      'Test thoroughly in different environments before deployment.',
      'Consider scalability and performance implications.',
      'Follow the established API patterns and conventions.'
    ];

    return this.getRandomItem(descriptions);
  }

  /**
   * Get task status from column
   */
  getTaskStatusFromColumn(column) {
    if (!column) return 'todo';
    
    const statusMap = {
      'Backlog': 'backlog',
      'To Do': 'todo',
      'In Progress': 'in_progress',
      'Review': 'review',
      'Done': 'completed'
    };

    return statusMap[column.name] || 'todo';
  }

  /**
   * Get random story points
   */
  getRandomStoryPoints() {
    const points = [1, 2, 3, 5, 8, 13, 21];
    return this.getRandomItem(points);
  }

  /**
   * Get random due date
   */
  getRandomDueDate() {
    const hasDueDate = faker.datatype.boolean({ probability: 0.7 });
    if (!hasDueDate) return null;
    
    return faker.date.future({ years: 0.5 });
  }

  /**
   * Get random estimated hours
   */
  getRandomEstimatedHours() {
    return faker.number.int({ min: 1, max: 40 });
  }

  /**
   * Generate task labels
   */
  generateTaskLabels() {
    const labels = [
      'frontend', 'backend', 'bug', 'feature', 'urgent', 'documentation',
      'testing', 'design', 'performance', 'security', 'accessibility'
    ];

    const numLabels = faker.number.int({ min: 0, max: 3 });
    return this.getRandomItems(labels, { min: numLabels, max: numLabels });
  }

  /**
   * Generate task checklists
   */
  generateTaskChecklists() {
    const hasChecklist = faker.datatype.boolean({ probability: 0.6 });
    if (!hasChecklist) return [];

    const checklistItems = [
      'Review requirements',
      'Create implementation plan',
      'Write unit tests',
      'Implement functionality',
      'Test locally',
      'Create pull request',
      'Address review comments',
      'Deploy to staging',
      'Perform integration testing',
      'Update documentation'
    ];

    const numItems = faker.number.int({ min: 3, max: 8 });
    const selectedItems = this.getRandomItems(checklistItems, { min: numItems, max: numItems });

    return selectedItems.map((item, index) => ({
      id: faker.string.uuid(),
      title: item,
      completed: faker.datatype.boolean({ probability: 0.3 }),
      order: index
    }));
  }

  /**
   * Get random tags
   */
  async getRandomTags() {
    // First try to get tags from the tag seeder if available
    if (this.tagSeeder && this.tagSeeder.getCreatedTags()) {
      const tags = this.tagSeeder.getCreatedTags();
      const numTags = faker.number.int({ min: 0, max: Math.min(3, tags.length) });
      return this.getRandomItems(tags, { min: numTags, max: numTags });
    }

    // Fallback to database query
    try {
      const tags = await this.tagModel.find({}).limit(20);
      const numTags = faker.number.int({ min: 0, max: Math.min(3, tags.length) });
      return this.getRandomItems(tags, { min: numTags, max: numTags });
    } catch (error) {
      this.warning(`Failed to fetch tags: ${error.message}`);
      return [];
    }
  }

  /**
   * Create task in database
   */
  async createTask(data) {
    try {
      const task = new this.taskModel(data);
      const savedTask = await task.save();
      
      this.success(`Created task: ${savedTask.title} (${savedTask.status})`);
      return savedTask;
      
    } catch (error) {
      this.error(`Failed to create task: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get available boards for task creation
   */
  async getAvailableBoards() {
    // First try to get boards from the board seeder if available
    if (this.boardSeeder && this.boardSeeder.getCreatedBoards()) {
      return this.boardSeeder.getCreatedBoards();
    }

    // Fallback to database query
    try {
      const boards = await this.boardModel.find({}).populate('members.user').limit(50);
      return boards;
    } catch (error) {
      this.error(`Failed to fetch boards: ${error.message}`);
      return [];
    }
  }

  /**
   * Ensure columns exist for a board
   */
  async ensureColumnsForBoard(board) {
    try {
      // Check if columns already exist for this board
      const existingColumns = await this.columnModel.find({ board: board._id });
      
      if (existingColumns.length > 0) {
        // Cache columns on the board object for easy access
        board.columns = existingColumns;
        return existingColumns;
      }

      // Create default columns for the board
      const defaultColumns = [
        { name: 'To Do', position: 0 },
        { name: 'In Progress', position: 1 },
        { name: 'Review', position: 2 },
        { name: 'Done', position: 3 }
      ];

      const createdColumns = [];
      for (const columnData of defaultColumns) {
        const column = new this.columnModel({
          name: columnData.name,
          board: board._id,
          position: columnData.position,
          settings: {
            wipLimit: {
              enabled: false,
              limit: null,
              strictMode: false
            },
            sorting: {
              method: 'manual',
              direction: 'asc'
            },
            autoAssign: {
              enabled: false,
              rules: []
            }
          }
        });

        const savedColumn = await column.save();
        createdColumns.push(savedColumn);
        this.success(`Created column: ${savedColumn.name} for board: ${board.name}`);
      }

      // Cache columns on the board object for easy access
      board.columns = createdColumns;
      return createdColumns;

    } catch (error) {
      this.error(`Failed to ensure columns for board ${board.name}: ${error.message}`);
      throw error;
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
   * Validate task data
   */
  validateTask(data) {
    const validator = require('../utils/validator');
    const result = validator.validateTask(data);
    
    if (result.errors.length > 0) {
      this.error(`Task validation errors: ${result.errors.join(', ')}`);
      return false;
    }
    
    if (result.warnings.length > 0) {
      this.warning(`Task validation warnings: ${result.warnings.join(', ')}`);
    }
    
    return true;
  }

  /**
   * Get created tasks
   */
  getCreatedTasks() {
    return this.getCreatedData('tasks') || [];
  }

  /**
   * Get tasks by status
   */
  getTasksByStatus(status) {
    const tasks = this.getCreatedTasks();
    return tasks.filter(task => task.status === status);
  }

  /**
   * Print seeding summary
   */
  printSummary() {
    const tasks = this.getCreatedTasks();
    
    this.success('\n=== Task Seeding Summary ===');
    this.log(`✅ Created ${tasks.length} tasks`);
    
    if (tasks.length > 0) {
      this.log('\n📋 Task Status Distribution:');
      const statusGroups = {};
      tasks.forEach(task => {
        if (!statusGroups[task.status]) {
          statusGroups[task.status] = 0;
        }
        statusGroups[task.status]++;
      });
      
      Object.entries(statusGroups).forEach(([status, count]) => {
        this.log(`  ${status}: ${count} tasks`);
      });

      this.log('\n📋 Task Priority Distribution:');
      const priorityGroups = {};
      tasks.forEach(task => {
        if (!priorityGroups[task.priority]) {
          priorityGroups[task.priority] = 0;
        }
        priorityGroups[task.priority]++;
      });
      
      Object.entries(priorityGroups).forEach(([priority, count]) => {
        this.log(`  ${priority}: ${count} tasks`);
      });
    }
    
    this.success('=== End Task Seeding Summary ===\n');
  }
}

module.exports = TaskSeeder;
