const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Project = require('../models/Project');
const Board = require('../models/Board');
const Column = require('../models/Column');

// Test database connection
const MONGODB_URI = process.env.TEST_DATABASE_URL || 'mongodb://localhost:27017/taskflow_test';

describe('Board Endpoints', () => {
    let server;
    let authToken;
    let testUser;
    let testProject;

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
            Column.deleteMany({})
        ]);

        // Create test user and get auth token
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

        // Create test project
        testProject = await Project.create({
            name: 'Test Project',
            owner: testUser._id,
            goal: 'Test project goal for AI assistance',
            targetEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            team: [{ user: testUser._id, role: 'member' }]
        });
    });

    describe('POST /api/boards', () => {
        it('should create a new board', async () => {
            const boardData = {
                name: 'Test Board',
                description: 'This is a test board',
                type: 'kanban',
                spaceId: testProject._id,
                projectId: testProject._id
            };

            const response = await request(app)
                .post('/api/boards')
                .set('Authorization', `Bearer ${authToken}`)
                .send(boardData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.board.name).toBe(boardData.name);
            expect(response.body.data.board.type).toBe('kanban');

            // Check if default columns were created
            const columns = await Column.find({ board: response.body.data.board._id });
            expect(columns).toHaveLength(3); // To Do, In Progress, Done
        });

        it('should not create board without required fields', async () => {
            const boardData = {
                description: 'Missing required fields'
            };

            const response = await request(app)
                .post('/api/boards')
                .set('Authorization', `Bearer ${authToken}`)
                .send(boardData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Validation failed');
        });
    });

    describe('GET /api/boards/project/:projectId', () => {
        it('should get all boards for project', async () => {
            // Create test boards
            await Board.create({
                name: 'Board 1',
                project: testProject._id,
                space: testProject._id
            });

            await Board.create({
                name: 'Board 2',
                project: testProject._id,
                space: testProject._id
            });

            const response = await request(app)
                .get(`/api/boards/project/${testProject._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.boards).toHaveLength(2);
        });
    });

    describe('GET /api/boards/:id', () => {
        let testBoard;
        let testColumn;

        beforeEach(async () => {
            testBoard = await Board.create({
                name: 'Test Board',
                project: testProject._id,
                space: testProject._id
            });

            testColumn = await Column.create({
                name: 'Test Column',
                board: testBoard._id,
                position: 0
            });
        });

        it('should get board with columns and tasks', async () => {
            const response = await request(app)
                .get(`/api/boards/${testBoard._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.board.name).toBe('Test Board');
            expect(response.body.data.board.columns).toHaveLength(1);
            expect(response.body.data.board.columns[0].name).toBe('Test Column');
        });

        it('should return 404 for non-existent board', async () => {
            const fakeId = new mongoose.Types.ObjectId();

            const response = await request(app)
                .get(`/api/boards/${fakeId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('not found');
        });
    });

    describe('PUT /api/boards/:id', () => {
        let testBoard;

        beforeEach(async () => {
            testBoard = await Board.create({
                name: 'Test Board',
                project: testProject._id,
                space: testProject._id
            });
        });

        it('should update board', async () => {
            const updateData = {
                name: 'Updated Board',
                description: 'Updated description'
            };

            const response = await request(app)
                .put(`/api/boards/${testBoard._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.board.name).toBe('Updated Board');
            expect(response.body.data.board.description).toBe('Updated description');
        });
    });

    describe('POST /api/boards/:id/columns', () => {
        let testBoard;

        beforeEach(async () => {
            testBoard = await Board.create({
                name: 'Test Board',
                project: testProject._id,
                space: testProject._id
            });
        });

        it('should add column to board', async () => {
            const columnData = {
                name: 'New Column',
                color: '#FF5733',
                position: 0
            };

            const response = await request(app)
                .post(`/api/boards/${testBoard._id}/columns`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(columnData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.column.name).toBe('New Column');
            // color stored under style.color in schema
            expect(response.body.data.column.style.color).toBe('#FF5733');
        });
    });

    describe('DELETE /api/boards/:id', () => {
        let testBoard;

        beforeEach(async () => {
            testBoard = await Board.create({
                name: 'Test Board',
                project: testProject._id,
                space: testProject._id
            });
        });

        it('should delete board and associated data', async () => {
            const response = await request(app)
                .delete(`/api/boards/${testBoard._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);

            // Verify board is deleted
            const deletedBoard = await Board.findById(testBoard._id);
            expect(deletedBoard).toBeNull();
        });
    });
});
