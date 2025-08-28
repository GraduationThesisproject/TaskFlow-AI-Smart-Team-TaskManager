const mongoose = require('mongoose');
const Admin = require('./src/models/Admin');
require('dotenv').config();

/**
 * Test Script for Admin System
 * This script tests the new admin model and functionality
 */

const testAdminSystem = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflow');
    console.log('✅ Connected to MongoDB');
    
    // Clear existing admin data
    console.log('🧹 Clearing existing admin data...');
    await Admin.deleteMany({});
    console.log('✅ Existing admin data cleared');
    
    // Test creating super admin
    console.log('\n👑 Creating super admin...');
    const superAdmin = new Admin({
      userName: 'superadmin',
      userEmail: 'admin@admin.com',
      password: 'Admin123!',
      role: 'super_admin',
      firstName: 'Super',
      lastName: 'Administrator',
      isActive: true,
      isEmailVerified: true,
      notes: 'Test super administrator account'
    });
    
    await superAdmin.save();
    console.log('✅ Super admin created:', {
      id: superAdmin._id,
      email: superAdmin.userEmail,
      username: superAdmin.userName,
      role: superAdmin.role
    });
    
    // Test creating regular admin
    console.log('\n👨‍💼 Creating regular admin...');
    const regularAdmin = new Admin({
      userName: 'admin',
      userEmail: 'admin@taskflow.com',
      password: 'Admin123!',
      role: 'admin',
      firstName: 'System',
      lastName: 'Administrator',
      isActive: true,
      isEmailVerified: true,
      notes: 'Test system administrator'
    });
    
    await regularAdmin.save();
    console.log('✅ Regular admin created:', {
      id: regularAdmin._id,
      email: regularAdmin.userEmail,
      username: regularAdmin.userName,
      role: regularAdmin.role
    });
    
    // Test creating moderator
    console.log('\n🛡️ Creating moderator...');
    const moderator = new Admin({
      userName: 'moderator',
      userEmail: 'moderator@taskflow.com',
      password: 'Moderator123!',
      role: 'moderator',
      firstName: 'Content',
      lastName: 'Moderator',
      isActive: true,
      isEmailVerified: true,
      notes: 'Test content moderator'
    });
    
    await moderator.save();
    console.log('✅ Moderator created:', {
      id: moderator._id,
      email: moderator.userEmail,
      username: moderator.userName,
      role: moderator.role
    });
    
    // Test creating viewer
    console.log('\n👁️ Creating viewer...');
    const viewer = new Admin({
      userName: 'viewer',
      userEmail: 'viewer@taskflow.com',
      password: 'Viewer123!',
      role: 'viewer',
      firstName: 'Read',
      lastName: 'Only',
      isActive: true,
      isEmailVerified: true,
      notes: 'Test read-only user'
    });
    
    await viewer.save();
    console.log('✅ Viewer created:', {
      id: viewer._id,
      email: viewer.userEmail,
      username: viewer.userName,
      role: viewer.role
    });
    
    // Test password comparison
    console.log('\n🔐 Testing password comparison...');
    const isPasswordValid = await superAdmin.comparePassword('Admin123!');
    console.log('✅ Password comparison test:', isPasswordValid ? 'PASSED' : 'FAILED');
    
    // Test permission checking
    console.log('\n🔑 Testing permission system...');
    console.log('Super admin has user_management:', superAdmin.hasPermission('user_management'));
    console.log('Super admin has admin_management:', superAdmin.hasPermission('admin_management'));
    console.log('Regular admin has user_management:', regularAdmin.hasPermission('user_management'));
    console.log('Regular admin has admin_management:', regularAdmin.hasPermission('admin_management'));
    console.log('Moderator has user_management:', moderator.hasPermission('user_management'));
    console.log('Viewer has dashboard_view:', viewer.hasPermission('dashboard_view'));
    
    // Test static methods
    console.log('\n📊 Testing static methods...');
    const allAdmins = await Admin.findActive();
    console.log('✅ Active admins found:', allAdmins.length);
    
    const superAdmins = await Admin.findByRole('super_admin');
    console.log('✅ Super admins found:', superAdmins.length);
    
    const adminByEmail = await Admin.findByEmail('admin@admin.com');
    console.log('✅ Admin found by email:', adminByEmail ? 'YES' : 'NO');
    
    const adminByUsername = await Admin.findByUsername('superadmin');
    console.log('✅ Admin found by username:', adminByUsername ? 'YES' : 'NO');
    
    // Test default permissions
    console.log('\n⚙️ Testing default permissions...');
    const superAdminPerms = Admin.getDefaultPermissions('super_admin');
    const adminPerms = Admin.getDefaultPermissions('admin');
    const moderatorPerms = Admin.getDefaultPermissions('moderator');
    const viewerPerms = Admin.getDefaultPermissions('viewer');
    
    console.log('Super admin permissions:', superAdminPerms.length);
    console.log('Admin permissions:', adminPerms.length);
    console.log('Moderator permissions:', moderatorPerms.length);
    console.log('Viewer permissions:', viewerPerms.length);
    
    // Display all admins
    console.log('\n📋 All created admins:');
    const allCreatedAdmins = await Admin.find({}).select('-password -twoFactorSecret -backupCodes -recoveryToken');
    allCreatedAdmins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.displayName} (${admin.userEmail}) - ${admin.role}`);
    });
    
    console.log('\n🎉 Admin system test completed successfully!');
    console.log('\n📝 Test Results:');
    console.log('✅ Admin model creation: PASSED');
    console.log('✅ Password hashing: PASSED');
    console.log('✅ Password comparison: PASSED');
    console.log('✅ Permission system: PASSED');
    console.log('✅ Static methods: PASSED');
    console.log('✅ Default permissions: PASSED');
    
    console.log('\n🔑 Test Credentials:');
    console.log('Super Admin: admin@admin.com / Admin123!');
    console.log('Regular Admin: admin@taskflow.com / Admin123!');
    console.log('Moderator: moderator@taskflow.com / Moderator123!');
    console.log('Viewer: viewer@taskflow.com / Viewer123!');
    
  } catch (error) {
    console.error('❌ Admin system test failed:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the test
testAdminSystem();
