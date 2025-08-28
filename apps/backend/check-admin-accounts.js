const mongoose = require('mongoose');
require('dotenv').config();

const Admin = require('./src/models/Admin');

async function checkAdminAccounts() {
  try {
    console.log('🔍 Checking Admin Accounts in Database...\n');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflow';
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');
    
    // Find all admin users
    const admins = await Admin.find({}).select('userName userEmail role isActive createdAt lastLoginAt');
    
    if (admins.length === 0) {
      console.log('❌ No admin users found in database');
      return;
    }
    
    console.log(`📊 Found ${admins.length} admin user(s):\n`);
    
    admins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.userName} (${admin.userEmail})`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Status: ${admin.isActive ? 'Active' : 'Inactive'}`);
      console.log(`   Created: ${admin.createdAt.toLocaleDateString()}`);
      console.log(`   Last Login: ${admin.lastLoginAt ? admin.lastLoginAt.toLocaleDateString() : 'Never'}`);
      console.log('');
    });
    
    // Check if any admin has 2FA enabled
    const adminsWith2FA = await Admin.find({ hasTwoFactorAuth: true }).select('userName userEmail hasTwoFactorAuth');
    
    if (adminsWith2FA.length > 0) {
      console.log('🔐 Admins with 2FA enabled:');
      adminsWith2FA.forEach(admin => {
        console.log(`   - ${admin.userName} (${admin.userEmail})`);
      });
      console.log('');
    }
    
    // Check admin roles distribution
    const roleCounts = {};
    admins.forEach(admin => {
      roleCounts[admin.role] = (roleCounts[admin.role] || 0) + 1;
    });
    
    console.log('📋 Role Distribution:');
    Object.entries(roleCounts).forEach(([role, count]) => {
      console.log(`   ${role}: ${count} user(s)`);
    });
    
  } catch (error) {
    console.error('❌ Error checking admin accounts:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the check
checkAdminAccounts();
