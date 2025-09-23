/**
 * Fix Workspace Owners Script
 * Adds workspace owners to their members array if they're missing
 */

const mongoose = require('mongoose');
const Workspace = require('../models/Workspace');
const env = require('../config/env');

async function fixWorkspaceOwners() {
    try {
        // Connect to MongoDB
        await mongoose.connect(env.DATABASE_URL);
        console.log('Connected to MongoDB');

        // Find all workspaces
        const workspaces = await Workspace.find({});
        console.log(`Found ${workspaces.length} workspaces`);

        let fixedCount = 0;

        for (const workspace of workspaces) {
            if (!workspace.owner) {
                console.log(`Workspace ${workspace._id} has no owner, skipping`);
                continue;
            }

            // Check if owner is already in members array
            const ownerInMembers = workspace.members.some(member => 
                member.user.toString() === workspace.owner.toString()
            );

            if (!ownerInMembers) {
                console.log(`Fixing workspace ${workspace._id} - adding owner to members`);
                
                // Add owner to members array as admin (highest role available)
                workspace.members.push({
                    user: workspace.owner,
                    role: 'admin'
                });

                // Update member count
                if (!workspace.usage) {
                    workspace.usage = {};
                }
                workspace.usage.membersCount = workspace.members.length;

                try {
                    await workspace.save();
                    fixedCount++;
                } catch (saveError) {
                    console.error(`Error saving workspace ${workspace._id}:`, saveError.message);
                    console.error('Validation errors:', saveError.errors);
                }
            } else {
                console.log(`Workspace ${workspace._id} already has owner in members`);
            }
        }

        console.log(`Fixed ${fixedCount} workspaces`);
        console.log('Migration completed successfully');

    } catch (error) {
        console.error('Error fixing workspace owners:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

// Run the script
if (require.main === module) {
    fixWorkspaceOwners();
}

module.exports = fixWorkspaceOwners;
