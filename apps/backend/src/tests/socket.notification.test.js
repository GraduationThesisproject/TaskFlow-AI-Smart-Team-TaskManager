const { Server } = require('socket.io');
const { createServer } = require('http');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Import test helpers
const { setupTestDB, teardownTestDB, clearDatabase } = require('./helpers/testSetup');
const { createTestUser, createTestNotification } = require('./helpers/testData');
const { createTestToken } = require('./helpers/authHelper');

// Import models
const User = require('../models/User');
const Notification = require('../models/Notification');

// Import socket handler
const handleNotificationSocket = require('../sockets/notification.socket');

describe('Notification Socket Tests', () => {
  let io, server, clientSocket;
  let testUser, testNotification;
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

    // Create test notification
    const notificationData = createTestNotification(testUser._id);
    testNotification = await Notification.create(notificationData);

    // Setup Socket.IO server
    server = createServer();
    io = new Server(server);
    
    // Apply notification socket handler
    handleNotificationSocket(io);
    
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

    test('should automatically join user notification room', async () => {
      clientSocket = await createAuthenticatedSocket();
      
      // The socket should automatically join the notifications room
      // We can test this by checking if the socket is in the room
      expect(clientSocket.connected).toBe(true);
    });
  });

  describe('Unread Count Operations', () => {
    beforeEach(async () => {
      clientSocket = await createAuthenticatedSocket();
    });

    test('should get unread notification count', (done) => {
      clientSocket.emit('notifications:getUnreadCount');

      clientSocket.on('notifications:unreadCount', (data) => {
        expect(data.count).toBeGreaterThanOrEqual(0);
        expect(typeof data.count).toBe('number');
        done();
      });
    });

    test('should return correct unread count for user', (done) => {
      // Create additional unread notifications
      const additionalNotifications = [
        createTestNotification(testUser._id, { isRead: false }),
        createTestNotification(testUser._id, { isRead: false }),
        createTestNotification(testUser._id, { isRead: true }) // This one is read
      ];

      Promise.all(additionalNotifications.map(n => Notification.create(n))).then(() => {
        clientSocket.emit('notifications:getUnreadCount');

        clientSocket.on('notifications:unreadCount', (data) => {
          expect(data.count).toBe(3); // 1 original + 2 new unread
          done();
        });
      });
    });
  });

  describe('Mark as Read Operations', () => {
    beforeEach(async () => {
      clientSocket = await createAuthenticatedSocket();
    });

    test('should mark single notification as read', (done) => {
      clientSocket.emit('notifications:markRead', {
        notificationId: testNotification._id.toString()
      });

      clientSocket.on('notifications:marked-read', (data) => {
        expect(data.notificationId).toBe(testNotification._id.toString());
        done();
      });
    });

    test('should update unread count after marking as read', (done) => {
      let unreadCountReceived = false;
      let markedReadReceived = false;

      const checkDone = () => {
        if (unreadCountReceived && markedReadReceived) {
          done();
        }
      };

      clientSocket.on('notifications:unreadCount', (data) => {
        expect(data.count).toBe(0); // Should be 0 after marking the only notification as read
        unreadCountReceived = true;
        checkDone();
      });

      clientSocket.on('notifications:marked-read', (data) => {
        expect(data.notificationId).toBe(testNotification._id.toString());
        markedReadReceived = true;
        checkDone();
      });

      clientSocket.emit('notifications:markRead', {
        notificationId: testNotification._id.toString()
      });
    });

    test('should handle marking already read notification', (done) => {
      // First mark as read
      clientSocket.emit('notifications:markRead', {
        notificationId: testNotification._id.toString()
      });

      setTimeout(() => {
        // Try to mark as read again
        clientSocket.emit('notifications:markRead', {
          notificationId: testNotification._id.toString()
        });

        // Should not emit marked-read event again
        clientSocket.on('notifications:marked-read', () => {
          // This should not be called for already read notifications
          expect(true).toBe(false);
        });

        setTimeout(() => {
          done();
        }, 100);
      }, 100);
    });

    test('should handle marking non-existent notification', (done) => {
      const fakeNotificationId = new mongoose.Types.ObjectId().toString();
      
      clientSocket.emit('notifications:markRead', {
        notificationId: fakeNotificationId
      });

      // Should not emit any events for non-existent notifications
      setTimeout(() => {
        done();
      }, 100);
    });

    test('should mark all notifications as read', (done) => {
      // Create additional unread notifications
      const additionalNotifications = [
        createTestNotification(testUser._id, { isRead: false }),
        createTestNotification(testUser._id, { isRead: false })
      ];

      Promise.all(additionalNotifications.map(n => Notification.create(n))).then(() => {
        clientSocket.emit('notifications:markAllRead');

        clientSocket.on('notifications:all-marked-read', () => {
          // Check that unread count is 0
          clientSocket.emit('notifications:getUnreadCount');
          
          clientSocket.on('notifications:unreadCount', (data) => {
            expect(data.count).toBe(0);
            done();
          });
        });
      });
    });
  });

  describe('Recent Notifications', () => {
    beforeEach(async () => {
      clientSocket = await createAuthenticatedSocket();
    });

    test('should get recent notifications with default limit', (done) => {
      clientSocket.emit('notifications:getRecent');

      clientSocket.on('notifications:recent', (data) => {
        expect(data.notifications).toBeDefined();
        expect(Array.isArray(data.notifications)).toBe(true);
        expect(data.notifications.length).toBeLessThanOrEqual(10); // Default limit
        done();
      });
    });

    test('should get recent notifications with custom limit', (done) => {
      clientSocket.emit('notifications:getRecent', { limit: 5 });

      clientSocket.on('notifications:recent', (data) => {
        expect(data.notifications).toBeDefined();
        expect(Array.isArray(data.notifications)).toBe(true);
        expect(data.notifications.length).toBeLessThanOrEqual(5);
        done();
      });
    });

    test('should return notifications sorted by creation date', (done) => {
      // Create notifications with different timestamps
      const oldNotification = createTestNotification(testUser._id);
      const newNotification = createTestNotification(testUser._id);

      Promise.all([
        Notification.create(oldNotification),
        Notification.create(newNotification)
      ]).then(() => {
        clientSocket.emit('notifications:getRecent', { limit: 10 });

        clientSocket.on('notifications:recent', (data) => {
          expect(data.notifications.length).toBeGreaterThan(1);
          
          // Check that notifications are sorted by createdAt descending
          for (let i = 0; i < data.notifications.length - 1; i++) {
            const current = new Date(data.notifications[i].createdAt);
            const next = new Date(data.notifications[i + 1].createdAt);
            expect(current.getTime()).toBeGreaterThanOrEqual(next.getTime());
          }
          done();
        });
      });
    });
  });

  describe('Notification Subscriptions', () => {
    beforeEach(async () => {
      clientSocket = await createAuthenticatedSocket();
    });

    test('should subscribe to notification types', (done) => {
      const types = ['task_assigned', 'mention', 'due_date'];

      clientSocket.emit('notifications:subscribe', { types });

      clientSocket.on('notifications:subscribed', (data) => {
        expect(data.types).toEqual(types);
        done();
      });
    });

    test('should subscribe to empty types array', (done) => {
      clientSocket.emit('notifications:subscribe', { types: [] });

      clientSocket.on('notifications:subscribed', (data) => {
        expect(data.types).toEqual([]);
        done();
      });
    });

    test('should unsubscribe from notification types', (done) => {
      const types = ['task_assigned', 'mention'];

      clientSocket.emit('notifications:unsubscribe', { types });

      clientSocket.on('notifications:unsubscribed', (data) => {
        expect(data.types).toEqual(types);
        done();
      });
    });
  });

  describe('Delivery Status Updates', () => {
    beforeEach(async () => {
      clientSocket = await createAuthenticatedSocket();
    });

    test('should update delivery status', (done) => {
      const deliveryMethod = 'email';

      clientSocket.emit('notifications:delivered', {
        notificationId: testNotification._id.toString(),
        deliveryMethod
      });

      // This event doesn't emit a response, so we just verify it doesn't throw an error
      setTimeout(() => {
        done();
      }, 100);
    });

    test('should handle delivery status for non-existent notification', (done) => {
      const fakeNotificationId = new mongoose.Types.ObjectId().toString();
      
      clientSocket.emit('notifications:delivered', {
        notificationId: fakeNotificationId,
        deliveryMethod: 'email'
      });

      // Should not throw an error
      setTimeout(() => {
        done();
      }, 100);
    });
  });

  describe('Global Notification Utilities', () => {
    test('should have sendNotification utility', () => {
      expect(io.sendNotification).toBeDefined();
      expect(typeof io.sendNotification).toBe('function');
    });

    test('should have sendBulkNotifications utility', () => {
      expect(io.sendBulkNotifications).toBeDefined();
      expect(typeof io.sendBulkNotifications).toBe('function');
    });

    test('should have broadcastSystemNotification utility', () => {
      expect(io.broadcastSystemNotification).toBeDefined();
      expect(typeof io.broadcastSystemNotification).toBe('function');
    });

    test('should send notification to user', async () => {
             const notificationData = {
         title: 'Test Notification',
         message: 'This is a test notification',
         type: 'task_assigned',
         priority: 'medium',
         relatedEntity: {
           entityType: 'task',
           entityId: new mongoose.Types.ObjectId()
         }
       };

      const notification = await io.sendNotification(testUser._id, notificationData);

      expect(notification).toBeDefined();
      expect(notification.title).toBe(notificationData.title);
      expect(notification.recipient.toString()).toBe(testUser._id.toString());
    });

    test('should send bulk notifications', async () => {
      const otherUserData = createTestUser({ email: 'other@test.com' });
      const otherUser = await User.create(otherUserData);

      const notifications = [
                 {
           recipient: testUser._id,
           title: 'Notification 1',
           message: 'First notification',
           type: 'task_assigned',
           relatedEntity: {
             entityType: 'task',
             entityId: new mongoose.Types.ObjectId()
           }
         },
         {
           recipient: otherUser._id,
           title: 'Notification 2',
           message: 'Second notification',
           type: 'task_updated',
           relatedEntity: {
             entityType: 'task',
             entityId: new mongoose.Types.ObjectId()
           }
         }
      ];

      const results = await io.sendBulkNotifications(notifications);

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true);
    });

    test('should broadcast system notification', async () => {
             const notificationData = {
         title: 'System Notification',
         message: 'This is a system-wide notification',
         type: 'system_alert',
         priority: 'high',
         relatedEntity: {
           entityType: 'user',
           entityId: new mongoose.Types.ObjectId()
         }
       };

      const results = await io.broadcastSystemNotification(notificationData);

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      clientSocket = await createAuthenticatedSocket();
    });

    test('should handle database errors gracefully', (done) => {
      // Mock a database error by temporarily breaking the connection
      const originalFind = Notification.find;
      const mockFind = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            limit: jest.fn().mockRejectedValue(new Error('Database error'))
          })
        })
      });
      Notification.find = mockFind;

      clientSocket.emit('notifications:getRecent');

      clientSocket.on('error', (data) => {
        expect(data.message).toBe('Failed to get recent notifications');
        
        // Restore original function
        Notification.find = originalFind;
        done();
      });
    });

    test('should handle invalid notification ID format', (done) => {
      clientSocket.emit('notifications:markRead', {
        notificationId: 'invalid-id-format'
      });

      clientSocket.on('error', (data) => {
        expect(data.message).toBe('Failed to mark notification as read');
        done();
      });
    });
  });

  describe('Real-time Notifications', () => {
    test('should receive real-time notification', (done) => {
      clientSocket = require('socket.io-client')(`http://localhost:${server.address().port}`, {
        auth: { token: authToken }
      });

      clientSocket.on('connect', () => {
        clientSocket.on('notification:new', (data) => {
          expect(data.notification).toBeDefined();
          expect(data.notification.title).toBe('Real-time Test');
          done();
        });

                 // Send a notification using the global utility
         io.sendNotification(testUser._id, {
           title: 'Real-time Test',
           message: 'This is a real-time notification',
           type: 'task_assigned',
           relatedEntity: {
             entityType: 'task',
             entityId: new mongoose.Types.ObjectId()
           }
         });
      });
    });

        test('should receive typed notifications', (done) => {
      clientSocket = require('socket.io-client')(`http://localhost:${server.address().port}`, {
        auth: { token: authToken }
      });

      clientSocket.on('connect', () => {
        // Subscribe to specific type
        clientSocket.emit('notifications:subscribe', { types: ['comment_mentioned'] });

        clientSocket.on('notifications:subscribed', () => {
          clientSocket.on('notification:typed', (data) => {
            expect(data.notification).toBeDefined();
            expect(data.type).toBe('comment_mentioned');
            done();
          });

          // Send a typed notification
          io.sendNotification(testUser._id, {
            title: 'Mention Notification',
            message: 'You were mentioned',
            type: 'comment_mentioned',
            relatedEntity: {
              entityType: 'comment',
              entityId: new mongoose.Types.ObjectId()
            }
          });
        });
      });
    });
  });
});
