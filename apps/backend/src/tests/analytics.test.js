const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const { setupTestDB, teardownTestDB, clearDatabase } = require('./helpers/testSetup');
const { createAuthenticatedUser, getAuthHeaders } = require('./helpers/authHelper');
const { 
  createTestWorkspace, 
  createTestProject, 
  createTestBoard, 
  createTestColumn, 
  createTestTask,
  createWorkspaceWithRoles,
  createProjectWithRoles
} = require('./helpers/testData');
const Workspace = require('../models/Workspace');
const Project = require('../models/Project');
const Board = require('../models/Board');
const Column = require('../models/Column');
const Task = require('../models/Task');
const Analytics = require('../models/Analytics');

describe('Analytics Endpoints', () => {
  let server;

  beforeAll(async () => {
    await setupTestDB();
    server = app.listen();
  });

  afterAll(async () => {
    await teardownTestDB();
    if (server) server.close();
  });

  describe('GET /api/analytics/project/:projectId', () => {
    let authUser;
    let workspace;
    let project;
    let board;
    let column;
    let tasks;

    beforeEach(async () => {
      await clearDatabase();
      authUser = await createAuthenticatedUser(app);
      workspace = await createWorkspaceWithRoles(authUser.user._id);
      project = await createProjectWithRoles(authUser.user._id, workspace._id);
      board = await Board.create(createTestBoard(project._id, workspace._id));
      column = await Column.create(createTestColumn(board._id));

      // Create sample tasks with different statuses
      tasks = await Promise.all([
        Task.create(createTestTask(board._id, column._id, authUser.user._id, {
          project: project._id,
          status: 'done',
          priority: 'high',
          completedAt: new Date()
        })),
        Task.create(createTestTask(board._id, column._id, authUser.user._id, {
          project: project._id,
          status: 'in_progress',
          priority: 'medium'
        })),
        Task.create(createTestTask(board._id, column._id, authUser.user._id, {
          project: project._id,
          status: 'todo',
          priority: 'low',
          dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000) // Overdue
        }))
      ]);
    });

    it('should get project analytics', async () => {
      const response = await request(app)
        .get(`/api/analytics/project/${project._id}`)
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.analytics).toBeDefined();
      expect(response.body.data.analytics.totalTasks).toBe(3);
      expect(response.body.data.analytics.completedTasks).toBe(1);
      expect(response.body.data.analytics.inProgressTasks).toBe(1);
      expect(response.body.data.analytics.overdueTasks).toBe(1);
      expect(response.body.data.analytics.completionRate).toBeCloseTo(33.33, 1);
    });

    it('should get analytics with date range', async () => {
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
      const endDate = new Date();

      const response = await request(app)
        .get(`/api/analytics/project/${project._id}?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`)
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.data.analytics.period.startDate).toBeDefined();
      expect(response.body.data.analytics.period.endDate).toBeDefined();
    });

    it('should get analytics by priority breakdown', async () => {
      const response = await request(app)
        .get(`/api/analytics/project/${project._id}`)
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.data.analytics.byPriority).toBeDefined();
      expect(response.body.data.analytics.byPriority.high).toBe(1);
      expect(response.body.data.analytics.byPriority.medium).toBe(1);
      expect(response.body.data.analytics.byPriority.low).toBe(1);
    });

    it('should not get analytics without project access', async () => {
      const otherUser = await createAuthenticatedUser(app, { email: 'other@test.com' });

      await request(app)
        .get(`/api/analytics/project/${project._id}`)
        .set(getAuthHeaders(otherUser.token))
        .expect(403);
    });
  });

  describe('POST /api/analytics/project/:projectId/generate', () => {
    let authUser;
    let workspace;
    let project;

    beforeEach(async () => {
      await clearDatabase();
      authUser = await createAuthenticatedUser(app);
      workspace = await createWorkspaceWithRoles(authUser.user._id);
      project = await createProjectWithRoles(authUser.user._id, workspace._id);
    });

    it('should generate project analytics', async () => {
      const analyticsData = {
        periodType: 'monthly',
        includeAI: true
      };

      const response = await request(app)
        .post(`/api/analytics/project/${project._id}/generate`)
        .set(getAuthHeaders(authUser.token))
        .send(analyticsData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.analytics.project.toString()).toBe(project._id.toString());
      expect(response.body.data.analytics.period.type).toBe('monthly');
      expect(response.body.data.analytics.isCalculated).toBe(true);
    });

    it('should generate custom period analytics', async () => {
      const analyticsData = {
        periodType: 'custom',
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date()
      };

      const response = await request(app)
        .post(`/api/analytics/project/${project._id}/generate`)
        .set(getAuthHeaders(authUser.token))
        .send(analyticsData)
        .expect(201);

      expect(response.body.data.analytics.period.type).toBe('custom');
      expect(response.body.data.analytics.period.startDate).toBeDefined();
      expect(response.body.data.analytics.period.endDate).toBeDefined();
    });
  });

  describe('GET /api/analytics/project/:projectId/export', () => {
    let authUser;
    let workspace;
    let project;

    beforeEach(async () => {
      await clearDatabase();
      authUser = await createAuthenticatedUser(app);
      workspace = await createWorkspaceWithRoles(authUser.user._id);
      project = await createProjectWithRoles(authUser.user._id, workspace._id);

      // Create analytics data
      await Analytics.create({
        project: project._id,
        period: {
          type: 'monthly',
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          endDate: new Date()
        },
        data: {
          totalTasks: 10,
          completedTasks: 7,
          activeTasks: 3
        },
        isCalculated: true
      });
    });

    it('should export analytics as CSV', async () => {
      const response = await request(app)
        .get(`/api/analytics/project/${project._id}/export?format=csv`)
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(response.text).toContain('totalTasks,completedTasks');
    });

    it('should export analytics as JSON', async () => {
      const response = await request(app)
        .get(`/api/analytics/project/${project._id}/export?format=json`)
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.headers['content-type']).toContain('application/json');
      expect(response.body.data.analytics).toBeDefined();
      expect(response.body.data.analytics.totalTasks).toBe(0);
    });
  });

  describe('GET /api/analytics/workspace/:workspaceId', () => {
    let authUser;
    let workspace;
    let project;

    beforeEach(async () => {
      await clearDatabase();
      authUser = await createAuthenticatedUser(app);
      workspace = await createWorkspaceWithRoles(authUser.user._id);
      project = await createProjectWithRoles(authUser.user._id, workspace._id);
    });

    it('should get workspace analytics', async () => {
      const response = await request(app)
        .get(`/api/analytics/workspace/${workspace._id}`)
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.analytics).toBeDefined();
      expect(response.body.data.analytics.totalProjects).toBeDefined();
      expect(response.body.data.analytics.activeMembers).toBeDefined();
      expect(response.body.data.analytics.totalTasks).toBeDefined();
    });

    it('should not get workspace analytics without membership', async () => {
      const otherUser = await createAuthenticatedUser(app, { email: 'other@test.com' });

      await request(app)
        .get(`/api/analytics/workspace/${workspace._id}`)
        .set(getAuthHeaders(otherUser.token))
        .expect(403);
    });
  });

  describe('GET /api/analytics/project/:projectId/team-performance', () => {
    let authUser;
    let workspace;
    let project;
    let memberUser;

    beforeEach(async () => {
      await clearDatabase();
      authUser = await createAuthenticatedUser(app);
      memberUser = await createAuthenticatedUser(app, { email: 'member@test.com' });
      workspace = await createWorkspaceWithRoles(authUser.user._id);
      project = await createProjectWithRoles(authUser.user._id, workspace._id);

      // Add member to project
      project.team.push({ user: memberUser.user._id, role: 'contributor' });
      await project.save();

      // Create tasks assigned to different users
      const board = await Board.create(createTestBoard(project._id, workspace._id));
      const column = await Column.create(createTestColumn(board._id));

      await Promise.all([
        Task.create(createTestTask(board._id, column._id, authUser.user._id, {
          assignees: [authUser.user._id],
          status: 'done',
          project: project._id,
          reporter: authUser.user._id
        })),
        Task.create(createTestTask(board._id, column._id, authUser.user._id, {
          assignees: [memberUser.user._id],
          status: 'in_progress',
          project: project._id,
          reporter: authUser.user._id
        }))
      ]);
    });

    it('should get team performance analytics', async () => {
      const response = await request(app)
        .get(`/api/analytics/project/${project._id}/team-performance`)
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.teamPerformance).toBeDefined();
      expect(response.body.data.teamPerformance.members).toHaveLength(2);
      expect(response.body.data.teamPerformance.averageCompletionTime).toBeDefined();
      expect(response.body.data.teamPerformance.productivityTrends).toBeDefined();
    });

    it('should filter team performance by date range', async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = new Date();

      const response = await request(app)
        .get(`/api/analytics/project/${project._id}/team-performance?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`)
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.data.teamPerformance.period).toBeDefined();
      expect(response.body.data.teamPerformance.period.startDate).toBeDefined();
      expect(response.body.data.teamPerformance.period.endDate).toBeDefined();
    });
  });
});
