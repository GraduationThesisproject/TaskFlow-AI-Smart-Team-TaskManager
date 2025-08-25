#!/usr/bin/env node

const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');
const UserRoles = require('../models/UserRoles');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');

async function createAdminAccount() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflow';
    
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    
    console.log('✅ Connected to MongoDB');
    
    // Check if admin user already exists
    const existingUser = await User.findOne({ email: 'admin@admin.com' });
    if (existingUser) {
      console.log('⚠️  Admin user already exists');
      console.log('Email: admin@admin.com');
      console.log('Password: admin123!');
      console.log('User ID:', existingUser._id);
      
      // Check if Admin model exists for this user
      const existingAdmin = await Admin.findOne({ userId: existingUser._id });
      if (existingAdmin) {
        console.log('✅ Admin model already exists for this user');
        console.log('Admin ID:', existingAdmin._id);
        console.log('Role:', existingAdmin.role);
      } else {
        console.log('⚠️  Admin model does not exist, creating...');
        await createAdminModel(existingUser._id);
      }
      
      await mongoose.connection.close();
      return;
    }
    
    console.log('👤 Creating admin user...');
    
    // Hash password (using a valid password that meets requirements)
    const hashedPassword = await bcrypt.hash('admin123!', 12);
    
    // Create user
    const user = new User({
      name: 'System Administrator',
      email: 'admin@admin.com',
      password: hashedPassword,
      emailVerified: true,
      isActive: true
    });
    
    await user.save();
    console.log('✅ User created successfully');
    console.log('User ID:', user._id);
    
    // Create UserRoles entry
    console.log('🔐 Creating user roles...');
    const userRoles = new UserRoles({
      userId: user._id,
      systemRole: 'super_admin'
    });
    
    await userRoles.save();
    console.log('✅ User roles created successfully');
    
    // Create Admin model entry
    console.log('👑 Creating admin model...');
    await createAdminModel(user._id);
    
    console.log('🎉 Admin account created successfully!');
    console.log('');
          console.log('📋 Admin Credentials:');
      console.log('  • Email: admin@admin.com');
      console.log('  • Password: admin123!');
      console.log('  • Role: super_admin');
      console.log('  • User ID:', user._id);
    console.log('');
    console.log('🔗 You can now log in to the admin panel at: http://localhost:3000/login');
    
    await mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ Error creating admin account:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

async function createAdminModel(userId) {
  try {
    // Create Admin model with superadmin role
    const admin = new Admin({
      userId: userId,
      role: 'superadmin',
      permissions: {
        manageUsers: true,
        manageWorkspaces: true,
        manageTemplates: true,
        viewAnalytics: true,
        systemSettings: true,
        manageAdmins: true,
        viewSystemLogs: true,
        manageQuotas: true,
        manageAIJobs: true
      },
      isActive: true
    });
    
    await admin.save();
    console.log('✅ Admin model created successfully');
    console.log('Admin ID:', admin._id);
    console.log('Role:', admin.role);
    
    return admin;
  } catch (error) {
    console.error('❌ Error creating admin model:', error);
    throw error;
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n⚠️  Received SIGINT. Closing MongoDB connection...');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n⚠️  Received SIGTERM. Closing MongoDB connection...');
  await mongoose.connection.close();
  process.exit(0);
});

// Run the script
createAdminAccount();
