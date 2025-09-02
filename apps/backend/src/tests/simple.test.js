const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const { setupTestDB, teardownTestDB, clearDatabase } = require('./helpers/testSetup');
const { createAuthenticatedUser } = require('./helpers/authHelper');
const { createWorkspaceWithRoles } = require('./helpers/testData');

describe('Simple Test', () => {
  let server;

  beforeAll(async () => {
    await setupTestDB();
    server = app.listen();
  });

  afterAll(async () => {
    await teardownTestDB();
    if (server) server.close();
  });

  it('should create user and workspace', async () => {
    await clearDatabase();
    
    console.log('Test starting...');
    
    try {
      console.log('Creating authenticated user...');
      const authUser = await createAuthenticatedUser(app);
      console.log('User created successfully');
      
      // Check what fields are available
      expect(authUser).toBeDefined();
      expect(authUser.user).toBeDefined();
      expect(authUser.user._id).toBeDefined();
      
      // Now try to create workspace with the correct user ID
      const workspace = await createWorkspaceWithRoles(authUser.user._id);
      expect(workspace).toBeDefined();
      expect(workspace.owner.toString()).toBe(authUser.user._id.toString());
    } catch (error) {
      console.log('Error:', error.message);
      throw error;
    }
  });
});
