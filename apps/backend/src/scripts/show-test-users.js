#!/usr/bin/env node

const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');
const UserRoles = require('../models/UserRoles');

async function showTestUsers() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflow';
    
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');
    console.log('');
    
    // Find test users
    const testUsers = await User.find({
      email: { $regex: /\.test@gmail\.com$/ }
    }).sort({ email: 1 });
    
    if (testUsers.length === 0) {
      console.log('❌ No test users found.');
      console.log('Run the seeder first: npm run seed');
      process.exit(1);
    }
    
    console.log('👥 TEST USERS CREDENTIALS');
    console.log('='.repeat(50));
    console.log('');
    
    for (let user of testUsers) {
      const userRoles = await UserRoles.findOne({ userId: user._id });
      const systemRole = userRoles ? userRoles.systemRole : 'user';
      
      console.log(`📧 Email:     ${user.email}`);
      console.log(`👤 Name:      ${user.name}`);
      console.log(`🔐 Password:  12345678A!`);
      console.log(`🏷️  Role:      ${systemRole}`);
      console.log(`✅ Verified:  ${user.emailVerified ? 'Yes' : 'No'}`);
      console.log(`📅 Created:   ${user.createdAt.toLocaleDateString()}`);
      console.log(`🌐 Last Login: ${user.lastLogin ? user.lastLogin.toLocaleString() : 'Never'}`);
      console.log('-'.repeat(50));
    }
    
    // Get all users count
    const totalUsers = await User.countDocuments();
    const totalTestUsers = testUsers.length;
    const totalOtherUsers = totalUsers - totalTestUsers;
    
    console.log('');
    console.log('📊 SUMMARY');
    console.log('='.repeat(30));
    console.log(`Test Users: ${totalTestUsers}`);
    console.log(`Other Users: ${totalOtherUsers}`);
    console.log(`Total Users: ${totalUsers}`);
    console.log('');
    
    // Quick login examples
    console.log('🚀 QUICK LOGIN EXAMPLES');
    console.log('='.repeat(30));
    console.log('');
    console.log('For Super Admin access:');
    console.log('  Email: superadmin.test@gmail.com');
    console.log('  Password: 12345678A!');
    console.log('');
    console.log('For Admin access:');
    console.log('  Email: admin.test@gmail.com');
    console.log('  Password: 12345678A!');
    console.log('');
    console.log('For Regular User access:');
    console.log('  Email: user.test@gmail.com');
    console.log('  Password: 12345678A!');
    console.log('');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n⚠️  Closing MongoDB connection...');
  await mongoose.connection.close();
  process.exit(0);
});

// Run the script
showTestUsers();
