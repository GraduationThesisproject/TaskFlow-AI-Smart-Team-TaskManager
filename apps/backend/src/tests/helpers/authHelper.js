const request = require('supertest');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const { createTestUser } = require('./testData');

// Create authenticated user and return token
const createAuthenticatedUser = async (app, userData = {}) => {
  const testUserData = createTestUser(userData);
  
  // Register user to create pending registration
  const registerResponse = await request(app)
    .post('/api/auth/register')
    .send(testUserData);

  if (registerResponse.status !== 201) {
    throw new Error(`Failed to register user: ${registerResponse.body.message}`);
  }

  // Set verification code and pending registration for testing
  const { emailVerifyCodes, pendingRegistrations } = require('../controllers/auth.controller');
  emailVerifyCodes.set(testUserData.email, {
    code: '1234',
    expiresAt: Date.now() + 10 * 60 * 1000,
    attempts: 0
  });

  // Verify email to create user
  const verifyResponse = await request(app)
    .post('/api/auth/verify-email')
    .send({
      email: testUserData.email,
      code: '1234'
    });

  if (verifyResponse.status !== 200) {
    throw new Error(`Failed to verify email: ${verifyResponse.body.message}`);
  }

  // Login to get token
  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({
      email: testUserData.email,
      password: testUserData.password
    });

  if (loginResponse.status !== 200) {
    throw new Error(`Failed to login user: ${loginResponse.body.message}`);
  }
  
  // Normalize user object to include "id" alias for _id
  const apiUser = loginResponse.body.data.user || {};
  const normalizedUser = { ...apiUser, id: apiUser._id };
  
  return {
    user: normalizedUser,
    token: loginResponse.body.data.token,
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
