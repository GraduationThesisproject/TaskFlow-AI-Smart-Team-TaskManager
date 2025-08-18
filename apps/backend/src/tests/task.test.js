const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Project = require('../models/Project');
const Board = require('../models/Board');
const Column = require('../models/Column');
const Task = require('../models/Task');

// Test database connection
const MONGODB_URI = process.env.TEST_DATABASE_URL || 'mongodb://localhost:27017/taskflow_test';

describe('Task Endpoints', () => {
    let server;
    let authToken;
    let testUser;
    let testProject;
    let testBoard;
    let testColumn;

    beforeAll(async () => {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        server = app.listen();
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
        if (server) server.close();
    });

    beforeEach(async () => {
        // Clean database
        await Promise.all([
            User.deleteMany({}),
            Project.deleteMany({}),
            Board.deleteMany({}),
            Column.deleteMany({}),
            Task.deleteMany({})
        ]);

        // Create test user and get auth token
        const userData = {
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123'
        };

        const registerResponse = await request(app)
            .post('/api/auth/register')
            .send(userData);

        authToken = registerResponse.body.data.token;
        testUser = registerResponse.body.data.user;

        // Create test project
        testProject = await Project.create({
            name: 'Test Project',
            owner: testUser.id,
            members: [{ user: testUser.id, role: 'admin' }]
        });

        // Create test board
        testBoard = await Board.create({
            name: 'Test Board',
            project: testProject._id,
            space: testProject._id, // Using project as space for simplicity
            type: 'kanban'
        });

        // Create test column
        testColumn = await Column.create({
            name: 'To Do',
            board: testBoard._id,
            position: 0
        });
    });

    describe('GET /api/tasks', () => {
        it('should get all tasks with auth', async () => {
            // Create test task
            await Task.create({
                title: 'Test Task',
                board: testBoard._id,
                column: testColumn._id,
                reporter: testUser.id,
                position: 0
            });

            const response = await request(app)
                .get('/api/tasks')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.tasks).toHaveLength(1);
            expect(response.body.data.tasks[0].title).toBe('Test Task');
        });

        it('should filter tasks by board', async () => {
            await Task.create({
                title: 'Task 1',
                board: testBoard._id,
                column: testColumn._id,
                reporter: testUser.id,
                position: 0
            });

            const response = await request(app)
                .get(`/api/tasks?boardId=${testBoard._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.data.tasks).toHaveLength(1);
        });
    });

    describe('POST /api/tasks', () => {
        it('should create a new task', async () => {
            const taskData = {
                title: 'New Test Task',
                description: 'This is a test task',
                boardId: testBoard._id,
                columnId: testColumn._id,
                priority: 'high'
            };

            const response = await request(app)
                .post('/api/tasks')
                .set('Authorization', `Bearer ${authToken}`)
                .send(taskData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.task.title).toBe(taskData.title);
            expect(response.body.data.task.priority).toBe('high');
        });

        it('should not create task without title', async () => {
            const taskData = {
                boardId: testBoard._id,
                columnId: testColumn._id
            };

            const response = await request(app)
                .post('/api/tasks')
                .set('Authorization', `Bearer ${authToken}`)
                .send(taskData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Validation failed');
        });
    });

    describe('PUT /api/tasks/:id', () => {
        let testTask;

        beforeEach(async () => {
            testTask = await Task.create({
                title: 'Test Task',
                board: testBoard._id,
                column: testColumn._id,
                reporter: testUser.id,
                position: 0
            });
        });

        it('should update task', async () => {
            const updateData = {
                title: 'Updated Task',
                priority: 'urgent',
                status: 'in-progress'
            };

            const response = await request(app)
                .put(`/api/tasks/${testTask._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.task.title).toBe('Updated Task');
            expect(response.body.data.task.priority).toBe('urgent');
        });
    });

    describe('PATCH /api/tasks/:id/move', () => {
        let testTask;
        let targetColumn;

        beforeEach(async () => {
            testTask = await Task.create({
                title: 'Test Task',
                board: testBoard._id,
                column: testColumn._id,
                reporter: testUser.id,
                position: 0
            });

            targetColumn = await Column.create({
                name: 'In Progress',
                board: testBoard._id,
                position: 1
            });
        });

        it('should move task to different column', async () => {
            const moveData = {
                columnId: targetColumn._id,
                position: 0
            };

            const response = await request(app)
                .patch(`/api/tasks/${testTask._id}/move`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(moveData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.task.column.toString()).toBe(targetColumn._id.toString());
        });
    });

    describe('POST /api/tasks/:id/comments', () => {
        let testTask;

        beforeEach(async () => {
            testTask = await Task.create({
                title: 'Test Task',
                board: testBoard._id,
                column: testColumn._id,
                reporter: testUser.id,
                position: 0
            });
        });

        it('should add comment to task', async () => {
            const commentData = {
                content: 'This is a test comment'
            };

            const response = await request(app)
                .post(`/api/tasks/${testTask._id}/comments`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(commentData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.comment.content).toBe(commentData.content);
        });
    });

    describe('DELETE /api/tasks/:id', () => {
        let testTask;

        beforeEach(async () => {
            testTask = await Task.create({
                title: 'Test Task',
                board: testBoard._id,
                column: testColumn._id,
                reporter: testUser.id,
                position: 0
            });
        });

        it('should delete task', async () => {
            const response = await request(app)
                .delete(`/api/tasks/${testTask._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);

            // Verify task is deleted
            const deletedTask = await Task.findById(testTask._id);
            expect(deletedTask).toBeNull();
        });
    });
});
