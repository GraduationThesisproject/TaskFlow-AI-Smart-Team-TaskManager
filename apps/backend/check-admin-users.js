require('dotenv').config();
const mongoose = require('mongoose');

// Import models
require('./src/models/Admin');

async function checkAdminUsers() {
  try {
    console.log('🔍 Checking admin users in database...');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflow';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    const Admin = mongoose.model('Admin');
    
    // Get all admin users
    const admins = await Admin.find({}).lean();
    
    console.log(`\n👥 Admin Users (${admins.length}):`);
    
    if (admins.length > 0) {
      admins.forEach((admin, index) => {
        console.log(`   ${index + 1}. ${admin.name || 'No name'} (${admin.email || 'No email'})`);
        console.log(`      Role: ${admin.role}`);
        console.log(`      Active: ${admin.isActive ? 'Yes' : 'No'}`);
        console.log(`      Created: ${admin.createdAt}`);
        console.log(`      Password hash: ${admin.password ? admin.password.substring(0, 20) + '...' : 'No password'}`);
        console.log('');
      });
    } else {
      console.log('❌ No admin users found in database');
    }
    
  } catch (error) {
    console.error('❌ Error checking admin users:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
    process.exit(0);
  }
}

checkAdminUsers();
