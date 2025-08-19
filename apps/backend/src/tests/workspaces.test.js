const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const { setupTestDB, teardownTestDB, clearDatabase } = require('./helpers/testSetup');
const { createAuthenticatedUser, getAuthHeaders } = require('./helpers/authHelper');
const { createTestWorkspace } = require('./helpers/testData');
const Workspace = require('../models/Workspace');
const User = require('../models/User');

describe('Workspace Endpoints', () => {
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

  describe('POST /api/workspaces', () => {
    let authUser;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
    });

    it('should create a new workspace', async () => {
      const workspaceData = {
        name: 'Test Workspace',
        description: 'A test workspace',
        plan: 'free'
      };

      const response = await request(app)
        .post('/api/workspaces')
        .set(getAuthHeaders(authUser.token))
        .send(workspaceData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.workspace.name).toBe(workspaceData.name);
      expect(response.body.data.workspace.owner.toString()).toBe(authUser.user.id);
      expect(response.body.data.workspace.members).toHaveLength(0); // Owner is not in members array
    });

    it('should not create workspace without name', async () => {
      const workspaceData = {
        description: 'A test workspace'
      };

      const response = await request(app)
        .post('/api/workspaces')
        .set(getAuthHeaders(authUser.token))
        .send(workspaceData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Validation failed');
    });

    it('should not create workspace without authentication', async () => {
      const workspaceData = {
        name: 'Test Workspace'
      };

      await request(app)
        .post('/api/workspaces')
        .send(workspaceData)
        .expect(401);
    });
  });

  describe('GET /api/workspaces', () => {
    let authUser;
    let workspace;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
      workspace = await Workspace.create(createTestWorkspace(authUser.user.id));
      
      // Add user to workspace as owner
      const user = await User.findById(authUser.user.id);
      const userRoles = await user.getRoles();
      await userRoles.addWorkspaceRole(workspace._id, 'owner');
    });

    it('should get user workspaces', async () => {
      const response = await request(app)
        .get('/api/workspaces')
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.workspaces).toHaveLength(1);
      expect(response.body.data.workspaces[0]._id.toString()).toBe(workspace._id.toString());
    });

    it('should not get workspaces without authentication', async () => {
      await request(app)
        .get('/api/workspaces')
        .expect(401);
    });
  });

  describe('GET /api/workspaces/:id', () => {
    let authUser;
    let workspace;
    let otherUser;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
      otherUser = await createAuthenticatedUser(app, { email: 'other@test.com' });
      workspace = await Workspace.create(createTestWorkspace(authUser.user.id));
      
      // Add user to workspace as owner
      const user = await User.findById(authUser.user.id);
      const userRoles = await user.getRoles();
      await userRoles.addWorkspaceRole(workspace._id, 'owner');
    });

    it('should get workspace by id for member', async () => {
      const response = await request(app)
        .get(`/api/workspaces/${workspace._id}`)
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.workspace._id.toString()).toBe(workspace._id.toString());
    });

    it('should not get workspace by id for non-member', async () => {
      const response = await request(app)
        .get(`/api/workspaces/${workspace._id}`)
        .set(getAuthHeaders(otherUser.token))
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent workspace', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      await request(app)
        .get(`/api/workspaces/${fakeId}`)
        .set(getAuthHeaders(authUser.token))
        .expect(404);
    });
  });

  describe('PUT /api/workspaces/:id', () => {
    let authUser;
    let workspace;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
      workspace = await Workspace.create(createTestWorkspace(authUser.user.id));
      
      // Add user to workspace as owner
      const user = await User.findById(authUser.user.id);
      const userRoles = await user.getRoles();
      await userRoles.addWorkspaceRole(workspace._id, 'owner');
    });

    it('should update workspace', async () => {
      const updateData = {
        name: 'Updated Workspace',
        description: 'Updated description'
      };

      const response = await request(app)
        .put(`/api/workspaces/${workspace._id}`)
        .set(getAuthHeaders(authUser.token))
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.workspace.name).toBe(updateData.name);
      expect(response.body.data.workspace.description).toBe(updateData.description);
    });

    it('should not update workspace as non-admin member', async () => {
      const memberUser = await createAuthenticatedUser(app, { email: 'member@test.com' });
      
      // Add as member (not admin)
      const memberUserModel = await User.findById(memberUser.user.id);
      const memberUserRoles = await memberUserModel.getRoles();
      await memberUserRoles.addWorkspaceRole(workspace._id, 'member');

      const updateData = {
        name: 'Updated Workspace'
      };

      await request(app)
        .put(`/api/workspaces/${workspace._id}`)
        .set(getAuthHeaders(memberUser.token))
        .send(updateData)
        .expect(403);
    });
  });

  describe('POST /api/workspaces/:id/invite', () => {
    let authUser;
    let workspace;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
      workspace = await Workspace.create(createTestWorkspace(authUser.user.id));
      
      // Add user to workspace as owner
      const user = await User.findById(authUser.user.id);
      const userRoles = await user.getRoles();
      await userRoles.addWorkspaceRole(workspace._id, 'owner');
    });

    it('should invite user to workspace', async () => {
      const inviteData = {
        email: 'newuser@test.com',
        role: 'member',
        message: 'Join our workspace!'
      };

      const response = await request(app)
        .post(`/api/workspaces/${workspace._id}/invite`)
        .set(getAuthHeaders(authUser.token))
        .send(inviteData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.invitation.email).toBe(inviteData.email);
      expect(response.body.data.invitation.role).toBe(inviteData.role);
    });

    it('should not invite with invalid email', async () => {
      const inviteData = {
        email: 'invalid-email',
        role: 'member'
      };

      await request(app)
        .post(`/api/workspaces/${workspace._id}/invite`)
        .set(getAuthHeaders(authUser.token))
        .send(inviteData)
        .expect(400);
    });
  });

  describe('GET /api/workspaces/:id/members', () => {
    let authUser;
    let workspace;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
      workspace = await Workspace.create(createTestWorkspace(authUser.user.id));
      
      // Add user to workspace as owner
      const user = await User.findById(authUser.user.id);
      const userRoles = await user.getRoles();
      await userRoles.addWorkspaceRole(workspace._id, 'owner');
    });

    it('should get workspace members', async () => {
      const response = await request(app)
        .get(`/api/workspaces/${workspace._id}/members`)
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.members).toHaveLength(1);
      expect(response.body.data.members[0].role).toBe('owner');
    });
  });

  describe('DELETE /api/workspaces/:id/members/:memberId', () => {
    let authUser;
    let workspace;
    let memberUser;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
      memberUser = await createAuthenticatedUser(app, { email: 'member@test.com' });
      
      workspace = await Workspace.create(createTestWorkspace(authUser.user.id));
      
      // Add owner to workspace
      const user = await User.findById(authUser.user.id);
      const userRoles = await user.getRoles();
      await userRoles.addWorkspaceRole(workspace._id, 'owner');
      
      // Add member to workspace
      const memberUserModel = await User.findById(memberUser.user.id);
      const memberUserRoles = await memberUserModel.getRoles();
      await memberUserRoles.addWorkspaceRole(workspace._id, 'member');
    });

    it('should remove member from workspace', async () => {
      const response = await request(app)
        .delete(`/api/workspaces/${workspace._id}/members/${memberUser.user.id}`)
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.success).toBe(true);
      
      // Verify member was removed
      const memberUserModel = await User.findById(memberUser.user.id);
      const memberUserRoles = await memberUserModel.getRoles();
      const hasRole = memberUserRoles.hasWorkspaceRole(workspace._id);
      expect(hasRole).toBe(false);
    });

    it('should not remove member without admin permission', async () => {
      await request(app)
        .delete(`/api/workspaces/${workspace._id}/members/${memberUser.user.id}`)
        .set(getAuthHeaders(memberUser.token))
        .expect(403);
    });
  });
});
