/**
 * Debug Workspace Script
 * Check the current state of a specific workspace
 */

const mongoose = require('mongoose');
const Workspace = require('../models/Workspace');
const User = require('../models/User');
const env = require('../config/env');

async function debugWorkspace() {
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

        console.log('=== WORKSPACE DEBUG ===');
        console.log('Workspace ID:', workspace._id);
        console.log('Workspace Name:', workspace.name);
        console.log('Workspace Owner:', workspace.owner);
        console.log('Workspace Owner Type:', typeof workspace.owner);
        console.log('User ID:', userId);
        console.log('User ID Type:', typeof userId);
        console.log('Owner Match:', workspace.owner.toString() === userId);
        console.log('Members Array:', JSON.stringify(workspace.members, null, 2));

        // Check if user is in members
        const userInMembers = workspace.members.find(member => 
            member.user.toString() === userId
        );
        console.log('User in Members:', userInMembers);

        // Check user details
        const user = await User.findById(userId);
        if (user) {
            console.log('User Found:', user.email);
        } else {
            console.log('User not found');
        }

    } catch (error) {
        console.error('Error debugging workspace:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

// Run the script
if (require.main === module) {
    debugWorkspace();
}

module.exports = debugWorkspace;

