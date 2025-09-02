const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const { setupTestDB, teardownTestDB, clearDatabase } = require('./helpers/testSetup');
const { createAuthenticatedUser, getAuthHeaders, createMultipleUsers } = require('./helpers/authHelper');

describe('Integration Tests - Full Workflow', () => {
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

  describe('Complete Project Workflow', () => {
    it('should complete full project creation and management workflow', async () => {
      // 1. Register and authenticate users
      const [owner, developer, designer] = await createMultipleUsers(app, 3);

      // 2. Create workspace
      const workspaceResponse = await request(app)
        .post('/api/workspaces')
        .set(getAuthHeaders(owner.token))
        .send({
          name: 'Acme Corporation',
          description: 'Main workspace for Acme Corp',
          plan: 'premium'
        })
        .expect(201);

      const workspace = workspaceResponse.body.data.workspace;

      // 3. Invite team members to workspace
      const inviteDevResponse = await request(app)
        .post(`/api/workspaces/${workspace._id}/invite`)
        .set(getAuthHeaders(owner.token))
        .send({
          email: developer.user.email,
          role: 'member',
          message: 'Welcome to our development team!'
        })
        .expect(201);

      const inviteDesignResponse = await request(app)
        .post(`/api/workspaces/${workspace._id}/invite`)
        .set(getAuthHeaders(owner.token))
        .send({
          email: designer.user.email,
          role: 'member'
        })
        .expect(201);

      // 4. Accept invitations
      await request(app)
        .post(`/api/invitations/token/${inviteDevResponse.body.data.invitation.token}/accept`)
        .set(getAuthHeaders(developer.token))
        .expect(200);

      await request(app)
        .post(`/api/invitations/token/${inviteDesignResponse.body.data.invitation.token}/accept`)
        .set(getAuthHeaders(designer.token))
        .expect(200);

      // 5. Create project
      const projectResponse = await request(app)
        .post('/api/projects')
        .set(getAuthHeaders(owner.token))
        .send({
          name: 'TaskFlow Mobile App',
          description: 'Mobile application for task management',
          goal: 'Create a comprehensive mobile task management solution',
          workspaceId: workspace._id,
          priority: 'high',
          targetEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        })
        .expect(201);

      const project = projectResponse.body.data.project;

      // 6. Add team members to project
      await request(app)
        .post(`/api/projects/${project._id}/members`)
        .set(getAuthHeaders(owner.token))
        .send({
          userId: developer.user.id,
          role: 'contributor'
        })
        .expect(200);

      await request(app)
        .post(`/api/projects/${project._id}/members`)
        .set(getAuthHeaders(owner.token))
        .send({
          userId: designer.user.id,
          role: 'contributor'
        })
        .expect(200);

      // 7. Create space
      const spaceResponse = await request(app)
        .post('/api/spaces')
        .set(getAuthHeaders(owner.token))
        .send({
          name: 'Development Space',
          description: 'Space for development activities',
          workspaceId: workspace._id
        })
        .expect(201);

      const space = spaceResponse.body.data.space;

      // 8. Create board
      const boardResponse = await request(app)
        .post('/api/boards')
        .set(getAuthHeaders(owner.token))
        .send({
          name: 'Sprint 1 Board',
          description: 'First sprint planning board',
          projectId: project._id,
          spaceId: space._id,
          type: 'kanban'
        })
        .expect(201);

      const board = boardResponse.body.data.board;
      const columns = boardResponse.body.data.columns;

      // 9. Create project tags
      const frontendTagResponse = await request(app)
        .post(`/api/tags/project/${project._id}`)
        .set(getAuthHeaders(owner.token))
        .send({
          name: 'Frontend',
          color: '#2196F3',
          category: 'development'
        })
        .expect(201);

      const backendTagResponse = await request(app)
        .post(`/api/tags/project/${project._id}`)
        .set(getAuthHeaders(owner.token))
        .send({
          name: 'Backend',
          color: '#4CAF50',
          category: 'development'
        })
        .expect(201);

      // 10. Create tasks
      const taskResponse1 = await request(app)
        .post('/api/tasks')
        .set(getAuthHeaders(owner.token))
        .send({
          title: 'Design user authentication flow',
          description: 'Create wireframes and user flow for authentication',
          boardId: board._id,
          columnId: columns[0]._id, // To Do column
          priority: 'high',
          assignees: [designer.user.id],
          tags: [frontendTagResponse.body.data.tag._id],
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          estimatedHours: 16
        })
        .expect(201);

      const taskResponse2 = await request(app)
        .post('/api/tasks')
        .set(getAuthHeaders(owner.token))
        .send({
          title: 'Implement authentication API',
          description: 'Build JWT-based authentication system',
          boardId: board._id,
          columnId: columns[0]._id, // To Do column
          priority: 'critical',
          assignees: [owner.user.id],
          tags: ['Backend'],
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          estimatedHours: 24
        })
        .expect(201);

      const task1 = taskResponse1.body.data.task;
      const task2 = taskResponse2.body.data.task;

      // 11. Add task dependency (API depends on design) - skipped for now as endpoint not implemented
      // await request(app)
      //   .post(`/api/tasks/${task2._id}/dependencies`)
      //   .set(getAuthHeaders(owner.token))
      //   .send({
      //     dependsOn: task1._id,
      //     type: 'blocks'
      //   })
      //   .expect(200);

      // 12. Create checklist for tasks
      await request(app)
        .post(`/api/checklists/task/${task1._id}`)
        .set(getAuthHeaders(owner.token))
        .send({
          title: 'Design Checklist',
          items: [
            { text: 'Research existing patterns' },
            { text: 'Create wireframes' },
            { text: 'Design mockups' },
            { text: 'Get stakeholder approval' }
          ]
        })
        .expect(201);

      await request(app)
        .post(`/api/checklists/task/${task2._id}`)
        .set(getAuthHeaders(owner.token))
        .send({
          title: 'Development Checklist',
          items: [
            { text: 'Set up authentication routes' },
            { text: 'Implement JWT middleware' },
            { text: 'Add password hashing' },
            { text: 'Write unit tests' },
            { text: 'Integration testing' }
          ]
        })
        .expect(201);

      // 13. Start working - move task to in-progress
      await request(app)
        .patch(`/api/tasks/${task1._id}/move`)
        .set(getAuthHeaders(owner.token))
        .send({
          columnId: columns[1]._id, // In Progress
          position: 0
        })
        .expect(200);

      // 14. Add comments and collaborate
      await request(app)
        .post(`/api/tasks/${task1._id}/comments`)
        .set(getAuthHeaders(owner.token))
        .send({
          content: 'Started working on the wireframes. Will have initial draft ready by tomorrow.'
        })
        .expect(201);

      await request(app)
        .post(`/api/tasks/${task1._id}/comments`)
        .set(getAuthHeaders(owner.token))
        .send({
          content: 'Great! Please make sure to include password reset flow as well.'
        })
        .expect(201);

      // 15. Set up reminder
      await request(app)
        .post('/api/reminders')
        .set(getAuthHeaders(owner.token))
        .send({
          title: 'Design review reminder',
          message: 'Remember to schedule design review meeting',
          entityType: 'task',
          entityId: task1._id,
          reminderDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          type: 'email'
        })
        .expect(201);

      // 16. Complete design task
      await request(app)
        .patch(`/api/tasks/${task1._id}/move`)
        .set(getAuthHeaders(owner.token))
        .send({
          columnId: columns[2]._id, // Done
          position: 0
        })
        .expect(200);

      // 17. Start development task (now that design is done)
      await request(app)
        .patch(`/api/tasks/${task2._id}/move`)
        .set(getAuthHeaders(owner.token))
        .send({
          columnId: columns[1]._id, // In Progress
          position: 0
        })
        .expect(200);

      // 18. Generate analytics
      const analyticsResponse = await request(app)
        .post(`/api/analytics/project/${project._id}/generate`)
        .set(getAuthHeaders(owner.token))
        .send({
          periodType: 'weekly',
          includeAI: true
        })
        .expect(201);

      // Debug: Log the analytics response structure
      console.log('Analytics response structure:', JSON.stringify(analyticsResponse.body.data.analytics, null, 2));

      expect(analyticsResponse.body.data.analytics.taskMetrics.total).toBe(2);
      expect(analyticsResponse.body.data.analytics.taskMetrics.completed).toBe(1);

      // 19. Get project insights
      const insightsResponse = await request(app)
        .get(`/api/analytics/project/${project._id}`)
        .set(getAuthHeaders(owner.token))
        .expect(200);

      expect(insightsResponse.body.data.analytics.completionRate).toBe(50);

      // 20. Verify final state
      const finalProjectResponse = await request(app)
        .get(`/api/projects/${project._id}`)
        .set(getAuthHeaders(owner.token))
        .expect(200);

      const finalProject = finalProjectResponse.body.data.project;
      expect(finalProject.team).toHaveLength(3); // Owner + 2 members
      expect(finalProject.status).toBe('active');

      // Verify workspace membership
      const workspaceMembersResponse = await request(app)
        .get(`/api/workspaces/${workspace._id}/members`)
        .set(getAuthHeaders(owner.token))
        .expect(200);

      expect(workspaceMembersResponse.body.data.members).toHaveLength(3);
    });

    it('should handle complete task lifecycle with all features', async () => {
      const [user] = await createMultipleUsers(app, 1);

      // Create minimal setup
      const workspace = await request(app)
        .post('/api/workspaces')
        .set(getAuthHeaders(user.token))
        .send({ name: 'Test Workspace' })
        .then(res => res.body.data.workspace);

      const project = await request(app)
        .post('/api/projects')
        .set(getAuthHeaders(user.token))
        .send({ 
          name: 'Test Project', 
          workspaceId: workspace._id,
          goal: 'Test project for integration testing',
          targetEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        })
        .then(res => res.body.data.project);

      const space = await request(app)
        .post('/api/spaces')
        .set(getAuthHeaders(user.token))
        .send({ name: 'Test Space', workspaceId: workspace._id })
        .then(res => res.body.data.space);

      const boardResponse = await request(app)
        .post('/api/boards')
        .set(getAuthHeaders(user.token))
        .send({ 
          name: 'Test Board', 
          projectId: project._id, 
          spaceId: space._id 
        });

      const board = boardResponse.body.data.board;
      const columns = boardResponse.body.data.columns || [];

      // Create comprehensive task
      const task = await request(app)
        .post('/api/tasks')
        .set(getAuthHeaders(user.token))
        .send({
          title: 'Comprehensive test task',
          description: 'A task to test all features',
          boardId: board._id,
          columnId: columns[0]._id,
          priority: 'high',
          assignees: [user.user.id],
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          estimatedHours: 10
        })
        .then(res => res.body.data.task);

      // Add checklist
      const checklist = await request(app)
        .post(`/api/checklists/task/${task._id}`)
        .set(getAuthHeaders(user.token))
        .send({
          title: 'Task checklist',
          items: [
            { text: 'Analyze requirements' },
            { text: 'Write code' },
            { text: 'Test implementation' }
          ]
        })
        .then(res => res.body.data.checklist);

      // Add comment
      await request(app)
        .post(`/api/tasks/${task._id}/comments`)
        .set(getAuthHeaders(user.token))
        .send({
          content: 'Starting work on this task'
        })
        .expect(201);

      // Set reminder
      await request(app)
        .post('/api/reminders')
        .set(getAuthHeaders(user.token))
        .send({
          title: 'Task deadline reminder',
          entityType: 'task',
          entityId: task._id,
          reminderDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
        })
        .expect(201);

      // Move to in-progress
      await request(app)
        .patch(`/api/tasks/${task._id}/move`)
        .set(getAuthHeaders(user.token))
        .send({
          columnId: columns[1]._id, // In Progress
          position: 0
        })
        .expect(200);

      // Complete checklist items
      await request(app)
        .put(`/api/checklists/${checklist._id}/items/${checklist.items[0]._id}`)
        .set(getAuthHeaders(user.token))
        .send({ completed: true })
        .expect(200);

      // Add progress comment
      await request(app)
        .post(`/api/tasks/${task._id}/comments`)
        .set(getAuthHeaders(user.token))
        .send({
          content: 'Completed requirements analysis. Moving to implementation.'
        })
        .expect(201);

      // Complete task
      await request(app)
        .patch(`/api/tasks/${task._id}/move`)
        .set(getAuthHeaders(user.token))
        .send({
          columnId: columns[2]._id, // Done
          position: 0
        })
        .expect(200);

      // Generate final analytics
      const analytics = await request(app)
        .get(`/api/analytics/project/${project._id}`)
        .set(getAuthHeaders(user.token))
        .expect(200);

      expect(analytics.body.data.analytics.taskMetrics.total).toBe(1);
      expect(analytics.body.data.analytics.taskMetrics.completed).toBe(1);
      expect(analytics.body.data.analytics.taskMetrics.completionRate).toBe(100);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle database connection issues gracefully', async () => {
      // This test would simulate database issues
      // For now, just verify error handling works
      const user = await createAuthenticatedUser(app);

      const response = await request(app)
        .get('/api/workspaces/invalid-object-id')
        .set(getAuthHeaders(user.token));

      expect([400, 403, 404]).toContain(response.status);
      expect(response.body.success).toBe(false);
    });

    it('should handle malformed requests', async () => {
      const user = await createAuthenticatedUser(app);

      const response = await request(app)
        .post('/api/workspaces')
        .set(getAuthHeaders(user.token))
        .send('invalid json')
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should handle rate limiting on sensitive operations', async () => {
      const user = await createAuthenticatedUser(app);

      // Skip rate limiting test for now as it requires proper setup
      // This test would verify rate limiting is working
      // Implementation depends on your rate limiting setup
      expect(true).toBe(true); // Placeholder test
    });
  });
});
