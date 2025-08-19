const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const { setupTestDB, teardownTestDB, clearDatabase } = require('./helpers/testSetup');
const { createAuthenticatedUser, getAuthHeaders } = require('./helpers/authHelper');
const { createTestWorkspace, createTestProject, createTestTag, createWorkspaceWithRoles, createProjectWithRoles } = require('./helpers/testData');
const Workspace = require('../models/Workspace');
const Project = require('../models/Project');
const Tag = require('../models/Tag');

describe('Tag Endpoints', () => {
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

  describe('POST /api/tags/project/:projectId', () => {
    let authUser;
    let workspace;
    let project;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
      workspace = await createWorkspaceWithRoles(authUser.user.id);
      project = await createProjectWithRoles(authUser.user.id, workspace._id);
    });

    it('should create a new project tag', async () => {
      const tagData = {
        name: 'Frontend',
        color: '#2196F3',
        description: 'Frontend related tasks'
      };

      const response = await request(app)
        .post(`/api/tags/project/${project._id}`)
        .set(getAuthHeaders(authUser.token))
        .send(tagData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tag.name).toBe(tagData.name);
      expect(response.body.data.tag.color).toBe(tagData.color);
      expect(response.body.data.tag.project.toString()).toBe(project._id.toString());
      expect(response.body.data.tag.scope).toBe('project');
      expect(response.body.data.tag.createdBy.toString()).toBe(authUser.user.id);
    });

    it('should not create tag with duplicate name in same project', async () => {
      const tagData = {
        name: 'Frontend',
        color: '#2196F3'
      };

      // Create first tag
      await request(app)
        .post(`/api/tags/project/${project._id}`)
        .set(getAuthHeaders(authUser.token))
        .send(tagData)
        .expect(201);

      // Try to create duplicate
      await request(app)
        .post(`/api/tags/project/${project._id}`)
        .set(getAuthHeaders(authUser.token))
        .send(tagData)
        .expect(400);
    });

    it('should not create tag without name', async () => {
      const tagData = {
        color: '#2196F3'
      };

      await request(app)
        .post(`/api/tags/project/${project._id}`)
        .set(getAuthHeaders(authUser.token))
        .send(tagData)
        .expect(400);
    });

    it('should not create tag in project user is not member of', async () => {
      const otherUser = await createAuthenticatedUser(app, { email: 'other@test.com' });

      const tagData = {
        name: 'Frontend',
        color: '#2196F3'
      };

      await request(app)
        .post(`/api/tags/project/${project._id}`)
        .set(getAuthHeaders(otherUser.token))
        .send(tagData)
        .expect(403);
    });
  });

  describe('GET /api/tags/project/:projectId', () => {
    let authUser;
    let workspace;
    let project;
    let tags;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
      workspace = await createWorkspaceWithRoles(authUser.user.id);
      project = await createProjectWithRoles(authUser.user.id, workspace._id);

      tags = await Promise.all([
        Tag.create({ ...createTestTag(project._id, {
          name: 'Frontend',
          color: '#2196F3',
          category: 'development'
        }), createdBy: authUser.user.id }),
        Tag.create({ ...createTestTag(project._id, {
          name: 'Backend',
          color: '#4CAF50',
          category: 'development'
        }), createdBy: authUser.user.id }),
        Tag.create({ ...createTestTag(project._id, {
          name: 'Bug',
          color: '#F44336',
          category: 'priority'
        }), createdBy: authUser.user.id })
      ]);
    });

    it('should get project tags', async () => {
      const response = await request(app)
        .get(`/api/tags/project/${project._id}`)
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tags).toHaveLength(3);
      expect(response.body.data.tags[0].project.toString()).toBe(project._id.toString());
    });

    it('should filter tags by category', async () => {
      const response = await request(app)
        .get(`/api/tags/project/${project._id}?category=development`)
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.data.tags).toHaveLength(2);
      expect(response.body.data.tags.every(tag => tag.category === 'development')).toBe(true);
    });

    it('should search tags by name', async () => {
      const response = await request(app)
        .get(`/api/tags/project/${project._id}?search=front`)
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.data.tags).toHaveLength(1);
      expect(response.body.data.tags[0].name).toContain('Frontend');
    });

    it('should not get tags from project user is not member of', async () => {
      const otherUser = await createAuthenticatedUser(app, { email: 'other@test.com' });

      await request(app)
        .get(`/api/tags/project/${project._id}`)
        .set(getAuthHeaders(otherUser.token))
        .expect(403);
    });
  });

  describe('GET /api/tags/project/:projectId/usage', () => {
    let authUser;
    let workspace;
    let project;
    let tag;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
      workspace = await createWorkspaceWithRoles(authUser.user.id);
      project = await createProjectWithRoles(authUser.user.id, workspace._id);
      
      tag = await Tag.create({
        ...createTestTag(project._id, {
          name: 'Frontend',
          stats: {
            totalUsage: 5,
            recentUsage: 3,
            popularityScore: 0.8
          }
        }),
        createdBy: authUser.user.id,
        scope: 'project'
      });

      // Create a task with the tag to make it appear in usage statistics
      const Task = require('../models/Task');
      const Board = require('../models/Board');
      const Column = require('../models/Column');
      const Space = require('../models/Space');
      
      const space = await Space.create({
        name: 'Test Space',
        workspace: workspace._id
      });
      
      const board = await Board.create({
        name: 'Test Board',
        project: project._id,
        space: space._id,
        type: 'kanban'
      });
      
      const column = await Column.create({
        name: 'Todo',
        board: board._id,
        position: 0
      });
      
      await Task.create({
        title: 'Test Task',
        board: board._id,
        column: column._id,
        project: project._id,
        reporter: authUser.user.id,
        tags: [tag.name]
      });
    });

    it('should get tag usage statistics', async () => {
      const response = await request(app)
        .get(`/api/tags/project/${project._id}/usage`)
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.usage).toBeDefined();
      expect(response.body.data.usage.totalTags).toBe(1);
      expect(response.body.data.usage.mostUsed).toBeDefined();
      expect(response.body.data.usage.tagDistribution).toBeDefined();
    });
  });

  describe('PUT /api/tags/:id', () => {
    let authUser;
    let workspace;
    let project;
    let tag;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
      workspace = await createWorkspaceWithRoles(authUser.user.id);
      project = await createProjectWithRoles(authUser.user.id, workspace._id);
      tag = await Tag.create({ ...createTestTag(project._id), createdBy: authUser.user.id, scope: 'project' });
    });

    it('should update tag', async () => {
      const updateData = {
        name: 'Updated Frontend',
        color: '#FF9800',
        description: 'Updated description',
        category: 'ui'
      };

      const response = await request(app)
        .put(`/api/tags/${tag._id}`)
        .set(getAuthHeaders(authUser.token))
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tag.name).toBe(updateData.name);
      expect(response.body.data.tag.color).toBe(updateData.color);
      expect(response.body.data.tag.description).toBe(updateData.description);
      expect(response.body.data.tag.category).toBe(updateData.category);
    });

    it('should not update tag to duplicate name', async () => {
      const existingTag = await Tag.create({ ...createTestTag(project._id, { name: 'Existing' }), createdBy: authUser.user.id, scope: 'project' });

      const updateData = {
        name: 'Existing'
      };

      await request(app)
        .put(`/api/tags/${tag._id}`)
        .set(getAuthHeaders(authUser.token))
        .send(updateData)
        .expect(400);
    });

    it('should not update tag without permission', async () => {
      const otherUser = await createAuthenticatedUser(app, { email: 'other@test.com' });

      const updateData = {
        name: 'Hacked Tag'
      };

      await request(app)
        .put(`/api/tags/${tag._id}`)
        .set(getAuthHeaders(otherUser.token))
        .send(updateData)
        .expect(403);
    });
  });

  describe('DELETE /api/tags/:id', () => {
    let authUser;
    let workspace;
    let project;
    let tag;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
      workspace = await createWorkspaceWithRoles(authUser.user.id);
      project = await createProjectWithRoles(authUser.user.id, workspace._id);
      tag = await Tag.create({ ...createTestTag(project._id), createdBy: authUser.user.id, scope: 'project' });
    });

    it('should delete tag', async () => {
      const response = await request(app)
        .delete(`/api/tags/${tag._id}`)
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify tag is deleted
      const deletedTag = await Tag.findById(tag._id);
      expect(deletedTag).toBeNull();
    });

    it('should not delete tag without permission', async () => {
      const otherUser = await createAuthenticatedUser(app, { email: 'other@test.com' });

      await request(app)
        .delete(`/api/tags/${tag._id}`)
        .set(getAuthHeaders(otherUser.token))
        .expect(403);
    });

    it('should not delete tag that is in use', async () => {
      // Create a task that uses this tag to make it "in use"
      const Task = require('../models/Task');
      const Board = require('../models/Board');
      const Column = require('../models/Column');
      const Space = require('../models/Space');
      
      const space = await Space.create({
        name: 'Test Space',
        workspace: workspace._id
      });
      
      const board = await Board.create({
        name: 'Test Board',
        project: project._id,
        space: space._id,
        type: 'kanban'
      });
      
      const column = await Column.create({
        name: 'Todo',
        board: board._id,
        position: 0
      });
      
      await Task.create({
        title: 'Test Task',
        board: board._id,
        column: column._id,
        project: project._id,
        reporter: authUser.user.id,
        tags: [tag.name]
      });

      const response = await request(app)
        .delete(`/api/tags/${tag._id}`)
        .set(getAuthHeaders(authUser.token))
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('in use');
    });
  });

  describe('GET /api/tags', () => {
    let authUser;
    let workspace;
    let project;
    let tags;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
      workspace = await createWorkspaceWithRoles(authUser.user.id);
      project = await createProjectWithRoles(authUser.user.id, workspace._id);

      tags = await Promise.all([
        Tag.create({ ...createTestTag(project._id, { name: 'Frontend' }), createdBy: authUser.user.id, scope: 'project' }),
        Tag.create({ ...createTestTag(project._id, { name: 'Backend' }), createdBy: authUser.user.id, scope: 'project' }),
        Tag.create({ ...createTestTag(project._id, { name: 'Bug' }), createdBy: authUser.user.id, scope: 'project' })
      ]);
    });

    it('should get all accessible tags', async () => {
      const response = await request(app)
        .get('/api/tags')
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tags).toHaveLength(3);
    });

    it('should search tags across projects', async () => {
      const response = await request(app)
        .get('/api/tags?search=front')
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.data.tags).toHaveLength(1);
      expect(response.body.data.tags[0].name).toBe('Frontend');
    });

    it('should filter by scope', async () => {
      const response = await request(app)
        .get('/api/tags?scope=project')
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.data.tags).toHaveLength(3);
      expect(response.body.data.tags.every(tag => tag.scope === 'project')).toBe(true);
    });
  });

  describe('POST /api/tags/bulk-create', () => {
    let authUser;
    let workspace;
    let project;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
      workspace = await createWorkspaceWithRoles(authUser.user.id);
      project = await createProjectWithRoles(authUser.user.id, workspace._id);
    });

    it('should create multiple tags', async () => {
      const bulkData = {
        projectId: project._id,
        tags: [
          { name: 'Frontend', color: '#2196F3', category: 'development' },
          { name: 'Backend', color: '#4CAF50', category: 'development' },
          { name: 'Testing', color: '#FF9800', category: 'quality' }
        ]
      };

      const response = await request(app)
        .post('/api/tags/bulk-create')
        .set(getAuthHeaders(authUser.token))
        .send(bulkData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tags).toHaveLength(3);
      expect(response.body.data.created).toBe(3);
      expect(response.body.data.skipped).toBe(0);
    });

    it('should skip duplicate names', async () => {
      // Create existing tag
      await Tag.create({ ...createTestTag(project._id, { name: 'Frontend' }), createdBy: authUser.user.id, scope: 'project' });

      const bulkData = {
        projectId: project._id,
        tags: [
          { name: 'Frontend', color: '#2196F3' }, // Duplicate
          { name: 'Backend', color: '#4CAF50' }   // New
        ]
      };

      const response = await request(app)
        .post('/api/tags/bulk-create')
        .set(getAuthHeaders(authUser.token))
        .send(bulkData)
        .expect(201);

      expect(response.body.data.created).toBe(1);
      expect(response.body.data.skipped).toBe(1);
    });
  });
});
