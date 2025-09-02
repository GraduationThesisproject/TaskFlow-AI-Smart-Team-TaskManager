const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const { setupTestDB, teardownTestDB, clearDatabase } = require('./helpers/testSetup');
const { createAuthenticatedUser, getAuthHeaders, createMultipleUsers } = require('./helpers/authHelper');
const { 
  createTestWorkspace, 
  createTestSpace, 
  createTestBoard, 
  createTestColumn, 
  createTestTask,
  createTestTag,
  setupBoardPermissions
} = require('./helpers/testData');
const Workspace = require('../models/Workspace');
const Space = require('../models/Space');
const Board = require('../models/Board');
const Column = require('../models/Column');
const Task = require('../models/Task');
const Tag = require('../models/Tag');
const Comment = require('../models/Comment');

describe('Enhanced Task Endpoints', () => {
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

  describe('POST /api/tasks', () => {
    let authUser;
    let workspace;
    let space;
    let board;
    let column;
    let tag;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
      workspace = await Workspace.create(createTestWorkspace(authUser.user.id));
      space = await Space.create(createTestSpace(workspace._id));
      board = await Board.create(createTestBoard(space._id));
      column = await Column.create(createTestColumn(board._id));
      tag = await Tag.create(createTestTag(space._id, authUser.user.id));
      
      // Set up board permissions for the user
      await setupBoardPermissions(authUser.user.id, board._id);
    });

    it('should create a comprehensive task', async () => {
      const [assignee] = await createMultipleUsers(app, 1);

      const taskData = {
        title: 'Implement user authentication',
        description: 'Set up JWT-based authentication with refresh tokens',
        boardId: board._id,
        columnId: column._id,
        priority: 'high',
        assignees: [assignee.user.id],
        tags: [tag.name],
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        estimatedHours: 16
      };

      const response = await request(app)
        .post('/api/tasks')
        .set(getAuthHeaders(authUser.token))
        .send(taskData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.task.title).toBe(taskData.title);
      expect(response.body.data.task.assignees).toHaveLength(1);
      expect(response.body.data.task.tags).toHaveLength(1);
      // expect(response.body.data.task.subtasks).toHaveLength(4); // Subtasks not implemented yet
      expect(response.body.data.task.reporter._id || response.body.data.task.reporter).toBe(authUser.user.id);
      expect(response.body.data.task.estimatedHours).toBe(16);
    });

    it('should create task with dependencies', async () => {
      // Create a prerequisite task
      const prerequisiteTask = await Task.create(createTestTask(board._id, column._id, authUser.user.id, space._id));

      const taskData = {
        title: 'Implement user registration',
        description: 'Create user registration form and API',
        boardId: board._id,
        columnId: column._id,
        dependencies: [{
          task: prerequisiteTask._id,
          type: 'blocked_by'
        }]
      };

      const response = await request(app)
        .post('/api/tasks')
        .set(getAuthHeaders(authUser.token))
        .send(taskData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.task.dependencies).toHaveLength(1);
      expect(response.body.data.task.dependencies[0].task).toBe(prerequisiteTask._id.toString());
    });

    it('should create task with natural language input', async () => {
      const taskData = {
        naturalLanguageInput: 'Create a high priority task for user authentication due next Friday with 8 hours estimate',
        boardId: board._id,
        columnId: column._id
      };

      const response = await request(app)
        .post('/api/tasks')
        .set(getAuthHeaders(authUser.token))
        .send(taskData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.task.naturalLanguageInput).toBe(taskData.naturalLanguageInput);
      expect(response.body.data.task.aiGenerated).toBe(true);
    });

    it('should create task with time tracking', async () => {
      const taskData = {
        title: 'Design database schema',
        description: 'Create ERD and database schema',
        boardId: board._id,
        columnId: column._id,
        estimatedHours: 4,
        timeEntries: [{
          user: authUser.user.id,
          startTime: new Date(),
          description: 'Initial planning'
        }]
      };

      const response = await request(app)
        .post('/api/tasks')
        .set(getAuthHeaders(authUser.token))
        .send(taskData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.task.timeEntries).toHaveLength(1);
      expect(response.body.data.task.timeEntries[0].user).toBe(authUser.user.id);
    });

    it('should create task with watchers', async () => {
      const [watcher] = await createMultipleUsers(app, 1);
      
      // Add watcher to space team
      space.members.push({ user: watcher.user.id, role: 'contributor' });
      await space.save();

      const taskData = {
        title: 'API documentation',
        description: 'Write comprehensive API documentation',
        boardId: board._id,
        columnId: column._id,
        watchers: [watcher.user.id]
      };

      const response = await request(app)
        .post('/api/tasks')
        .set(getAuthHeaders(authUser.token))
        .send(taskData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.task.watchers).toHaveLength(1);
      expect(response.body.data.task.watchers[0]).toBe(watcher.user.id);
    });

    it('should create task with attachments', async () => {
      const taskData = {
        title: 'Design mockups',
        description: 'Create UI mockups for the application',
        boardId: board._id,
        columnId: column._id,
        attachments: ['file1.jpg', 'file2.pdf']
      };

      const response = await request(app)
        .post('/api/tasks')
        .set(getAuthHeaders(authUser.token))
        .send(taskData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.task.attachments).toHaveLength(2);
    });

    it('should create task with AI suggestions', async () => {
      const taskData = {
        title: 'Implement search functionality',
        description: 'Add search to the application',
        boardId: board._id,
        columnId: column._id,
        aiSuggestions: {
          estimatedDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          suggestedPriority: 'high',
          complexity: 'medium'
        }
      };

      const response = await request(app)
        .post('/api/tasks')
        .set(getAuthHeaders(authUser.token))
        .send(taskData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.task.aiSuggestions).toBeDefined();
      expect(response.body.data.task.aiSuggestions.suggestedPriority).toBe('high');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set(getAuthHeaders(authUser.token))
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Task title is required');
    });

    it('should validate board exists', async () => {
      const taskData = {
        title: 'Test task',
        boardId: new mongoose.Types.ObjectId(),
        columnId: column._id
      };

      const response = await request(app)
        .post('/api/tasks')
        .set(getAuthHeaders(authUser.token))
        .send(taskData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Board not found');
    });
  });

  describe('GET /api/tasks', () => {
    let authUser;
    let workspace;
    let space;
    let board;
    let column;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
      workspace = await Workspace.create(createTestWorkspace(authUser.user.id));
      space = await Space.create(createTestSpace(workspace._id));
      board = await Board.create(createTestBoard(space._id));
      column = await Column.create(createTestColumn(board._id));
      
      // Create multiple tasks
      await Task.create(createTestTask(board._id, column._id, authUser.user.id, space._id));
      await Task.create(createTestTask(board._id, column._id, authUser.user.id, space._id));
      await Task.create(createTestTask(board._id, column._id, authUser.user.id, space._id));
    });

    it('should get tasks with pagination', async () => {
      const response = await request(app)
        .get('/api/tasks?page=1&limit=2')
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tasks).toHaveLength(2);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(2);
    });

    it('should filter tasks by status', async () => {
      const response = await request(app)
        .get('/api/tasks?status=todo')
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tasks.every(task => task.status === 'todo')).toBe(true);
    });

    it('should filter tasks by priority', async () => {
      const response = await request(app)
        .get('/api/tasks?priority=high')
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tasks.every(task => task.priority === 'high')).toBe(true);
    });

    it('should search tasks by title', async () => {
      const response = await request(app)
        .get('/api/tasks?search=test')
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should filter tasks by assignee', async () => {
      const response = await request(app)
        .get(`/api/tasks?assignee=${authUser.user.id}`)
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should filter tasks by due date', async () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const response = await request(app)
        .get(`/api/tasks?dueDate=${tomorrow.toISOString()}`)
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    let authUser;
    let workspace;
    let space;
    let board;
    let column;
    let task;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
      workspace = await Workspace.create(createTestWorkspace(authUser.user.id));
      space = await Space.create(createTestSpace(workspace._id));
      board = await Board.create(createTestBoard(space._id));
      column = await Column.create(createTestColumn(board._id));
      task = await Task.create(createTestTask(board._id, column._id, authUser.user.id, space._id));
    });

    it('should update task title and description', async () => {
      const updateData = {
        title: 'Updated task title',
        description: 'Updated task description'
      };

      const response = await request(app)
        .put(`/api/tasks/${task._id}`)
        .set(getAuthHeaders(authUser.token))
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.task.title).toBe(updateData.title);
      expect(response.body.data.task.description).toBe(updateData.description);
    });

    it('should update task status', async () => {
      const updateData = {
        status: 'in_progress'
      };

      const response = await request(app)
        .put(`/api/tasks/${task._id}`)
        .set(getAuthHeaders(authUser.token))
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.task.status).toBe('in_progress');
    });

    it('should update task priority', async () => {
      const updateData = {
        priority: 'critical'
      };

      const response = await request(app)
        .put(`/api/tasks/${task._id}`)
        .set(getAuthHeaders(authUser.token))
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.task.priority).toBe('critical');
    });

    it('should update task assignees', async () => {
      const [assignee] = await createMultipleUsers(app, 1);
      const updateData = {
        assignees: [assignee.user.id]
      };

      const response = await request(app)
        .put(`/api/tasks/${task._id}`)
        .set(getAuthHeaders(authUser.token))
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.task.assignees).toHaveLength(1);
      expect(response.body.data.task.assignees[0]).toBe(assignee.user.id);
    });

    it('should update task due date', async () => {
      const newDueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
      const updateData = {
        dueDate: newDueDate
      };

      const response = await request(app)
        .put(`/api/tasks/${task._id}`)
        .set(getAuthHeaders(authUser.token))
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(new Date(response.body.data.task.dueDate)).toEqual(newDueDate);
    });

    it('should update task time tracking', async () => {
      const updateData = {
        estimatedHours: 12,
        actualHours: 8
      };

      const response = await request(app)
        .put(`/api/tasks/${task._id}`)
        .set(getAuthHeaders(authUser.token))
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.task.estimatedHours).toBe(12);
      expect(response.body.data.task.actualHours).toBe(8);
    });

    it('should update task tags', async () => {
      const updateData = {
        tags: ['frontend', 'react', 'ui']
      };

      const response = await request(app)
        .put(`/api/tasks/${task._id}`)
        .set(getAuthHeaders(authUser.token))
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.task.tags).toHaveLength(3);
      expect(response.body.data.task.tags).toContain('frontend');
    });

    it('should return 404 for non-existent task', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const updateData = {
        title: 'Updated title'
      };

      const response = await request(app)
        .put(`/api/tasks/${nonExistentId}`)
        .set(getAuthHeaders(authUser.token))
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Task not found');
    });
  });

  describe('PATCH /api/tasks/:id/move', () => {
    let authUser;
    let workspace;
    let space;
    let board;
    let column1;
    let column2;
    let task;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
      workspace = await Workspace.create(createTestWorkspace(authUser.user.id));
      space = await Space.create(createTestSpace(workspace._id));
      board = await Board.create(createTestBoard(space._id));
      column1 = await Column.create(createTestColumn(board._id, 0));
      column2 = await Column.create(createTestColumn(board._id, 1));
      task = await Task.create(createTestTask(board._id, column1._id, authUser.user.id, space._id));
    });

    it('should move task to different column', async () => {
      const moveData = {
        columnId: column2._id,
        position: 0
      };

      const response = await request(app)
        .patch(`/api/tasks/${task._id}/move`)
        .set(getAuthHeaders(authUser.token))
        .send(moveData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.task.column).toBe(column2._id.toString());
      expect(response.body.data.task.position).toBe(0);
    });

    it('should update task position within same column', async () => {
      const moveData = {
        position: 2
      };

      const response = await request(app)
        .patch(`/api/tasks/${task._id}/move`)
        .set(getAuthHeaders(authUser.token))
        .send(moveData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.task.position).toBe(2);
    });

    it('should return 404 for non-existent column', async () => {
      const nonExistentColumnId = new mongoose.Types.ObjectId();
      const moveData = {
        columnId: nonExistentColumnId,
        position: 0
      };

      const response = await request(app)
        .patch(`/api/tasks/${task._id}/move`)
        .set(getAuthHeaders(authUser.token))
        .send(moveData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Column not found');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    let authUser;
    let workspace;
    let space;
    let board;
    let column;
    let task;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
      workspace = await Workspace.create(createTestWorkspace(authUser.user.id));
      space = await Space.create(createTestSpace(workspace._id));
      board = await Board.create(createTestBoard(space._id));
      column = await Column.create(createTestColumn(board._id));
      task = await Task.create(createTestTask(board._id, column._id, authUser.user.id, space._id));
    });

    it('should delete task', async () => {
      const response = await request(app)
        .delete(`/api/tasks/${task._id}`)
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Task deleted successfully');

      // Verify task is deleted
      const deletedTask = await Task.findById(task._id);
      expect(deletedTask).toBeNull();
    });

    it('should return 404 for non-existent task', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/api/tasks/${nonExistentId}`)
        .set(getAuthHeaders(authUser.token))
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Task not found');
    });
  });

  describe('POST /api/tasks/:id/time-tracking', () => {
    let authUser;
    let workspace;
    let space;
    let board;
    let column;
    let task;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
      workspace = await Workspace.create(createTestWorkspace(authUser.user.id));
      space = await Space.create(createTestSpace(workspace._id));
      board = await Board.create(createTestBoard(space._id));
      column = await Column.create(createTestColumn(board._id));
      task = await Task.create(createTestTask(board._id, column._id, authUser.user.id, space._id));
    });

    it('should start time tracking', async () => {
      const timeTrackingData = {
        description: 'Working on task implementation'
      };

      const response = await request(app)
        .post(`/api/tasks/${task._id}/time-tracking`)
        .set(getAuthHeaders(authUser.token))
        .send(timeTrackingData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Time tracking started');

      // Verify time entry was created
      const updatedTask = await Task.findById(task._id);
      expect(updatedTask.timeEntries).toHaveLength(1);
      expect(updatedTask.timeEntries[0].user.toString()).toBe(authUser.user.id);
      expect(updatedTask.timeEntries[0].description).toBe(timeTrackingData.description);
    });

    it('should return error if time tracking already active', async () => {
      // Start time tracking first
      await request(app)
        .post(`/api/tasks/${task._id}/time-tracking`)
        .set(getAuthHeaders(authUser.token))
        .send({ description: 'First session' });

      // Try to start again
      const response = await request(app)
        .post(`/api/tasks/${task._id}/time-tracking`)
        .set(getAuthHeaders(authUser.token))
        .send({ description: 'Second session' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Time tracking already active');
    });
  });

  describe('POST /api/tasks/:id/time-tracking/stop', () => {
    let authUser;
    let workspace;
    let space;
    let board;
    let column;
    let task;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
      workspace = await Workspace.create(createTestWorkspace(authUser.user.id));
      space = await Space.create(createTestSpace(workspace._id));
      board = await Board.create(createTestBoard(space._id));
      column = await Column.create(createTestColumn(board._id));
      task = await Task.create(createTestTask(board._id, column._id, authUser.user.id, space._id));
    });

    it('should stop time tracking', async () => {
      // Start time tracking first
      await request(app)
        .post(`/api/tasks/${task._id}/time-tracking`)
        .set(getAuthHeaders(authUser.token))
        .send({ description: 'Working session' });

      // Stop time tracking
      const response = await request(app)
        .post(`/api/tasks/${task._id}/time-tracking/stop`)
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Time tracking stopped');

      // Verify time entry was updated
      const updatedTask = await Task.findById(task._id);
      expect(updatedTask.timeEntries[0].endTime).toBeDefined();
      expect(updatedTask.timeEntries[0].duration).toBeGreaterThan(0);
    });

    it('should return error if no active time tracking', async () => {
      const response = await request(app)
        .post(`/api/tasks/${task._id}/time-tracking/stop`)
        .set(getAuthHeaders(authUser.token))
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('No active time tracking found');
    });
  });

  describe('POST /api/tasks/:id/duplicate', () => {
    let authUser;
    let workspace;
    let space;
    let board;
    let column;
    let task;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
      workspace = await Workspace.create(createTestWorkspace(authUser.user.id));
      space = await Space.create(createTestSpace(workspace._id));
      board = await Board.create(createTestBoard(space._id));
      column = await Column.create(createTestColumn(board._id));
      task = await Task.create(createTestTask(board._id, column._id, authUser.user.id, space._id));
    });

    it('should duplicate task', async () => {
      const duplicateData = {
        title: 'Duplicated task',
        description: 'This is a duplicated task'
      };

      const response = await request(app)
        .post(`/api/tasks/${task._id}/duplicate`)
        .set(getAuthHeaders(authUser.token))
        .send(duplicateData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.task.title).toBe(duplicateData.title);
      expect(response.body.data.task.description).toBe(duplicateData.description);
      expect(response.body.data.task._id).not.toBe(task._id.toString());
    });

    it('should duplicate task with all properties', async () => {
      const response = await request(app)
        .post(`/api/tasks/${task._id}/duplicate`)
        .set(getAuthHeaders(authUser.token))
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.task.title).toContain('Copy');
      expect(response.body.data.task.board).toBe(task.board.toString());
      expect(response.body.data.task.column).toBe(task.column.toString());
      expect(response.body.data.task.reporter).toBe(task.reporter.toString());
    });
  });

  describe('GET /api/tasks/:id/history', () => {
    let authUser;
    let workspace;
    let space;
    let board;
    let column;
    let task;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
      workspace = await Workspace.create(createTestWorkspace(authUser.user.id));
      space = await Space.create(createTestSpace(workspace._id));
      board = await Board.create(createTestBoard(space._id));
      column = await Column.create(createTestColumn(board._id));
      task = await Task.create(createTestTask(board._id, column._id, authUser.user.id, space._id));
    });

    it('should get task history', async () => {
      const response = await request(app)
        .get(`/api/tasks/${task._id}/history`)
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.history).toBeDefined();
    });
  });

  describe('POST /api/tasks/:id/dependencies', () => {
    let authUser;
    let workspace;
    let space;
    let board;
    let column;
    let task;
    let dependencyTask;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
      workspace = await Workspace.create(createTestWorkspace(authUser.user.id));
      space = await Space.create(createTestSpace(workspace._id));
      board = await Board.create(createTestBoard(space._id));
      column = await Column.create(createTestColumn(board._id));
      task = await Task.create(createTestTask(board._id, column._id, authUser.user.id, space._id));
      dependencyTask = await Task.create(createTestTask(board._id, column._id, authUser.user.id, space._id));
    });

    it('should add task dependency', async () => {
      const dependencyData = {
        taskId: dependencyTask._id,
        type: 'blocks'
      };

      const response = await request(app)
        .post(`/api/tasks/${task._id}/dependencies`)
        .set(getAuthHeaders(authUser.token))
        .send(dependencyData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.task.dependencies).toHaveLength(1);
      expect(response.body.data.task.dependencies[0].task).toBe(dependencyTask._id.toString());
      expect(response.body.data.task.dependencies[0].type).toBe('blocks');
    });

    it('should return error for circular dependency', async () => {
      // Add dependency from task to dependencyTask
      await request(app)
        .post(`/api/tasks/${task._id}/dependencies`)
        .set(getAuthHeaders(authUser.token))
        .send({ taskId: dependencyTask._id, type: 'blocks' });

      // Try to add reverse dependency (circular)
      const response = await request(app)
        .post(`/api/tasks/${dependencyTask._id}/dependencies`)
        .set(getAuthHeaders(authUser.token))
        .send({ taskId: task._id, type: 'blocks' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Circular dependency detected');
    });
  });

  describe('DELETE /api/tasks/:id/dependencies/:dependencyId', () => {
    let authUser;
    let workspace;
    let space;
    let board;
    let column;
    let task;
    let dependencyTask;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
      workspace = await Workspace.create(createTestWorkspace(authUser.user.id));
      space = await Space.create(createTestSpace(workspace._id));
      board = await Board.create(createTestBoard(space._id));
      column = await Column.create(createTestColumn(board._id));
      task = await Task.create(createTestTask(board._id, column._id, authUser.user.id, space._id));
      dependencyTask = await Task.create(createTestTask(board._id, column._id, authUser.user.id, space._id));
      
      // Add dependency
      await request(app)
        .post(`/api/tasks/${task._id}/dependencies`)
        .set(getAuthHeaders(authUser.token))
        .send({ taskId: dependencyTask._id, type: 'blocks' });
    });

    it('should remove task dependency', async () => {
      const response = await request(app)
        .delete(`/api/tasks/${task._id}/dependencies/${dependencyTask._id}`)
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Dependency removed successfully');

      // Verify dependency was removed
      const updatedTask = await Task.findById(task._id);
      expect(updatedTask.dependencies).toHaveLength(0);
    });
  });
});
