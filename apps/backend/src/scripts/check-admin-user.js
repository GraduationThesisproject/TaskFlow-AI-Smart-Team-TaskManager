const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');
const UserRoles = require('../models/UserRoles');
const Space = require('../models/Space');
const Workspace = require('../models/Workspace');

async function checkAdminUser() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflow';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Find admin.test@gmail.com user
    const adminUser = await User.findOne({ email: 'admin.test@gmail.com' });
    if (!adminUser) {
      console.log('❌ admin.test@gmail.com user not found');
      return;
    }

    console.log(`\n👤 User: ${adminUser.name} (${adminUser.email})`);
    console.log(`   ID: ${adminUser._id}`);
    console.log(`   Created: ${adminUser.createdAt}`);

    // Get user roles
    const userRoles = await UserRoles.findOne({ userId: adminUser._id });
    if (!userRoles) {
      console.log('❌ No UserRoles record found');
      return;
    }

    console.log(`\n🔐 User Roles:`);
    console.log(`   System Role: ${userRoles.systemRole}`);
    console.log(`   Workspaces: ${userRoles.workspaces.length}`);
    console.log(`   Spaces: ${userRoles.spaces.length}`);

    // Show workspace access
    console.log(`\n🏢 Workspace Access:`);
    for (const ws of userRoles.workspaces) {
      const workspace = await Workspace.findById(ws.workspace);
      console.log(`   - ${workspace?.name || 'Unknown'} (${ws.workspace}) - Role: ${ws.role}`);
    }

    // Show space access
    console.log(`\n📁 Space Access:`);
    for (const sp of userRoles.spaces) {
      const space = await Space.findById(sp.space).populate('workspace', 'name');
      console.log(`   - ${space?.name || 'Unknown'} (${sp.space}) - Role: ${sp.role}`);
      console.log(`     Workspace: ${space?.workspace?.name || 'Unknown'}`);
    }

    // Check specific analytics space
    const analyticsSpaceId = '68b0fe70cda1977ca4c9a092';
    const hasAnalyticsAccess = userRoles.hasSpaceRole ? userRoles.hasSpaceRole(analyticsSpaceId) : false;
    const analyticsSpaceRole = userRoles.spaces.find(s => s.space.toString() === analyticsSpaceId);
    
    console.log(`\n🎯 Analytics Space Access (${analyticsSpaceId}):`);
    console.log(`   Has Access: ${hasAnalyticsAccess ? '✅ YES' : '❌ NO'}`);
    console.log(`   Role: ${analyticsSpaceRole ? analyticsSpaceRole.role : 'None'}`);

    // Show all spaces user is member of (from Space.members)
    const spacesAsMember = await Space.find({ 
      'members.user': adminUser._id 
    }).populate('workspace', 'name');

    console.log(`\n📋 Direct Space Memberships:`);
    spacesAsMember.forEach(space => {
      const member = space.members.find(m => m.user.toString() === adminUser._id.toString());
      console.log(`   - ${space.name} (${space._id}) - Role: ${member?.role || 'Unknown'}`);
      console.log(`     Workspace: ${space.workspace?.name || 'Unknown'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkAdminUser();
