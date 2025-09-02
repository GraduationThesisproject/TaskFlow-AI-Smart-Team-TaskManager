const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');
const UserRoles = require('../models/UserRoles');
const Space = require('../models/Space');
const Workspace = require('../models/Workspace');

async function checkSpacePermissions() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflow';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Find all spaces with "Analytics" or "Test" in the name
    const spaces = await Space.find({ 
      name: { $regex: /(Analytics|Test)/i } 
    }).populate('workspace', 'name');
    
    console.log('\n📁 Found Analytics/Test Spaces:');
    spaces.forEach(space => {
      console.log(`   - ${space.name} (ID: ${space._id.toString()})`);
      console.log(`     Workspace: ${space.workspace?.name || 'Unknown'}`);
      console.log(`     Members: ${space.members.length}`);
    });

    // Check the specific space ID from the error
    const errorSpaceId = '68b0fe70cda1977ca4c9a07b';
    console.log(`\n🔍 Checking space ID from error: ${errorSpaceId}`);
    
    const errorSpace = await Space.findById(errorSpaceId);
    if (errorSpace) {
      console.log(`   ✅ Space exists: ${errorSpace.name}`);
      console.log(`   Members: ${errorSpace.members.length}`);
    } else {
      console.log('   ❌ Space not found with this ID');
    }

    // Get test users and check their permissions
    const testUsers = await User.find({ 
      email: { $in: [
        'superadmin.test@gmail.com',
        'admin.test@gmail.com', 
        'user.test@gmail.com',
        'manager.test@gmail.com',
        'developer.test@gmail.com'
      ]}
    });

    console.log(`\n👥 Found ${testUsers.length} test users:`);

    for (const user of testUsers) {
      console.log(`\n🔧 User: ${user.name} (${user.email})`);
      
      // Get user roles
      const userRoles = await UserRoles.findOne({ userId: user._id });
      if (!userRoles) {
        console.log('   ❌ No UserRoles record found');
        continue;
      }

      console.log(`   System Role: ${userRoles.systemRole}`);
      console.log(`   Workspaces: ${userRoles.workspaces.length}`);
      console.log(`   Spaces: ${userRoles.spaces.length}`);

      // Check permissions for each space
      for (const space of spaces) {
        const hasRole = userRoles.hasSpaceRole ? userRoles.hasSpaceRole(space._id) : false;
        const spaceRole = userRoles.spaces.find(s => s.space.toString() === space._id.toString());
        console.log(`   Space "${space.name}": ${hasRole ? '✅' : '❌'} ${spaceRole ? `(${spaceRole.role})` : '(no role)'}`);
      }

      // Check the specific error space ID
      if (errorSpace) {
        const hasErrorSpaceRole = userRoles.hasSpaceRole ? userRoles.hasSpaceRole(errorSpaceId) : false;
        const errorSpaceRole = userRoles.spaces.find(s => s.space.toString() === errorSpaceId);
        console.log(`   Error Space: ${hasErrorSpaceRole ? '✅' : '❌'} ${errorSpaceRole ? `(${errorSpaceRole.role})` : '(no role)'}`);
      }
    }

    // Show the correct space ID to use
    const correctSpace = spaces.find(s => s.name.includes('Analytics Test Space') || s.name.includes('Test'));
    if (correctSpace) {
      console.log(`\n🎯 Correct Space ID to use: ${correctSpace._id.toString()}`);
      console.log(`   Name: ${correctSpace.name}`);
      console.log(`   Use this URL: http://localhost:5173/workspace/reports?spaceId=${correctSpace._id.toString()}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkSpacePermissions();
