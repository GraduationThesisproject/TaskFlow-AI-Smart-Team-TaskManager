const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');

// Import test helpers instead of manual setup
const { setupTestDB, teardownTestDB, clearDatabase } = require('./helpers/testSetup');

describe('Authentication Endpoints', () => {
    let server;

    beforeAll(async () => {
        await setupTestDB();
        server = app.listen();
    });

    afterAll(async () => {
        await teardownTestDB();
        if (server) {
            server.close();
        }
    });

    beforeEach(async () => {
        await clearDatabase();
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user with valid data', async () => {
            const userData = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'TestPass123!'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('registered successfully');
            expect(response.body.data.token).toBeDefined();
            expect(response.body.data.user.email).toBe(userData.email);
            expect(response.body.data.user.password).toBeUndefined();
        });

        it('should not register user with invalid email', async () => {
            const userData = {
                name: 'Test User',
                email: 'invalid-email',
                password: 'TestPass123!'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Validation failed');
        });

        it('should not register user with short password', async () => {
            const userData = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'weak'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        it('should not register user with existing email', async () => {
            const userData = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'TestPass123!'
            };

            // Register first user
            await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(201);

            // Try to register with same email
            const response = await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('already exists');
        });
    });

    describe('POST /api/auth/login', () => {
        let testUser;

        beforeEach(async () => {
            // Create test user
            testUser = await User.create({
                name: 'Test User',
                email: 'test@example.com',
                password: 'TestPass123!'
            });
        });

        it('should login with valid credentials', async () => {
            const loginData = {
                email: 'test@example.com',
                password: 'TestPass123!'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('successful');
            expect(response.body.data.token).toBeDefined();
            expect(response.body.data.user.email).toBe(loginData.email);
        });

        it('should not login with invalid email', async () => {
            const loginData = {
                email: 'wrong@example.com',
                password: 'TestPass123!'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Invalid');
        });

        it('should not login with invalid password', async () => {
            const loginData = {
                email: 'test@example.com',
                password: 'WrongPass123!'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Invalid');
        });
    });

    describe('GET /api/auth/me', () => {
        let testUser;
        let authToken;

        beforeEach(async () => {
            // Register and login user
            const userData = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'TestPass123!'
            };

            const registerResponse = await request(app)
                .post('/api/auth/register')
                .send(userData);

            authToken = registerResponse.body.data.token;
            testUser = registerResponse.body.data.user;
        });

        it('should get user profile with valid token', async () => {
            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.user.email).toBe(testUser.email);
            expect(response.body.data.user.password).toBeUndefined();
        });

        it('should not get profile without token', async () => {
            const response = await request(app)
                .get('/api/auth/me')
                .expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('token');
        });

        it('should not get profile with invalid token', async () => {
            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer invalid-token')
                .expect(401);

            expect(response.body.success).toBe(false);
        });
    });

    describe('PUT /api/auth/profile', () => {
        let authToken;

        beforeEach(async () => {
            const userData = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'TestPass123!'
            };

            const registerResponse = await request(app)
                .post('/api/auth/register')
                .send(userData);

            authToken = registerResponse.body.data.token;
        });

        it('should update user profile', async () => {
            const updateData = {
                name: 'Updated Name',
                preferences: {
                    theme: 'dark'
                }
            };

            const response = await request(app)
                .put('/api/auth/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.user.name).toBe(updateData.name);
        });
    });

    describe('PUT /api/auth/change-password', () => {
        let authToken;

        beforeEach(async () => {
            const userData = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'TestPass123!'
            };

            const registerResponse = await request(app)
                .post('/api/auth/register')
                .send(userData);

            authToken = registerResponse.body.data.token;
        });

        it('should change password with valid current password', async () => {
            const passwordData = {
                currentPassword: 'TestPass123!',
                newPassword: 'NewPass456!'
            };

            const response = await request(app)
                .put('/api/auth/change-password')
                .set('Authorization', `Bearer ${authToken}`)
                .send(passwordData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('changed');
        });

        it('should not change password with invalid current password', async () => {
            const passwordData = {
                currentPassword: 'WrongPass123!',
                newPassword: 'NewPass456!'
            };

            const response = await request(app)
                .put('/api/auth/change-password')
                .set('Authorization', `Bearer ${authToken}`)
                .send(passwordData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('incorrect');
        });
    });
});
