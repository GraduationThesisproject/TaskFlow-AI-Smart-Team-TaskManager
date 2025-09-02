const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const UserRoles = require('../models/UserRoles');
const Admin = require('../models/Admin');
const { generateToken } = require('../utils/jwt');

describe('Admin API Tests', () => {
  let adminUser, regularUser, adminToken, regularUserToken;
  let adminUserRoles, regularUserRoles;

  beforeAll(async () => {
    // Create test users
    adminUser = new User({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'AdminPass123!',
      emailVerified: true,
      isActive: true
    });
    await adminUser.save();

    regularUser = new User({
      name: 'Regular User',
      email: 'user@test.com',
      password: 'UserPass123!',
      emailVerified: true,
      isActive: true
    });
    await regularUser.save();

    // Create admin record for admin user
    const admin = new Admin({
      userId: adminUser._id,
      role: 'super_admin',
      isActive: true,
      permissions: {
        canManageUsers: true,
        canManageSystem: true,
        canViewAnalytics: true
      }
    });
    await admin.save();

    // Create user roles
    adminUserRoles = new UserRoles({
      userId: adminUser._id,
      systemRole: 'super_admin'
    });
    await adminUserRoles.save();

    regularUserRoles = new UserRoles({
      userId: regularUser._id,
      systemRole: 'user'
    });
    await regularUserRoles.save();

    // Generate tokens
    adminToken = generateToken(adminUser._id);
    regularUserToken = generateToken(regularUser._id);
  });

  afterAll(async () => {
    // Cleanup
    await User.deleteMany({});
    await UserRoles.deleteMany({});
    await Admin.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/admin/auth/login', () => {
    test('should login admin user successfully', async () => {
      const response = await request(app)
        .post('/api/admin/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'AdminPass123!'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.admin).toBeDefined();
    });

    test('should reject non-admin user login', async () => {
      const response = await request(app)
        .post('/api/admin/auth/login')
        .send({
          email: 'user@test.com',
          password: 'UserPass123!'
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/admin/users/:userId/role', () => {
    test('should change user role from user to admin successfully', async () => {
      const response = await request(app)
        .patch(`/api/admin/users/${regularUser._id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          newRole: 'admin'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.newRole).toBe('admin');
      expect(response.body.data.user).toBeDefined();

      // Verify the role was actually changed in the database
      const updatedUserRoles = await UserRoles.findOne({ userId: regularUser._id });
      expect(updatedUserRoles.systemRole).toBe('admin');
    });

    test('should change user role from admin to super_admin successfully', async () => {
      const response = await request(app)
        .patch(`/api/admin/users/${regularUser._id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          newRole: 'super_admin'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.newRole).toBe('super_admin');

      // Verify the role was actually changed in the database
      const updatedUserRoles = await UserRoles.findOne({ userId: regularUser._id });
      expect(updatedUserRoles.systemRole).toBe('super_admin');
    });

    test('should change user role back to user successfully', async () => {
      const response = await request(app)
        .patch(`/api/admin/users/${regularUser._id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          newRole: 'user'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.newRole).toBe('user');

      // Verify the role was actually changed in the database
      const updatedUserRoles = await UserRoles.findOne({ userId: regularUser._id });
      expect(updatedUserRoles.systemRole).toBe('user');
    });

    test('should reject invalid role values', async () => {
      const response = await request(app)
        .patch(`/api/admin/users/${regularUser._id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          newRole: 'invalid_role'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid role');
    });

    test('should reject role change for non-existent user', async () => {
      const fakeUserId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .patch(`/api/admin/users/${fakeUserId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          newRole: 'admin'
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not found');
    });

    test('should reject role change without admin token', async () => {
      const response = await request(app)
        .patch(`/api/admin/users/${regularUser._id}/role`)
        .send({
          newRole: 'admin'
        });

      expect(response.status).toBe(401);
    });

    test('should reject role change with regular user token', async () => {
      const response = await request(app)
        .patch(`/api/admin/users/${regularUser._id}/role`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({
          newRole: 'admin'
        });

      expect(response.status).toBe(403);
    });

    test('should create user roles document if it does not exist', async () => {
      // Create a new user without roles
      const newUser = new User({
        name: 'New User',
        email: 'newuser@test.com',
        password: 'NewPass123!',
        emailVerified: true,
        isActive: true
      });
      await newUser.save();

      const response = await request(app)
        .patch(`/api/admin/users/${newUser._id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          newRole: 'admin'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify the user roles document was created
      const userRoles = await UserRoles.findOne({ userId: newUser._id });
      expect(userRoles).toBeDefined();
      expect(userRoles.systemRole).toBe('admin');

      // Cleanup
      await User.findByIdAndDelete(newUser._id);
      await UserRoles.findOneAndDelete({ userId: newUser._id });
    });
  });

  describe('GET /api/admin/users', () => {
    test('should get all users when authenticated as admin', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.users).toBeDefined();
      expect(Array.isArray(response.body.data.users)).toBe(true);
    });

    test('should reject access without admin token', async () => {
      const response = await request(app)
        .get('/api/admin/users');

      expect(response.status).toBe(401);
    });
  });
});
