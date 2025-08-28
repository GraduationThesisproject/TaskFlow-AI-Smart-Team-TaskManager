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

async function verifyAdminPasswords() {
  try {
    console.log('🔍 Verifying Admin Passwords...\n');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflow';
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');
    
    for (const cred of adminCredentials) {
      console.log(`🔐 Verifying password for ${cred.email}...`);
      
      // Find the admin user and include password field
      const admin = await Admin.findOne({ userEmail: cred.email }).select('+password');
      
      if (!admin) {
        console.log(`❌ Admin user not found: ${cred.email}`);
        continue;
      }
      
      console.log(`   Role: ${admin.role}`);
      console.log(`   Password hash exists: ${!!admin.password}`);
      console.log(`   Password hash length: ${admin.password ? admin.password.length : 0}`);
      
      // Test password comparison
      try {
        const isPasswordValid = await admin.comparePassword(cred.password);
        console.log(`   Password comparison result: ${isPasswordValid ? '✅ Valid' : '❌ Invalid'}`);
        
        if (!isPasswordValid) {
          // Let's also test with bcrypt directly
          const directComparison = await bcrypt.compare(cred.password, admin.password);
          console.log(`   Direct bcrypt comparison: ${directComparison ? '✅ Valid' : '❌ Invalid'}`);
          
          // Hash the expected password to see what it should be
          const expectedHash = await bcrypt.hash(cred.password, 12);
          console.log(`   Expected hash: ${expectedHash.substring(0, 20)}...`);
          console.log(`   Current hash:  ${admin.password.substring(0, 20)}...`);
        }
      } catch (error) {
        console.log(`   Password comparison error: ${error.message}`);
      }
      
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Error verifying admin passwords:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the verification
verifyAdminPasswords();
