const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const { setupTestDB, teardownTestDB, clearDatabase } = require('./helpers/testSetup');
const { createAuthenticatedUser, getAuthHeaders } = require('./helpers/authHelper');
const { createTestReminder, createTestTask, createTestBoard, createTestColumn, createTestWorkspace, createTestProject, createTestSpace } = require('./helpers/testData');
const Reminder = require('../models/Reminder');
const Task = require('../models/Task');
const Board = require('../models/Board');
const Column = require('../models/Column');
const Workspace = require('../models/Workspace');
const Project = require('../models/Project');
const Space = require('../models/Space');

describe('Reminder Endpoints', () => {
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

  describe('POST /api/reminders', () => {
    let authUser;
    let testTask;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
      
      // Create test entities for reminders
      const workspace = await Workspace.create(createTestWorkspace(authUser.user._id));
      const project = await Project.create(createTestProject(authUser.user._id, workspace._id));
      const space = await Space.create(createTestSpace(workspace._id));
      const board = await Board.create(createTestBoard(project._id, space._id));
      const column = await Column.create(createTestColumn(board._id));
      testTask = await Task.create(createTestTask(board._id, column._id, authUser.user._id, {
        project: project._id
      }));
    });

    it('should create a new reminder', async () => {
      const reminderData = {
        title: 'Review task',
        message: 'Please review this task before the deadline',
        entityType: 'task',
        entityId: testTask._id,
        reminderDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        type: 'email'
      };

      const response = await request(app)
        .post('/api/reminders')
        .set(getAuthHeaders(authUser.token))
        .send(reminderData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.reminder.title).toBe(reminderData.title);
      expect(response.body.data.reminder.userId.toString()).toBe(authUser.user.id);
      expect(response.body.data.reminder.entityType).toBe('task');
      expect(response.body.data.reminder.status).toBe('scheduled');
    });

    it('should not create reminder without title', async () => {
      const reminderData = {
        entityType: 'task',
        entityId: testTask._id,
        reminderDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
      };

      await request(app)
        .post('/api/reminders')
        .set(getAuthHeaders(authUser.token))
        .send(reminderData)
        .expect(400);
    });

    it('should not create reminder with past date', async () => {
      const reminderData = {
        title: 'Past reminder',
        entityType: 'task',
        entityId: testTask._id,
        reminderDate: new Date(Date.now() - 24 * 60 * 60 * 1000) // Yesterday
      };

      await request(app)
        .post('/api/reminders')
        .set(getAuthHeaders(authUser.token))
        .send(reminderData)
        .expect(400);
    });

    it('should create recurring reminder', async () => {
      const reminderData = {
        title: 'Daily standup',
        entityType: 'task',
        entityId: testTask._id,
        reminderDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        type: 'both',
        recurring: {
          enabled: true,
          pattern: 'daily',
          frequency: 1,
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      };

      const response = await request(app)
        .post('/api/reminders')
        .set(getAuthHeaders(authUser.token))
        .send(reminderData)
        .expect(201);

      expect(response.body.data.reminder.repeat.enabled).toBe(true);
      expect(response.body.data.reminder.repeat.frequency).toBe('daily');
      expect(response.body.data.reminder.nextOccurrence).toBeDefined();
    });
  });

  describe('GET /api/reminders', () => {
    let authUser;
    let reminders;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
      
      const workspace = await Workspace.create(createTestWorkspace(authUser.user._id));
      const project = await Project.create(createTestProject(authUser.user._id, workspace._id));
      const space = await Space.create(createTestSpace(workspace._id));
      const board = await Board.create(createTestBoard(project._id, space._id));
      const column = await Column.create(createTestColumn(board._id));
      const task = await Task.create(createTestTask(board._id, column._id, authUser.user._id, {
        project: project._id
      }));

      reminders = await Promise.all([
        Reminder.create(createTestReminder(authUser.user._id, task._id, {
          title: 'Urgent reminder',
          priority: 'urgent',
          status: 'scheduled'
        })),
        Reminder.create(createTestReminder(authUser.user._id, task._id, {
          title: 'Normal reminder',
          priority: 'normal',
          status: 'scheduled'
        })),
        Reminder.create(createTestReminder(authUser.user._id, task._id, {
          title: 'Low priority reminder',
          priority: 'low',
          status: 'sent'
        }))
      ]);
    });

    it('should get user reminders', async () => {
      const response = await request(app)
        .get('/api/reminders')
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.reminders).toHaveLength(3);
    });

    it('should filter reminders by status', async () => {
      const response = await request(app)
        .get('/api/reminders?status=scheduled')
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.data.reminders).toHaveLength(2);
      expect(response.body.data.reminders.every(r => r.status === 'scheduled')).toBe(true);
    });

    it('should filter reminders by priority', async () => {
      const response = await request(app)
        .get('/api/reminders?priority=urgent')
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.data.reminders).toHaveLength(1);
      expect(response.body.data.reminders[0].priority).toBe('urgent');
    });

    it('should filter reminders by entity type', async () => {
      const response = await request(app)
        .get('/api/reminders?entityType=task')
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.data.reminders).toHaveLength(3);
    });

    it('should get due reminders', async () => {
      // Update one reminder to be due
      await Reminder.findByIdAndUpdate(reminders[0]._id, {
        scheduledAt: new Date(Date.now() - 10 * 60 * 1000) // 10 minutes ago
      });

      const response = await request(app)
        .get('/api/reminders?isDue=true')
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.data.reminders).toHaveLength(1);
    });
  });

  describe('GET /api/reminders/:id', () => {
    let authUser;
    let reminder;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
      
      const workspace = await Workspace.create(createTestWorkspace(authUser.user._id));
      const project = await Project.create(createTestProject(authUser.user._id, workspace._id));
      const space = await Space.create(createTestSpace(workspace._id));
      const board = await Board.create(createTestBoard(project._id, space._id));
      const column = await Column.create(createTestColumn(board._id));
      const task = await Task.create(createTestTask(board._id, column._id, authUser.user._id, {
        project: project._id
      }));
      
      reminder = await Reminder.create(createTestReminder(authUser.user._id, task._id));
    });

    it('should get reminder by id', async () => {
      const response = await request(app)
        .get(`/api/reminders/${reminder._id}`)
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.reminder._id.toString()).toBe(reminder._id.toString());
    });

    it('should not get reminder of another user', async () => {
      const otherUser = await createAuthenticatedUser(app, { email: 'other@test.com' });

      await request(app)
        .get(`/api/reminders/${reminder._id}`)
        .set(getAuthHeaders(otherUser.token))
        .expect(403);
    });
  });

  describe('PUT /api/reminders/:id', () => {
    let authUser;
    let reminder;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
      
      const workspace = await Workspace.create(createTestWorkspace(authUser.user._id));
      const project = await Project.create(createTestProject(authUser.user._id, workspace._id));
      const space = await Space.create(createTestSpace(workspace._id));
      const board = await Board.create(createTestBoard(project._id, space._id));
      const column = await Column.create(createTestColumn(board._id));
      const task = await Task.create(createTestTask(board._id, column._id, authUser.user._id, {
        project: project._id
      }));
      
      reminder = await Reminder.create(createTestReminder(authUser.user._id, task._id));
    });

    it('should update reminder', async () => {
      const updateData = {
        title: 'Updated reminder title',
        message: 'Updated message',
        priority: 'urgent',
        reminderDate: new Date(Date.now() + 48 * 60 * 60 * 1000) // 2 days from now
      };

      const response = await request(app)
        .put(`/api/reminders/${reminder._id}`)
        .set(getAuthHeaders(authUser.token))
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.reminder.title).toBe(updateData.title);
      expect(response.body.data.reminder.priority).toBe(updateData.priority);
    });

    it('should not update reminder of another user', async () => {
      const otherUser = await createAuthenticatedUser(app, { email: 'other@test.com' });

      const updateData = {
        title: 'Hacked title'
      };

      await request(app)
        .put(`/api/reminders/${reminder._id}`)
        .set(getAuthHeaders(otherUser.token))
        .send(updateData)
        .expect(403);
    });
  });

  describe('PATCH /api/reminders/:id/snooze', () => {
    let authUser;
    let reminder;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
      
      const workspace = await Workspace.create(createTestWorkspace(authUser.user._id));
      const project = await Project.create(createTestProject(authUser.user._id, workspace._id));
      const space = await Space.create(createTestSpace(workspace._id));
      const board = await Board.create(createTestBoard(project._id, space._id));
      const column = await Column.create(createTestColumn(board._id));
      const task = await Task.create(createTestTask(board._id, column._id, authUser.user._id, {
        project: project._id
      }));
      
      reminder = await Reminder.create(createTestReminder(authUser.user._id, task._id));
    });

    it('should snooze reminder', async () => {
      const snoozeData = {
        minutes: 30
      };

      const response = await request(app)
        .patch(`/api/reminders/${reminder._id}/snooze`)
        .set(getAuthHeaders(authUser.token))
        .send(snoozeData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.reminder.status).toBe('snoozed');
      expect(response.body.data.reminder.snoozeInfo.snoozeCount).toBe(1);
      expect(response.body.data.reminder.snoozeInfo.snoozedUntil).toBeDefined();
    });

    it('should not snooze reminder beyond max snoozes', async () => {
      // Snooze to maximum
      reminder.snoozeInfo.snoozeCount = 3; // Assuming max is 3
      await reminder.save();

      const snoozeData = {
        minutes: 15
      };

      await request(app)
        .patch(`/api/reminders/${reminder._id}/snooze`)
        .set(getAuthHeaders(authUser.token))
        .send(snoozeData)
        .expect(400);
    });
  });

  describe('DELETE /api/reminders/:id', () => {
    let authUser;
    let reminder;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
      
      const workspace = await Workspace.create(createTestWorkspace(authUser.user._id));
      const project = await Project.create(createTestProject(authUser.user._id, workspace._id));
      const space = await Space.create(createTestSpace(workspace._id));
      const board = await Board.create(createTestBoard(project._id, space._id));
      const column = await Column.create(createTestColumn(board._id));
      const task = await Task.create(createTestTask(board._id, column._id, authUser.user._id, {
        project: project._id
      }));
      
      reminder = await Reminder.create(createTestReminder(authUser.user._id, task._id));
    });

    it('should delete reminder', async () => {
      const response = await request(app)
        .delete(`/api/reminders/${reminder._id}`)
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify reminder is deleted
      const deletedReminder = await Reminder.findById(reminder._id);
      expect(deletedReminder).toBeNull();
    });

    it('should not delete reminder of another user', async () => {
      const otherUser = await createAuthenticatedUser(app, { email: 'other@test.com' });

      await request(app)
        .delete(`/api/reminders/${reminder._id}`)
        .set(getAuthHeaders(otherUser.token))
        .expect(403);
    });
  });

  describe('GET /api/reminders/stats', () => {
    let authUser;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
      
      const workspace = await Workspace.create(createTestWorkspace(authUser.user._id));
      const project = await Project.create(createTestProject(authUser.user._id, workspace._id));
      const space = await Space.create(createTestSpace(workspace._id));
      const board = await Board.create(createTestBoard(project._id, space._id));
      const column = await Column.create(createTestColumn(board._id));
      const task = await Task.create(createTestTask(board._id, column._id, authUser.user._id, {
        project: project._id
      }));

      await Promise.all([
        Reminder.create(createTestReminder(authUser.user._id, task._id, {
          status: 'scheduled',
          priority: 'urgent'
        })),
        Reminder.create(createTestReminder(authUser.user._id, task._id, {
          status: 'sent',
          priority: 'normal'
        })),
        Reminder.create(createTestReminder(authUser.user._id, task._id, {
          status: 'scheduled',
          priority: 'urgent'
        }))
      ]);
    });

    it('should get reminder statistics', async () => {
      const response = await request(app)
        .get('/api/reminders/stats')
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.stats.total).toBe(3);
      expect(response.body.data.stats.byStatus.scheduled).toBe(2);
      expect(response.body.data.stats.byStatus.sent).toBe(1);
      expect(response.body.data.stats.byPriority.urgent).toBe(2);
      expect(response.body.data.stats.byPriority.normal).toBe(1);
    });
  });
});
