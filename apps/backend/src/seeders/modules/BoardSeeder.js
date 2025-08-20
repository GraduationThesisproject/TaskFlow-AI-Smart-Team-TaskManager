/**
 * Board Seeder
 * Handles seeding of boards and related entities
 */

const BaseSeeder = require('../base/BaseSeeder');
const { faker } = require('@faker-js/faker');
const Board = require('../../models/Board');
const Space = require('../../models/Space');
const User = require('../../models/User');

class BoardSeeder extends BaseSeeder {
  constructor(workspaceSeeder = null) {
    super();
    this.workspaceSeeder = workspaceSeeder;
    this.boardModel = Board;
    this.spaceModel = Space;
    this.userModel = User;
  }

  /**
   * Main seeding method for boards
   */
  async seed() {
    const config = this.getConfig('boards');
    const spaces = await this.getAvailableSpaces();
    
    if (spaces.length === 0) {
      this.log('Skipping board seeding (no spaces available)');
      return [];
    }

    const totalBoards = this.calculateTotalBoards(spaces, config);
    await this.initialize(totalBoards, 'Board Seeding');

    try {
      const createdBoards = [];

      for (const space of spaces) {
        const boardCount = faker.number.int({
          min: config.perSpace.min,
          max: config.perSpace.max
        });

        this.log(`Creating ${boardCount} boards for space: ${space.name}`);

        for (let i = 0; i < boardCount; i++) {
          const boardData = this.generateBoardData(space);
          
          if (this.validate(boardData, 'validateBoard')) {
            const board = await this.createBoard(boardData);
            createdBoards.push(board);
            
            this.addCreatedData('boards', board);
            this.updateProgress(1, `Created board: ${board.name} in ${space.name}`);
          }
        }
      }

      this.completeProgress('Board seeding completed');
      this.printSummary();
      
      return createdBoards;

    } catch (error) {
      this.error(`Board seeding failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Calculate total number of boards to create
   */
  calculateTotalBoards(spaces, config) {
    return spaces.reduce((total, space) => {
      const boardCount = faker.number.int({
        min: config.perSpace.min,
        max: config.perSpace.max
      });
      return total + boardCount;
    }, 0);
  }

  /**
   * Generate board data
   */
  generateBoardData(space) {
    const owner = this.getRandomItem(space.members.map(m => m.user));
    const members = this.getRandomItems(space.members.map(m => m.user), {
      min: 1,
      max: Math.min(5, space.members.length),
      exclude: [owner]
    });

    return {
      name: this.generateBoardName(),
      description: this.generateBoardDescription(),
      space: space._id,
      workspace: space.workspace,
      owner: owner,
      members: [
        {
          user: owner,
          permissions: ['view', 'edit', 'delete', 'manage_columns', 'manage_members'],
          addedAt: this.getRandomPastDate(30)
        },
        ...members.map(user => ({
          user: user,
          permissions: this.getRandomItems(['view', 'edit', 'delete', 'manage_columns', 'manage_members'], {
            min: 1,
            max: 3
          }),
          addedAt: this.getRandomPastDate(30)
        }))
      ],
      settings: this.generateBoardSettings(),
      visibility: this.getRandomItem(['private', 'workspace', 'public']),
      archived: false,
      createdAt: this.getRandomPastDate(90),
      updatedAt: new Date()
    };
  }

  /**
   * Generate board name
   */
  generateBoardName() {
    const prefixes = ['Project', 'Sprint', 'Release', 'Feature', 'Bug Fix', 'Design', 'Planning', 'Review'];
    const suffixes = ['Board', 'Kanban', 'Scrum', 'Backlog', 'Roadmap', 'Tasks', 'Workflow'];
    
    const prefix = this.getRandomItem(prefixes);
    const suffix = this.getRandomItem(suffixes);
    const name = faker.company.catchPhrase();
    
    return `${prefix} ${name} ${suffix}`;
  }

  /**
   * Generate board description
   */
  generateBoardDescription() {
    const descriptions = [
      'Track and manage project tasks and milestones.',
      'Organize work items and track progress efficiently.',
      'Visualize workflow and project status.',
      'Collaborate on tasks and project deliverables.',
      'Manage sprint planning and execution.',
      'Track feature development and bug fixes.',
      'Coordinate team efforts and project timeline.',
      'Monitor project progress and team productivity.'
    ];

    return this.getRandomItem(descriptions);
  }



  /**
   * Generate board settings
   */
  generateBoardSettings() {
    return {
      allowComments: faker.datatype.boolean({ probability: 0.9 }),
      allowAttachments: faker.datatype.boolean({ probability: 0.8 }),
      allowTimeTracking: faker.datatype.boolean({ probability: 0.7 }),
      defaultTaskPriority: this.getRandomItem(['low', 'medium', 'high', 'critical']),
      autoArchive: faker.datatype.boolean({ probability: 0.3 }),
      archiveAfterDays: faker.number.int({ min: 7, max: 90 })
    };
  }

  /**
   * Create board in database
   */
  async createBoard(data) {
    try {
      const board = new this.boardModel(data);
      const savedBoard = await board.save();
      
      this.success(`Created board: ${savedBoard.name} (ID: ${savedBoard._id})`);
      return savedBoard;
      
    } catch (error) {
      this.error(`Failed to create board: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get available spaces for board creation
   */
  async getAvailableSpaces() {
    // First try to get spaces from the workspace seeder if available
    if (this.workspaceSeeder && this.workspaceSeeder.getCreatedSpaces()) {
      return this.workspaceSeeder.getCreatedSpaces();
    }

    // Fallback to database query
    try {
      const spaces = await this.spaceModel.find({}).populate('members.user').limit(50);
      return spaces;
    } catch (error) {
      this.error(`Failed to fetch spaces: ${error.message}`);
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
   * Validate board data
   */
  validateBoard(data) {
    const validator = require('../utils/validator');
    const result = validator.validateBoard(data);
    
    if (result.errors.length > 0) {
      this.error(`Board validation errors: ${result.errors.join(', ')}`);
      return false;
    }
    
    if (result.warnings.length > 0) {
      this.warning(`Board validation warnings: ${result.warnings.join(', ')}`);
    }
    
    return true;
  }

  /**
   * Get created boards
   */
  getCreatedBoards() {
    return this.getCreatedData('boards') || [];
  }

  /**
   * Print seeding summary
   */
  printSummary() {
    const boards = this.getCreatedBoards();
    
    this.success('\n=== Board Seeding Summary ===');
    this.log(`✅ Created ${boards.length} boards`);
    
    if (boards.length > 0) {
      this.log('\n📋 Created Boards:');
      const boardGroups = {};
      boards.forEach(board => {
        const spaceName = board.space?.name || 'Unknown Space';
        if (!boardGroups[spaceName]) {
          boardGroups[spaceName] = [];
        }
        boardGroups[spaceName].push(board.name);
      });
      
      Object.entries(boardGroups).forEach(([space, boardNames]) => {
        this.log(`  ${space}: ${boardNames.join(', ')}`);
      });
    }
    
    this.success('=== End Board Seeding Summary ===\n');
  }
}

module.exports = BoardSeeder;
