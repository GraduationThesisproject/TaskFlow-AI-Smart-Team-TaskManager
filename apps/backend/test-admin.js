#!/usr/bin/env node

const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const User = require('./src/models/User');
const UserRoles = require('./src/models/UserRoles');
const Admin = require('./src/models/Admin');
const bcrypt = require('bcryptjs');

async function testAdminAccount() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflow';
    
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    
    console.log('✅ Connected to MongoDB');
    
    // Check if admin user exists
    const existingUser = await User.findOne({ email: 'admin@admin.com' });
    if (existingUser) {
      console.log('✅ Admin user exists');
      console.log('Email:', existingUser.email);
      console.log('User ID:', existingUser._id);
      
      // Check if Admin model exists
      const existingAdmin = await Admin.findOne({ userId: existingUser._id });
      if (existingAdmin) {
        console.log('✅ Admin model exists');
        console.log('Admin ID:', existingAdmin._id);
        console.log('Role:', existingAdmin.role);
        console.log('Permissions:', existingAdmin.permissions);
      } else {
        console.log('❌ Admin model does not exist');
      }
      
      // Test password
      const isPasswordValid = await existingUser.comparePassword('admin123!');
      console.log('Password valid:', isPasswordValid);
      
      // Check UserRoles
      const userRoles = await UserRoles.findOne({ userId: existingUser._id });
      if (userRoles) {
        console.log('✅ UserRoles exist');
        console.log('System Role:', userRoles.systemRole);
      } else {
        console.log('❌ UserRoles do not exist');
      }
      
    } else {
      console.log('❌ Admin user does not exist');
    }
    
    await mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ Error testing admin account:', error);
    await mongoose.connection.close();
    process.exit(1);
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

// Run the test
testAdminAccount();
