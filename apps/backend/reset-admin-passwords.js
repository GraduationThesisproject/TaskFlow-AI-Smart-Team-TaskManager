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

async function resetAdminPasswords() {
  try {
    console.log('🔐 Resetting Admin Passwords...\n');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflow';
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');
    
    for (const cred of adminCredentials) {
      console.log(`🔄 Resetting password for ${cred.email}...`);
      
      // Find the admin user
      const admin = await Admin.findOne({ userEmail: cred.email });
      
      if (!admin) {
        console.log(`❌ Admin user not found: ${cred.email}`);
        continue;
      }
      
      // Hash the new password
      const hashedPassword = await bcrypt.hash(cred.password, 12);
      
      // Update the password
      admin.password = hashedPassword;
      await admin.save();
      
      console.log(`✅ Password reset successfully for ${cred.email}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   New password: ${cred.password}`);
      console.log('');
    }
    
    console.log('🎉 All admin passwords have been reset!');
    console.log('\n📋 Updated Login Credentials:');
    console.log('=====================================');
    adminCredentials.forEach(cred => {
      console.log(`${cred.email} | ${cred.password} | Role: ${cred.role}`);
    });
    
  } catch (error) {
    console.error('❌ Error resetting admin passwords:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the password reset
resetAdminPasswords();
