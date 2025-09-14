const Space = require('../models/Space');
const Workspace = require('../models/Workspace');
const User = require('../models/User');
const { sendResponse } = require('../utils/response');
const logger = require('../config/logger');

/**
 * Clean up null user references from spaces and workspaces
 * POST /api/cleanup/null-users
 */
exports.cleanupNullUsers = async (req, res) => {
    try {
        const { dryRun = false } = req.body;
        
        logger.info(`Starting null user cleanup (dryRun: ${dryRun})`);
        
        let results = {
            spaces: { affected: 0, cleaned: 0 },
            workspaces: { affected: 0, cleaned: 0 },
            orphaned: { spaces: 0, workspaces: 0 }
        };
        
        // 1. Clean up spaces with null user references
        const spacesWithNullUsers = await Space.find({ "members.user": null });
        results.spaces.affected = spacesWithNullUsers.length;
        
        if (!dryRun && spacesWithNullUsers.length > 0) {
            await Space.updateMany(
                { "members.user": null },
                { $pull: { "members": { "user": null } } }
            );
            
            // Update member counts
            await Space.updateMany(
                {},
                [{ $set: { "stats.activeMembersCount": { $size: "$members" } } }]
            );
        }
        
        // 2. Clean up workspaces with null user references
        const workspacesWithNullUsers = await Workspace.find({ "members.user": null });
        results.workspaces.affected = workspacesWithNullUsers.length;
        
        if (!dryRun && workspacesWithNullUsers.length > 0) {
            await Workspace.updateMany(
                { "members.user": null },
                { $pull: { "members": { "user": null } } }
            );
        }
        
        // 3. Clean up orphaned references (user IDs that don't exist)
        const existingUserIds = await User.distinct("_id");
        
        const spacesWithOrphans = await Space.find({
            "members.user": { $nin: existingUserIds }
        });
        results.orphaned.spaces = spacesWithOrphans.length;
        
        if (!dryRun && spacesWithOrphans.length > 0) {
            await Space.updateMany(
                { "members.user": { $nin: existingUserIds } },
                { $pull: { "members": { "user": { $nin: existingUserIds } } } }
            );
        }
        
        const workspacesWithOrphans = await Workspace.find({
            "members.user": { $nin: existingUserIds }
        });
        results.orphaned.workspaces = workspacesWithOrphans.length;
        
        if (!dryRun && workspacesWithOrphans.length > 0) {
            await Workspace.updateMany(
                { "members.user": { $nin: existingUserIds } },
                { $pull: { "members": { "user": { $nin: existingUserIds } } } }
            );
        }
        
        // Calculate total cleaned
        const totalCleaned = results.spaces.affected + 
                           results.workspaces.affected + 
                           results.orphaned.spaces + 
                           results.orphaned.workspaces;
        
        logger.info(`Cleanup completed. Total records: ${totalCleaned}`);
        
        sendResponse(res, 200, true, 'Cleanup completed successfully', {
            dryRun,
            results,
            totalCleaned
        });
        
    } catch (error) {
        logger.error('Cleanup error:', error);
        sendResponse(res, 500, false, 'Cleanup failed', { error: error.message });
    }
};

/**
 * Get database health report
 * GET /api/cleanup/health
 */
exports.getDatabaseHealth = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalSpaces = await Space.countDocuments();
        const totalWorkspaces = await Workspace.countDocuments();
        
        // Count space members
        const spaceMembersResult = await Space.aggregate([
            { $unwind: '$members' },
            { $count: 'totalSpaceMembers' }
        ]);
        const totalSpaceMembers = spaceMembersResult[0]?.totalSpaceMembers || 0;
        
        // Count workspace members
        const workspaceMembersResult = await Workspace.aggregate([
            { $unwind: '$members' },
            { $count: 'totalWorkspaceMembers' }
        ]);
        const totalWorkspaceMembers = workspaceMembersResult[0]?.totalWorkspaceMembers || 0;
        
        // Count null references
        const spacesWithNullUsers = await Space.countDocuments({ "members.user": null });
        const workspacesWithNullUsers = await Workspace.countDocuments({ "members.user": null });
        
        // Count orphaned references
        const existingUserIds = await User.distinct("_id");
        const spacesWithOrphans = await Space.countDocuments({
            "members.user": { $nin: existingUserIds }
        });
        const workspacesWithOrphans = await Workspace.countDocuments({
            "members.user": { $nin: existingUserIds }
        });
        
        sendResponse(res, 200, true, 'Database health report generated', {
            stats: {
                users: totalUsers,
                spaces: totalSpaces,
                workspaces: totalWorkspaces,
                spaceMembers: totalSpaceMembers,
                workspaceMembers: totalWorkspaceMembers
            },
            issues: {
                spacesWithNullUsers,
                workspacesWithNullUsers,
                spacesWithOrphans,
                workspacesWithOrphans,
                totalIssues: spacesWithNullUsers + workspacesWithNullUsers + spacesWithOrphans + workspacesWithOrphans
            }
        });
        
    } catch (error) {
        logger.error('Health check error:', error);
        sendResponse(res, 500, false, 'Health check failed', { error: error.message });
    }
};
