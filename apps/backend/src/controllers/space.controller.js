const Space = require('../models/Space');
const Workspace = require('../models/Workspace');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { sendResponse } = require('../utils/response');
const logger = require('../config/logger');

// Get all spaces for workspace (query parameter version for frontend compatibility)
exports.getSpacesByWorkspace = async (req, res) => {
    try {
        const { workspace: workspaceId } = req.query;
        
        if (!workspaceId) {
            return sendResponse(res, 400, false, 'Workspace ID is required');
        }
        
        const userId = req.user.id;

        // Get both active and archived spaces
        const spaces = await Space.find({ workspace: workspaceId, isActive: true })
            .populate('members.user', 'name email avatar')
            .populate('boards', 'name type')
            .sort({ updatedAt: -1 });

        // Calculate real-time stats for each space
        const Board = require('../models/Board');
        const Task = require('../models/Task');
        
        const spacesWithStats = await Promise.all(spaces.map(async (space) => {
            // Get real-time board count
            const boardCount = await Board.countDocuments({ 
                space: space._id, 
                isArchived: { $ne: true } 
            });
            
            // Get real-time task counts
            const taskCount = await Task.countDocuments({ 
                space: space._id, 
                archived: { $ne: true } 
            });
            
            const completedTaskCount = await Task.countDocuments({ 
                space: space._id, 
                status: 'completed', 
                archived: { $ne: true } 
            });
            
            const overdueTaskCount = await Task.countDocuments({ 
                space: space._id, 
                dueDate: { $lt: new Date() },
                status: { $ne: 'completed' },
                archived: { $ne: true }
            });

            // Update space stats with real-time data
            space.stats.totalBoards = boardCount;
            space.stats.totalTasks = taskCount;
            space.stats.completedTasks = completedTaskCount;
            space.stats.overdueTasks = overdueTaskCount;
            space.stats.activeMembersCount = space.members.length;

            return space;
        }));

        sendResponse(res, 200, true, 'Spaces retrieved successfully', {
            spaces: spacesWithStats,
            count: spacesWithStats.length
        });
    } catch (error) {
        logger.error('Get spaces by workspace error:', error);
        sendResponse(res, 500, false, 'Server error retrieving spaces');
    }
};

// Get all spaces for workspace (original params version)
exports.getSpaces = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const userId = req.user.id;

        // Get both active and archived spaces
        const spaces = await Space.find({ workspace: workspaceId, isActive: true })
            .populate('members.user', 'name email avatar')
            .populate('boards', 'name type')
            .sort({ updatedAt: -1 });

        // Calculate real-time stats for each space
        const Board = require('../models/Board');
        const Task = require('../models/Task');
        
        const spacesWithStats = await Promise.all(spaces.map(async (space) => {
            // Get real-time board count
            const boardCount = await Board.countDocuments({ 
                space: space._id, 
                isArchived: { $ne: true } 
            });
            
            // Get real-time task counts
            const taskCount = await Task.countDocuments({ 
                space: space._id, 
                archived: { $ne: true } 
            });
            
            const completedTaskCount = await Task.countDocuments({ 
                space: space._id, 
                status: 'completed', 
                archived: { $ne: true } 
            });
            
            const overdueTaskCount = await Task.countDocuments({ 
                space: space._id, 
                dueDate: { $lt: new Date() },
                status: { $ne: 'completed' },
                archived: { $ne: true }
            });

            // Update space stats with real-time data
            space.stats.totalBoards = boardCount;
            space.stats.totalTasks = taskCount;
            space.stats.completedTasks = completedTaskCount;
            space.stats.overdueTasks = overdueTaskCount;
            space.stats.activeMembersCount = space.members.length;

            return space;
        }));

        sendResponse(res, 200, true, 'Spaces retrieved successfully', {
            spaces: spacesWithStats,
            count: spacesWithStats.length
        });
    } catch (error) {
        logger.error('Get spaces error:', error);
        sendResponse(res, 500, false, 'Server error retrieving spaces');
    }
};

// Get single space
exports.getSpace = async (req, res) => {
    try {
        const { id: spaceId } = req.params;
        const userId = req.user.id;

        const space = await Space.findById(spaceId)
            .populate('workspace', 'name')
            .populate('members.user', 'name email avatar')
            .populate('boards', 'name type stats')
            .populate('activityLog')
            .limit(20);

        if (!space) {
            return sendResponse(res, 404, false, 'Space not found');
        }

        sendResponse(res, 200, true, 'Space retrieved successfully', {
            space: {
                ...space.toObject(),
                healthStatus: space.healthStatus,
                completionRate: space.completionRate,
                memberCount: space.memberCount
            }
        });
    } catch (error) {
        logger.error('Get space error:', error);
        sendResponse(res, 500, false, 'Server error retrieving space');
    }
};

