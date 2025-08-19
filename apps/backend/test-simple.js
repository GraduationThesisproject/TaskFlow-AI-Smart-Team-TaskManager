const request = require('supertest');
const mongoose = require('mongoose');
const app = require('./src/app');
const { setupTestDB, teardownTestDB, clearDatabase } = require('./src/tests/helpers/testSetup');

async function testSimple() {
  try {
    await setupTestDB();
    
    console.log('Test database setup complete');
    
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'TestPass123!'
    };

    console.log('Sending user data:', userData);
    console.log('Password length:', userData.password.length);
    console.log('Password contains letter:', /[A-Za-z]/.test(userData.password));
    console.log('Password contains number:', /\d/.test(userData.password));
    console.log('Password contains special:', /[@$!%*#?&]/.test(userData.password));

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData);

    console.log('Response status:', response.status);
    console.log('Response body:', JSON.stringify(response.body, null, 2));

    await teardownTestDB();
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testSimple();
