/**
 * Workspace Seeder
 * Handles seeding of workspaces, spaces, and related entities
 */

const BaseSeeder = require('../base/BaseSeeder');
const { faker } = require('@faker-js/faker');
const Workspace = require('../../models/Workspace');
const Space = require('../../models/Space');
const User = require('../../models/User');

class WorkspaceSeeder extends BaseSeeder {
  constructor(userSeeder = null) {
    super();
    this.userSeeder = userSeeder;
    this.workspaceModel = Workspace;
    this.spaceModel = Space;
    this.userModel = User;
  }

  /**
   * Main seeding method for workspaces
   */
  async seed() {
    const config = this.getConfig('workspaces');
    const total = config.count;
    
    if (total === 0) {
      this.log('Skipping workspace seeding (count: 0)');
      return [];
    }

    await this.initialize(total, 'Workspace Seeding');

    try {
      // Get users for workspace creation
      const users = await this.getAvailableUsers();
      
      if (users.length === 0) {
        throw new Error('No users available for workspace creation');
      }

      const createdWorkspaces = [];

      for (let i = 0; i < total; i++) {
        const workspaceData = this.generateWorkspaceData(users);
        
        if (this.validate(workspaceData, 'validateWorkspace')) {
          const workspace = await this.createWorkspace(workspaceData);
          createdWorkspaces.push(workspace);
          
          this.addCreatedData('workspaces', workspace);
          this.updateProgress(1, `Created workspace: ${workspace.name}`);
          
          // Create spaces for this workspace
          await this.createSpacesForWorkspace(workspace, users);
        }
      }

      this.completeProgress('Workspace seeding completed');
      this.printSummary();
      
      return createdWorkspaces;

    } catch (error) {
      this.error(`Workspace seeding failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate workspace data
   */
  generateWorkspaceData(users) {
    const owner = this.getRandomItem(users);
    const members = this.getRandomItems(users, {
      min: this.getConfig('workspaces.membersPerWorkspace.min'),
      max: this.getConfig('workspaces.membersPerWorkspace.max'),
      exclude: [owner._id]
    });

    return {
      name: this.generateWorkspaceName(),
      description: this.generateWorkspaceDescription(),
      owner: owner._id,
      members: [
        {
          user: owner._id,
          role: 'admin',
          joinedAt: this.getRandomPastDate(30),
          permissions: {
            canCreateSpaces: true,
            canManageMembers: true,
            canEditSettings: true,
            canDeleteWorkspace: true
          }
        },
        ...members.map(m => ({
          user: m._id,
          role: this.getRandomItem(['member', 'admin']),
          joinedAt: this.getRandomPastDate(30),
          permissions: {
            canCreateSpaces: this.getRandomBoolean(),
            canManageMembers: this.getRandomBoolean(0.2),
            canEditSettings: this.getRandomBoolean(0.1),
            canDeleteWorkspace: false
          }
        }))
      ],
      settings: this.generateWorkspaceSettings(),
      logo: this.generateWorkspaceLogo(),
      isPublic: faker.datatype.boolean({ probability: 0.3 }),
      tags: this.generateWorkspaceTags(),
      createdAt: this.getRandomPastDate(365),
      updatedAt: new Date()
    };
  }

  /**
   * Generate workspace name
   */
  generateWorkspaceName() {
    const prefixes = ['Team', 'Project', 'Company', 'Studio', 'Lab', 'Hub', 'Group', 'Squad'];
    const suffixes = ['Workspace', 'Space', 'Hub', 'Lab', 'Studio', 'Team', 'Group'];
    
    const prefix = this.getRandomItem(prefixes);
    const suffix = this.getRandomItem(suffixes);
    const name = faker.company.name();
    
    return `${prefix} ${name} ${suffix}`;
  }

  /**
   * Generate workspace description
   */
  generateWorkspaceDescription() {
    const descriptions = [
      'A collaborative workspace for team projects and task management.',
      'Central hub for project coordination and team communication.',
      'Workspace dedicated to product development and innovation.',
      'Team collaboration space for efficient project management.',
      'Creative workspace for design and development projects.',
      'Professional workspace for business operations and planning.',
      'Innovation lab for research and development initiatives.',
      'Collaborative environment for cross-functional teams.'
    ];

    return this.getRandomItem(descriptions);
  }

  /**
   * Generate workspace settings
   */
  generateWorkspaceSettings() {
    return {
      theme: this.getRandomItem(['light', 'dark', 'auto']),
      language: this.getRandomItem(['en', 'es', 'fr', 'de', 'ja']),
      timezone: this.getRandomItem(['UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo']),
      notifications: {
        email: faker.datatype.boolean(),
        push: faker.datatype.boolean(),
        desktop: faker.datatype.boolean()
      },
      privacy: {
        allowInvites: faker.datatype.boolean(),
        publicProfile: faker.datatype.boolean(),
        showActivity: faker.datatype.boolean()
      },
      features: {
        analytics: faker.datatype.boolean(),
        integrations: faker.datatype.boolean(),
        advancedPermissions: faker.datatype.boolean()
      }
    };
  }

  /**
   * Generate workspace logo
   */
  generateWorkspaceLogo() {
    const logos = [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=150&h=150&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150&h=150&fit=crop',
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=150&h=150&fit=crop',
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=150&h=150&fit=crop',
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150&h=150&fit=crop',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop',
      'https://images.unsplash.com/photo-1580518324671-c2f0833a3af3?w=150&h=150&fit=crop'
    ];

    return this.getRandomItem(logos);
  }

  /**
   * Generate workspace tags
   */
  generateWorkspaceTags() {
    const tagCategories = [
      ['development', 'coding', 'programming', 'software'],
      ['design', 'creative', 'art', 'graphics'],
      ['marketing', 'advertising', 'branding', 'social'],
      ['business', 'management', 'strategy', 'planning'],
      ['research', 'analysis', 'data', 'insights'],
      ['collaboration', 'teamwork', 'communication', 'coordination']
    ];

    const category = this.getRandomItem(tagCategories);
    const numTags = faker.number.int({ min: 1, max: 3 });
    
    return this.getRandomItems(category, { min: numTags, max: numTags });
  }

  /**
   * Create workspace in database
   */
  async createWorkspace(data) {
    try {
      const workspace = new this.workspaceModel(data);
      const savedWorkspace = await workspace.save();
      
      this.success(`Created workspace: ${savedWorkspace.name} (ID: ${savedWorkspace._id})`);
      return savedWorkspace;
      
    } catch (error) {
      this.error(`Failed to create workspace: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create spaces for a workspace
   */
  async createSpacesForWorkspace(workspace, users) {
    const config = this.getConfig('spaces');
    const spaceCount = faker.number.int({
      min: config.perWorkspace.min,
      max: config.perWorkspace.max
    });

    this.log(`Creating ${spaceCount} spaces for workspace: ${workspace.name}`);

    for (let i = 0; i < spaceCount; i++) {
      const spaceData = this.generateSpaceData(workspace, users);
      
      if (this.validate(spaceData, 'validateSpace')) {
        try {
          const space = new this.spaceModel(spaceData);
          const savedSpace = await space.save();
          
          this.addCreatedData('spaces', savedSpace);
          this.log(`Created space: ${savedSpace.name} in workspace: ${workspace.name}`);
          
        } catch (error) {
          this.error(`Failed to create space: ${error.message}`);
        }
      }
    }
  }

  /**
   * Generate space data
   */
  generateSpaceData(workspace, users) {
    const owner = this.getRandomItem(users);
    const members = this.getRandomItems(users, {
      min: 1,
      max: Math.min(5, users.length),
      exclude: [owner._id]
    });

    return {
      name: this.generateSpaceName(),
      description: this.generateSpaceDescription(),
      workspace: workspace._id,
      owner: owner._id,
      members: [
        {
          user: owner._id,
          role: 'admin',
          joinedAt: this.getRandomPastDate(30),
          permissions: {
            canViewBoards: true,
            canCreateBoards: true,
            canEditBoards: true,
            canDeleteBoards: true,
            canCreateTasks: true,
            canEditTasks: true,
            canDeleteTasks: true,
            canManageMembers: true,
            canEditSettings: true
          }
        },
        ...members.map(m => ({
          user: m._id,
          role: this.getRandomItem(['viewer', 'member', 'admin']),
          joinedAt: this.getRandomPastDate(30),
          permissions: {
            canViewBoards: true,
            canCreateBoards: this.getRandomBoolean(),
            canEditBoards: this.getRandomBoolean(0.3),
            canDeleteBoards: this.getRandomBoolean(0.1),
            canCreateTasks: this.getRandomBoolean(),
            canEditTasks: this.getRandomBoolean(),
            canDeleteTasks: this.getRandomBoolean(0.2),
            canManageMembers: this.getRandomBoolean(0.1),
            canEditSettings: this.getRandomBoolean(0.1)
          }
        }))
      ],
      type: this.getRandomItem(['project', 'department', 'team', 'sprint', 'milestone']),
      color: this.getRandomItem(['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899']),
      isArchived: false,
      settings: this.generateSpaceSettings(),
      createdAt: this.getRandomPastDate(180),
      updatedAt: new Date()
    };
  }

  /**
   * Generate space name
   */
  generateSpaceName() {
    const prefixes = ['Frontend', 'Backend', 'Design', 'Marketing', 'Sales', 'Support', 'QA', 'DevOps'];
    const suffixes = ['Team', 'Squad', 'Project', 'Sprint', 'Milestone', 'Phase', 'Release'];
    
    const prefix = this.getRandomItem(prefixes);
    const suffix = this.getRandomItem(suffixes);
    
    return `${prefix} ${suffix}`;
  }

  /**
   * Generate space description
   */
  generateSpaceDescription() {
    const descriptions = [
      'Dedicated space for team collaboration and project management.',
      'Focused area for specific project deliverables and milestones.',
      'Team workspace for coordinated development and planning.',
      'Project space for tracking progress and managing tasks.',
      'Collaborative environment for cross-functional initiatives.',
      'Sprint workspace for agile development and iteration planning.',
      'Department space for organizational alignment and coordination.',
      'Milestone tracking space for project phases and deliverables.'
    ];

    return this.getRandomItem(descriptions);
  }

  /**
   * Generate space settings
   */
  generateSpaceSettings() {
    return {
      visibility: this.getRandomItem(['public', 'private', 'team']),
      permissions: {
        canEdit: ['owner', 'admin'],
        canDelete: ['owner'],
        canInvite: ['owner', 'admin']
      },
      features: {
        comments: faker.datatype.boolean(),
        attachments: faker.datatype.boolean(),
        timeTracking: faker.datatype.boolean(),
        labels: faker.datatype.boolean()
      }
    };
  }

  /**
   * Get available users for workspace creation
   */
  async getAvailableUsers() {
    // First try to get users from the user seeder if available
    if (this.userSeeder && this.userSeeder.getCreatedData('user')) {
      const userData = this.userSeeder.getCreatedData('user');
      // Extract user objects from the { user, preferences, roles, sessions } structure
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
   * Get configuration for this seeder
   */
  getConfig(path) {
    const config = require('../config/seeder.config');
    const environment = process.env.NODE_ENV || 'development';
    const envConfig = config.environments[environment];
    return path ? path.split('.').reduce((obj, key) => obj?.[key], envConfig) : envConfig;
  }

  /**
   * Validate workspace data
   */
  validateWorkspace(data) {
    const validator = require('../utils/validator');
    const result = validator.validateWorkspace(data);
    
    if (result.errors.length > 0) {
      this.error(`Workspace validation errors: ${result.errors.join(', ')}`);
      return false;
    }
    
    if (result.warnings.length > 0) {
      this.warning(`Workspace validation warnings: ${result.warnings.join(', ')}`);
    }
    
    return true;
  }

  /**
   * Validate space data
   */
  validateSpace(data) {
    const validator = require('../utils/validator');
    const result = validator.validateSpace(data);
    
    if (result.errors.length > 0) {
      this.error(`Space validation errors: ${result.errors.join(', ')}`);
      return false;
    }
    
    if (result.warnings.length > 0) {
      this.warning(`Space validation warnings: ${result.warnings.join(', ')}`);
    }
    
    return true;
  }

  /**
   * Get created workspaces
   */
  getCreatedWorkspaces() {
    return this.getCreatedData('workspaces') || [];
  }

  /**
   * Get created spaces
   */
  getCreatedSpaces() {
    return this.getCreatedData('spaces') || [];
  }

  /**
   * Print seeding summary
   */
  printSummary() {
    const workspaces = this.getCreatedWorkspaces();
    const spaces = this.getCreatedSpaces();
    
    this.success('\n=== Workspace Seeding Summary ===');
    this.log(`✅ Created ${workspaces.length} workspaces`);
    this.log(`✅ Created ${spaces.length} spaces`);
    
    if (workspaces.length > 0) {
      this.log('\n📋 Created Workspaces:');
      workspaces.forEach((workspace, index) => {
        this.log(`  ${index + 1}. ${workspace.name} (${workspace.members.length} members)`);
      });
    }
    
    if (spaces.length > 0) {
      this.log('\n📋 Created Spaces:');
      const spaceGroups = {};
      spaces.forEach(space => {
        const workspaceName = workspaces.find(w => w._id.equals(space.workspace))?.name || 'Unknown';
        if (!spaceGroups[workspaceName]) {
          spaceGroups[workspaceName] = [];
        }
        spaceGroups[workspaceName].push(space.name);
      });
      
      Object.entries(spaceGroups).forEach(([workspace, spaceNames]) => {
        this.log(`  ${workspace}: ${spaceNames.join(', ')}`);
      });
    }
    
    this.success('=== End Workspace Seeding Summary ===\n');
  }
}

module.exports = WorkspaceSeeder;
