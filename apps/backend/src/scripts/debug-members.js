/**
 * Debug Members Script
 * Check all members in the workspace
 */

const mongoose = require('mongoose');
const Workspace = require('../models/Workspace');
const User = require('../models/User');
const env = require('../config/env');

async function debugMembers() {
    try {
        // Connect to MongoDB
        await mongoose.connect(env.DATABASE_URL);
        console.log('Connected to MongoDB');

        const workspaceId = '68cc34c1c0b4a26eb21d07ac';

        // Find the workspace
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            console.log('Workspace not found');
            return;
        }

        console.log('=== WORKSPACE MEMBERS DEBUG ===');
        console.log('Workspace ID:', workspace._id);
        console.log('Total Members:', workspace.members.length);
        
        for (let i = 0; i < workspace.members.length; i++) {
            const member = workspace.members[i];
            console.log(`\nMember ${i + 1}:`);
            console.log('  ID:', member._id);
            console.log('  User ID:', member.user);
            console.log('  User ID Type:', typeof member.user);
            console.log('  Role:', member.role);
            console.log('  Joined At:', member.joinedAt);
            
            // Try to find the user
            try {
                const user = await User.findById(member.user);
                if (user) {
                    console.log('  User Email:', user.email);
                    console.log('  User Name:', user.name);
                } else {
                    console.log('  User: NOT FOUND');
                }
            } catch (err) {
                console.log('  User Error:', err.message);
            }
        }

        // Test the specific member ID we're looking for
        const targetMemberId = '68cc38be9075ea8e385e635d';
        console.log(`\n=== LOOKING FOR MEMBER: ${targetMemberId} ===`);
        
        const foundMember = workspace.members.find(m => 
            m.user.toString() === targetMemberId
        );
        console.log('Found by toString:', foundMember);

        const foundMemberEquals = workspace.members.find(m => 
            m.user.equals(targetMemberId)
        );
        console.log('Found by equals:', foundMemberEquals);

        // Check if the member ID exists in the database
        try {
            const userExists = await User.findById(targetMemberId);
            console.log('User exists in database:', !!userExists);
            if (userExists) {
                console.log('User email:', userExists.email);
            }
        } catch (err) {
            console.log('User lookup error:', err.message);
        }

    } catch (error) {
        console.error('Error debugging members:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

// Run the script
if (require.main === module) {
    debugMembers();
}

module.exports = debugMembers;

