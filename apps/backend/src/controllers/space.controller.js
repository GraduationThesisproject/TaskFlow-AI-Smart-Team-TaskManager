const Space = require('../models/Space');
const Workspace = require('../models/Workspace');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { sendResponse } = require('../utils/response');
const logger = require('../config/logger');

// Get all spaces for workspace
exports.getSpaces = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const userId = req.user.id;

        // SECURITY FIX: Use verified roles from auth middleware
        const userRoles = req.user.roles;
        
        if (!userRoles.hasWorkspaceRole(workspaceId)) {
            return sendResponse(res, 403, false, 'Access denied to workspace');
        }

        const spaces = await Space.findByWorkspace(workspaceId)
            .populate('members.user', 'name email avatar')
            .populate('boards', 'name type')
            .sort({ updatedAt: -1 });

        // Enrich with user permissions for each space
        const enrichedSpaces = spaces.map(space => {
            const userSpaceRole = userRoles.spaces.find(s => 
                s.space.toString() === space._id.toString()
            );

            return {
                ...space.toObject(),
                userRole: userSpaceRole ? userSpaceRole.role : null,
                userPermissions: userSpaceRole ? userSpaceRole.permissions : null,
                healthStatus: space.healthStatus,
                completionRate: space.completionRate
            };
        });

        sendResponse(res, 200, true, 'Spaces retrieved successfully', {
            spaces: enrichedSpaces,
            count: enrichedSpaces.length
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

        // SECURITY FIX: Use verified roles from auth middleware
        const userRoles = req.user.roles;
        
        if (!userRoles.hasSpacePermission(spaceId, 'canViewBoards')) {
            return sendResponse(res, 403, false, 'Access denied to this space');
        }

        const space = await Space.findById(spaceId)
            .populate('workspace', 'name')
            .populate('members.user', 'name email avatar')
            .populate('boards', 'name type stats')
            .populate('activityLog')
            .limit(20);

        if (!space) {
            return sendResponse(res, 404, false, 'Space not found');
        }

        // Get user's role and permissions
        const userSpaceRole = userRoles.spaces.find(s => 
            s.space.toString() === spaceId
        );

        sendResponse(res, 200, true, 'Space retrieved successfully', {
            space: {
                ...space.toObject(),
                healthStatus: space.healthStatus,
                completionRate: space.completionRate,
                memberCount: space.memberCount
            },
            userRole: userSpaceRole.role,
            userPermissions: userSpaceRole.permissions
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

        // Check workspace permissions
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        const workspaceRole = userRoles.workspaces.find(ws => 
            ws.workspace.toString() === workspaceId
        );

        if (!workspaceRole || !workspaceRole.permissions.canCreateSpaces) {
            return sendResponse(res, 403, false, 'Insufficient permissions to create spaces');
        }

        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return sendResponse(res, 404, false, 'Workspace not found');
        }

        // Check space limits
        if (workspace.usage.spacesCount >= workspace.limits.maxSpaces) {
            return sendResponse(res, 400, false, 'Workspace space limit reached');
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

        // Add space to workspace
        await workspace.addSpace(space._id);

        // Add space role to user
        await userRoles.addSpaceRole(space._id, 'admin');

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

        logger.info(`Space created: ${name} in workspace ${workspace.name}`);

        sendResponse(res, 201, true, 'Space created successfully', {
            space: space.toObject(),
            userRole: 'admin'
        });
    } catch (error) {
        logger.error('Create space error:', error);
        sendResponse(res, 500, false, 'Server error creating space');
    }
};

// Update space
exports.updateSpace = async (req, res) => {
    try {
        const { id: spaceId } = req.params;
        const { name, description, settings, permissions } = req.body;
        const userId = req.user.id;

        const space = await Space.findById(spaceId);
        if (!space) {
            return sendResponse(res, 404, false, 'Space not found');
        }

        // Check permissions using both role model and space membership
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        const hasRolePermission = userRoles.hasSpacePermission(spaceId, 'canEditSettings');
        const hasMemberPermission = space.hasPermission(userId, 'canEditSettings');
        if (!hasRolePermission && !hasMemberPermission) {
            return sendResponse(res, 403, false, 'Insufficient permissions to edit space');
        }

        // Store old values
        const oldValues = {
            name: space.name,
            description: space.description
        };

        // Update fields
        if (name) space.name = name;
        if (description) space.description = description;

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
        await ActivityLog.logActivity({
            userId,
            action: 'space_update',
            description: `Updated space: ${space.name}`,
            entity: { type: 'Space', id: spaceId, name: space.name },
            workspaceId: space.workspace,
            spaceId,
            metadata: {
                oldValues,
                newValues: { name, description },
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

        // SECURITY FIX: Use verified roles from auth middleware
        const userRoles = req.user.roles;
        const hasRolePermission = userRoles.hasSpacePermission(spaceId, 'canManageMembers');
        const hasMemberPermission = space.hasPermission(currentUserId, 'canManageMembers');
        if (!hasRolePermission && !hasMemberPermission) {
            return sendResponse(res, 403, false, 'Insufficient permissions to manage members');
        }

        // SECURITY FIX: Validate role assignment permissions
        // Get current user's space role to determine what roles they can assign
        const currentUserSpaceRole = userRoles.spaces.find(s => 
            s.space.toString() === spaceId
        );

        if (!currentUserSpaceRole) {
            return sendResponse(res, 403, false, 'You are not a member of this space');
        }

        // Role assignment validation based on current user's role
        const allowedRoles = ['viewer', 'member', 'admin'];
        if (!allowedRoles.includes(role)) {
            return sendResponse(res, 400, false, 'Invalid role specified');
        }

        // Only space admins can assign admin roles
        if (role === 'admin' && currentUserSpaceRole.role !== 'admin') {
            return sendResponse(res, 403, false, 'Only space admins can assign admin roles');
        }

        // Space admins can assign any role, members can only assign viewer/member roles
        if (currentUserSpaceRole.role === 'member' && role === 'admin') {
            return sendResponse(res, 403, false, 'Members can only assign viewer or member roles');
        }

        // Ensure new member is part of workspace
        const workspace = await Workspace.findById(space.workspace);
        const isWorkspaceMember = workspace.members.some(m => m.user.toString() === newMemberId.toString());
        if (!isWorkspaceMember && workspace.owner.toString() !== newMemberId.toString()) {
            return sendResponse(res, 403, false, 'User must be a member of the workspace to join space');
        }

        // Add member to space
        await space.addMember(newMemberId, role, currentUserId);

        // Add space role to user
        const newMember = await User.findById(newMemberId);
        const newMemberRoles = await newMember.getRoles();
        
        // Add space role with default permissions
        newMemberRoles.spaces.push({
            space: spaceId,
            role,
            permissions: space.getDefaultPermissions(role)
        });
        await newMemberRoles.save();

        // Log activity
        await ActivityLog.logActivity({
            userId: currentUserId,
            action: 'space_member_add',
            description: `Added member to space: ${space.name}`,
            entity: { type: 'Space', id: spaceId, name: space.name },
            relatedEntities: [{ type: 'User', id: newMemberId, name: newMember.name }],
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

// Archive space
exports.archiveSpace = async (req, res) => {
    try {
        const { id: spaceId } = req.params;
        const { unarchive } = req.body;
        const userId = req.user.id;

        const space = await Space.findById(spaceId);
        if (!space) {
            return sendResponse(res, 404, false, 'Space not found');
        }

        // Check permissions using both role model and space membership
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        const hasRolePermission = userRoles.hasSpacePermission(spaceId, 'canEditSettings');
        const hasMemberPermission = space.hasPermission(userId, 'canEditSettings');
        if (!hasRolePermission && !hasMemberPermission) {
            return sendResponse(res, 403, false, 'Insufficient permissions to archive space');
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

            sendResponse(res, 200, true, 'Space unarchived successfully');
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

            sendResponse(res, 200, true, 'Space archived successfully');
        }
    } catch (error) {
        logger.error('Archive space error:', error);
        sendResponse(res, 500, false, 'Server error archiving space');
    }
};
