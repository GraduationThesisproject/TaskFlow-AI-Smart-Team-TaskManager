const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflow';
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Check admin user details
const checkAdminUser = async () => {
  try {
    console.log('🔍 Checking Admin User Details...\n');
    
    // Check Admin collection
    const Admin = mongoose.connection.db.collection('admins');
    const adminUser = await Admin.findOne({ userEmail: 'admin@admin.com' });
    
    if (adminUser) {
      console.log('👑 Admin User Found:');
      console.log('=====================================');
      console.log(`📧 Email: ${adminUser.userEmail}`);
      console.log(`👤 Username: ${adminUser.userName}`);
      console.log(`🔑 Role: ${adminUser.role}`);
      console.log(`✅ Active: ${adminUser.isActive}`);
      console.log(`📅 Created: ${adminUser.createdAt}`);
      
      if (adminUser.permissions && adminUser.permissions.length > 0) {
        console.log('\n🔐 Permissions:');
        console.log('=====================================');
        adminUser.permissions.forEach((perm, index) => {
          console.log(`${index + 1}. ${perm.name} - ${perm.description}`);
          console.log(`   Allowed: ${perm.allowed ? '✅ Yes' : '❌ No'}`);
        });
      } else {
        console.log('\n⚠️ No permissions defined');
      }
      
      if (adminUser.firstName || adminUser.lastName) {
        console.log(`\n👤 Name: ${adminUser.firstName || ''} ${adminUser.lastName || ''}`);
      }
      
      if (adminUser.notes) {
        console.log(`\n📝 Notes: ${adminUser.notes}`);
      }
      
      if (adminUser.metadata) {
        console.log('\n📊 Metadata:');
        console.log(JSON.stringify(adminUser.metadata, null, 2));
      }
      
    } else {
      console.log('❌ Admin user not found in Admin collection');
    }
    
    // Check User collection
    console.log('\n🔍 Checking User Collection...');
    const User = mongoose.connection.db.collection('users');
    const regularUser = await User.findOne({ email: 'admin@admin.com' });
    
    if (regularUser) {
      console.log('👤 Regular User Found:');
      console.log('=====================================');
      console.log(`📧 Email: ${regularUser.email}`);
      console.log(`👤 Name: ${regularUser.name}`);
      console.log(`✅ Active: ${regularUser.isActive}`);
      console.log(`✅ Email Verified: ${regularUser.emailVerified}`);
      console.log(`🔒 Locked: ${regularUser.isLocked || false}`);
      console.log(`📅 Created: ${regularUser.createdAt}`);
    } else {
      console.log('⚠️ No regular user found with this email');
    }
    
    // Check UserRoles collection
    console.log('\n🔍 Checking User Roles Collection...');
    const UserRoles = mongoose.connection.db.collection('userroles');
    if (regularUser) {
      const userRoles = await UserRoles.findOne({ userId: regularUser._id });
      if (userRoles) {
        console.log('🎭 User Roles Found:');
        console.log('=====================================');
        console.log(`🔑 System Role: ${userRoles.systemRole}`);
        if (userRoles.globalRoles && userRoles.globalRoles.length > 0) {
          console.log(`🌍 Global Roles: ${userRoles.globalRoles.join(', ')}`);
        }
        if (userRoles.workspaceRoles && userRoles.workspaceRoles.length > 0) {
          console.log(`🏢 Workspace Roles: ${userRoles.workspaceRoles.length} workspaces`);
        }
      } else {
        console.log('⚠️ No user roles found');
      }
    }
    
    // Check all admin users
    console.log('\n🔍 Checking All Admin Users...');
    const allAdmins = await Admin.find({}).toArray();
    console.log(`📊 Total Admin Users: ${allAdmins.length}`);
    
    if (allAdmins.length > 0) {
      console.log('\n👥 All Admin Users:');
      console.log('=====================================');
      allAdmins.forEach((admin, index) => {
        console.log(`${index + 1}. ${admin.userEmail} - ${admin.role} (${admin.isActive ? 'Active' : 'Inactive'})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking admin user:', error);
  }
};

// Main function
const main = async () => {
  try {
    await connectDB();
    await checkAdminUser();
    console.log('\n🎉 Admin user check completed!');
  } catch (error) {
    console.error('❌ Script failed:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

main();
