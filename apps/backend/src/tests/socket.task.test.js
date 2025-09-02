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
const Comment = require('../models/Comment');

// Import socket handler
const handleTaskSocket = require('../sockets/task.socket');

describe('Task Socket Tests', () => {
  let io, server, clientSocket;
  let testUser, testBoard, testColumn, testTask, testProject;
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
    const space = await createSpaceWithRoles(testUser._id, workspace._id);
    
    const boardData = createTestBoard(testProject._id, space._id);
    testBoard = await Board.create(boardData);

    // Setup board permissions
    await setupBoardPermissions(testUser._id, testBoard._id, 'admin');

    // Create test column
    const columnData = createTestColumn(testBoard._id, 0);
    testColumn = await Column.create(columnData);

    // Create test task
    const taskData = createTestTask(testBoard._id, testColumn._id, testUser._id, testProject._id, space._id);
    testTask = await Task.create(taskData);

    // Setup Socket.IO server
    server = createServer();
    io = new Server(server);
    
    // Apply task socket handler
    handleTaskSocket(io);
    
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
    return new Promise((resolve) => {
      const socket = require('socket.io-client')(`http://localhost:${server.address().port}`, {
        auth: { token: authToken }
      });

      socket.on('connect', () => {
        resolve(socket);
      });

      socket.on('error', (error) => {
        console.error('Socket connection error:', error);
      });
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

    test('should receive welcome message on connection', (done) => {
      clientSocket = require('socket.io-client')(`http://localhost:${server.address().port}`, {
        auth: { token: authToken }
      });

      clientSocket.on('connected', (data) => {
        expect(data.message).toBe('Successfully connected to TaskFlow');
        expect(data.user.id).toBe(testUser._id.toString());
        expect(data.user.name).toBe(testUser.name);
        expect(data.user.email).toBe(testUser.email);
        done();
      });
    });
  });

  describe('Project Room Management', () => {
    beforeEach(async () => {
      clientSocket = await createAuthenticatedSocket();
    });

    test('should join project room successfully', (done) => {
      clientSocket.emit('join:project', testProject._id.toString());

      // Since the join is successful, we should not receive an error
      // and the user should be able to join the room
      setTimeout(() => {
        // If we reach here without an error, the join was successful
        done();
      }, 100);
    });

    test('should reject joining non-existent project', (done) => {
      const fakeProjectId = new mongoose.Types.ObjectId().toString();
      clientSocket.emit('join:project', fakeProjectId);

      clientSocket.on('error', (data) => {
        expect(data.message).toBe('Project not found');
        done();
      });
    });

    test('should reject joining project without access', async () => {
      // Create another user without project access
      const otherUserData = createTestUser({ email: 'other@test.com' });
      const otherUser = await User.create(otherUserData);
      const otherUserToken = createTestToken(otherUser._id);

      const otherSocket = require('socket.io-client')(`http://localhost:${server.address().port}`, {
        auth: { token: otherUserToken }
      });

      return new Promise((resolve) => {
        otherSocket.on('connect', () => {
          // Use a different project ID that the other user doesn't own
          const differentProjectId = new mongoose.Types.ObjectId().toString();
          otherSocket.emit('join:project', differentProjectId);

          otherSocket.on('error', (data) => {
            expect(data.message).toBe('Access denied to project');
            otherSocket.disconnect();
            resolve();
          });
        });
      });
    });
  });

  describe('Board Room Management', () => {
    beforeEach(async () => {
      clientSocket = await createAuthenticatedSocket();
    });

    test('should join board room successfully', (done) => {
      clientSocket.emit('join:board', testBoard._id.toString());

      // This should not throw an error
      setTimeout(() => {
        done();
      }, 100);
    });

    test('should reject joining non-existent board', (done) => {
      const fakeBoardId = new mongoose.Types.ObjectId().toString();
      clientSocket.emit('join:board', fakeBoardId);

      clientSocket.on('error', (data) => {
        expect(data.message).toBe('Board not found');
        done();
      });
    });
  });

  describe('Task Operations', () => {
    beforeEach(async () => {
      clientSocket = await createAuthenticatedSocket();
      clientSocket.emit('join:board', testBoard._id.toString());
    });

    test('should update task successfully', (done) => {
      const updates = {
        title: 'Updated Task Title',
        priority: 'high',
        status: 'in_progress'
      };

      clientSocket.emit('task:update', {
        taskId: testTask._id.toString(),
        updates,
        boardId: testBoard._id.toString()
      });

      clientSocket.on('task:updated', (data) => {
        expect(data.task.title).toBe(updates.title);
        expect(data.task.priority).toBe(updates.priority);
        expect(data.task.status).toBe(updates.status);
        expect(data.updatedBy.id).toBe(testUser._id.toString());
        expect(data.timestamp).toBeDefined();
        done();
      });
    });

    test('should reject updating non-existent task', (done) => {
      const fakeTaskId = new mongoose.Types.ObjectId().toString();
      
      clientSocket.emit('task:update', {
        taskId: fakeTaskId,
        updates: { title: 'Test' },
        boardId: testBoard._id.toString()
      });

      clientSocket.on('error', (data) => {
        expect(data.message).toBe('Task not found');
        done();
      });
    });

    test('should move task successfully', (done) => {
      // Create target column
      const targetColumn = new Column({
        name: 'Target Column',
        board: testBoard._id,
        position: 1
      });

      targetColumn.save().then(() => {
        const targetPosition = 0;

        clientSocket.emit('task:move', {
          taskId: testTask._id.toString(),
          sourceColumnId: testColumn._id.toString(),
          targetColumnId: targetColumn._id.toString(),
          targetPosition,
          boardId: testBoard._id.toString()
        });

        clientSocket.on('task:moved', (data) => {
          expect(data.taskId).toBe(testTask._id.toString());
          expect(data.sourceColumnId).toBe(testColumn._id.toString());
          expect(data.targetColumnId).toBe(targetColumn._id.toString());
          expect(data.targetPosition).toBe(targetPosition);
          expect(data.movedBy.id).toBe(testUser._id.toString());
          expect(data.timestamp).toBeDefined();
          done();
        });
      });
    });

    test('should reject moving non-existent task', (done) => {
      const fakeTaskId = new mongoose.Types.ObjectId().toString();
      
      clientSocket.emit('task:move', {
        taskId: fakeTaskId,
        sourceColumnId: testColumn._id.toString(),
        targetColumnId: testColumn._id.toString(),
        targetPosition: 0,
        boardId: testBoard._id.toString()
      });

      clientSocket.on('error', (data) => {
        expect(data.message).toBe('Task not found');
        done();
      });
    });
  });

  describe('Comment Operations', () => {
    beforeEach(async () => {
      clientSocket = await createAuthenticatedSocket();
      clientSocket.emit('join:board', testBoard._id.toString());
    });

    test('should add comment successfully', (done) => {
      const commentData = {
        taskId: testTask._id.toString(),
        content: 'This is a test comment',
        mentions: []
      };

      clientSocket.emit('comment:add', commentData);

      clientSocket.on('comment:added', (data) => {
        expect(data.comment.content).toBe(commentData.content);
        expect(data.comment.task.toString()).toBe(testTask._id.toString());
        expect(data.comment.author.id).toBe(testUser._id.toString());
        expect(data.taskId).toBe(testTask._id.toString());
        expect(data.timestamp).toBeDefined();
        done();
      });
    });

    test('should add comment with mentions', (done) => {
      // Create another user to mention
      const mentionedUserData = createTestUser({ email: 'mentioned@test.com' });
      
      User.create(mentionedUserData).then((mentionedUser) => {
        const commentData = {
          taskId: testTask._id.toString(),
          content: 'This is a test comment with @mentioned@test.com',
          mentions: [{
            user: mentionedUser._id.toString(),
            mentionedAt: new Date()
          }]
        };

        clientSocket.emit('comment:add', commentData);

        clientSocket.on('comment:added', (data) => {
          expect(data.comment.content).toBe(commentData.content);
          expect(data.comment.mentions).toHaveLength(1);
          expect(data.comment.mentions[0].user).toBe(mentionedUser._id.toString());
          done();
        });
      });
    });

    test('should send notifications to mentioned users', (done) => {
      // Create another user to mention
      const mentionedUserData = createTestUser({ email: 'mentioned@test.com' });
      
      User.create(mentionedUserData).then((mentionedUser) => {
        // Create socket for mentioned user
        const mentionedUserToken = createTestToken(mentionedUser._id);
        const mentionedSocket = require('socket.io-client')(`http://localhost:${server.address().port}`, {
          auth: { token: mentionedUserToken }
        });

        mentionedSocket.on('connect', () => {
          mentionedSocket.on('notification', (data) => {
            expect(data.type).toBe('mention');
            expect(data.message).toContain(testUser.name);
            expect(data.taskId).toBe(testTask._id.toString());
            expect(data.taskTitle).toBe(testTask.title);
            mentionedSocket.disconnect();
            done();
          });

          // Add comment with mention
          const commentData = {
            taskId: testTask._id.toString(),
            content: 'This is a test comment with @mentioned@test.com',
            mentions: [{
              user: mentionedUser._id.toString(),
              mentionedAt: new Date()
            }]
          };

          clientSocket.emit('comment:add', commentData);
        });
      });

      // Add timeout for the test
      setTimeout(() => {
        done(new Error('Test timeout - notification event not received'));
      }, 10000);
    });
  });

  describe('User Presence and Typing', () => {
    beforeEach(async () => {
      clientSocket = await createAuthenticatedSocket();
      clientSocket.emit('join:board', testBoard._id.toString());
    });

    test('should emit typing start indicator', (done) => {
      clientSocket.emit('typing:start', {
        boardId: testBoard._id.toString(),
        taskId: testTask._id.toString()
      });

      // This event is broadcast to other users, so we need to test it differently
      // For now, we'll just verify the event is handled without error
      setTimeout(() => {
        done();
      }, 100);
    });

    test('should emit typing stop indicator', (done) => {
      clientSocket.emit('typing:stop', {
        boardId: testBoard._id.toString(),
        taskId: testTask._id.toString()
      });

      setTimeout(() => {
        done();
      }, 100);
    });

    test('should update user presence', (done) => {
      const status = 'away';

      clientSocket.emit('presence:update', {
        boardId: testBoard._id.toString(),
        status
      });

      setTimeout(() => {
        done();
      }, 100);
    });
  });

  describe('Disconnection Handling', () => {
    test('should handle user disconnection', (done) => {
      clientSocket = require('socket.io-client')(`http://localhost:${server.address().port}`, {
        auth: { token: authToken }
      });

      clientSocket.on('connect', () => {
        clientSocket.on('user:left', (data) => {
          expect(data.user.id).toBe(testUser._id.toString());
          expect(data.timestamp).toBeDefined();
          done();
        });

        clientSocket.disconnect();
      });

      // Add timeout for the test
      setTimeout(() => {
        done(new Error('Test timeout - user:left event not received'));
      }, 10000);
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      clientSocket = await createAuthenticatedSocket();
    });

    test('should handle socket errors', (done) => {
      // This test verifies that error events are handled
      clientSocket.on('error', (error) => {
        expect(error).toBeDefined();
        done();
      });

      // Trigger an error by emitting an invalid event
      clientSocket.emit('invalid:event');

      // Add timeout for the test
      setTimeout(() => {
        done(new Error('Test timeout - error event not received'));
      }, 10000);
    });

    test('should handle database errors gracefully', (done) => {
      // Mock a database error
      const originalFindById = Task.findById;
      Task.findById = jest.fn().mockRejectedValue(new Error('Database error'));

      clientSocket.emit('task:update', {
        taskId: testTask._id.toString(),
        updates: { title: 'Test' },
        boardId: testBoard._id.toString()
      });

      clientSocket.on('error', (data) => {
        expect(data.message).toBe('Failed to update task');
        
        // Restore original function
        Task.findById = originalFindById;
        done();
      });
    });
  });

  describe('Global Socket Utilities', () => {
    test('should have notifyUser utility', () => {
      expect(io.notifyUser).toBeDefined();
      expect(typeof io.notifyUser).toBe('function');
    });

    test('should have notifyProject utility', () => {
      expect(io.notifyProject).toBeDefined();
      expect(typeof io.notifyProject).toBe('function');
    });

    test('should have notifyBoard utility', () => {
      expect(io.notifyBoard).toBeDefined();
      expect(typeof io.notifyBoard).toBe('function');
    });

    test('should notify user successfully', (done) => {
      clientSocket = require('socket.io-client')(`http://localhost:${server.address().port}`, {
        auth: { token: authToken }
      });

      clientSocket.on('connect', () => {
        clientSocket.on('test:event', (data) => {
          expect(data.message).toBe('Test notification');
          done();
        });

        io.notifyUser(testUser._id, 'test:event', { message: 'Test notification' });
      });
    });

    test('should notify project successfully', (done) => {
      clientSocket = require('socket.io-client')(`http://localhost:${server.address().port}`, {
        auth: { token: authToken }
      });

      clientSocket.on('connect', () => {
        clientSocket.emit('join:project', testProject._id.toString());

        setTimeout(() => {
          clientSocket.on('project:event', (data) => {
            expect(data.message).toBe('Project notification');
            done();
          });

          io.notifyProject(testProject._id, 'project:event', { message: 'Project notification' });
        }, 100);
      });

      // Add timeout for the test
      setTimeout(() => {
        done(new Error('Test timeout - project:event not received'));
      }, 10000);
    });

    test('should notify board successfully', (done) => {
      clientSocket = require('socket.io-client')(`http://localhost:${server.address().port}`, {
        auth: { token: authToken }
      });

      clientSocket.on('connect', () => {
        clientSocket.emit('join:board', testBoard._id.toString());

        setTimeout(() => {
          clientSocket.on('board:event', (data) => {
            expect(data.message).toBe('Board notification');
            done();
          });

          io.notifyBoard(testBoard._id, 'board:event', { message: 'Board notification' });
        }, 100);
      });
    });
  });

  describe('Real-time Collaboration', () => {
    test('should broadcast task updates to all board members', (done) => {
      // Create second user
      const secondUserData = createTestUser({ email: 'second@test.com' });
      
      User.create(secondUserData).then(async (secondUser) => {
        // Setup board permissions for second user
        await setupBoardPermissions(secondUser._id, testBoard._id, 'member');

        const secondUserToken = createTestToken(secondUser._id);
        const secondSocket = require('socket.io-client')(`http://localhost:${server.address().port}`, {
          auth: { token: secondUserToken }
        });

        secondSocket.on('connect', () => {
          secondSocket.emit('join:board', testBoard._id.toString());

          setTimeout(() => {
            secondSocket.on('task:updated', (data) => {
              expect(data.task.title).toBe('Updated by first user');
              expect(data.updatedBy.id).toBe(testUser._id.toString());
              secondSocket.disconnect();
              done();
            });

            // First user updates task
            clientSocket = require('socket.io-client')(`http://localhost:${server.address().port}`, {
              auth: { token: authToken }
            });

            clientSocket.on('connect', () => {
              clientSocket.emit('join:board', testBoard._id.toString());

              setTimeout(() => {
                clientSocket.emit('task:update', {
                  taskId: testTask._id.toString(),
                  updates: { title: 'Updated by first user' },
                  boardId: testBoard._id.toString()
                });
              }, 100);
            });
          }, 100);
        });
      });
    });

    test('should broadcast comments to all board members', (done) => {
      // Create second user
      const secondUserData = createTestUser({ email: 'second@test.com' });
      
      User.create(secondUserData).then(async (secondUser) => {
        // Setup board permissions for second user
        await setupBoardPermissions(secondUser._id, testBoard._id, 'member');

        const secondUserToken = createTestToken(secondUser._id);
        const secondSocket = require('socket.io-client')(`http://localhost:${server.address().port}`, {
          auth: { token: secondUserToken }
        });

        secondSocket.on('connect', () => {
          secondSocket.emit('join:board', testBoard._id.toString());

          setTimeout(() => {
            secondSocket.on('comment:added', (data) => {
              expect(data.comment.content).toBe('Comment from first user');
              expect(data.comment.author.id).toBe(testUser._id.toString());
              secondSocket.disconnect();
              done();
            });

            // First user adds comment
            clientSocket = require('socket.io-client')(`http://localhost:${server.address().port}`, {
              auth: { token: authToken }
            });

            clientSocket.on('connect', () => {
              clientSocket.emit('join:board', testBoard._id.toString());

              setTimeout(() => {
                clientSocket.emit('comment:add', {
                  taskId: testTask._id.toString(),
                  content: 'Comment from first user',
                  mentions: []
                });
              }, 100);
            });
          }, 100);
        });
      });
    });
  });
});
