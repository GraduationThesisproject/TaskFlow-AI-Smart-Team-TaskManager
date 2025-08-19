const request = require('supertest');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const app = require('../app');
const { setupTestDB, teardownTestDB, clearDatabase } = require('./helpers/testSetup');
const { createAuthenticatedUser, getAuthHeaders } = require('./helpers/authHelper');
const { createTestFile } = require('./helpers/testData');
const File = require('../models/File');

describe('File Endpoints', () => {
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

  describe('POST /api/files/upload/avatar', () => {
    let authUser;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
    });

    it('should upload avatar image', async () => {
      // Create a test image file
      const testImageBuffer = Buffer.from('fake-image-data');
      
      const response = await request(app)
        .post('/api/files/upload/avatar')
        .set(getAuthHeaders(authUser.token))
        .attach('file', testImageBuffer, 'avatar.jpg')
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.file.category).toBe('avatar');
      expect(response.body.data.file.originalName).toBe('avatar.jpg');
      expect(response.body.data.file.uploadedBy.toString()).toBe(authUser.user.id);
    });

    it('should not upload without authentication', async () => {
      const testImageBuffer = Buffer.from('fake-image-data');
      
      await request(app)
        .post('/api/files/upload/avatar')
        .attach('file', testImageBuffer, 'avatar.jpg')
        .expect(401);
    });

    it('should not upload file larger than limit', async () => {
      // Create a large buffer (simulate 10MB file)
      const largeBuffer = Buffer.alloc(10 * 1024 * 1024);
      
      const response = await request(app)
        .post('/api/files/upload/avatar')
        .set(getAuthHeaders(authUser.token))
        .attach('file', largeBuffer, 'large-avatar.jpg')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('too large');
    });

    it('should not upload invalid file type', async () => {
      const textBuffer = Buffer.from('This is not an image');
      
      const response = await request(app)
        .post('/api/files/upload/avatar')
        .set(getAuthHeaders(authUser.token))
        .attach('file', textBuffer, 'not-image.txt')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not allowed');
    });
  });

  describe('POST /api/files/upload/task-attachments', () => {
    let authUser;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
    });

    it('should upload multiple task attachments', async () => {
      const file1Buffer = Buffer.from('document-content-1');
      const file2Buffer = Buffer.from('document-content-2');
      
      const response = await request(app)
        .post('/api/files/upload/task-attachments')
        .set(getAuthHeaders(authUser.token))
        .attach('files', file1Buffer, 'document1.pdf')
        .attach('files', file2Buffer, 'document2.pdf')
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.files).toHaveLength(2);
      expect(response.body.data.files[0].category).toBe('task_attachment');
      expect(response.body.data.files[1].category).toBe('task_attachment');
    });

    it('should upload single task attachment', async () => {
      const fileBuffer = Buffer.from('document-content');
      
      const response = await request(app)
        .post('/api/files/upload/task-attachments')
        .set(getAuthHeaders(authUser.token))
        .attach('files', fileBuffer, 'document.pdf')
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.files).toHaveLength(1);
    });

    it('should not upload too many files', async () => {
      const requests = [];
      const maxFiles = 15; // Assuming limit is 10
      
      for (let i = 0; i < maxFiles; i++) {
        const fileBuffer = Buffer.from(`content-${i}`);
        requests.push(['files', fileBuffer, `file${i}.txt`]);
      }
      
      let requestBuilder = request(app)
        .post('/api/files/upload/task-attachments')
        .set(getAuthHeaders(authUser.token));
        
      requests.forEach(([field, buffer, filename]) => {
        requestBuilder = requestBuilder.attach(field, buffer, filename);
      });
      
      const response = await requestBuilder.expect(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message.toLowerCase()).toMatch(/too many files|unexpected field/);
    });
  });

  describe('GET /api/files/:id', () => {
    let authUser;
    let testFile;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
      testFile = await File.create(createTestFile(authUser.user.id));
    });

    it('should get file metadata', async () => {
      const response = await request(app)
        .get(`/api/files/${testFile._id}`)
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.file._id.toString()).toBe(testFile._id.toString());
      expect(response.body.data.file.filename).toBe(testFile.filename);
    });

    it('should not get file without authentication', async () => {
      await request(app)
        .get(`/api/files/${testFile._id}`)
        .expect(401);
    });

    it('should return 404 for non-existent file', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      await request(app)
        .get(`/api/files/${fakeId}`)
        .set(getAuthHeaders(authUser.token))
        .expect(404);
    });
  });

  describe('GET /api/files/:id/download', () => {
    let authUser;
    let testFile;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
      testFile = await File.create(createTestFile(authUser.user.id, {
        filename: 'test-download.txt',
        originalName: 'test-download.txt',
        mimeType: 'text/plain',
        path: path.join(process.cwd(), 'uploads', 'test-download.txt')
      }));
      
      // Create actual file for download
      const uploadDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      fs.writeFileSync(testFile.path, 'Test file content');
    });

    afterEach(() => {
      // Clean up test files
      if (testFile && testFile.path && fs.existsSync(testFile.path)) {
        fs.unlinkSync(testFile.path);
      }
    });

    it('should download file', async () => {
      const response = await request(app)
        .get(`/api/files/${testFile._id}/download`)
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.headers['content-type']).toBe('text/plain');
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(response.text).toBe('Test file content');
    });

    it('should not download file without authentication', async () => {
      await request(app)
        .get(`/api/files/${testFile._id}/download`)
        .expect(401);
    });

    it('should return 404 for missing physical file', async () => {
      // Delete physical file but keep database record
      const filePath = path.join(process.cwd(), 'uploads', testFile.filename);
      fs.unlinkSync(filePath);
      
      await request(app)
        .get(`/api/files/${testFile._id}/download`)
        .set(getAuthHeaders(authUser.token))
        .expect(404);
    });
  });

  describe('DELETE /api/files/:id', () => {
    let authUser;
    let testFile;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
      
      // Create test file with proper path
      const uploadDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const filename = 'test-delete-file.txt';
      const filePath = path.join(uploadDir, filename);
      
      testFile = await File.create(createTestFile(authUser.user.id, {
        filename: filename,
        path: filePath
      }));
      
      // Create physical file
      fs.writeFileSync(filePath, 'Test content');
    });

    afterEach(() => {
      // Clean up any remaining test files
      if (testFile && testFile.path && fs.existsSync(testFile.path)) {
        fs.unlinkSync(testFile.path);
      }
    });

    it('should delete file', async () => {
      const response = await request(app)
        .delete(`/api/files/${testFile._id}`)
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.success).toBe(true);
      
      // Verify file is soft deleted from database
      const deletedFile = await File.findById(testFile._id);
      expect(deletedFile.isActive).toBe(false);
      
      // Verify physical file is deleted
      expect(fs.existsSync(testFile.path)).toBe(false);
    });

    it('should not delete file uploaded by another user', async () => {
      const otherUser = await createAuthenticatedUser(app, { email: 'other@test.com' });
      
      await request(app)
        .delete(`/api/files/${testFile._id}`)
        .set(getAuthHeaders(otherUser.token))
        .expect(403);
    });
  });

  describe('GET /api/files', () => {
    let authUser;
    let files;

    beforeEach(async () => {
      authUser = await createAuthenticatedUser(app);
      
      // Create multiple test files
      files = await Promise.all([
        File.create(createTestFile(authUser.user.id, { category: 'avatar' })),
        File.create(createTestFile(authUser.user.id, { category: 'task_attachment' })),
        File.create(createTestFile(authUser.user.id, { category: 'general' }))
      ]);
    });

    it('should get user files', async () => {
      const response = await request(app)
        .get('/api/files')
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.files).toHaveLength(3);
    });

    it('should filter files by category', async () => {
      const response = await request(app)
        .get('/api/files?category=avatar')
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.data.files).toHaveLength(1);
      expect(response.body.data.files[0].category).toBe('avatar');
    });

    it('should paginate files', async () => {
      const response = await request(app)
        .get('/api/files?page=1&limit=2')
        .set(getAuthHeaders(authUser.token))
        .expect(200);

      expect(response.body.data.files).toHaveLength(2);
      expect(response.body.data.pagination).toBeDefined();
      expect(response.body.data.pagination.totalItems).toBe(3);
      expect(response.body.data.pagination.currentPage).toBe(1);
    });
  });
});
