const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Admin = require('./src/models/Admin');

// Admin credentials from README
const adminCredentials = [
  {
    email: 'admin@taskflow.com',
    password: 'Admin123!',
    role: 'admin'
  },
  {
    email: 'moderator@taskflow.com',
    password: 'Moderator123!',
    role: 'moderator'
  },
  {
    email: 'viewer@taskflow.com',
    password: 'Viewer123!',
    role: 'viewer'
  }
];

async function fixAdminPasswordsDirect() {
  try {
    console.log('🔧 Fixing Admin Passwords (Direct Update)...\n');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflow';
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');
    
    for (const cred of adminCredentials) {
      console.log(`🔄 Fixing password for ${cred.email}...`);
      
      // Hash the password manually
      const hashedPassword = await bcrypt.hash(cred.password, 12);
      
      // Use findOneAndUpdate to bypass pre-save middleware
      const result = await Admin.findOneAndUpdate(
        { userEmail: cred.email },
        { 
          password: hashedPassword,
          lastActivityAt: new Date()
        },
        { new: true }
      );
      
      if (!result) {
        console.log(`❌ Admin user not found: ${cred.email}`);
        continue;
      }
      
      console.log(`✅ Password fixed successfully for ${cred.email}`);
      console.log(`   Role: ${result.role}`);
      console.log(`   New password: ${cred.password}`);
      console.log(`   Hash updated: ${result.password.substring(0, 20)}...`);
      console.log('');
    }
    
    console.log('🎉 All admin passwords have been fixed!');
    console.log('\n📋 Updated Login Credentials:');
    console.log('=====================================');
    adminCredentials.forEach(cred => {
      console.log(`${cred.email} | ${cred.password} | Role: ${cred.role}`);
    });
    
    console.log('\n🧪 Now you can test the login with these credentials!');
    
  } catch (error) {
    console.error('❌ Error fixing admin passwords:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the password fix
fixAdminPasswordsDirect();
