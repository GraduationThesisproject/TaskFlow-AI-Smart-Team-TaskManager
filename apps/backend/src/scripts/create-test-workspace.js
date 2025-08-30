const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Workspace = require('../models/Workspace');
const Space = require('../models/Space');
const UserRoles = require('../models/UserRoles');

async function createTestWorkspaceAndSpace() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflow';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Find the manager user
    const managerUser = await User.findOne({ email: 'manager.test@gmail.com' });
    if (!managerUser) {
      throw new Error('Manager user not found');
    }
    console.log('👤 Found manager user:', managerUser.name);

    // Create a test workspace
    const workspace = new Workspace({
      name: 'Test Analytics Workspace',
      description: 'Workspace for testing analytics functionality',
      owner: managerUser._id,
      members: [{
        user: managerUser._id,
        role: 'admin',
        joinedAt: new Date(),
        permissions: {
          canCreateSpaces: true,
          canManageMembers: true,
          canEditSettings: true,
          canDeleteWorkspace: false
        }
      }],
      settings: {
        isPublic: false,
        allowInvitations: true,
        defaultSpaceRole: 'member'
      }
    });

    await workspace.save();
    console.log('🏢 Created workspace:', workspace.name);

    // Create a test space
    const space = new Space({
      name: 'Analytics Test Space',
      description: 'Space for testing analytics API',
      workspace: workspace._id,
      owner: managerUser._id,
      members: [{
        user: managerUser._id,
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
      }],
      type: 'project',
      color: '#3B82F6',
      isArchived: false,
      settings: {
        isPublic: false,
        allowComments: true,
        requireApproval: false
      }
    });

    await space.save();
    console.log('📁 Created space:', space.name);

    // Update UserRoles for the manager
    let userRoles = await UserRoles.findOne({ userId: managerUser._id });
    
    if (!userRoles) {
      userRoles = new UserRoles({ userId: managerUser._id });
    }

    // Add workspace role
    await userRoles.addWorkspaceRole(workspace._id, 'admin', {
      canCreateSpaces: true,
      canManageMembers: true,
      canEditSettings: true,
      canDeleteWorkspace: false
    });

    // Add space role
    await userRoles.addSpaceRole(space._id, 'admin', {
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

    console.log('🔐 Updated UserRoles for manager');
    console.log('📊 Space ID for analytics testing:', space._id.toString());
    console.log('🏢 Workspace ID:', workspace._id.toString());
    
    console.log('\n🚀 Test the analytics API with:');
    console.log(`   Space ID: ${space._id.toString()}`);
    console.log('   User: manager.test@gmail.com');
    console.log('   Password: 12345678A!');

  } catch (error) {
    console.error('❌ Error creating test workspace:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

createTestWorkspaceAndSpace();
