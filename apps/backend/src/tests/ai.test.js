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
  createTestTask 
} = require('./helpers/testData');
const Workspace = require('../models/Workspace');
const Project = require('../models/Project');
const Board = require('../models/Board');
const Column = require('../models/Column');
const Task = require('../models/Task');

describe('AI Endpoints', () => {
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

  describe('POST /api/ai/suggestions', () => {
    let authUser;
    let workspace;
    let project;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
      const userId = new mongoose.Types.ObjectId(authUser.user._id);
      workspace = await Workspace.create(createTestWorkspace(userId));
      project = await Project.create(createTestProject(userId, workspace._id));
    });

    it('should generate task suggestions', async () => {
      const requestData = {
        projectGoal: 'Build a mobile app for task management',
        projectContext: 'React Native app with backend API',
        boardType: 'kanban',
        teamSize: 5,
        timeframe: '3 months'
      };

      const response = await request(app)
        .post('/api/ai/suggestions')
        .set(getAuthHeaders(authUser.token))
        .send(requestData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.suggestions).toBeDefined();
    });

    it('should not generate suggestions without project goal', async () => {
      const requestData = {
        boardType: 'kanban'
      };

      await request(app)
        .post('/api/ai/suggestions')
        .set(getAuthHeaders(authUser.token))
        .send(requestData)
        .expect(400);
    });
  });

  describe('POST /api/ai/parse', () => {
    let authUser;
    let workspace;
    let project;
    let board;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
      const userId = new mongoose.Types.ObjectId(authUser.user._id);
      workspace = await Workspace.create(createTestWorkspace(userId));
      project = await Project.create(createTestProject(userId, workspace._id));
      board = await Board.create(createTestBoard(project._id, workspace._id));
    });

    it('should parse natural language task input', async () => {
      const requestData = {
        input: 'Create a login page with email and password fields, due next Friday',
        boardId: board._id
      };

      const response = await request(app)
        .post('/api/ai/parse')
        .set(getAuthHeaders(authUser.token))
        .send(requestData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.parsedTask).toBeDefined();
    });

    it('should not parse without input', async () => {
      const requestData = {
        boardId: board._id
      };

      await request(app)
        .post('/api/ai/parse')
        .set(getAuthHeaders(authUser.token))
        .send(requestData)
        .expect(400);
    });
  });

  describe('GET /api/ai/risks/project/:projectId', () => {
    let authUser;
    let workspace;
    let project;
    let board;
    let column;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
      const userId = new mongoose.Types.ObjectId(authUser.user._id);
      workspace = await Workspace.create(createTestWorkspace(userId));
      project = await Project.create(createTestProject(userId, workspace._id));
      board = await Board.create(createTestBoard(project._id, workspace._id));
      column = await Column.create(createTestColumn(board._id));

      // Create tasks with various risk indicators
      await Promise.all([
        (async ()=>{ const t = createTestTask(board._id, column._id, userId, {
          title: 'Overdue critical task',
          priority: 'critical',
          dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          status: 'in_progress'
        }); t.project = project._id; await Task.create(t); })(),
        (async ()=>{ const t = createTestTask(board._id, column._id, userId, {
          title: 'Complex integration task',
          description: 'This task involves multiple systems and has high complexity',
          priority: 'high',
          estimatedHours: 40
        }); t.project = project._id; await Task.create(t); })(),
        (async ()=>{ const t = createTestTask(board._id, column._id, userId, {
          title: 'Blocked task',
          status: 'todo',
          priority: 'high'
        }); t.project = project._id; await Task.create(t); })()
      ]);
    });

    it('should analyze project risks', async () => {
      const response = await request(app)
        .get(`/api/ai/risks/project/${project._id}`)
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.analysis).toBeDefined();
      expect(response.body.data.analysis.risks).toBeInstanceOf(Array);
    });
  });

  describe('POST /api/ai/timeline/:projectId', () => {
    let authUser;
    let workspace;
    let project;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
      const userId = new mongoose.Types.ObjectId(authUser.user._id);
      workspace = await Workspace.create(createTestWorkspace(userId));
      project = await Project.create(createTestProject(userId, workspace._id));
    });

    it('should generate AI timeline', async () => {
      const timelineData = {
        startDate: new Date(),
        constraints: ['3 developers', 'Q1 deadline'],
        priorities: ['user authentication', 'core features']
      };

      const response = await request(app)
        .post(`/api/ai/timeline/${project._id}`)
        .set(getAuthHeaders(authUser.token))
        .send(timelineData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.timeline).toBeDefined();
    });
  });

  describe('GET /api/ai/recommendations/:projectId', () => {
    let authUser;
    let workspace;
    let project;
    let board;
    let column;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
      const userId = new mongoose.Types.ObjectId(authUser.user._id);
      workspace = await Workspace.create(createTestWorkspace(userId));
      project = await Project.create(createTestProject(userId, workspace._id));
      board = await Board.create(createTestBoard(project._id, workspace._id));
      column = await Column.create(createTestColumn(board._id));

      // Create tasks with patterns that AI can learn from
      await Promise.all([
        (async ()=>{ const t = createTestTask(board._id, column._id, userId, {
          title: 'API endpoint for user management',
          priority: 'high',
          estimatedHours: 8
        }); t.project = project._id; await Task.create(t); })(),
        (async ()=>{ const t = createTestTask(board._id, column._id, userId, {
          title: 'Frontend component for user profile',
          priority: 'medium',
          estimatedHours: 4
        }); t.project = project._id; await Task.create(t); })()
      ]);
    });

    it('should get smart recommendations', async () => {
      const response = await request(app)
        .get(`/api/ai/recommendations/${project._id}`)
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.recommendations).toBeDefined();
    });
  });

  describe('GET /api/ai/performance/:projectId', () => {
    let authUser;
    let workspace;
    let project;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
      const userId = new mongoose.Types.ObjectId(authUser.user._id);
      workspace = await Workspace.create(createTestWorkspace(userId));
      project = await Project.create(createTestProject(userId, workspace._id));

      // Add team members
      const member1 = await createAuthenticatedUser(app, { email: 'member1@test.com' });
      const member2 = await createAuthenticatedUser(app, { email: 'member2@test.com' });
      
      project.team.push(
        { user: member1.user.id, role: 'contributor' },
        { user: member2.user.id, role: 'contributor' }
      );
      await project.save();
    });

    it('should analyze team performance', async () => {
      const response = await request(app)
        .get(`/api/ai/performance/${project._id}`)
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.analysis).toBeDefined();
    });
  });
});
