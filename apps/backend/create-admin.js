require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import Admin model
require('./src/models/Admin');

async function createAdmin() {
  try {
    console.log('🔐 Creating admin user...');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflow';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    const Admin = mongoose.model('Admin');
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ userEmail: 'admin@admin.com' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin already exists, updating password...');
      
      // Update the password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash('admin123', saltRounds);
      
      existingAdmin.password = hashedPassword;
      existingAdmin.isActive = true;
      await existingAdmin.save();
      
      console.log('✅ Admin password updated successfully');
      console.log('📧 Email: admin@admin.com');
      console.log('🔑 Password: admin123');
    } else {
      console.log('➕ Creating new admin user...');
      
      // Hash the password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash('admin123', saltRounds);
      
      // Create the admin user
      const admin = new Admin({
        userName: 'admin_user',
        userEmail: 'admin@admin.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'super_admin',
        isActive: true,
        permissions: [
          {
            name: 'admin_management',
            description: 'Manage admin users and roles',
            allowed: true
          },
          {
            name: 'user_management',
            description: 'Manage regular users',
            allowed: true
          },
          {
            name: 'system_settings',
            description: 'Access system settings',
            allowed: true
          },
          {
            name: 'audit_logs',
            description: 'View audit logs',
            allowed: true
          },
          {
            name: 'data_export',
            description: 'Export system data',
            allowed: true
          }
        ],
        notes: 'Created by script'
      });
      
      await admin.save();
      console.log('✅ Admin user created successfully');
      console.log('📧 Email: admin@admin.com');
      console.log('🔑 Password: admin123');
    }
    
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
    process.exit(0);
  }
}

createAdmin();