// Create new space
exports.createSpace = async (req, res) => {
    try {
        const { 
            name, 
            description, 
            workspaceId,
            settings,
            permissions 
        } = req.body;
        const userId = req.user.id;

        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return sendResponse(res, 404, false, 'Workspace not found');
        }

        // Enforce workspace space limit BEFORE creating the space
        try {
            const current = Number(workspace?.usage?.spacesCount || 0);
            const maximum = Number(workspace?.limits?.maxSpaces || 0);
            if (maximum && current >= maximum) {
                return sendResponse(res, 400, false, 'Workspace space limit reached', {
                    limit: { current, maximum }
                });
            }
        } catch (limitErr) {
            // Non-blocking: if limits are malformed, continue with creation but log for diagnostics
            logger.warn('Workspace limit check failed in createSpace', {
                workspaceId,
                message: limitErr?.message,
            });
        }

        const space = await Space.create({
            name,
            description,
            workspace: workspaceId,
            members: [{
                user: userId,
                role: 'admin',
                addedBy: userId
            }],
            settings: settings || {},
            permissions: permissions || {}
        });

        // Add space to workspace (robust: fallback if instance method not present)
        try {
            if (typeof workspace.addSpace === 'function') {
                await workspace.addSpace(space._id);
            } else {
                await Workspace.findByIdAndUpdate(
                    workspaceId,
                    { $addToSet: { spaces: space._id } },
                    { new: true }
                );
            }
        } catch (attachErr) {
            logger.error('Failed to attach space to workspace', {
                workspaceId,
                spaceId: String(space._id),
                message: attachErr?.message,
                stack: attachErr?.stack,
            });
            // Do not fail creation: continue; a background repair can re-link if needed
        }

        await space.populate('workspace', 'name');

        // Log activity
        await ActivityLog.logActivity({
            userId,
            action: 'space_create',
            description: `Created space: ${name}`,
            entity: { type: 'Space', id: space._id, name },
            workspaceId,
            spaceId: space._id,
            metadata: { ipAddress: req.ip }
        });

        logger.info(`Space created: ${name} in workspace ${workspace?.name || workspaceId}`);

        sendResponse(res, 201, true, 'Space created successfully', {
            space: space.toObject(),
            userRole: 'admin'
        });
    } catch (error) {
        logger.error('Create space error', {
            message: error?.message,
            stack: error?.stack,
            name: error?.name,
        });
        sendResponse(res, 500, false, 'Server error creating space');
    }
};

// Update space
exports.updateSpace = async (req, res) => {
    try {
        const { id: spaceId } = req.params;
        const { name, description, settings, permissions, isArchived } = req.body;
        const userId = req.user.id;

        const space = await Space.findById(spaceId);
        if (!space) {
            return sendResponse(res, 404, false, 'Space not found');
        }

        // Store old values
        const oldValues = {
            name: space.name,
            description: space.description
        };

        // Update fields
        if (name) space.name = name;
        if (description) space.description = description;
        
        // Handle archive/unarchive
        if (typeof isArchived === 'boolean') {
            if (isArchived && !space.isArchived) {
                // Archive the space
                space.isArchived = true;
                space.archivedAt = new Date();
                space.archivedBy = userId;
            } else if (!isArchived && space.isArchived) {
                // Unarchive the space
                space.isArchived = false;
                space.archivedAt = null;
                space.archivedBy = null;
            }
        }

        // Update settings
        if (settings) {
            await space.updateSettings('settings', settings);
        }

        // Update permissions
        if (permissions) {
            await space.updatePermissions(permissions);
        }

        await space.save();

        // Log activity
        let action = 'space_update';
        let logDescription = `Updated space: ${space.name}`;
        
        if (typeof isArchived === 'boolean') {
            if (isArchived && !space.isArchived) {
                action = 'space_archive';
                logDescription = `Archived space: ${space.name}`;
            } else if (!isArchived && space.isArchived) {
                action = 'space_unarchive';
                logDescription = `Unarchived space: ${space.name}`;
            }
        }
        
        await ActivityLog.logActivity({
            userId,
            action,
            description: logDescription,
            entity: { type: 'Space', id: spaceId, name: space.name },
            workspaceId: space.workspace,
            spaceId,
            metadata: {
                oldValues,
                newValues: { name, description, isArchived },
                ipAddress: req.ip
            }
        });

        sendResponse(res, 200, true, 'Space updated successfully', {
            space: space.toObject()
        });
    } catch (error) {
        logger.error('Update space error:', error);
        sendResponse(res, 500, false, 'Server error updating space');
    }
};

