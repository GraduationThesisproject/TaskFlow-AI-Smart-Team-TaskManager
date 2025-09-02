const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const { setupTestDB, teardownTestDB, clearDatabase } = require('./helpers/testSetup');
const { createAuthenticatedUser, getAuthHeaders, createMultipleUsers } = require('./helpers/authHelper');

const Notification = require('../models/Notification');

describe('Notification Endpoints', () => {
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

  describe('GET /api/notifications', () => {
    let authUser;
    let notifications;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
      
      // Create test notifications
      notifications = await Promise.all([
        Notification.create({
          recipient: authUser.user._id,
          title: 'Task assigned',
          message: 'You have been assigned a new task',
          type: 'task_assigned',
          priority: 'medium',
          relatedEntity: {
            entityType: 'task',
            entityId: new mongoose.Types.ObjectId()
          }
        }),
        Notification.create({
          recipient: authUser.user._id,
          title: 'Comment added',
          message: 'A new comment was added to your task',
          type: 'comment_added',
          priority: 'low',
          isRead: true,
          relatedEntity: {
            entityType: 'comment',
            entityId: new mongoose.Types.ObjectId()
          }
        }),
        Notification.create({
          recipient: authUser.user._id,
          title: 'Urgent deadline',
          message: 'A task deadline is approaching',
          type: 'deadline_approaching',
          priority: 'urgent',
          relatedEntity: {
            entityType: 'task',
            entityId: new mongoose.Types.ObjectId()
          }
        })
      ]);
    });

    it('should get user notifications', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.notifications).toHaveLength(3);
      expect(response.body.data.unreadCount).toBe(2);
    });

    it('should filter notifications by read status', async () => {
      const response = await request(app)
        .get('/api/notifications?isRead=false')
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.data.notifications).toHaveLength(2);
      expect(response.body.data.notifications.every(n => !n.isRead)).toBe(true);
    });

    it('should filter notifications by type', async () => {
      const response = await request(app)
        .get('/api/notifications?type=task_assigned')
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.data.notifications).toHaveLength(1);
      expect(response.body.data.notifications[0].type).toBe('task_assigned');
    });

    it('should filter notifications by priority', async () => {
      const response = await request(app)
        .get('/api/notifications?priority=urgent')
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.data.notifications).toHaveLength(1);
      expect(response.body.data.notifications[0].priority).toBe('urgent');
    });

    it('should paginate notifications', async () => {
      const response = await request(app)
        .get('/api/notifications?page=1&limit=2')
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.data.notifications).toHaveLength(2);
      expect(response.body.data.pagination.totalItems).toBe(3);
      expect(response.body.data.pagination.currentPage).toBe(1);
    });

    it('should not get notifications without authentication', async () => {
      await request(app)
        .get('/api/notifications')
        .expect(401);
    });
  });

  describe('PATCH /api/notifications/:id/read', () => {
    let authUser;
    let notification;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
      notification = await Notification.create({
        recipient: authUser.user._id,
        title: 'Test Notification',
        message: 'This is a test notification',
        type: 'task_assigned',
        priority: 'medium',
        relatedEntity: {
          entityType: 'task',
          entityId: new mongoose.Types.ObjectId()
        }
      });
    });

    it('should mark notification as read', async () => {
      const response = await request(app)
        .patch(`/api/notifications/${notification._id}/read`)
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.notification.isRead).toBe(true);
      expect(response.body.data.notification.readAt).toBeDefined();
    });

    it('should not mark others notification as read', async () => {
      const otherUser = await createAuthenticatedUser(app, { email: 'other@test.com' });

      await request(app)
        .patch(`/api/notifications/${notification._id}/read`)
        .set(getAuthHeaders(otherUser.token))
        .expect(403);
    });

    it('should return 404 for non-existent notification', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      await request(app)
        .patch(`/api/notifications/${fakeId}/read`)
        .set(getAuthHeaders(authUser.token))
        .expect(404);
    });
  });

  describe('POST /api/notifications/mark-all-read', () => {
    let authUser;
    let notifications;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
      
      notifications = await Promise.all([
        Notification.create({
          recipient: authUser.user._id,
          title: 'Test Notification 1',
          message: 'This is test notification 1',
          type: 'task_assigned',
          priority: 'medium',
          relatedEntity: {
            entityType: 'task',
            entityId: new mongoose.Types.ObjectId()
          }
        }),
        Notification.create({
          recipient: authUser.user._id,
          title: 'Test Notification 2',
          message: 'This is test notification 2',
          type: 'comment_added',
          priority: 'low',
          relatedEntity: {
            entityType: 'comment',
            entityId: new mongoose.Types.ObjectId()
          }
        }),
        Notification.create({
          recipient: authUser.user._id,
          title: 'Test Notification 3',
          message: 'This is test notification 3',
          type: 'deadline_approaching',
          priority: 'high',
          relatedEntity: {
            entityType: 'task',
            entityId: new mongoose.Types.ObjectId()
          }
        })
      ]);
    });

    it('should mark all notifications as read', async () => {
      const response = await request(app)
        .post('/api/notifications/mark-all-read')
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.modifiedCount).toBe(3);

      // Verify all notifications are marked as read
      const updatedNotifications = await Notification.find({ recipient: authUser.user._id });
      expect(updatedNotifications.every(n => n.isRead)).toBe(true);
    });

    it('should only mark current user notifications as read', async () => {
      const [otherUser] = await createMultipleUsers(app, 1);
      await Notification.create({
        recipient: otherUser.user._id,
        title: 'Other User Notification',
        message: 'This is a notification for another user',
        type: 'task_assigned',
        priority: 'medium',
        relatedEntity: {
          entityType: 'task',
          entityId: new mongoose.Types.ObjectId()
        }
      });

      const response = await request(app)
        .post('/api/notifications/mark-all-read')
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.data.modifiedCount).toBe(3); // Only auth user's notifications

      // Verify other user's notification is still unread
      const otherUserNotification = await Notification.findOne({ recipient: otherUser.user._id });
      expect(otherUserNotification.isRead).toBe(false);
    });
  });

  describe('DELETE /api/notifications/:id', () => {
    let authUser;
    let notification;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
      notification = await Notification.create({
        recipient: authUser.user._id,
        title: 'Test Notification',
        message: 'This is a test notification',
        type: 'task_assigned',
        priority: 'medium',
        relatedEntity: {
          entityType: 'task',
          entityId: new mongoose.Types.ObjectId()
        }
      });
    });

    it('should delete notification', async () => {
      const response = await request(app)
        .delete(`/api/notifications/${notification._id}`)
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify notification is deleted
      const deletedNotification = await Notification.findById(notification._id);
      expect(deletedNotification).toBeNull();
    });

    it('should not delete others notification', async () => {
      const otherUser = await createAuthenticatedUser(app, { email: 'other@test.com' });

      await request(app)
        .delete(`/api/notifications/${notification._id}`)
        .set(getAuthHeaders(otherUser.token))
        .expect(403);
    });
  });

  describe('POST /api/notifications/clear-read', () => {
    let authUser;
    let notifications;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
      
      notifications = await Promise.all([
        Notification.create({
          recipient: authUser.user._id,
          title: 'Read Notification 1',
          message: 'This is a read notification',
          type: 'task_assigned',
          priority: 'medium',
          isRead: true,
          relatedEntity: {
            entityType: 'task',
            entityId: new mongoose.Types.ObjectId()
          }
        }),
        Notification.create({
          recipient: authUser.user._id,
          title: 'Read Notification 2',
          message: 'This is another read notification',
          type: 'comment_added',
          priority: 'low',
          isRead: true,
          relatedEntity: {
            entityType: 'comment',
            entityId: new mongoose.Types.ObjectId()
          }
        }),
        Notification.create({
          recipient: authUser.user._id,
          title: 'Unread Notification',
          message: 'This is an unread notification',
          type: 'deadline_approaching',
          priority: 'high',
          isRead: false,
          relatedEntity: {
            entityType: 'task',
            entityId: new mongoose.Types.ObjectId()
          }
        })
      ]);
    });

    it('should clear all read notifications', async () => {
      const response = await request(app)
        .post('/api/notifications/clear-read')
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.deletedCount).toBe(2);

      // Verify only unread notification remains
      const remainingNotifications = await Notification.find({ recipient: authUser.user._id });
      expect(remainingNotifications).toHaveLength(1);
      expect(remainingNotifications[0].isRead).toBe(false);
    });
  });

  describe('GET /api/notifications/stats', () => {
    let authUser;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
      
      await Promise.all([
        Notification.create({
          recipient: authUser.user._id,
          title: 'Urgent Task Assignment',
          message: 'You have an urgent task assigned',
          type: 'task_assigned',
          priority: 'urgent',
          isRead: false,
          relatedEntity: {
            entityType: 'task',
            entityId: new mongoose.Types.ObjectId()
          }
        }),
        Notification.create({
          recipient: authUser.user._id,
          title: 'Comment Added',
          message: 'A comment was added to your task',
          type: 'comment_added',
          priority: 'medium',
          isRead: true,
          relatedEntity: {
            entityType: 'comment',
            entityId: new mongoose.Types.ObjectId()
          }
        }),
        Notification.create({
          recipient: authUser.user._id,
          title: 'Deadline Approaching',
          message: 'A task deadline is approaching',
          type: 'deadline_approaching',
          priority: 'urgent',
          isRead: false,
          relatedEntity: {
            entityType: 'task',
            entityId: new mongoose.Types.ObjectId()
          }
        })
      ]);
    });

    it('should get notification statistics', async () => {
      const response = await request(app)
        .get('/api/notifications/stats')
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.stats.total).toBe(3);
      expect(response.body.data.stats.unread).toBe(2);
      expect(response.body.data.stats.byType.task_assigned).toBe(1);
      expect(response.body.data.stats.byType.comment_added).toBe(1);
      expect(response.body.data.stats.byType.deadline_approaching).toBe(1);
      expect(response.body.data.stats.byPriority.urgent).toBe(2);
      expect(response.body.data.stats.byPriority.medium).toBe(1);
    });
  });
});
