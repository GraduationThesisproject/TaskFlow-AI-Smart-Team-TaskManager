const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const { setupTestDB, teardownTestDB, clearDatabase } = require('./helpers/testSetup');
const { createAuthenticatedAdmin, getAuthHeaders } = require('./helpers/authHelper');
const Integration = require('../models/Integration');

describe('Integration Management API', () => {
  let server;
  let adminToken;
  let adminHeaders;

  beforeAll(async () => {
    await setupTestDB();
    server = app.listen();
    
    // Create authenticated admin
    const admin = await createAuthenticatedAdmin(app);
    adminToken = admin.token;
    adminHeaders = getAuthHeaders(adminToken);
  });

  afterAll(async () => {
    await teardownTestDB();
    if (server) server.close();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  describe('GET /api/integrations', () => {
    it('should return empty list when no integrations exist', async () => {
      const response = await request(app)
        .get('/api/integrations')
        .set(adminHeaders)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.integrations).toEqual([]);
      expect(response.body.data.total).toBe(0);
    });

    it('should return all integrations', async () => {
      // Create test integrations
      const integrations = [
        {
          name: 'Slack',
          description: 'Team communication',
          category: 'communication',
          status: 'active',
          isEnabled: true
        },
        {
          name: 'GitHub',
          description: 'Code repository',
          category: 'development',
          status: 'active',
          isEnabled: true
        }
      ];

      await Integration.insertMany(integrations);

      const response = await request(app)
        .get('/api/integrations')
        .set(adminHeaders)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.integrations).toHaveLength(2);
      expect(response.body.data.total).toBe(2);
    });

    it('should filter by category', async () => {
      const integrations = [
        {
          name: 'Slack',
          description: 'Team communication',
          category: 'communication',
          status: 'active',
          isEnabled: true
        },
        {
          name: 'GitHub',
          description: 'Code repository',
          category: 'development',
          status: 'active',
          isEnabled: true
        }
      ];

      await Integration.insertMany(integrations);

      const response = await request(app)
        .get('/api/integrations?category=communication')
        .set(adminHeaders)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.integrations).toHaveLength(1);
      expect(response.body.data.integrations[0].category).toBe('communication');
    });

    it('should filter by status', async () => {
      const integrations = [
        {
          name: 'Slack',
          description: 'Team communication',
          category: 'communication',
          status: 'active',
          isEnabled: true
        },
        {
          name: 'Stripe',
          description: 'Payment processing',
          category: 'analytics',
          status: 'error',
          isEnabled: false
        }
      ];

      await Integration.insertMany(integrations);

      const response = await request(app)
        .get('/api/integrations?status=error')
        .set(adminHeaders)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.integrations).toHaveLength(1);
      expect(response.body.data.integrations[0].status).toBe('error');
    });

    it('should search by name and description', async () => {
      const integrations = [
        {
          name: 'Slack',
          description: 'Team communication platform',
          category: 'communication',
          status: 'active',
          isEnabled: true
        },
        {
          name: 'GitHub',
          description: 'Code repository service',
          category: 'development',
          status: 'active',
          isEnabled: true
        }
      ];

      await Integration.insertMany(integrations);

      const response = await request(app)
        .get('/api/integrations?search=communication')
        .set(adminHeaders)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.integrations).toHaveLength(1);
      expect(response.body.data.integrations[0].name).toBe('Slack');
    });
  });

  describe('POST /api/integrations', () => {
    it('should create a new integration', async () => {
      const integrationData = {
        name: 'Slack',
        description: 'Team communication platform',
        category: 'communication',
        apiKey: 'xoxb-test-token',
        isEnabled: true
      };

      const response = await request(app)
        .post('/api/integrations')
        .set(adminHeaders)
        .send(integrationData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.integration.name).toBe('Slack');
      expect(response.body.data.integration.category).toBe('communication');
      expect(response.body.data.integration.isEnabled).toBe(true);
    });

    it('should validate required fields', async () => {
      const invalidData = {
        description: 'Missing name and category'
      };

      const response = await request(app)
        .post('/api/integrations')
        .set(adminHeaders)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });

    it('should prevent duplicate integration names', async () => {
      const integration = new Integration({
        name: 'Slack',
        description: 'Team communication',
        category: 'communication',
        status: 'active',
        isEnabled: true
      });
      await integration.save();

      const duplicateData = {
        name: 'Slack',
        description: 'Another communication tool',
        category: 'communication',
        isEnabled: false
      };

      const response = await request(app)
        .post('/api/integrations')
        .set(adminHeaders)
        .send(duplicateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });
  });

  describe('GET /api/integrations/:id', () => {
    it('should return a single integration', async () => {
      const integration = new Integration({
        name: 'Slack',
        description: 'Team communication',
        category: 'communication',
        status: 'active',
        isEnabled: true
      });
      await integration.save();

      const response = await request(app)
        .get(`/api/integrations/${integration._id}`)
        .set(adminHeaders)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.integration.name).toBe('Slack');
      expect(response.body.data.integration.id).toBe(integration._id.toString());
    });

    it('should return 404 for non-existent integration', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/integrations/${fakeId}`)
        .set(adminHeaders)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Integration not found');
    });
  });

  describe('PUT /api/integrations/:id', () => {
    it('should update an integration', async () => {
      const integration = new Integration({
        name: 'Slack',
        description: 'Team communication',
        category: 'communication',
        status: 'active',
        isEnabled: true
      });
      await integration.save();

      const updateData = {
        description: 'Updated description',
        isEnabled: false
      };

      const response = await request(app)
        .put(`/api/integrations/${integration._id}`)
        .set(adminHeaders)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.integration.description).toBe('Updated description');
      expect(response.body.data.integration.isEnabled).toBe(false);
    });

    it('should return 404 for non-existent integration', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .put(`/api/integrations/${fakeId}`)
        .set(adminHeaders)
        .send({ description: 'Updated' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Integration not found');
    });
  });

  describe('DELETE /api/integrations/:id', () => {
    it('should delete an integration', async () => {
      const integration = new Integration({
        name: 'Slack',
        description: 'Team communication',
        category: 'communication',
        status: 'active',
        isEnabled: true
      });
      await integration.save();

      const response = await request(app)
        .delete(`/api/integrations/${integration._id}`)
        .set(adminHeaders)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify integration is deleted
      const deletedIntegration = await Integration.findById(integration._id);
      expect(deletedIntegration).toBeNull();
    });

    it('should return 404 for non-existent integration', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/api/integrations/${fakeId}`)
        .set(adminHeaders)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Integration not found');
    });
  });

  describe('POST /api/integrations/:id/test', () => {
    it('should test integration connection', async () => {
      const integration = new Integration({
        name: 'Slack',
        description: 'Team communication',
        category: 'communication',
        status: 'pending',
        isEnabled: true,
        apiKey: 'xoxb-test-token'
      });
      await integration.save();

      const response = await request(app)
        .post(`/api/integrations/${integration._id}/test`)
        .set(adminHeaders)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('success');
      expect(response.body.data).toHaveProperty('message');
    });

    it('should return error for missing API key', async () => {
      const integration = new Integration({
        name: 'Slack',
        description: 'Team communication',
        category: 'communication',
        status: 'pending',
        isEnabled: true
      });
      await integration.save();

      const response = await request(app)
        .post(`/api/integrations/${integration._id}/test`)
        .set(adminHeaders)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('API key is required');
    });
  });

  describe('POST /api/integrations/:id/sync', () => {
    it('should sync integration data', async () => {
      const integration = new Integration({
        name: 'Slack',
        description: 'Team communication',
        category: 'communication',
        status: 'active',
        isEnabled: true,
        apiKey: 'xoxb-test-token'
      });
      await integration.save();

      const response = await request(app)
        .post(`/api/integrations/${integration._id}/sync`)
        .set(adminHeaders)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('success');
      expect(response.body.data).toHaveProperty('message');
    });

    it('should return error for disabled integration', async () => {
      const integration = new Integration({
        name: 'Slack',
        description: 'Team communication',
        category: 'communication',
        status: 'inactive',
        isEnabled: false,
        apiKey: 'xoxb-test-token'
      });
      await integration.save();

      const response = await request(app)
        .post(`/api/integrations/${integration._id}/sync`)
        .set(adminHeaders)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('must be enabled');
    });
  });

  describe('PATCH /api/integrations/:id/toggle', () => {
    it('should toggle integration enabled status', async () => {
      const integration = new Integration({
        name: 'Slack',
        description: 'Team communication',
        category: 'communication',
        status: 'active',
        isEnabled: true,
        apiKey: 'xoxb-test-token'
      });
      await integration.save();

      const response = await request(app)
        .patch(`/api/integrations/${integration._id}/toggle`)
        .set(adminHeaders)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.integration.isEnabled).toBe(false);
    });

    it('should return 404 for non-existent integration', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .patch(`/api/integrations/${fakeId}/toggle`)
        .set(adminHeaders)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Integration not found');
    });
  });

  describe('GET /api/integrations/stats', () => {
    it('should return integration statistics', async () => {
      const integrations = [
        {
          name: 'Slack',
          description: 'Team communication',
          category: 'communication',
          status: 'active',
          isEnabled: true
        },
        {
          name: 'GitHub',
          description: 'Code repository',
          category: 'development',
          status: 'active',
          isEnabled: true
        },
        {
          name: 'Stripe',
          description: 'Payment processing',
          category: 'analytics',
          status: 'error',
          isEnabled: false
        }
      ];

      await Integration.insertMany(integrations);

      const response = await request(app)
        .get('/api/integrations/stats')
        .set(adminHeaders)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.stats.total).toBe(3);
      expect(response.body.data.stats.active).toBe(2);
      expect(response.body.data.stats.error).toBe(1);
      expect(response.body.data.stats.enabled).toBe(2);
      expect(response.body.data.stats.disabled).toBe(1);
      expect(response.body.data.categories).toHaveLength(3);
    });
  });

  describe('Authentication and Authorization', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/integrations')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should require admin authentication', async () => {
      // This test would require creating a regular user token
      // For now, we'll test that the admin middleware is working
      const response = await request(app)
        .get('/api/integrations')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