// Get space members
exports.getSpaceMembers = async (req, res) => {
    try {
        const { id: spaceId } = req.params;
        const userId = req.user.id;

        const space = await Space.findById(spaceId)
            .populate('members.user', 'name email avatar')
            .populate('members.addedBy', 'name email');

        if (!space) {
            return sendResponse(res, 404, false, 'Space not found');
        }

        // Format member data
        const members = space.members.map(member => ({
            _id: member._id,
            user: member.user,
            role: member.role,
            joinedAt: member.joinedAt,
            addedBy: member.addedBy,
            permissions: member.permissions
        }));

        sendResponse(res, 200, true, 'Space members retrieved successfully', {
            members: members,
            count: members.length
        });
    } catch (error) {
        logger.error('Get space members error:', error);
        sendResponse(res, 500, false, 'Server error retrieving space members');
    }
};

// Add member to space
exports.addMember = async (req, res) => {
    try {
        const { id: spaceId } = req.params;
        const { userId: newMemberId, role = 'member' } = req.body;
        const currentUserId = req.user.id;

        const space = await Space.findById(spaceId);
        if (!space) {
            return sendResponse(res, 404, false, 'Space not found');
        }

        // Validate role
        const allowedRoles = ['viewer', 'member', 'admin'];
        if (!allowedRoles.includes(role)) {
            return sendResponse(res, 400, false, 'Invalid role specified');
        }

        // Ensure new member is part of workspace
        const workspace = await Workspace.findById(space.workspace);
        const isWorkspaceMember = workspace.members.some(m => m.user.toString() === newMemberId.toString());
        if (!isWorkspaceMember && workspace.owner.toString() !== newMemberId.toString()) {
            // return sendResponse(res, 403, false, 'User must be a member of the workspace to join space');
        }

        // Get new member info for logging
        const newMember = await User.findById(newMemberId);

        if (!newMember) {
            return sendResponse(res, 404, false, 'User not found');
        }

        // Add member to space
        await space.addMember(newMemberId, role, currentUserId);

        // Log activity
        await ActivityLog.logActivity({
            userId: currentUserId,
            action: 'space_member_add',
            description: `Added member to space: ${space.name}`,
            entity: { type: 'Space', id: spaceId, name: space.name },
            relatedEntities: [{ type: 'User', id: newMemberId, name: newMember?.name || 'Unknown User' }],
            workspaceId: space.workspace,
            spaceId,
            metadata: {
                memberRole: role,
                ipAddress: req.ip
            }
        });

        sendResponse(res, 200, true, 'Member added to space successfully');
    } catch (error) {
        logger.error('Add space member error:', error);
        sendResponse(res, 500, false, 'Server error adding member to space');
    }
};

