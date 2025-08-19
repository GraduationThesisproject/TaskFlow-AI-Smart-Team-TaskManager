const { Server } = require('socket.io');
const { createServer } = require('http');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Import test helpers
const { setupTestDB, teardownTestDB, clearDatabase } = require('./helpers/testSetup');
const { createTestUser, createWorkspaceWithRoles } = require('./helpers/testData');
const { createTestToken } = require('./helpers/authHelper');

// Import models
const User = require('../models/User');
const Workspace = require('../models/Workspace');

// Import socket handler
const handleWorkspaceSocket = require('../sockets/workspace.socket');

describe('Workspace Socket Tests', () => {
  let io, server, clientSocket;
  let testUser, testWorkspace;
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

    // Create test workspace
    testWorkspace = await createWorkspaceWithRoles(testUser._id);

    // Setup Socket.IO server
    server = createServer();
    io = new Server(server);
    
    // Apply workspace socket handler
    handleWorkspaceSocket(io);
    
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

  describe('Connection and Setup', () => {
    test('should connect successfully with valid token', async () => {
      clientSocket = await createAuthenticatedSocket();
      expect(clientSocket.connected).toBe(true);
    });
  });

  describe('Workspace Room Management', () => {
    beforeEach(async () => {
      clientSocket = await createAuthenticatedSocket();
    });

    test('should join workspace room successfully', (done) => {
      clientSocket.emit('workspace:join', { workspaceId: testWorkspace._id.toString() });

      clientSocket.on('workspace:user-joined', (data) => {
        expect(data.user.id).toBe(testUser._id.toString());
        expect(data.timestamp).toBeDefined();
        done();
      });

      // Add timeout for the test
      setTimeout(() => {
        done(new Error('Test timeout - workspace:user-joined event not received'));
      }, 10000);
    });

    test('should reject joining workspace without permissions', async () => {
      const otherUserData = createTestUser({ email: 'other@test.com' });
      const otherUser = await User.create(otherUserData);
      const otherUserToken = createTestToken(otherUser._id);

      const otherSocket = require('socket.io-client')(`http://localhost:${server.address().port}`, {
        auth: { token: otherUserToken }
      });

      return new Promise((resolve) => {
        otherSocket.on('connect', () => {
          otherSocket.emit('workspace:join', { workspaceId: testWorkspace._id.toString() });

          otherSocket.on('error', (data) => {
            expect(data.message).toBe('Access denied to workspace');
            otherSocket.disconnect();
            resolve();
          });
        });
      });
    });

    test('should leave workspace room', (done) => {
      clientSocket.emit('workspace:join', { workspaceId: testWorkspace._id.toString() });
      
      setTimeout(() => {
        clientSocket.emit('workspace:leave', { workspaceId: testWorkspace._id.toString() });
        
        clientSocket.on('workspace:user-left', (data) => {
          expect(data.user.id).toBe(testUser._id.toString());
          expect(data.timestamp).toBeDefined();
          done();
        });
      }, 100);

      // Add timeout for the test
      setTimeout(() => {
        done(new Error('Test timeout - workspace:user-left event not received'));
      }, 10000);
    });
  });

  describe('Member Management', () => {
    beforeEach(async () => {
      clientSocket = await createAuthenticatedSocket();
      clientSocket.emit('workspace:join', { workspaceId: testWorkspace._id.toString() });
    });

    test('should update workspace member successfully', (done) => {
      const memberUserData = createTestUser({ email: 'member@test.com' });
      
      User.create(memberUserData).then(async (memberUser) => {
        await testWorkspace.addMember(memberUser._id, 'member', testUser._id);

        const updates = {
          role: 'admin',
          permissions: { canInvite: true, canManageProjects: true }
        };

        clientSocket.emit('workspace:member-update', {
          workspaceId: testWorkspace._id.toString(),
          memberId: memberUser._id.toString(),
          updates
        });

        clientSocket.on('workspace:member-updated', (data) => {
          expect(data.memberId).toBe(memberUser._id.toString());
          expect(data.updates).toEqual(updates);
          expect(data.updatedBy.id).toBe(testUser._id.toString());
          expect(data.timestamp).toBeDefined();
          done();
        });
      });
    });
  });

  describe('Workspace Settings', () => {
    beforeEach(async () => {
      clientSocket = await createAuthenticatedSocket();
      clientSocket.emit('workspace:join', { workspaceId: testWorkspace._id.toString() });
    });

    test('should update workspace settings successfully', (done) => {
      const settings = {
        allowPublicProjects: true,
        requireApprovalForInvites: false,
        maxTeamSize: 50
      };

      clientSocket.emit('workspace:settings-update', {
        workspaceId: testWorkspace._id.toString(),
        settings
      });

      clientSocket.on('workspace:settings-updated', (data) => {
        expect(data.settings).toEqual(settings);
        expect(data.updatedBy.id).toBe(testUser._id.toString());
        expect(data.timestamp).toBeDefined();
        done();
      });
    });
  });

  describe('Usage Limits and Quotas', () => {
    beforeEach(async () => {
      clientSocket = await createAuthenticatedSocket();
      clientSocket.emit('workspace:join', { workspaceId: testWorkspace._id.toString() });
    });

    test('should check workspace limits successfully', (done) => {
      clientSocket.emit('workspace:check-limits', {
        workspaceId: testWorkspace._id.toString()
      });

      setTimeout(() => {
        done();
      }, 100);
    });

    test('should emit limit warnings when approaching limits', (done) => {
      testWorkspace.usage = {
        membersCount: 9,
        storageUsed: 9000000000
      };
      testWorkspace.limits = {
        maxMembers: 10,
        maxStorage: 10000000000
      };
      testWorkspace.save().then(() => {
        clientSocket.emit('workspace:check-limits', {
          workspaceId: testWorkspace._id.toString()
        });

        clientSocket.on('workspace:limit-warnings', (data) => {
          expect(data.warnings).toBeDefined();
          expect(Array.isArray(data.warnings)).toBe(true);
          expect(data.warnings.length).toBeGreaterThan(0);
          done();
        });
      });
    });
  });

  describe('Global Workspace Utilities', () => {
    test('should have notifyWorkspace utility', () => {
      expect(io.notifyWorkspace).toBeDefined();
      expect(typeof io.notifyWorkspace).toBe('function');
    });

    test('should have notifyWorkspaceAdmins utility', () => {
      expect(io.notifyWorkspaceAdmins).toBeDefined();
      expect(typeof io.notifyWorkspaceAdmins).toBe('function');
    });

    test('should notify workspace successfully', (done) => {
      clientSocket = require('socket.io-client')(`http://localhost:${server.address().port}`, {
        auth: { token: authToken }
      });

      clientSocket.on('connect', () => {
        clientSocket.emit('workspace:join', { workspaceId: testWorkspace._id.toString() });

        setTimeout(() => {
          clientSocket.on('workspace:event', (data) => {
            expect(data.message).toBe('Workspace notification');
            done();
          });

          io.notifyWorkspace(testWorkspace._id, 'workspace:event', { message: 'Workspace notification' });
        }, 100);
      });
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      clientSocket = await createAuthenticatedSocket();
    });

    test('should handle database errors gracefully', (done) => {
      const originalFindById = Workspace.findById;
      Workspace.findById = jest.fn().mockRejectedValue(new Error('Database error'));

      clientSocket.emit('workspace:check-limits', {
        workspaceId: testWorkspace._id.toString()
      });

      clientSocket.on('error', (data) => {
        expect(data.message).toBe('Failed to check workspace limits');
        Workspace.findById = originalFindById;
        done();
      });
    });
  });
});
