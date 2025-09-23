const request = require('supertest');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const { createTestUser } = require('./testData');

// Create authenticated user and return token
const createAuthenticatedUser = async (app, userData = {}) => {
  const testUserData = createTestUser(userData);
  
  const response = await request(app)
    .post('/api/auth/register')
    .send(testUserData);
    
  if (response.status !== 201) {
    throw new Error(`Failed to create user: ${response.body.message}`);
  }
  
  // Normalize user object to include "id" alias for _id
  const apiUser = response.body.data.user || {};
  const normalizedUser = { ...apiUser, id: apiUser._id };
  
  return {
    user: normalizedUser,
    token: response.body.data.token,
    password: testUserData.password
  };
};

// Create multiple authenticated users
const createMultipleUsers = async (app, count = 2) => {
  const users = [];
  for (let i = 0; i < count; i++) {
    const userData = await createAuthenticatedUser(app, {
      email: `user${i}@test.com`,
      name: `Test User ${i + 1}`
    });
    users.push(userData);
  }
  return users;
};

// Get auth headers for requests
const getAuthHeaders = (token) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
});

// Create JWT token for user (for testing)
const createTestToken = (userId) => {
  const jwtUtil = require('../../utils/jwt');
  return jwtUtil.generateToken(userId, '1h');
};

module.exports = {
  createAuthenticatedUser,
  createMultipleUsers,
  getAuthHeaders,
  createTestToken
};