// Remove member from space
exports.removeMember = async (req, res) => {
    try {
        const { id: spaceId, memberId } = req.params;
        const currentUserId = req.user.id;

        console.log('=== REMOVE MEMBER DEBUG (Backend) ===');
        console.log('spaceId:', spaceId);
        console.log('memberId (user ID):', memberId);
        console.log('currentUserId:', currentUserId);

        const space = await Space.findById(spaceId);
        if (!space) {
            console.log('Space not found');
            return sendResponse(res, 404, false, 'Space not found');
        }

        console.log('Space found:', space.name);
        console.log('Space members count:', space.members.length);
        console.log('Space members:', space.members.map(m => ({
            membershipId: m._id,
            userId: m.user.toString(),
            role: m.role,
            userName: m.user?.name || 'Unknown'
        })));

        // Check if member exists in space
        const member = space.members.find(m => m.user.toString() === memberId.toString());
        if (!member) {
            console.log('Member not found in space members array');
            console.log('Looking for user ID:', memberId);
            console.log('Available user IDs:', space.members.map(m => m.user.toString()));
            
            // Check if the user exists at all
            const userExists = await User.findById(memberId);
            if (!userExists) {
                console.log('User does not exist in database');
                return sendResponse(res, 404, false, 'User not found');
            }
            
            // User exists but not in this space - might have been already removed
            console.log('User exists but not in this space - might have been already removed');
            return sendResponse(res, 200, true, 'Member was already removed from space');
        }

        console.log('Member found:', {
            membershipId: member._id,
            userId: member.user.toString(),
            role: member.role
        });

        // Get member info for logging
        const memberUser = await User.findById(memberId);
        console.log('Member user found:', memberUser ? {
            id: memberUser._id,
            name: memberUser.name,
            email: memberUser.email
        } : 'User not found');

        // Remove member from space
        console.log('Calling space.removeMember with user ID:', memberId);
        await space.removeMember(memberId);
        console.log('Member removed successfully');

        // Log activity
        await ActivityLog.logActivity({
            userId: currentUserId,
            action: 'space_member_remove',
            description: `Removed member from space: ${space.name}`,
            entity: { type: 'Space', id: spaceId, name: space.name },
            relatedEntities: [{ type: 'User', id: memberId, name: memberUser?.name || 'Unknown User' }],
            workspaceId: space.workspace,
            spaceId,
            metadata: {
                memberRole: member.role,
                ipAddress: req.ip
            }
        });

        sendResponse(res, 200, true, 'Member removed from space successfully');
    } catch (error) {
        logger.error('Remove space member error:', error);
        sendResponse(res, 500, false, 'Server error removing member from space');
    }
};

// Archive space
exports.archiveSpace = async (req, res) => {
    try {
        const { id: spaceId } = req.params;
        const { unarchive } = req.body || {};
        const userId = req.user.id;

        const space = await Space.findById(spaceId);
        if (!space) {
            return sendResponse(res, 404, false, 'Space not found');
        }

        if (unarchive) {
            await space.unarchive();
            
            // Log activity
            await ActivityLog.logActivity({
                userId,
                action: 'space_update',
                description: `Unarchived space: ${space.name}`,
                entity: { type: 'Space', id: spaceId, name: space.name },
                workspaceId: space.workspace,
                spaceId,
                metadata: { ipAddress: req.ip }
            });

            sendResponse(res, 200, true, 'Space unarchived successfully', {
                space: space.toObject()
            });
        } else {
            await space.archive(userId);

            // Log activity
            await ActivityLog.logActivity({
                userId,
                action: 'space_archive',
                description: `Archived space: ${space.name}`,
                entity: { type: 'Space', id: spaceId, name: space.name },
                workspaceId: space.workspace,
                spaceId,
                metadata: { ipAddress: req.ip },
                severity: 'warning'
            });

            sendResponse(res, 200, true, 'Space archived successfully', {
                space: {
                    ...space.toObject(),
                    archiveCountdownSeconds: Math.max(0, Math.floor((space.archiveExpiresAt.getTime() - Date.now()) / 1000))
                }
            });
        }
    } catch (error) {
        logger.error('Archive space error:', error);
        sendResponse(res, 500, false, 'Server error archiving space');
    }
};

// Permanently delete an archived space
exports.permanentDeleteSpace = async (req, res) => {
    try {
        const { id: spaceId } = req.params;
        const userId = req.user.id;

        const space = await Space.findById(spaceId);
        if (!space) {
            return sendResponse(res, 404, false, 'Space not found');
        }

        // Check if space is archived
        if (!space.isArchived) {
            return sendResponse(res, 400, false, 'Space must be archived before permanent deletion');
        }

        // Check if archive expiration time has passed (24 hours)
        if (space.archiveExpiresAt && space.archiveExpiresAt > new Date()) {
            const remainingMs = space.archiveExpiresAt.getTime() - Date.now();
            const remainingHours = Math.ceil(remainingMs / (1000 * 60 * 60));
            return sendResponse(res, 400, false, `Space cannot be permanently deleted yet. Please wait ${remainingHours} more hours.`);
        }

        // Perform permanent deletion
        const result = await space.permanentDelete(userId);

        // Log activity
        await ActivityLog.logActivity({
            userId,
            action: 'space_permanent_delete',
            description: `Permanently deleted space: ${space.name}`,
            entity: { type: 'Space', id: spaceId, name: space.name },
            workspaceId: space.workspace,
            spaceId,
            metadata: { ipAddress: req.ip },
            severity: 'critical'
        });

        sendResponse(res, 200, true, result.message);
    } catch (error) {
        logger.error('Permanent delete space error:', error);
        sendResponse(res, 500, false, 'Server error permanently deleting space');
    }
};
