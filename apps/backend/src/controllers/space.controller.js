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

        // Check user's role in the workspace to determine space visibility
        const Workspace = require('../models/Workspace');
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return sendResponse(res, 404, false, 'Workspace not found');
        }

        // Check if user is workspace owner or admin
        const isWorkspaceOwner = workspace.owner.toString() === userId.toString();
        const isWorkspaceAdmin = workspace.members.some(member => 
            member.user.toString() === userId.toString() && 
            (member.role === 'admin' || member.role === 'owner')
        );

        console.log('🔍 Space filtering check:', {
            userId,
            workspaceId,
            isWorkspaceOwner,
            isWorkspaceAdmin,
            workspaceMembers: workspace.members.length
        });

        // Build query based on user role
        let spaceQuery = { workspace: workspaceId, isActive: true };
        
        // If user is not workspace owner/admin, only show spaces they are members of
        if (!isWorkspaceOwner && !isWorkspaceAdmin) {
            spaceQuery['members.user'] = userId;
        }

        // Get spaces based on user role
        const spaces = await Space.find(spaceQuery)
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

        // Check user's role in the workspace to determine space visibility
        const Workspace = require('../models/Workspace');
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return sendResponse(res, 404, false, 'Workspace not found');
        }

        // Check if user is workspace owner or admin
        const isWorkspaceOwner = workspace.owner.toString() === userId.toString();
        const isWorkspaceAdmin = workspace.members.some(member => 
            member.user.toString() === userId.toString() && 
            (member.role === 'admin' || member.role === 'owner')
        );

        // Build query based on user role
        let spaceQuery = { workspace: workspaceId, isActive: true };
        
        // If user is not workspace owner/admin, only show spaces they are members of
        if (!isWorkspaceOwner && !isWorkspaceAdmin) {
            spaceQuery['members.user'] = userId;
        }

        // Get spaces based on user role
        const spaces = await Space.find(spaceQuery)
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
            // Count actual active spaces in the database instead of using cached count
            const currentSpacesCount = await Space.countDocuments({ 
                workspace: workspaceId, 
                isActive: true 
            });
            const maximum = Number(workspace?.limits?.maxSpaces || 0);
            
            console.log('🔍 Space limit check:', {
                workspaceId,
                currentSpacesCount,
                maximum,
                workspaceUsage: workspace?.usage?.spacesCount,
                workspaceLimits: workspace?.limits?.maxSpaces
            });
            
            if (maximum && currentSpacesCount >= maximum) {
                return sendResponse(res, 400, false, 'Workspace space limit reached', {
                    limit: { current: currentSpacesCount, maximum }
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
                // Fallback: manually update spaces array and usage count
                await Workspace.findByIdAndUpdate(
                    workspaceId,
                    { 
                        $addToSet: { spaces: space._id },
                        $inc: { 'usage.spacesCount': 1 }
                    },
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

        // Emit real-time workspace space created event
        const { getWorkspaceSocketIO } = require('../utils/socketManager');
        const workspaceIo = getWorkspaceSocketIO();
        if (workspaceIo) {
            const eventData = {
                workspaceId,
                space: {
                    id: space._id,
                    name: space.name,
                    description: space.description,
                    settings: space.settings,
                    permissions: space.permissions,
                    createdAt: space.createdAt,
                    updatedAt: space.updatedAt
                },
                createdBy: {
                    id: userId,
                    name: req.user.name,
                    email: req.user.email
                }
            };
            
            console.log('🔔 Emitting workspace:space_created event:', eventData);
            workspaceIo.to(workspaceId.toString()).emit('workspace:space_created', eventData);
        }

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

        // Emit real-time workspace space updated event
        const { getWorkspaceSocketIO } = require('../utils/socketManager');
        const workspaceIo = getWorkspaceSocketIO();
        if (workspaceIo) {
            const eventData = {
                workspaceId: space.workspace,
                space: {
                    id: space._id,
                    name: space.name,
                    description: space.description,
                    settings: space.settings,
                    permissions: space.permissions,
                    isArchived: space.isArchived,
                    archivedAt: space.archivedAt,
                    updatedAt: space.updatedAt
                },
                updatedBy: {
                    id: userId,
                    name: req.user.name,
                    email: req.user.email
                },
                changes: {
                    name: name ? { old: oldValues.name, new: name } : null,
                    description: description ? { old: oldValues.description, new: description } : null,
                    isArchived: typeof isArchived === 'boolean' ? { old: !isArchived, new: isArchived } : null,
                    settings: settings ? { updated: true } : null,
                    permissions: permissions ? { updated: true } : null
                }
            };
            
            console.log('🔔 Emitting workspace:space_updated event:', eventData);
            workspaceIo.to(space.workspace.toString()).emit('workspace:space_updated', eventData);
        }

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

        console.log('🔍 Add member request:', {
            spaceId,
            newMemberId,
            role,
            currentUserId,
            body: req.body
        });

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

        console.log('🔍 Remove member request:', {
            spaceId,
            memberId,
            currentUserId
        });

        const space = await Space.findById(spaceId);
        if (!space) {
            return sendResponse(res, 404, false, 'Space not found');
        }

        // Check if member exists in space
        const memberToRemove = space.members.find(member => 
            member.user.toString() === memberId.toString()
        );
        
        if (!memberToRemove) {
            return sendResponse(res, 404, false, 'Member not found in this space');
        }

        // Get member info for logging
        const memberUser = await User.findById(memberId);

        // Remove member from space
        await space.removeMember(memberId);

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
                ipAddress: req.ip
            }
        });

        sendResponse(res, 200, true, 'Member removed from space successfully');
    } catch (error) {
        logger.error('Remove space member error:', error);
        sendResponse(res, 500, false, 'Server error removing space member');
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
