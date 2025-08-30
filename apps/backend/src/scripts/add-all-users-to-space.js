const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');
const UserRoles = require('../models/UserRoles');
const Space = require('../models/Space');

async function addAllUsersToTestSpace() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflow';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Find the test space
    const testSpace = await Space.findOne({ name: 'Analytics Test Space' });
    if (!testSpace) {
      console.log('❌ Test space not found');
      return;
    }
    console.log('📁 Found test space:', testSpace.name, 'ID:', testSpace._id.toString());

    // Get all test users
    const testUsers = await User.find({ 
      email: { $in: [
        'superadmin.test@gmail.com',
        'admin.test@gmail.com', 
        'user.test@gmail.com',
        'manager.test@gmail.com',
        'developer.test@gmail.com'
      ]}
    });

    console.log(`👥 Found ${testUsers.length} test users`);

    for (const user of testUsers) {
      console.log(`\n🔧 Processing user: ${user.name} (${user.email})`);
      
      // Get or create UserRoles
      let userRoles = await UserRoles.findOne({ userId: user._id });
      if (!userRoles) {
        userRoles = new UserRoles({ userId: user._id });
        console.log('   Created new UserRoles');
      }

      // Check if user already has space role
      const existingSpaceRole = userRoles.spaces.find(space => 
        space.space.toString() === testSpace._id.toString()
      );

      if (existingSpaceRole) {
        console.log(`   ✅ Already has space role: ${existingSpaceRole.role}`);
        continue;
      }

      // Add space role
      await userRoles.addSpaceRole(testSpace._id, 'admin', {
        canViewBoards: true,
        canCreateBoards: true,
        canEditBoards: true,
        canDeleteBoards: true,
        canCreateTasks: true,
        canEditTasks: true,
        canDeleteTasks: true,
        canManageMembers: true,
        canEditSettings: true,
        canDeleteSpace: false
      });

      // Also add to space members if not already there
      const existingMember = testSpace.members.find(member => 
        member.user.toString() === user._id.toString()
      );

      if (!existingMember) {
        testSpace.members.push({
          user: user._id,
          role: 'admin',
          joinedAt: new Date(),
          permissions: {
            canViewBoards: true,
            canCreateBoards: true,
            canEditBoards: true,
            canDeleteBoards: true,
            canCreateTasks: true,
            canEditTasks: true,
            canDeleteTasks: true,
            canManageMembers: true,
            canEditSettings: true,
            canDeleteSpace: false
          }
        });
        console.log('   ➕ Added to space members');
      }

      console.log('   ✅ Added admin role to test space');
    }

    // Save the updated space
    await testSpace.save();
    console.log('\n💾 Saved space with all test users');

    console.log('\n🚀 All test users now have access to analytics space:');
    console.log(`   Space ID: ${testSpace._id.toString()}`);
    console.log('   Users with access:');
    testUsers.forEach(user => {
      console.log(`   - ${user.name} (${user.email})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

addAllUsersToTestSpace();
