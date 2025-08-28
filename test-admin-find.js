const mongoose = require('mongoose');
require('dotenv').config();

async function testAdminFind() {
  try {
    console.log('🔍 Testing Admin Model Find...\n');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflow';
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    // Import Admin model
    const Admin = require('./apps/backend/src/models/Admin');
    
    // Test finding admin by ID
    const adminId = '68b025ad0bd7371b487411ca'; // From our debug output
    console.log(`\n🔍 Looking for admin with ID: ${adminId}`);
    
    const admin = await Admin.findById(adminId);
    
    if (admin) {
      console.log('✅ Admin found!');
      console.log('Email:', admin.userEmail);
      console.log('Username:', admin.userName);
      console.log('Role:', admin.role);
      console.log('Is Active:', admin.isActive);
    } else {
      console.log('❌ Admin not found');
      
      // Let's see what admins exist
      console.log('\n🔍 Checking what admins exist...');
      const allAdmins = await Admin.find({}).select('_id userEmail userName role');
      console.log('All admins:', allAdmins);
    }
    
    await mongoose.connection.close();
    
  } catch (error) {
    console.error('💥 Test error:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }
}

testAdminFind();
