/**
 * Test Member Role Update Script
 * Test the updateMemberRole function with proper ObjectId handling
 */

const mongoose = require('mongoose');
const Workspace = require('../models/Workspace');
const User = require('../models/User');
const env = require('../config/env');

async function testMemberRoleUpdate() {
    try {
        // Connect to MongoDB
        await mongoose.connect(env.DATABASE_URL);
        console.log('Connected to MongoDB');

        const workspaceId = '68cc34c1c0b4a26eb21d07ac';
        const userId = '68cc34abc0b4a26eb21d06db';

        // Find the workspace
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            console.log('Workspace not found');
            return;
        }

        console.log('=== TESTING OBJECTID COMPARISONS ===');
        console.log('Workspace ID:', workspace._id);
        console.log('Workspace Owner:', workspace.owner);
        console.log('User ID:', userId);
        console.log('User ID Type:', typeof userId);
        console.log('Owner Type:', typeof workspace.owner);

        // Test ObjectId comparison
        const isOwner = workspace.owner && workspace.owner.equals(userId);
        console.log('IsOwner (using .equals):', isOwner);

        // Test string comparison (should fail)
        const isOwnerString = workspace.owner && workspace.owner.toString() === userId.toString();
        console.log('IsOwner (using .toString):', isOwnerString);

        // Test member finding
        const currentUserMember = workspace.members.find(m => 
            m.user.equals(userId)
        );
        console.log('Current User Member (using .equals):', currentUserMember?.role);

        const currentUserMemberString = workspace.members.find(m => 
            m.user.toString() === userId.toString()
        );
        console.log('Current User Member (using .toString):', currentUserMemberString?.role);

        // Test member to update finding
        const memberToUpdate = workspace.members.find(m => 
            m.user.toString() === '68cc38be9075ea8e385e635d'
        );
        console.log('Member to Update (using .toString):', memberToUpdate?.role);

        const memberToUpdateEquals = workspace.members.find(m => 
            m.user.equals('68cc38be9075ea8e385e635d')
        );
        console.log('Member to Update (using .equals):', memberToUpdateEquals?.role);

        console.log('=== TEST COMPLETED ===');

    } catch (error) {
        console.error('Error testing member role update:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

// Run the script
if (require.main === module) {
    testMemberRoleUpdate();
}

module.exports = testMemberRoleUpdate;

