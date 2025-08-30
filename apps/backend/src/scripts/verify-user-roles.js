const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');
const UserRoles = require('../models/UserRoles');
const Space = require('../models/Space');

async function verifyUserRoles() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflow';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Find the manager user
    const managerUser = await User.findOne({ email: 'manager.test@gmail.com' });
    if (!managerUser) {
      console.log('❌ Manager user not found');
      return;
    }
    console.log('👤 Found manager user:', managerUser.name, 'ID:', managerUser._id.toString());

    // Find the test space
    const testSpace = await Space.findOne({ name: 'Analytics Test Space' });
    if (!testSpace) {
      console.log('❌ Test space not found');
      return;
    }
    console.log('📁 Found test space:', testSpace.name, 'ID:', testSpace._id.toString());

    // Check UserRoles
    const userRoles = await UserRoles.findOne({ userId: managerUser._id });
    if (!userRoles) {
      console.log('❌ No UserRoles found for manager');
      return;
    }
    
    console.log('🔐 UserRoles found for manager:');
    console.log('   System Role:', userRoles.systemRole);
    console.log('   Workspaces:', userRoles.workspaces.length);
    console.log('   Spaces:', userRoles.spaces.length);

    // Check specific space role
    const spaceRole = userRoles.spaces.find(space => 
      space.space.toString() === testSpace._id.toString()
    );
    
    if (spaceRole) {
      console.log('✅ Manager has space role:', spaceRole.role);
      console.log('   Permissions:', JSON.stringify(spaceRole.permissions, null, 2));
    } else {
      console.log('❌ Manager does not have role in test space');
    }

    // Test hasSpaceRole method
    const hasRole = userRoles.hasSpaceRole(testSpace._id, 'member');
    console.log('🧪 hasSpaceRole test result:', hasRole);

    // Show all users for comparison
    console.log('\n👥 All users in database:');
    const allUsers = await User.find({}, 'name email _id').limit(10);
    allUsers.forEach(user => {
      console.log(`   ${user.name} (${user.email}) - ID: ${user._id.toString()}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

verifyUserRoles();
