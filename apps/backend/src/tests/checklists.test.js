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
const Checklist = require('../models/Checklist');
const User = require('../models/User');

describe('Checklist Endpoints', () => {
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

  describe('POST /api/checklists/task/:taskId', () => {
    let authUser;
    let workspace;
    let project;
    let board;
    let column;
    let task;

    beforeEach(async () => {
      try {
        authUser = await createAuthenticatedUser(app);
        
        // Ensure user ID is properly converted to ObjectId
        const userId = new mongoose.Types.ObjectId(authUser.user._id);
        
        // Create workspace with explicit owner
        const workspaceData = {
          name: 'Test Workspace',
          description: 'Test workspace description',
          owner: userId,
          plan: 'free',
          members: []
        };
        workspace = await Workspace.create(workspaceData);
        
        // Create project
        const projectData = {
          name: 'Test Project',
          description: 'Test project description',
          owner: userId,
          workspace: workspace._id,
          goal: 'Test goal',
          targetEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'active',
          priority: 'medium',
          team: [{ user: userId, role: 'member' }]
        };
        project = await Project.create(projectData);
        
        // Create board
        const boardData = {
          name: 'Test Board',
          description: 'Test board description',
          project: project._id,
          space: workspace._id,
          owner: userId,
          type: 'kanban',
          visibility: 'private'
        };
        board = await Board.create(boardData);
        
        // Create column
        const columnData = {
          name: 'Todo',
          board: board._id,
          position: 0,
          isDefault: true
        };
        column = await Column.create(columnData);
        
        // Create task
        const taskData = {
          title: 'Test Task',
          description: 'Test task description',
          board: board._id,
          column: column._id,
          project: project._id,
          reporter: userId,
          assignees: [userId],
          priority: 'medium',
          status: 'todo',
          position: 0
        };
        task = await Task.create(taskData);
        
        // Add board role to user so they can create checklists
        const user = await User.findById(authUser.user._id);
        if (!user) {
          throw new Error(`User not found with ID: ${authUser.user._id}`);
        }
        const userRoles = await user.getRoles();
        await userRoles.addBoardRole(board._id, 'member');
      } catch (error) {
        console.error('Setup error:', error);
        throw error;
      }
    });

    it('should create checklist for task', async () => {
      const checklistData = {
        title: 'Implementation Checklist',
        items: [
          { 
            text: 'Set up development environment',
            position: 0
          },
          { 
            text: 'Write unit tests',
            position: 1
          },
          { 
            text: 'Code review',
            position: 2
          }
        ]
      };

      const response = await request(app)
        .post(`/api/checklists/task/${task._id}`)
        .set(getAuthHeaders(authUser.token))
        .send(checklistData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.checklist.title).toBe(checklistData.title);
      expect(response.body.data.checklist.taskId.toString()).toBe(task._id.toString());
      expect(response.body.data.checklist.items).toHaveLength(3);
      expect(response.body.data.checklist.createdBy.toString()).toBe(authUser.user._id);
      
      // Check first item details
      const firstItem = response.body.data.checklist.items[0];
      expect(firstItem.text).toBe(checklistData.items[0].text);
      expect(firstItem.completed).toBe(false);
    });

    it('should not create checklist without title', async () => {
      const checklistData = {
        items: [{ text: 'Test item', position: 0 }]
      };

      await request(app)
        .post(`/api/checklists/task/${task._id}`)
        .set(getAuthHeaders(authUser.token))
        .send(checklistData)
        .expect(400);
    });

    it('should not create checklist for task user cannot access', async () => {
      const otherUser = await createAuthenticatedUser(app, { email: 'other@test.com' });

      const checklistData = {
        title: 'Unauthorized checklist',
        items: [{ text: 'Test item', position: 0 }]
      };

      await request(app)
        .post(`/api/checklists/task/${task._id}`)
        .set(getAuthHeaders(otherUser.token))
        .send(checklistData)
        .expect(403);
    });
  });

  describe('GET /api/checklists/task/:taskId', () => {
    let authUser;
    let workspace;
    let project;
    let board;
    let column;
    let task;
    let checklists;

    beforeEach(async () => {
      try {
        authUser = await createAuthenticatedUser(app);
        const userId = new mongoose.Types.ObjectId(authUser.user._id);
        
        workspace = await Workspace.create(createTestWorkspace(userId));
        project = await Project.create(createTestProject(userId, workspace._id));
        board = await Board.create(createTestBoard(project._id, workspace._id));
        column = await Column.create(createTestColumn(board._id));
        const taskData = createTestTask(board._id, column._id, userId);
        taskData.project = project._id;
        task = await Task.create(taskData);

        checklists = await Promise.all([
          Checklist.create({
            title: 'Pre-development checklist',
            taskId: task._id,
            createdBy: userId,
            position: 0,
            items: [
              { text: 'Requirements review', completed: true, position: 0 },
              { text: 'Design approval', completed: false, position: 1 }
            ]
          }),
          Checklist.create({
            title: 'Testing checklist',
            taskId: task._id,
            createdBy: userId,
            position: 1,
            items: [
              { text: 'Unit tests', completed: false, position: 0 },
              { text: 'Integration tests', completed: false, position: 1 }
            ]
          })
        ]);

        // Add board role to user
        const user = await User.findById(authUser.user._id);
        const userRoles = await user.getRoles();
        await userRoles.addBoardRole(board._id, 'member');
      } catch (error) {
        console.error('Setup error:', error);
        throw error;
      }
    });

    it('should get task checklists', async () => {
      const response = await request(app)
        .get(`/api/checklists/task/${task._id}`)
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.checklists).toHaveLength(2);
      expect(response.body.data.checklists[0].taskId.toString()).toBe(task._id.toString());
    });

    it('should calculate completion statistics', async () => {
      const response = await request(app)
        .get(`/api/checklists/task/${task._id}`)
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.data.stats).toBeDefined();
      expect(response.body.data.stats.totalItems).toBe(4);
      expect(response.body.data.stats.completedItems).toBe(1);
      expect(response.body.data.stats.completionPercentage).toBe(25);
    });
  });

  describe('PUT /api/checklists/:id', () => {
    let authUser;
    let workspace;
    let project;
    let board;
    let column;
    let task;
    let checklist;

    beforeEach(async () => {
      try {
        authUser = await createAuthenticatedUser(app);
        const userId = new mongoose.Types.ObjectId(authUser.user._id);
        
        workspace = await Workspace.create(createTestWorkspace(userId));
        project = await Project.create(createTestProject(userId, workspace._id));
        board = await Board.create(createTestBoard(project._id, workspace._id));
        column = await Column.create(createTestColumn(board._id));
        const taskData = createTestTask(board._id, column._id, userId);
        taskData.project = project._id;
        task = await Task.create(taskData);

        checklist = await Checklist.create({
          title: 'Original checklist',
          taskId: task._id,
          createdBy: userId,
          position: 0,
          items: [
            { text: 'Original item 1', position: 0 },
            { text: 'Original item 2', position: 1 }
          ]
        });

        // Add board role to user
        const user = await User.findById(authUser.user._id);
        const userRoles = await user.getRoles();
        await userRoles.addBoardRole(board._id, 'member');
      } catch (error) {
        console.error('Setup error:', error);
        throw error;
      }
    });

    it('should update checklist', async () => {
      const updateData = {
        title: 'Updated checklist title'
      };

      const response = await request(app)
        .put(`/api/checklists/${checklist._id}`)
        .set(getAuthHeaders(authUser.token))
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.checklist.title).toBe(updateData.title);
    });

    it('should not update checklist of another user', async () => {
      const otherUser = await createAuthenticatedUser(app, { email: 'other@test.com' });

      const updateData = {
        title: 'Hacked checklist'
      };

      await request(app)
        .put(`/api/checklists/${checklist._id}`)
        .set(getAuthHeaders(otherUser.token))
        .send(updateData)
        .expect(403);
    });
  });

  describe('POST /api/checklists/:id/items', () => {
    let authUser;
    let workspace;
    let project;
    let board;
    let column;
    let task;
    let checklist;

    beforeEach(async () => {
      try {
        authUser = await createAuthenticatedUser(app);
        const userId = new mongoose.Types.ObjectId(authUser.user._id);
        
        workspace = await Workspace.create(createTestWorkspace(userId));
        project = await Project.create(createTestProject(userId, workspace._id));
        board = await Board.create(createTestBoard(project._id, workspace._id));
        column = await Column.create(createTestColumn(board._id));
        const taskData = createTestTask(board._id, column._id, userId);
        taskData.project = project._id;
        task = await Task.create(taskData);

        checklist = await Checklist.create({
          title: 'Test checklist',
          taskId: task._id,
          createdBy: userId,
          position: 0,
          items: []
        });

        // Add board role to user
        const user = await User.findById(authUser.user._id);
        const userRoles = await user.getRoles();
        await userRoles.addBoardRole(board._id, 'member');
      } catch (error) {
        console.error('Setup error:', error);
        throw error;
      }
    });

    it('should add item to checklist', async () => {
      const itemData = {
        text: 'New checklist item',
        position: 0
      };

      const response = await request(app)
        .post(`/api/checklists/${checklist._id}/items`)
        .set(getAuthHeaders(authUser.token))
        .send(itemData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.checklist.items).toHaveLength(1);
      expect(response.body.data.checklist.items[0].text).toBe(itemData.text);
    });
  });

  describe('PUT /api/checklists/:id/items/:itemId', () => {
    let authUser;
    let workspace;
    let project;
    let board;
    let column;
    let task;
    let checklist;
    let itemId;

    beforeEach(async () => {
      try {
        authUser = await createAuthenticatedUser(app);
        const userId = new mongoose.Types.ObjectId(authUser.user._id);
        
        workspace = await Workspace.create(createTestWorkspace(userId));
        project = await Project.create(createTestProject(userId, workspace._id));
        board = await Board.create(createTestBoard(project._id, workspace._id));
        column = await Column.create(createTestColumn(board._id));
        const taskData = createTestTask(board._id, column._id, userId);
        taskData.project = project._id;
        task = await Task.create(taskData);

        checklist = await Checklist.create({
          title: 'Test checklist',
          taskId: task._id,
          createdBy: userId,
          position: 0,
          items: [
            { text: 'Test item', completed: false, position: 0 }
          ]
        });
        
        itemId = checklist.items[0]._id;

        // Add board role to user
        const user = await User.findById(authUser.user._id);
        const userRoles = await user.getRoles();
        await userRoles.addBoardRole(board._id, 'member');
      } catch (error) {
        console.error('Setup error:', error);
        throw error;
      }
    });

    it('should update checklist item', async () => {
      const updateData = {
        text: 'Updated item text',
        completed: true
      };

      const response = await request(app)
        .put(`/api/checklists/${checklist._id}/items/${itemId}`)
        .set(getAuthHeaders(authUser.token))
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.checklist.items[0].text).toBe(updateData.text);
      expect(response.body.data.checklist.items[0].completed).toBe(true);
      expect(response.body.data.checklist.items[0].completedAt).toBeDefined();
    });

    it('should toggle item completion', async () => {
      const toggleData = {
        completed: true
      };

      const response = await request(app)
        .put(`/api/checklists/${checklist._id}/items/${itemId}`)
        .set(getAuthHeaders(authUser.token))
        .send(toggleData)
        .expect(200);

      expect(response.body.data.checklist.items[0].completed).toBe(true);
      expect(response.body.data.checklist.items[0].completedAt).toBeDefined();
    });
  });

  describe('DELETE /api/checklists/:id/items/:itemId', () => {
    let authUser;
    let workspace;
    let project;
    let board;
    let column;
    let task;
    let checklist;
    let itemId;

    beforeEach(async () => {
      try {
        authUser = await createAuthenticatedUser(app);
        const userId = new mongoose.Types.ObjectId(authUser.user._id);
        
        workspace = await Workspace.create(createTestWorkspace(userId));
        project = await Project.create(createTestProject(userId, workspace._id));
        board = await Board.create(createTestBoard(project._id, workspace._id));
        column = await Column.create(createTestColumn(board._id));
        const taskData = createTestTask(board._id, column._id, userId);
        taskData.project = project._id;
        task = await Task.create(taskData);

        checklist = await Checklist.create({
          title: 'Test checklist',
          taskId: task._id,
          createdBy: userId,
          position: 0,
          items: [
            { text: 'Item to delete', position: 0 },
            { text: 'Item to keep', position: 1 }
          ]
        });
        
        itemId = checklist.items[0]._id;

        // Add board role to user
        const user = await User.findById(authUser.user._id);
        const userRoles = await user.getRoles();
        await userRoles.addBoardRole(board._id, 'member');
      } catch (error) {
        console.error('Setup error:', error);
        throw error;
      }
    });

    it('should delete checklist item', async () => {
      const response = await request(app)
        .delete(`/api/checklists/${checklist._id}/items/${itemId}`)
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.checklist.items).toHaveLength(1);
      expect(response.body.data.checklist.items[0].text).toBe('Item to keep');
    });
  });

  describe('PATCH /api/checklists/:id/reorder', () => {
    let authUser;
    let workspace;
    let project;
    let board;
    let column;
    let task;
    let checklist;

    beforeEach(async () => {
      try {
        authUser = await createAuthenticatedUser(app);
        const userId = new mongoose.Types.ObjectId(authUser.user._id);
        
        workspace = await Workspace.create(createTestWorkspace(userId));
        project = await Project.create(createTestProject(userId, workspace._id));
        board = await Board.create(createTestBoard(project._id, workspace._id));
        column = await Column.create(createTestColumn(board._id));
        const taskData = createTestTask(board._id, column._id, userId);
        taskData.project = project._id;
        task = await Task.create(taskData);

        checklist = await Checklist.create({
          title: 'Test checklist',
          taskId: task._id,
          createdBy: userId,
          position: 0,
          items: [
            { text: 'First item', position: 0 },
            { text: 'Second item', position: 1 },
            { text: 'Third item', position: 2 }
          ]
        });

        // Add board role to user
        const user = await User.findById(authUser.user._id);
        const userRoles = await user.getRoles();
        await userRoles.addBoardRole(board._id, 'member');
      } catch (error) {
        console.error('Setup error:', error);
        throw error;
      }
    });

    it('should reorder checklist items', async () => {
      const reorderData = {
        itemOrder: [
          checklist.items[2]._id, // Move third to first
          checklist.items[0]._id, // Move first to second
          checklist.items[1]._id  // Move second to third
        ]
      };

      const response = await request(app)
        .patch(`/api/checklists/${checklist._id}/reorder`)
        .set(getAuthHeaders(authUser.token))
        .send(reorderData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.checklist.items[0].text).toBe('Third item');
      expect(response.body.data.checklist.items[1].text).toBe('First item');
      expect(response.body.data.checklist.items[2].text).toBe('Second item');
    });
  });

  describe('DELETE /api/checklists/:id', () => {
    let authUser;
    let workspace;
    let project;
    let board;
    let column;
    let task;
    let checklist;

    beforeEach(async () => {
      try {
        authUser = await createAuthenticatedUser(app);
        const userId = new mongoose.Types.ObjectId(authUser.user._id);
        
        workspace = await Workspace.create(createTestWorkspace(userId));
        project = await Project.create(createTestProject(userId, workspace._id));
        board = await Board.create(createTestBoard(project._id, workspace._id));
        column = await Column.create(createTestColumn(board._id));
        const taskData = createTestTask(board._id, column._id, userId);
        taskData.project = project._id;
        task = await Task.create(taskData);

        checklist = await Checklist.create({
          title: 'Test checklist',
          taskId: task._id,
          createdBy: userId,
          position: 0,
          items: [{ text: 'Test item', position: 0 }]
        });

        // Add board role to user
        const user = await User.findById(authUser.user._id);
        const userRoles = await user.getRoles();
        await userRoles.addBoardRole(board._id, 'member');
      } catch (error) {
        console.error('Setup error:', error);
        throw error;
      }
    });

    it('should delete checklist', async () => {
      const response = await request(app)
        .delete(`/api/checklists/${checklist._id}`)
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify checklist is deleted
      const deletedChecklist = await Checklist.findById(checklist._id);
      expect(deletedChecklist).toBeNull();
    });

    it('should not delete checklist created by another user', async () => {
      const otherUser = await createAuthenticatedUser(app, { email: 'other@test.com' });

      await request(app)
        .delete(`/api/checklists/${checklist._id}`)
        .set(getAuthHeaders(otherUser.token))
        .expect(403);
    });
  });
});
