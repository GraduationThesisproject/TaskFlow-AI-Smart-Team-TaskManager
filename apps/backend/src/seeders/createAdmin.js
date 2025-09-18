const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const logger = require('../config/logger');

/**
 * Simple Admin Creator
 * Creates a single admin user for testing/development
 */

const createSingleAdmin = async () => {
  try {
    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflow');
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ userEmail: 'admin@admin.com' });
    
    if (existingAdmin) {
      logger.info('Admin already exists:', existingAdmin.userEmail);
      return existingAdmin;
    }

    // Create admin user
    const adminData = {
      userName: 'admin',
      userEmail: 'admin@admin.com',
      password: 'admin123!', // Will be hashed by pre-save middleware
      firstName: 'Admin',
      lastName: 'User',
      role: 'super_admin',
      isActive: true,
      isEmailVerified: true,
      permissions: Admin.getDefaultPermissions('super_admin'),
      notes: 'Default admin user created by seeder'
    };

    const admin = new Admin(adminData);
    await admin.save();
    
    logger.info('✅ Admin created successfully:', {
      email: admin.userEmail,
      username: admin.userName,
      role: admin.role
    });
    
    return admin;
  } catch (error) {
    logger.error('❌ Error creating admin:', error);
    throw error;
  }
};

// Run if called directly
if (require.main === module) {
  createSingleAdmin()
    .then(() => {
      console.log('✅ Admin creation completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Admin creation failed:', error);
      process.exit(1);
    });
}

module.exports = { createSingleAdmin };
