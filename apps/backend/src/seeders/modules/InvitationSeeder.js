/**
 * Invitation Seeder
 * Handles seeding of invitations for workspaces and boards
 */

const BaseSeeder = require('../base/BaseSeeder');
const { faker } = require('@faker-js/faker');
const Invitation = require('../../models/Invitation');
const User = require('../../models/User');
const Workspace = require('../../models/Workspace');

class InvitationSeeder extends BaseSeeder {
  constructor(userSeeder = null, workspaceSeeder = null) {
    super();
    this.userSeeder = userSeeder;
    this.workspaceSeeder = workspaceSeeder;
    this.invitationModel = Invitation;
    this.userModel = User;
    this.workspaceModel = Workspace;
  }

  /**
   * Main seeding method for invitations
   */
  async seed() {
    const users = await this.getAvailableUsers();
    const workspaces = await this.getAvailableWorkspaces();
    
    if (users.length === 0 || workspaces.length === 0) {
      this.log('Skipping invitation seeding (no users or workspaces available)');
      return [];
    }

    const totalInvitations = this.calculateTotalInvitations(users, workspaces);
    await this.initialize(totalInvitations, 'Invitation Seeding');

    try {
      const createdInvitations = [];

      for (const workspace of workspaces) {
        const invitationCount = faker.number.int({ min: 1, max: 5 });

        this.log(`Creating ${invitationCount} invitations for workspace: ${workspace.name}`);

        for (let i = 0; i < invitationCount; i++) {
          const invitationData = await this.generateInvitationData(workspace);
          
          if (this.validate(invitationData, 'validateInvitation')) {
            const invitation = await this.createInvitation(invitationData);
            createdInvitations.push(invitation);
            
            this.addCreatedData('invitations', invitation);
            this.updateProgress(1, `Created invitation for workspace: ${workspace.name}`);
          }
        }
      }

      this.completeProgress('Invitation seeding completed');
      this.printSummary();
      
      return createdInvitations;

    } catch (error) {
      this.error(`Invitation seeding failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Calculate total number of invitations to create
   */
  calculateTotalInvitations(users, workspaces) {
    return workspaces.reduce((total, workspace) => {
      const invitationCount = faker.number.int({ min: 1, max: 5 });
      return total + invitationCount;
    }, 0);
  }

  /**
   * Generate invitation data
   */
  async generateInvitationData(workspace) {
    const users = await this.getAvailableUsers();
    const inviter = this.getRandomItem(users);
    const invitee = this.getRandomItem(users.filter(user => user._id.toString() !== inviter._id.toString()));
    const type = this.getRandomInvitationType();
    const role = this.getInvitationRole(type);

    return {
      type: type,
      status: this.getRandomItem(['pending', 'accepted', 'declined', 'expired']),
      inviter: inviter._id,
      invitee: {
        email: invitee.email,
        name: invitee.name,
        userId: invitee._id
      },
      workspace: workspace._id,
      space: null, // Will be set if space-specific invitation
      board: null, // Will be set if board-specific invitation
      role: role,
      permissions: this.generateInvitationPermissions(role),
      message: this.generateInvitationMessage(type, workspace),
      expiresAt: this.generateExpiryDate(),
      acceptedAt: null,
      declinedAt: null,
      metadata: {
        source: this.getInvitationSource(type),
        campaign: this.getRandomItem(['organic', 'referral', 'marketing', 'direct']),
        ipAddress: faker.internet.ip(),
        userAgent: faker.internet.userAgent(),
        referrer: faker.internet.url(),
        utmSource: this.getRandomItem(['email', 'social', 'search', 'direct']),
        utmMedium: this.getRandomItem(['email', 'social', 'cpc', 'organic']),
        utmCampaign: this.getRandomItem(['workspace-invite', 'team-collaboration', 'project-management'])
      },
      settings: {
        allowMultipleAcceptances: faker.datatype.boolean({ probability: 0.1 }),
        requireApproval: faker.datatype.boolean({ probability: 0.2 }),
        autoExpire: true,
        sendReminders: faker.datatype.boolean({ probability: 0.7 }),
        reminderFrequency: this.getRandomItem(['daily', 'weekly', 'monthly'])
      },
      notifications: {
        emailSent: faker.datatype.boolean({ probability: 0.9 }),
        emailOpened: faker.datatype.boolean({ probability: 0.6 }),
        emailClicked: faker.datatype.boolean({ probability: 0.3 }),
        pushSent: faker.datatype.boolean({ probability: 0.4 }),
        smsSent: faker.datatype.boolean({ probability: 0.1 })
      },
      createdAt: this.getRandomPastDate(30),
      updatedAt: new Date()
    };
  }

  /**
   * Get random invitation type
   */
  getRandomInvitationType() {
    const types = [
      'workspace_invitation',
      'space_invitation',
      'board_invitation',
      'project_invitation',
      'team_invitation',
      'client_invitation',
      'consultant_invitation',
      'viewer_invitation'
    ];

    return this.getRandomItem(types);
  }

  /**
   * Get invitation role based on type
   */
  getInvitationRole(type) {
    const roleMap = {
      'workspace_invitation': this.getRandomItem(['admin', 'member', 'viewer']),
      'space_invitation': this.getRandomItem(['admin', 'member', 'viewer']),
      'board_invitation': this.getRandomItem(['admin', 'member', 'viewer']),
      'project_invitation': this.getRandomItem(['admin', 'member', 'viewer']),
      'team_invitation': this.getRandomItem(['admin', 'member', 'viewer']),
      'client_invitation': 'client',
      'consultant_invitation': 'consultant',
      'viewer_invitation': 'viewer'
    };

    return roleMap[type] || 'member';
  }

  /**
   * Generate invitation permissions
   */
  generateInvitationPermissions(role) {
    const permissions = {
      'admin': {
        canView: true,
        canEdit: true,
        canDelete: true,
        canManageMembers: true,
        canCreateSpaces: true,
        canCreateBoards: true,
        canInviteUsers: true,
        canManageSettings: true,
        canAccessAnalytics: true,
        canExportData: true
      },
      'member': {
        canView: true,
        canEdit: true,
        canDelete: false,
        canManageMembers: false,
        canCreateSpaces: true,
        canCreateBoards: true,
        canInviteUsers: true,
        canManageSettings: false,
        canAccessAnalytics: true,
        canExportData: false
      },
      'viewer': {
        canView: true,
        canEdit: false,
        canDelete: false,
        canManageMembers: false,
        canCreateSpaces: false,
        canCreateBoards: false,
        canInviteUsers: false,
        canManageSettings: false,
        canAccessAnalytics: false,
        canExportData: false
      },
      'client': {
        canView: true,
        canEdit: false,
        canDelete: false,
        canManageMembers: false,
        canCreateSpaces: false,
        canCreateBoards: false,
        canInviteUsers: false,
        canManageSettings: false,
        canAccessAnalytics: false,
        canExportData: false
      },
      'consultant': {
        canView: true,
        canEdit: true,
        canDelete: false,
        canManageMembers: false,
        canCreateSpaces: true,
        canCreateBoards: true,
        canInviteUsers: false,
        canManageSettings: false,
        canAccessAnalytics: true,
        canExportData: true
      }
    };

    return permissions[role] || permissions['member'];
  }

  /**
   * Generate invitation message
   */
  generateInvitationMessage(type, workspace) {
    const messages = {
      'workspace_invitation': [
        `You've been invited to join the "${workspace.name}" workspace. We'd love to have you collaborate with our team!`,
        `Join us in the "${workspace.name}" workspace to start collaborating on exciting projects together.`,
        `You're invited to be part of the "${workspace.name}" workspace. Let's work together to achieve great things!`
      ],
      'space_invitation': [
        `You've been invited to join a space within the "${workspace.name}" workspace.`,
        `Join our team in a collaborative space within "${workspace.name}".`,
        `We'd like to invite you to participate in a space within the "${workspace.name}" workspace.`
      ],
      'board_invitation': [
        `You've been invited to collaborate on a board within the "${workspace.name}" workspace.`,
        `Join our team on a project board within "${workspace.name}".`,
        `We'd like to invite you to work together on a board in the "${workspace.name}" workspace.`
      ],
      'project_invitation': [
        `You've been invited to join a project within the "${workspace.name}" workspace.`,
        `Join our team on an exciting project within "${workspace.name}".`,
        `We'd like to invite you to participate in a project within the "${workspace.name}" workspace.`
      ],
      'team_invitation': [
        `You've been invited to join our team in the "${workspace.name}" workspace.`,
        `Join our collaborative team within the "${workspace.name}" workspace.`,
        `We'd like to invite you to be part of our team in the "${workspace.name}" workspace.`
      ],
      'client_invitation': [
        `You've been invited to view project progress in the "${workspace.name}" workspace.`,
        `Access your project updates and deliverables in the "${workspace.name}" workspace.`,
        `Stay updated on your project by joining the "${workspace.name}" workspace.`
      ],
      'consultant_invitation': [
        `You've been invited to provide consultation for the "${workspace.name}" workspace.`,
        `Join us as a consultant to help improve the "${workspace.name}" workspace.`,
        `We'd like to invite you to provide expert guidance for the "${workspace.name}" workspace.`
      ],
      'viewer_invitation': [
        `You've been invited to view the "${workspace.name}" workspace.`,
        `Get a glimpse of our work in the "${workspace.name}" workspace.`,
        `We'd like to invite you to observe the "${workspace.name}" workspace.`
      ]
    };

    return this.getRandomItem(messages[type] || messages['workspace_invitation']);
  }

