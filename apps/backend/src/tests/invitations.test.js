const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const { setupTestDB, teardownTestDB, clearDatabase } = require('./helpers/testSetup');
const { createAuthenticatedUser, getAuthHeaders } = require('./helpers/authHelper');
const { createTestWorkspace, createTestProject, createTestInvitation } = require('./helpers/testData');
const Workspace = require('../models/Workspace');
const Project = require('../models/Project');
const Invitation = require('../models/Invitation');
const User = require('../models/User'); // Added User model import

describe('Invitation Endpoints', () => {
  let server;

  beforeAll(async () => {
    await setupTestDB();
    server = app.listen();
  });

  afterAll(async () => {
    await teardownTestDB();
    if (server) server.close();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  describe('POST /api/invitations', () => {
    let authUser;
    let workspace;
    let project;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
      const userId = new mongoose.Types.ObjectId(authUser.user._id);
      
      // Create workspace with proper user roles
      workspace = await Workspace.create(createTestWorkspace(userId));
      
      // Add owner role to user for the workspace
      const user = await User.findById(userId);
      const userRoles = await user.getRoles();
      await userRoles.addWorkspaceRole(workspace._id, 'owner');
      
      project = await Project.create(createTestProject(userId, workspace._id));
      
      // Add owner role to user for the project
      await userRoles.addProjectRole(project._id, 'owner');
    });

    it('should create workspace invitation', async () => {
      const invitationData = {
        email: 'newuser@test.com',
        name: 'New User',
        targetEntity: {
          type: 'Workspace',
          id: workspace._id
        },
        role: 'member',
        message: 'Join our awesome workspace!'
      };

      const response = await request(app)
        .post('/api/invitations')
        .set(getAuthHeaders(authUser.token))
        .send(invitationData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.invitation.invitedUser.email).toBe(invitationData.email);
      expect(response.body.data.invitation.targetEntity.type).toBe('Workspace');
      expect(response.body.data.invitation.role).toBe('member');
      expect(response.body.data.invitation.status).toBe('pending');
      expect(response.body.data.invitation.token).toBeDefined();
      expect(response.body.data.invitation.inviteUrl).toBeDefined();
    });

    it('should create project invitation', async () => {
      const invitationData = {
        email: 'contributor@test.com',
        targetEntity: {
          type: 'Project',
          id: project._id
        },
        role: 'contributor'
      };

      const response = await request(app)
        .post('/api/invitations')
        .set(getAuthHeaders(authUser.token))
        .send(invitationData)
        .expect(201);

      expect(response.body.data.invitation.targetEntity.type).toBe('Project');
      expect(response.body.data.invitation.role).toBe('contributor');
    });

    it('should not create invitation without email', async () => {
      const invitationData = {
        targetEntity: {
          type: 'Workspace',
          id: workspace._id
        },
        role: 'member'
      };

      await request(app)
        .post('/api/invitations')
        .set(getAuthHeaders(authUser.token))
        .send(invitationData)
        .expect(400);
    });

    it('should not create invitation with invalid email', async () => {
      const invitationData = {
        email: 'invalid-email',
        targetEntity: {
          type: 'Workspace',
          id: workspace._id
        },
        role: 'member'
      };

      await request(app)
        .post('/api/invitations')
        .set(getAuthHeaders(authUser.token))
        .send(invitationData)
        .expect(400);
    });

    it('should not create duplicate invitation', async () => {
      const invitationData = {
        email: 'newuser@test.com',
        targetEntity: {
          type: 'Workspace',
          id: workspace._id
        },
        role: 'member'
      };

      // Create first invitation
      await request(app)
        .post('/api/invitations')
        .set(getAuthHeaders(authUser.token))
        .send(invitationData)
        .expect(201);

      // Try to create duplicate
      await request(app)
        .post('/api/invitations')
        .set(getAuthHeaders(authUser.token))
        .send(invitationData)
        .expect(400);
    });
  });

  describe('GET /api/invitations', () => {
    let authUser;
    let workspace;
    let invitations;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
      const userId = new mongoose.Types.ObjectId(authUser.user._id);
      
      // Create workspace with proper user roles
      workspace = await Workspace.create(createTestWorkspace(userId));
      
      // Add owner role to user for the workspace
      const user = await User.findById(userId);
      const userRoles = await user.getRoles();
      await userRoles.addWorkspaceRole(workspace._id, 'owner');

      // Create invitations directly with proper schema
      invitations = await Promise.all([
        Invitation.create({
          type: 'workspace',
          invitedBy: userId,
          invitedUser: {
            email: 'user1@test.com',
            name: 'User 1'
          },
          targetEntity: {
            type: 'Workspace',
            id: workspace._id,
            name: workspace.name
          },
          role: 'member',
          status: 'pending',
          token: 'token1',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }),
        Invitation.create({
          type: 'workspace',
          invitedBy: userId,
          invitedUser: {
            email: 'user2@test.com',
            name: 'User 2'
          },
          targetEntity: {
            type: 'Workspace',
            id: workspace._id,
            name: workspace.name
          },
          role: 'admin',
          status: 'accepted',
          token: 'token2',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }),
        Invitation.create({
          type: 'workspace',
          invitedBy: userId,
          invitedUser: {
            email: 'user3@test.com',
            name: 'User 3'
          },
          targetEntity: {
            type: 'Workspace',
            id: workspace._id,
            name: workspace.name
          },
          role: 'member',
          status: 'declined',
          token: 'token3',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        })
      ]);
    });

    it('should get sent invitations', async () => {
      const response = await request(app)
        .get('/api/invitations')
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.invitations).toHaveLength(3);
    });

    it('should filter invitations by status', async () => {
      const response = await request(app)
        .get('/api/invitations?status=pending')
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.data.invitations).toHaveLength(1);
      expect(response.body.data.invitations[0].status).toBe('pending');
    });

    it('should filter invitations by entity type', async () => {
      const response = await request(app)
        .get('/api/invitations?entityType=Workspace')
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.data.invitations).toHaveLength(3);
      expect(response.body.data.invitations.every(inv => inv.targetEntity.type === 'Workspace')).toBe(true);
    });
  });

  describe('GET /api/invitations/token/:token', () => {
    let authUser;
    let workspace;
    let invitation;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
      const userId = new mongoose.Types.ObjectId(authUser.user._id);
      workspace = await Workspace.create(createTestWorkspace(userId));
      
      invitation = await Invitation.create({
        type: 'workspace',
        invitedBy: userId,
        invitedUser: {
          email: 'invited@test.com',
          name: 'Invited User'
        },
        targetEntity: {
          type: 'Workspace',
          id: workspace._id,
          name: workspace.name
        },
        role: 'member',
        status: 'pending',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });

      // Debug: Check if invitation was created properly
      console.log('Created invitation:', JSON.stringify(invitation, null, 2));
      console.log('Invitation targetEntity:', invitation.targetEntity);
      
      // Verify the invitation was saved correctly
      const savedInvitation = await Invitation.findById(invitation._id);
      console.log('Saved invitation:', JSON.stringify(savedInvitation, null, 2));
      console.log('Saved invitation targetEntity:', savedInvitation.targetEntity);
    });

    it('should get invitation by token', async () => {
      const response = await request(app)
        .get(`/api/invitations/token/${invitation.token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.invitation.id).toBe(invitation._id.toString());
      expect(response.body.data.invitation.invitedBy).toBeDefined();
      expect(response.body.data.invitation.targetEntity).toBeDefined();
    });

    it('should return 404 for invalid token', async () => {
      const fakeToken = 'invalid-token-12345';

      await request(app)
        .get(`/api/invitations/token/${fakeToken}`)
        .expect(404);
    });

    it('should return 400 for expired invitation', async () => {
      // Set invitation as expired
      invitation.expiresAt = new Date(Date.now() - 24 * 60 * 60 * 1000); // Yesterday
      await invitation.save();

      const response = await request(app)
        .get(`/api/invitations/token/${invitation.token}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('expired');
    });
  });

  describe('POST /api/invitations/token/:token/accept', () => {
    let authUser;
    let workspace;
    let invitation;
    let invitedUser;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
      invitedUser = await createAuthenticatedUser(app, { email: 'invited@test.com' });
      const userId = new mongoose.Types.ObjectId(authUser.user._id);
      
      // Create workspace with proper user roles
      workspace = await Workspace.create(createTestWorkspace(userId));
      
      // Add owner role to user for the workspace
      const user = await User.findById(userId);
      const userRoles = await user.getRoles();
      await userRoles.addWorkspaceRole(workspace._id, 'owner');
      
      invitation = await Invitation.create({
        type: 'workspace',
        invitedBy: userId,
        invitedUser: {
          email: 'invited@test.com',
          name: 'Invited User'
        },
        targetEntity: {
          type: 'Workspace',
          id: workspace._id,
          name: workspace.name
        },
        role: 'member',
        status: 'pending',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
    });

    it('should accept invitation', async () => {
      const response = await request(app)
        .post(`/api/invitations/token/${invitation.token}/accept`)
        .set(getAuthHeaders(invitedUser.token))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.invitation.status).toBe('accepted');
      expect(response.body.data.invitation.acceptedAt).toBeDefined();
    });

    it('should not accept already accepted invitation', async () => {
      // Accept invitation first
      invitation.status = 'accepted';
      invitation.acceptedAt = new Date();
      await invitation.save();

      await request(app)
        .post(`/api/invitations/token/${invitation.token}/accept`)
        .set(getAuthHeaders(invitedUser.token))
        .expect(400);
    });

    it('should not accept expired invitation', async () => {
      invitation.expiresAt = new Date(Date.now() - 24 * 60 * 60 * 1000); // Yesterday
      await invitation.save();

      await request(app)
        .post(`/api/invitations/token/${invitation.token}/accept`)
        .set(getAuthHeaders(invitedUser.token))
        .expect(400);
    });

    it('should not accept invitation with wrong user', async () => {
      const wrongUser = await createAuthenticatedUser(app, { email: 'wrong@test.com' });

      await request(app)
        .post(`/api/invitations/token/${invitation.token}/accept`)
        .set(getAuthHeaders(wrongUser.token))
        .expect(400);
    });
  });

  describe('POST /api/invitations/token/:token/decline', () => {
    let authUser;
    let workspace;
    let invitation;
    let invitedUser;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
      invitedUser = await createAuthenticatedUser(app, { email: 'invited@test.com' });
      const userId = new mongoose.Types.ObjectId(authUser.user._id);
      
      // Create workspace with proper user roles
      workspace = await Workspace.create(createTestWorkspace(userId));
      
      // Add owner role to user for the workspace
      const user = await User.findById(userId);
      const userRoles = await user.getRoles();
      await userRoles.addWorkspaceRole(workspace._id, 'owner');
      
      invitation = await Invitation.create({
        type: 'workspace',
        invitedBy: userId,
        invitedUser: {
          email: 'invited@test.com',
          name: 'Invited User'
        },
        targetEntity: {
          type: 'Workspace',
          id: workspace._id,
          name: workspace.name
        },
        role: 'member',
        status: 'pending',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
    });

    it('should decline invitation', async () => {
      const declineData = {
        reason: 'Not interested right now'
      };

      const response = await request(app)
        .post(`/api/invitations/token/${invitation.token}/decline`)
        .set(getAuthHeaders(invitedUser.token))
        .send(declineData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.invitation.status).toBe('declined');
      expect(response.body.data.invitation.declinedAt).toBeDefined();
    });

    it('should decline without reason', async () => {
      const response = await request(app)
        .post(`/api/invitations/token/${invitation.token}/decline`)
        .set(getAuthHeaders(invitedUser.token))
        .expect(200);

      expect(response.body.data.invitation.status).toBe('declined');
    });
  });

  describe('POST /api/invitations/:id/resend', () => {
    let authUser;
    let workspace;
    let invitation;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
      const userId = new mongoose.Types.ObjectId(authUser.user._id);
      
      // Create workspace with proper user roles
      workspace = await Workspace.create(createTestWorkspace(userId));
      
      // Add owner role to user for the workspace
      const user = await User.findById(userId);
      const userRoles = await user.getRoles();
      await userRoles.addWorkspaceRole(workspace._id, 'owner');
      
      invitation = await Invitation.create({
        type: 'workspace',
        invitedBy: userId,
        invitedUser: {
          email: 'resend@test.com',
          name: 'Resend User'
        },
        targetEntity: {
          type: 'Workspace',
          id: workspace._id,
          name: workspace.name
        },
        role: 'member',
        status: 'pending',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
    });

    it('should resend invitation', async () => {
      const response = await request(app)
        .post(`/api/invitations/${invitation._id}/resend`)
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.invitation.resentAt).toBeDefined();
      expect(response.body.data.invitation.resentCount).toBe(1);
    });

    it('should not resend accepted invitation', async () => {
      invitation.status = 'accepted';
      await invitation.save();

      await request(app)
        .post(`/api/invitations/${invitation._id}/resend`)
        .set(getAuthHeaders(authUser.token))
        .expect(400);
    });
  });

  describe('DELETE /api/invitations/:id', () => {
    let authUser;
    let workspace;
    let invitation;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
      const userId = new mongoose.Types.ObjectId(authUser.user._id);
      
      // Create workspace with proper user roles
      workspace = await Workspace.create(createTestWorkspace(userId));
      
      // Add owner role to user for the workspace
      const user = await User.findById(userId);
      const userRoles = await user.getRoles();
      await userRoles.addWorkspaceRole(workspace._id, 'owner');
      
      invitation = await Invitation.create({
        type: 'workspace',
        invitedBy: userId,
        invitedUser: {
          email: 'cancel@test.com',
          name: 'Cancel User'
        },
        targetEntity: {
          type: 'Workspace',
          id: workspace._id,
          name: workspace.name
        },
        role: 'member',
        status: 'pending',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
    });

    it('should cancel invitation', async () => {
      const response = await request(app)
        .delete(`/api/invitations/${invitation._id}`)
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify invitation is cancelled
      const cancelledInvitation = await Invitation.findById(invitation._id);
      expect(cancelledInvitation.status).toBe('cancelled');
    });

    it('should not cancel invitation by non-sender', async () => {
      const otherUser = await createAuthenticatedUser(app, { email: 'other@test.com' });

      await request(app)
        .delete(`/api/invitations/${invitation._id}`)
        .set(getAuthHeaders(otherUser.token))
        .expect(403);
    });
  });

  describe('GET /api/invitations/entity/:entityType/:entityId', () => {
    let authUser;
    let workspace;
    let invitations;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
      const userId = new mongoose.Types.ObjectId(authUser.user._id);
      
      // Create workspace with proper user roles
      workspace = await Workspace.create(createTestWorkspace(userId));
      
      // Add owner role to user for the workspace
      const user = await User.findById(userId);
      const userRoles = await user.getRoles();
      await userRoles.addWorkspaceRole(workspace._id, 'owner');

      invitations = await Promise.all([
        Invitation.create({
          type: 'workspace',
          invitedBy: userId,
          invitedUser: {
            email: 'entity1@test.com',
            name: 'Entity User 1'
          },
          targetEntity: {
            type: 'Workspace',
            id: workspace._id,
            name: workspace.name
          },
          role: 'member',
          status: 'pending',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }),
        Invitation.create({
          type: 'workspace',
          invitedBy: userId,
          invitedUser: {
            email: 'entity2@test.com',
            name: 'Entity User 2'
          },
          targetEntity: {
            type: 'Workspace',
            id: workspace._id,
            name: workspace.name
          },
          role: 'member',
          status: 'accepted',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        })
      ]);
    });

    it('should get invitations for entity', async () => {
      const response = await request(app)
        .get(`/api/invitations/entity/workspace/${workspace._id}`)
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.invitations).toHaveLength(2);
      expect(response.body.data.invitations.every(inv => 
        inv.targetEntity.id.toString() === workspace._id.toString()
      )).toBe(true);
    });

    it('should filter by status in entity invitations', async () => {
      const response = await request(app)
        .get(`/api/invitations/entity/workspace/${workspace._id}?status=pending`)
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.data.invitations).toHaveLength(1);
      expect(response.body.data.invitations[0].status).toBe('pending');
    });
  });
});
