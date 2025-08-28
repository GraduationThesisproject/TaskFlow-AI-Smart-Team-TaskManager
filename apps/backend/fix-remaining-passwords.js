const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Admin = require('./src/models/Admin');

// Fix remaining admin passwords
const remainingCredentials = [
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

async function fixRemainingPasswords() {
  try {
    console.log('🔧 Fixing Remaining Admin Passwords...\n');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflow';
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');
    
    for (const cred of remainingCredentials) {
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
      console.log('');
    }
    
    console.log('🎉 All remaining admin passwords have been fixed!');
    
  } catch (error) {
    console.error('❌ Error fixing remaining passwords:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the password fix
fixRemainingPasswords();
