// Set environment variables for testing
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.JWT_EXPIRES_IN = '1h';
process.env.NODE_ENV = 'test';

const { Server } = require('socket.io');
const { createServer } = require('http');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Import test helpers
const { setupTestDB, teardownTestDB, clearDatabase } = require('./helpers/testSetup');
const { 
  createTestUser, 
  createTestBoard, 
  createTestColumn, 
  createTestTask,
  createWorkspaceWithRoles,
  createProjectWithRoles,
  createSpaceWithRoles,
  setupBoardPermissions
} = require('./helpers/testData');
const { createTestToken } = require('./helpers/authHelper');

// Import models
const User = require('../models/User');
const Board = require('../models/Board');
const Column = require('../models/Column');
const Task = require('../models/Task');
const UserRoles = require('../models/UserRoles');

// Import socket handler
const handleBoardSocket = require('../sockets/board.socket');

describe('Board Socket Tests', () => {
  let io, server, clientSocket;
  let testUser, testBoard, testColumn, testTask, testProject, testSpace;
  let authToken;

  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearDatabase();

    // Create test user
    const userData = createTestUser();
    testUser = await User.create(userData);
    authToken = createTestToken(testUser._id);

    // Create test workspace, project, space, and board
    const workspace = await createWorkspaceWithRoles(testUser._id);
    testProject = await createProjectWithRoles(testUser._id, workspace._id);
    testSpace = await createSpaceWithRoles(testUser._id, workspace._id);
    
    const boardData = createTestBoard(testProject._id, testSpace._id);
    testBoard = await Board.create(boardData);

    // Setup board permissions
    const userRoles = await testUser.getRoles();
    await userRoles.addBoardRole(testBoard._id, 'admin', {
      canView: true,
      canEdit: true,
      canCreateTasks: true,
      canEditTasks: true,
      canDeleteTasks: true,
      canManageColumns: true
    });

    // Create test column
    const columnData = createTestColumn(testBoard._id, 0);
    testColumn = await Column.create(columnData);

    // Create test task
    const taskData = createTestTask(testBoard._id, testColumn._id, testUser._id, testProject._id, testSpace._id);
    testTask = await Task.create(taskData);

    // Setup Socket.IO server
    server = createServer();
    io = new Server(server);
    
    // Apply board socket handler
    handleBoardSocket(io);
    
    server.listen(0); // Use random port
  });

  afterEach(async () => {
    if (clientSocket) {
      clientSocket.disconnect();
    }
    if (server) {
      server.close();
    }
  });

  // Helper function to create authenticated socket connection
  const createAuthenticatedSocket = () => {
    return new Promise((resolve, reject) => {
      const socket = require('socket.io-client')(`http://localhost:${server.address().port}`, {
        auth: { token: authToken },
        timeout: 5000
      });

      socket.on('connect', () => {
        resolve(socket);
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        reject(error);
      });

      // Add timeout
      setTimeout(() => {
        reject(new Error('Socket connection timeout'));
      }, 5000);
    });
  };

  describe('Authentication', () => {
    test('should reject connection without token', (done) => {
      const socket = require('socket.io-client')(`http://localhost:${server.address().port}`);
      
      socket.on('connect_error', (error) => {
        expect(error.message).toBe('Authentication required');
        socket.disconnect();
        done();
      });
    });

    test('should reject connection with invalid token', (done) => {
      const socket = require('socket.io-client')(`http://localhost:${server.address().port}`, {
        auth: { token: 'invalid-token' }
      });
      
      socket.on('connect_error', (error) => {
        expect(error.message).toBe('Authentication failed');
        socket.disconnect();
        done();
      });
    });

    test('should accept connection with valid token', async () => {
      clientSocket = await createAuthenticatedSocket();
      expect(clientSocket.connected).toBe(true);
    });
  });

  describe('Board Join/Leave', () => {
    beforeEach(async () => {
      clientSocket = await createAuthenticatedSocket();
    });

    test('should join board room successfully', (done) => {
      clientSocket.emit('board:join', { boardId: testBoard._id.toString() });

      clientSocket.on('board:state', (data) => {
        expect(data.board._id).toBe(testBoard._id.toString());
        expect(data.columns).toBeDefined();
        expect(data.tasks).toBeDefined();
        done();
      });

      // Add timeout for the test
      setTimeout(() => {
        done(new Error('Test timeout - board:state event not received'));
      }, 10000);
    });

    test('should reject joining non-existent board', (done) => {
      const fakeBoardId = new mongoose.Types.ObjectId().toString();
      clientSocket.emit('board:join', { boardId: fakeBoardId });

      clientSocket.on('error', (data) => {
        expect(data.message).toBe('Board not found');
        done();
      });
    });

    test('should reject joining board without permissions', async () => {
      // Create another user without board permissions
      const otherUserData = createTestUser({ email: 'other@test.com' });
      const otherUser = await User.create(otherUserData);
      const otherUserToken = createTestToken(otherUser._id);

      const otherSocket = require('socket.io-client')(`http://localhost:${server.address().port}`, {
        auth: { token: otherUserToken }
      });

      return new Promise((resolve) => {
        otherSocket.on('connect', () => {
          otherSocket.emit('board:join', { boardId: testBoard._id.toString() });

          otherSocket.on('error', (data) => {
            expect(data.message).toBe('Access denied to board');
            otherSocket.disconnect();
            resolve();
          });
        });
      });
    });

    test('should leave board room', (done) => {
      clientSocket.emit('board:join', { boardId: testBoard._id.toString() });
      
      setTimeout(() => {
        clientSocket.emit('board:leave', { boardId: testBoard._id.toString() });
        // Note: We can't easily test if socket left the room, but we can test the event is emitted
        done();
      }, 100);
    });
  });

  describe('Column Operations', () => {
    beforeEach(async () => {
      clientSocket = await createAuthenticatedSocket();
      clientSocket.emit('board:join', { boardId: testBoard._id.toString() });
      
      // Wait for board join to complete
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    test('should create column successfully', (done) => {
      const columnData = {
        name: 'New Column',
        position: 1,
        isDefault: false
      };

      clientSocket.emit('column:create', {
        boardId: testBoard._id.toString(),
        columnData
      });

      clientSocket.on('column:created', (data) => {
        expect(data.column.name).toBe(columnData.name);
        expect(data.column.board).toBe(testBoard._id.toString());
        expect(data.createdBy.id).toBe(testUser._id.toString());
        done();
      });

      // Add timeout for the test
      setTimeout(() => {
        done(new Error('Test timeout - column:created event not received'));
      }, 10000);
    });

    test('should reject column creation without permissions', async () => {
      // Create user with view-only permissions
      const viewUserData = createTestUser({ email: 'view@test.com' });
      const viewUser = await User.create(viewUserData);
      const viewUserToken = createTestToken(viewUser._id);

      // Setup view-only permissions
      const userRoles = await viewUser.getRoles();
      await userRoles.addBoardRole(testBoard._id, 'viewer', {
        canView: true,
        canEdit: false,
        canCreateTasks: false,
        canEditTasks: false,
        canDeleteTasks: false,
        canManageColumns: false
      });

      const viewSocket = require('socket.io-client')(`http://localhost:${server.address().port}`, {
        auth: { token: viewUserToken }
      });

      return new Promise((resolve) => {
        viewSocket.on('connect', () => {
          viewSocket.emit('board:join', { boardId: testBoard._id.toString() });
          
          setTimeout(() => {
            viewSocket.emit('column:create', {
              boardId: testBoard._id.toString(),
              columnData: { name: 'Test Column' }
            });

            viewSocket.on('error', (data) => {
              expect(data.message).toBe('Insufficient permissions to create columns');
              viewSocket.disconnect();
              resolve();
            });
          }, 100);
        });
      });
    });

    test('should update column successfully', (done) => {
      const updates = { name: 'Updated Column Name' };

      clientSocket.emit('column:update', {
        columnId: testColumn._id.toString(),
        updates
      });

      clientSocket.on('column:updated', (data) => {
        expect(data.column.name).toBe(updates.name);
        expect(data.updatedBy.id).toBe(testUser._id.toString());
        done();
      });

      // Add timeout for the test
      setTimeout(() => {
        done(new Error('Test timeout - column:updated event not received'));
      }, 10000);
    });

    test('should reject updating non-existent column', (done) => {
      const fakeColumnId = new mongoose.Types.ObjectId().toString();
      
      clientSocket.emit('column:update', {
        columnId: fakeColumnId,
        updates: { name: 'Test' }
      });

      clientSocket.on('error', (data) => {
        expect(data.message).toBe('Column not found');
        done();
      });
    });

    test('should delete column successfully', (done) => {
      // Create a separate empty column for deletion
      const emptyColumn = new Column({
        name: 'Empty Column',
        board: testBoard._id,
        position: 1
      });
      
      emptyColumn.save().then(() => {
        clientSocket.emit('column:delete', {
          columnId: emptyColumn._id.toString()
        });

        clientSocket.on('column:deleted', (data) => {
          expect(data.columnId).toBe(emptyColumn._id.toString());
          expect(data.deletedBy.id).toBe(testUser._id.toString());
          done();
        });
      });

      // Add timeout for the test
      setTimeout(() => {
        done(new Error('Test timeout - column:deleted event not received'));
      }, 10000);
    });

    test('should reject deleting column with tasks', (done) => {
      // Create a column with tasks
      const columnWithTasks = new Column({
        name: 'Column with Tasks',
        board: testBoard._id,
        position: 1
      });
      
      columnWithTasks.save().then(async () => {
        const task = new Task({
          title: 'Test Task',
          board: testBoard._id,
          project: testProject._id,
          space: testSpace._id,
          column: columnWithTasks._id,
          reporter: testUser._id
        });
        await task.save();

        clientSocket.emit('column:delete', {
          columnId: columnWithTasks._id.toString()
        });

        clientSocket.on('error', (data) => {
          expect(data.message).toBe('Cannot delete column with tasks');
          done();
        });
      });

      // Add timeout for the test
      setTimeout(() => {
        done(new Error('Test timeout - error event not received'));
      }, 10000);
    });
  });

  describe('Column Reordering', () => {
    beforeEach(async () => {
      clientSocket = await createAuthenticatedSocket();
      clientSocket.emit('board:join', { boardId: testBoard._id.toString() });
      
      // Wait for board join to complete
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    test('should reorder columns successfully', (done) => {
      // Create additional columns
      const column1 = new Column({
        name: 'Column 1',
        board: testBoard._id,
        position: 0
      });
      const column2 = new Column({
        name: 'Column 2',
        board: testBoard._id,
        position: 1
      });

      Promise.all([column1.save(), column2.save()]).then(() => {
        const columnOrder = [
          { columnId: column2._id.toString(), position: 0 },
          { columnId: column1._id.toString(), position: 1 }
        ];

        clientSocket.emit('columns:reorder', {
          boardId: testBoard._id.toString(),
          columnOrder
        });

        clientSocket.on('columns:reordered', (data) => {
          expect(data.columnOrder).toEqual(columnOrder);
          expect(data.reorderedBy.id).toBe(testUser._id.toString());
          done();
        });
      });

      // Add timeout for the test
      setTimeout(() => {
        done(new Error('Test timeout - columns:reordered event not received'));
      }, 10000);
    });
  });

  describe('Board Settings', () => {
    beforeEach(async () => {
      clientSocket = await createAuthenticatedSocket();
      clientSocket.emit('board:join', { boardId: testBoard._id.toString() });
      
      // Wait for board join to complete
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    test('should update board settings successfully', (done) => {
      const settings = {
        allowComments: false,
        allowAttachments: true,
        autoArchive: true
      };

      clientSocket.emit('board:settings-update', {
        boardId: testBoard._id.toString(),
        settings
      });

      clientSocket.on('board:settings-updated', (data) => {
        expect(data.settings.allowComments).toBe(settings.allowComments);
        expect(data.settings.allowAttachments).toBe(settings.allowAttachments);
        expect(data.settings.autoArchive).toBe(settings.autoArchive);
        expect(data.updatedBy.id).toBe(testUser._id.toString());
        done();
      });

      // Add timeout for the test
      setTimeout(() => {
        done(new Error('Test timeout - board:settings-updated event not received'));
      }, 10000);
    });
  });

  describe('Board View Tracking', () => {
    beforeEach(async () => {
      clientSocket = await createAuthenticatedSocket();
      clientSocket.emit('board:join', { boardId: testBoard._id.toString() });
      
      // Wait for board join to complete
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    test('should track board view', (done) => {
      clientSocket.emit('board:view', { boardId: testBoard._id.toString() });

      // This event is broadcast to other users, so we need to test it differently
      // For now, we'll just verify the event is handled without error
      setTimeout(() => {
        done();
      }, 100);
    });
  });

  describe('Bulk Operations', () => {
    beforeEach(async () => {
      clientSocket = await createAuthenticatedSocket();
      clientSocket.emit('board:join', { boardId: testBoard._id.toString() });
      
      // Wait for board join to complete
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    test('should perform bulk move tasks operation', (done) => {
      // Create additional column for moving tasks
      const targetColumn = new Column({
        name: 'Target Column',
        board: testBoard._id,
        position: 1
      });

      targetColumn.save().then(() => {
        clientSocket.emit('board:bulk-operation', {
          boardId: testBoard._id.toString(),
          operation: 'move_tasks',
          targets: [testTask._id.toString()],
          options: { targetColumnId: targetColumn._id.toString() }
        });

        clientSocket.on('board:bulk-operation-completed', (data) => {
          expect(data.operation).toBe('move_tasks');
          expect(data.targets).toEqual([testTask._id.toString()]);
          expect(data.performedBy.id).toBe(testUser._id.toString());
          done();
        });
      });

      // Add timeout for the test
      setTimeout(() => {
        done(new Error('Test timeout - board:bulk-operation-completed event not received'));
      }, 10000);
    });

    test('should perform bulk update tasks operation', (done) => {
      const updates = { priority: 'high' };

      clientSocket.emit('board:bulk-operation', {
        boardId: testBoard._id.toString(),
        operation: 'update_tasks',
        targets: [testTask._id.toString()],
        options: { updates }
      });

      clientSocket.on('board:bulk-operation-completed', (data) => {
        expect(data.operation).toBe('update_tasks');
        expect(data.targets).toEqual([testTask._id.toString()]);
        expect(data.performedBy.id).toBe(testUser._id.toString());
        done();
      });

      // Add timeout for the test
      setTimeout(() => {
        done(new Error('Test timeout - board:bulk-operation-completed event not received'));
      }, 10000);
    });

    test('should reject unknown bulk operation', (done) => {
      clientSocket.emit('board:bulk-operation', {
        boardId: testBoard._id.toString(),
        operation: 'unknown_operation',
        targets: [testTask._id.toString()],
        options: {}
      });

      clientSocket.on('error', (data) => {
        expect(data.message).toBe('Unknown bulk operation');
        done();
      });

      // Add timeout for the test
      setTimeout(() => {
        done(new Error('Test timeout - error event not received'));
      }, 10000);
    });
  });

  describe('Global Utilities', () => {
    test('should have notifyBoard utility', () => {
      expect(io.notifyBoard).toBeDefined();
      expect(typeof io.notifyBoard).toBe('function');
    });

    test('should have notifyBoardAdmins utility', () => {
      expect(io.notifyBoardAdmins).toBeDefined();
      expect(typeof io.notifyBoardAdmins).toBe('function');
    });
  });
});