  /**
   * Generate expiry date
   */
  generateExpiryDate() {
    const now = new Date();
    const expiryDays = faker.number.int({ min: 7, max: 30 });
    return new Date(now.getTime() + expiryDays * 24 * 60 * 60 * 1000);
  }

  /**
   * Get invitation source
   */
  getInvitationSource(type) {
    const sources = {
      'workspace_invitation': 'workspace_owner',
      'space_invitation': 'space_admin',
      'board_invitation': 'board_admin',
      'project_invitation': 'project_manager',
      'team_invitation': 'team_lead',
      'client_invitation': 'account_manager',
      'consultant_invitation': 'project_manager',
      'viewer_invitation': 'workspace_admin'
    };

    return sources[type] || 'system';
  }

  /**
   * Create invitation in database
   */
  async createInvitation(data) {
    try {
      const invitation = new this.invitationModel(data);
      const savedInvitation = await invitation.save();
      
      this.success(`Created ${savedInvitation.type} invitation for ${savedInvitation.invitee.email}`);
      return savedInvitation;
      
    } catch (error) {
      this.error(`Failed to create invitation: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get available users for invitation creation
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
   * Get available workspaces for invitation creation
   */
  async getAvailableWorkspaces() {
    // First try to get workspaces from the workspace seeder if available
    if (this.workspaceSeeder && this.workspaceSeeder.getCreatedWorkspaces()) {
      return this.workspaceSeeder.getCreatedWorkspaces();
    }

    // Fallback to database query
    try {
      const workspaces = await this.workspaceModel.find({}).limit(50);
      return workspaces;
    } catch (error) {
      this.error(`Failed to fetch workspaces: ${error.message}`);
      return [];
    }
  }

  /**
   * Validate invitation data
   */
  validateInvitation(data) {
    const validator = require('../utils/validator');
    const result = validator.validateInvitation(data);
    
    if (result.errors.length > 0) {
      this.error(`Invitation validation errors: ${result.errors.join(', ')}`);
      return false;
    }
    
    if (result.warnings.length > 0) {
      this.warning(`Invitation validation warnings: ${result.warnings.join(', ')}`);
    }
    
    return true;
  }

  /**
   * Get created invitations
   */
  getCreatedInvitations() {
    return this.getCreatedData('invitations') || [];
  }

  /**
   * Get invitations by type
   */
  getInvitationsByType(type) {
    const invitations = this.getCreatedInvitations();
    return invitations.filter(invitation => invitation.type === type);
  }

  /**
   * Get invitations by status
   */
  getInvitationsByStatus(status) {
    const invitations = this.getCreatedInvitations();
    return invitations.filter(invitation => invitation.status === status);
  }

  /**
   * Print seeding summary
   */
  printSummary() {
    const invitations = this.getCreatedInvitations();
    
    this.success('\n=== Invitation Seeding Summary ===');
    this.log(`✅ Created ${invitations.length} invitations`);
    
    if (invitations.length > 0) {
      this.log('\n📋 Invitation Type Distribution:');
      const typeGroups = {};
      invitations.forEach(invitation => {
        if (!typeGroups[invitation.type]) {
          typeGroups[invitation.type] = 0;
        }
        typeGroups[invitation.type]++;
      });
      
      Object.entries(typeGroups).forEach(([type, count]) => {
        this.log(`  ${type}: ${count} invitations`);
      });

      this.log('\n📋 Invitation Status Distribution:');
      const statusGroups = {};
      invitations.forEach(invitation => {
        if (!statusGroups[invitation.status]) {
          statusGroups[invitation.status] = 0;
        }
        statusGroups[invitation.status]++;
      });
      
      Object.entries(statusGroups).forEach(([status, count]) => {
        this.log(`  ${status}: ${count} invitations`);
      });

      this.log('\n📋 Invitation Role Distribution:');
      const roleGroups = {};
      invitations.forEach(invitation => {
        if (!roleGroups[invitation.role]) {
          roleGroups[invitation.role] = 0;
        }
        roleGroups[invitation.role]++;
      });
      
      Object.entries(roleGroups).forEach(([role, count]) => {
        this.log(`  ${role}: ${count} invitations`);
      });

      const pendingInvitations = invitations.filter(i => i.status === 'pending');
      const acceptedInvitations = invitations.filter(i => i.status === 'accepted');
      const expiredInvitations = invitations.filter(i => i.status === 'expired');

      this.log(`\n📋 Invitation Statistics:`);
      this.log(`  Pending: ${pendingInvitations.length}`);
      this.log(`  Accepted: ${acceptedInvitations.length}`);
      this.log(`  Expired: ${expiredInvitations.length}`);
    }
    
    this.success('=== End Invitation Seeding Summary ===\n');
  }
}

module.exports = InvitationSeeder;
