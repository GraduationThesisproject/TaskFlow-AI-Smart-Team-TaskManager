const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const { setupTestDB, teardownTestDB, clearDatabase } = require('./helpers/testSetup');
const { createAuthenticatedUser, getAuthHeaders } = require('./helpers/authHelper');
const { createTestWorkspace, createTestProject, createTestSpace, createTestBoard } = require('./helpers/testData');
const Workspace = require('../models/Workspace');
const Project = require('../models/Project');
const Space = require('../models/Space');
const Board = require('../models/Board');
const Column = require('../models/Column');

describe('Board Endpoints', () => {
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

  describe('POST /api/boards', () => {
    let authUser;
    let workspace;
    let project;
    let space;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
      workspace = await Workspace.create(createTestWorkspace(authUser.user._id));
      project = await Project.create(createTestProject(authUser.user._id, workspace._id));
      space = await Space.create(createTestSpace(workspace._id));
    });

    it('should create a new board', async () => {
      const boardData = {
        name: 'Test Board',
        description: 'A test board',
        projectId: project._id,
        spaceId: space._id,
        type: 'kanban',
        visibility: 'private'
      };

      const response = await request(app)
        .post('/api/boards')
        .set(getAuthHeaders(authUser.token))
        .send(boardData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.board.name).toBe(boardData.name);
      expect(response.body.data.board.project.toString()).toBe(project._id.toString());
      expect(response.body.data.board.type).toBe('kanban');
      
      // Should create default columns
      expect(response.body.data.columns).toBeDefined();
      expect(response.body.data.columns).toHaveLength(3); // To Do, In Progress, Done
    });

    it('should not create board without name', async () => {
      const boardData = {
        projectId: project._id,
        spaceId: space._id
      };

      await request(app)
        .post('/api/boards')
        .set(getAuthHeaders(authUser.token))
        .send(boardData)
        .expect(400);
    });

    it('should not create board in project user is not member of', async () => {
      const otherUser = await createAuthenticatedUser(app, { email: 'other@test.com' });

      const boardData = {
        name: 'Test Board',
        projectId: project._id,
        spaceId: space._id
      };

      await request(app)
        .post('/api/boards')
        .set(getAuthHeaders(otherUser.token))
        .send(boardData)
        .expect(403);
    });
  });

  describe('GET /api/boards/project/:projectId', () => {
    let authUser;
    let workspace;
    let project;
    let space;
    let board;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
      workspace = await Workspace.create(createTestWorkspace(authUser.user._id));
      project = await Project.create(createTestProject(authUser.user._id, workspace._id));
      space = await Space.create(createTestSpace(workspace._id));
      board = await Board.create(createTestBoard(project._id, space._id));
    });

    it('should get project boards', async () => {
      const response = await request(app)
        .get(`/api/boards/project/${project._id}`)
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.boards).toHaveLength(1);
      expect(response.body.data.boards[0]._id.toString()).toBe(board._id.toString());
    });

    it('should not get boards from project user is not member of', async () => {
      const otherUser = await createAuthenticatedUser(app, { email: 'other@test.com' });

      await request(app)
        .get(`/api/boards/project/${project._id}`)
        .set(getAuthHeaders(otherUser.token))
        .expect(403);
    });
  });

  describe('GET /api/boards/:id', () => {
    let authUser;
    let workspace;
    let project;
    let space;
    let board;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
      workspace = await Workspace.create(createTestWorkspace(authUser.user._id));
      project = await Project.create(createTestProject(authUser.user._id, workspace._id));
      space = await Space.create(createTestSpace(workspace._id));
      board = await Board.create(createTestBoard(project._id, space._id));
    });

    it('should get board by id', async () => {
      const response = await request(app)
        .get(`/api/boards/${board._id}`)
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.board._id.toString()).toBe(board._id.toString());
      expect(response.body.data.columns).toBeDefined();
      expect(response.body.data.tasks).toBeDefined();
    });
  });

  describe('PUT /api/boards/:id', () => {
    let authUser;
    let workspace;
    let project;
    let space;
    let board;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
      workspace = await Workspace.create(createTestWorkspace(authUser.user._id));
      project = await Project.create(createTestProject(authUser.user._id, workspace._id));
      space = await Space.create(createTestSpace(workspace._id));
      board = await Board.create(createTestBoard(project._id, space._id));
    });

    it('should update board', async () => {
      const updateData = {
        name: 'Updated Board',
        description: 'Updated description',
        visibility: 'public'
      };

      const response = await request(app)
        .put(`/api/boards/${board._id}`)
        .set(getAuthHeaders(authUser.token))
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.board.name).toBe(updateData.name);
      expect(response.body.data.board.visibility).toBe(updateData.visibility);
    });
  });

  describe('POST /api/boards/:id/columns', () => {
    let authUser;
    let workspace;
    let project;
    let space;
    let board;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
      workspace = await Workspace.create(createTestWorkspace(authUser.user._id));
      project = await Project.create(createTestProject(authUser.user._id, workspace._id));
      space = await Space.create(createTestSpace(workspace._id));
      board = await Board.create(createTestBoard(project._id, space._id));
    });

    it('should add new column to board', async () => {
      const columnData = {
        name: 'Review',
        position: 2,
        color: '#FF5722'
      };

      const response = await request(app)
        .post(`/api/boards/${board._id}/columns`)
        .set(getAuthHeaders(authUser.token))
        .send(columnData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.column.name).toBe(columnData.name);
      expect(response.body.data.column.board.toString()).toBe(board._id.toString());
      expect(response.body.data.column.position).toBe(columnData.position);
    });

    it('should not add column without name', async () => {
      const columnData = {
        position: 2
      };

      await request(app)
        .post(`/api/boards/${board._id}/columns`)
        .set(getAuthHeaders(authUser.token))
        .send(columnData)
        .expect(400);
    });
  });

  describe('PUT /api/boards/:id/columns/:columnId', () => {
    let authUser;
    let workspace;
    let project;
    let space;
    let board;
    let column;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
      workspace = await Workspace.create(createTestWorkspace(authUser.user._id));
      project = await Project.create(createTestProject(authUser.user._id, workspace._id));
      space = await Space.create(createTestSpace(workspace._id));
      board = await Board.create(createTestBoard(project._id, space._id));
      column = await Column.create({
        name: 'Test Column',
        board: board._id,
        position: 0
      });
    });

    it('should update column', async () => {
      const updateData = {
        name: 'Updated Column',
        color: '#4CAF50'
      };

      const response = await request(app)
        .put(`/api/boards/${board._id}/columns/${column._id}`)
        .set(getAuthHeaders(authUser.token))
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.column.name).toBe(updateData.name);
      expect(response.body.data.column.color).toBe(updateData.color);
    });
  });

  describe('DELETE /api/boards/:id/columns/:columnId', () => {
    let authUser;
    let workspace;
    let project;
    let space;
    let board;
    let column;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
      workspace = await Workspace.create(createTestWorkspace(authUser.user._id));
      project = await Project.create(createTestProject(authUser.user._id, workspace._id));
      space = await Space.create(createTestSpace(workspace._id));
      board = await Board.create(createTestBoard(project._id, space._id));
      column = await Column.create({
        name: 'Test Column',
        board: board._id,
        position: 0
      });
    });

    it('should delete column', async () => {
      const response = await request(app)
        .delete(`/api/boards/${board._id}/columns/${column._id}`)
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.success).toBe(true);
      
      // Verify column is deleted
      const deletedColumn = await Column.findById(column._id);
      expect(deletedColumn).toBeNull();
    });

    it('should not delete default column', async () => {
      column.isDefault = true;
      await column.save();

      await request(app)
        .delete(`/api/boards/${board._id}/columns/${column._id}`)
        .set(getAuthHeaders(authUser.token))
        .expect(400);
    });
  });

  describe('DELETE /api/boards/:id', () => {
    let authUser;
    let workspace;
    let project;
    let space;
    let board;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
      workspace = await Workspace.create(createTestWorkspace(authUser.user._id));
      project = await Project.create(createTestProject(authUser.user._id, workspace._id));
      space = await Space.create(createTestSpace(workspace._id));
      board = await Board.create(createTestBoard(project._id, space._id));
    });

    it('should delete board', async () => {
      const response = await request(app)
        .delete(`/api/boards/${board._id}`)
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.success).toBe(true);
      
      // Verify board is deleted
      const deletedBoard = await Board.findById(board._id);
      expect(deletedBoard).toBeNull();
    });

    it('should not delete board without permission', async () => {
      const otherUser = await createAuthenticatedUser(app, { email: 'other@test.com' });

      await request(app)
        .delete(`/api/boards/${board._id}`)
        .set(getAuthHeaders(otherUser.token))
        .expect(403);
    });
  });
});
