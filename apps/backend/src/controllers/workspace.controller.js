const Workspace = require('../models/Workspace');
const User = require('../models/User');
const Invitation = require('../models/Invitation');
const ActivityLog = require('../models/ActivityLog');
const { sendResponse } = require('../utils/response');
const { sendEmail } = require('../utils/email');
const logger = require('../config/logger');

// Get all workspaces for user
exports.getAllWorkspaces = async (req, res) => {
    try {
        const userId = req.user.id;

        const workspaces = await Workspace.findByUser(userId)
            .populate('owner', 'name email avatar')
            .populate('members.user', 'name email avatar')
            .sort({ updatedAt: -1 });

        // Get user role for each workspace
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();

        const enrichedWorkspaces = workspaces.map(workspace => {
            const userRole = userRoles.workspaces.find(ws => 
                ws.workspace.toString() === workspace._id.toString()
            );

            return {
                ...workspace.toObject(),
                userRole: userRole ? userRole.role : null,
                userPermissions: userRole ? userRole.permissions : null
            };
        });

        sendResponse(res, 200, true, 'Workspaces retrieved successfully', {
            workspaces: enrichedWorkspaces,
            count: enrichedWorkspaces.length
        });
    } catch (error) {
        logger.error('Get workspaces error:', error);
        sendResponse(res, 500, false, 'Server error retrieving workspaces');
    }
};

// Get single workspace
exports.getWorkspace = async (req, res) => {
    try {
        const { id: workspaceId } = req.params;
        const userId = req.user.id;

        // Check access
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        if (!userRoles.hasWorkspaceRole(workspaceId)) {
            return sendResponse(res, 403, false, 'Access denied to this workspace');
        }

        const workspace = await Workspace.findById(workspaceId)
            .populate('owner', 'name email avatar')
            .populate('members.user', 'name email avatar')
            .populate('spaces');

        if (!workspace) {
            return sendResponse(res, 404, false, 'Workspace not found');
        }

        // Get user's role and permissions
        const userWorkspaceRole = userRoles.workspaces.find(ws => 
            ws.workspace.toString() === workspaceId
        );

        sendResponse(res, 200, true, 'Workspace retrieved successfully', {
            workspace: {
                ...workspace.toObject(),
                stats: workspace.stats,
                health: workspace.health,
                availableFeatures: workspace.availableFeatures
            },
            userRole: userWorkspaceRole.role,
            userPermissions: userWorkspaceRole.permissions
        });
    } catch (error) {
        logger.error('Get workspace error:', error);
        sendResponse(res, 500, false, 'Server error retrieving workspace');
    }
};

// Create new workspace
exports.createWorkspace = async (req, res) => {
    try {
        const { name, description, plan = 'free' } = req.body;
        const userId = req.user.id;

        const workspace = await Workspace.create({
            name,
            description,
            owner: userId,
            plan,
            members: [], // Owner is not included in members array
            usage: {
                membersCount: 1 // Owner counts as 1
            }
        });

        // Add owner role to user
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        await userRoles.addWorkspaceRole(workspace._id, 'owner');

        await workspace.populate('owner', 'name email avatar');

        // Log activity
        await ActivityLog.logActivity({
            userId,
            action: 'workspace_create',
            description: `Created workspace: ${name}`,
            entity: { type: 'Workspace', id: workspace._id, name },
            workspaceId: workspace._id,
            metadata: {
                plan,
                ipAddress: req.ip
            }
        });

        logger.info(`Workspace created: ${name} by ${req.user.email}`);

        sendResponse(res, 201, true, 'Workspace created successfully', {
            workspace: workspace.toObject(),
            userRole: 'owner'
        });
    } catch (error) {
        logger.error('Create workspace error:', error);
        sendResponse(res, 500, false, 'Server error creating workspace');
    }
};

// Update workspace
exports.updateWorkspace = async (req, res) => {
    try {
        const { id: workspaceId } = req.params;
        const { name, description, settings } = req.body;
        const userId = req.user.id;

        // Check permissions
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        const workspaceRole = userRoles.workspaces.find(ws => 
            ws.workspace.toString() === workspaceId
        );

        if (!workspaceRole || !workspaceRole.permissions.canEditSettings) {
            return sendResponse(res, 403, false, 'Insufficient permissions to edit workspace');
        }

        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return sendResponse(res, 404, false, 'Workspace not found');
        }

        // Store old values
        const oldValues = {
            name: workspace.name,
            description: workspace.description
        };

        // Update basic fields
        if (name) workspace.name = name;
        if (description) workspace.description = description;

        // Update settings if provided
        if (settings) {
            Object.entries(settings).forEach(([section, updates]) => {
                if (workspace.settings[section]) {
                    Object.assign(workspace.settings[section], updates);
                }
            });
        }

        await workspace.save();

        // Log activity
        await ActivityLog.logActivity({
            userId,
            action: 'workspace_update',
            description: `Updated workspace: ${workspace.name}`,
            entity: { type: 'Workspace', id: workspaceId, name: workspace.name },
            workspaceId,
            metadata: {
                oldValues,
                newValues: { name, description },
                ipAddress: req.ip
            }
        });

        sendResponse(res, 200, true, 'Workspace updated successfully', {
            workspace: workspace.toObject()
        });
    } catch (error) {
        logger.error('Update workspace error:', error);
        sendResponse(res, 500, false, 'Server error updating workspace');
    }
};

// Invite member to workspace
exports.inviteMember = async (req, res) => {
    try {
        const { id: workspaceId } = req.params;
        const { email, role = 'member', message } = req.body;
        const userId = req.user.id;

        // Check permissions
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        if (!userRoles.hasWorkspaceRole(workspaceId, 'admin')) {
            return sendResponse(res, 403, false, 'Admin permissions required to invite members');
        }

        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return sendResponse(res, 404, false, 'Workspace not found');
        }

        // Check if user is already a member
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            const existingMember = workspace.members.find(member => 
                member.user.toString() === existingUser._id.toString()
            );
            
            if (existingMember) {
                return sendResponse(res, 400, false, 'User is already a member of this workspace');
            }
        }

        // Check workspace limits
        if (workspace.usage.membersCount >= workspace.limits.maxMembers) {
            return sendResponse(res, 400, false, 'Workspace member limit reached');
        }

        // Create invitation
        const invitation = await Invitation.create({
            type: 'workspace',
            invitedBy: userId,
            invitedUser: {
                email,
                userId: existingUser ? existingUser._id : null
            },
            targetEntity: {
                type: 'Workspace',
                id: workspaceId,
                name: workspace.name
            },
            role,
            message
        });

        // Send invitation email
        await sendEmail({
            to: email,
            template: 'workspace-invitation',
            data: {
                inviterName: user.name,
                workspaceName: workspace.name,
                workspaceDescription: workspace.description,
                role,
                message,
                invitationUrl: invitation.inviteUrl
            }
        });

        // Log activity
        await ActivityLog.logActivity({
            userId,
            action: 'workspace_member_add',
            description: `Invited member to workspace: ${workspace.name}`,
            entity: { type: 'Workspace', id: workspaceId, name: workspace.name },
            workspaceId,
            metadata: {
                invitedEmail: email,
                role,
                invitationId: invitation._id,
                ipAddress: req.ip
            }
        });

        sendResponse(res, 200, true, 'Invitation sent successfully', {
            invitation: {
                email,
                role,
                expiresAt: invitation.expiresAt,
                token: invitation.token
            }
        });
    } catch (error) {
        logger.error('Invite member error:', error);
        sendResponse(res, 500, false, 'Server error sending invitation');
    }
};

// Accept workspace invitation
exports.acceptInvitation = async (req, res) => {
    try {
        const { token } = req.params;
        const userId = req.user.id;

        const invitation = await Invitation.findByToken(token);
        if (!invitation || invitation.targetEntity.type !== 'workspace') {
            return sendResponse(res, 404, false, 'Invalid or expired invitation');
        }

        if (invitation.status !== 'pending') {
            return sendResponse(res, 400, false, 'Invitation is no longer valid');
        }

        const workspace = await Workspace.findById(invitation.targetEntity.id);
        if (!workspace) {
            return sendResponse(res, 404, false, 'Workspace not found');
        }

        // Add user to workspace
        await workspace.addMember(userId, invitation.role, invitation.invitedBy);

        // Add workspace role to user
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        await userRoles.addWorkspaceRole(workspace._id, invitation.role);

        // Accept invitation
        await invitation.accept(userId);

        // Log activity
        await ActivityLog.logActivity({
            userId,
            action: 'workspace_member_add',
            description: `User joined workspace: ${workspace.name}`,
            entity: { type: 'Workspace', id: workspace._id, name: workspace.name },
            workspaceId: workspace._id,
            metadata: {
                invitationToken: token,
                role: invitation.role,
                ipAddress: req.ip
            }
        });

        sendResponse(res, 200, true, 'Successfully joined workspace', {
            workspace: {
                id: workspace._id,
                name: workspace.name,
                description: workspace.description
            },
            role: invitation.role
        });
    } catch (error) {
        logger.error('Accept invitation error:', error);
        sendResponse(res, 500, false, 'Server error accepting invitation');
    }
};

// Get workspace members
exports.getWorkspaceMembers = async (req, res) => {
    try {
        const { id: workspaceId } = req.params;
        const userId = req.user.id;

        // Check access
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        if (!userRoles.hasWorkspaceRole(workspaceId)) {
            return sendResponse(res, 403, false, 'Access denied to this workspace');
        }

        const workspace = await Workspace.findById(workspaceId)
            .populate('owner', 'name email avatar lastLogin')
            .populate('members.user', 'name email avatar lastLogin')
            .populate('members.invitedBy', 'name avatar');

        if (!workspace) {
            return sendResponse(res, 404, false, 'Workspace not found');
        }

        // Format member data with statistics
        const members = [
            // Include owner
            {
                user: workspace.owner,
                role: 'owner',
                joinedAt: workspace.createdAt,
                permissions: {
                    canCreateSpaces: true,
                    canManageMembers: true,
                    canManageBilling: true,
                    canDeleteWorkspace: true,
                    canEditSettings: true
                }
            },
            // Include regular members
            ...workspace.members.map(member => member.toObject())
        ];

        sendResponse(res, 200, true, 'Workspace members retrieved successfully', {
            members,
            total: members.length,
            limits: {
                current: workspace.usage.membersCount,
                maximum: workspace.limits.maxMembers
            }
        });
    } catch (error) {
        logger.error('Get workspace members error:', error);
        sendResponse(res, 500, false, 'Server error retrieving workspace members');
    }
};

// Remove member from workspace
exports.removeMember = async (req, res) => {
    try {
        const { id: workspaceId, memberId } = req.params;
        const userId = req.user.id;

        // Check permissions
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        if (!userRoles.hasWorkspaceRole(workspaceId, 'admin')) {
            return sendResponse(res, 403, false, 'Admin permissions required to remove members');
        }

        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return sendResponse(res, 404, false, 'Workspace not found');
        }

        // Can't remove workspace owner
        if (workspace.owner.toString() === memberId) {
            return sendResponse(res, 400, false, 'Cannot remove workspace owner');
        }

        // Remove member from workspace
        await workspace.removeMember(memberId);

        // Remove workspace roles from user
        const member = await User.findById(memberId);
        const memberRoles = await member.getRoles();
        await memberRoles.removeWorkspaceRole(workspaceId);

        // Log activity
        await ActivityLog.logActivity({
            userId,
            action: 'workspace_member_remove',
            description: `Removed member from workspace: ${workspace.name}`,
            entity: { type: 'Workspace', id: workspaceId, name: workspace.name },
            relatedEntities: [{ type: 'User', id: memberId, name: member.name }],
            workspaceId,
            metadata: { ipAddress: req.ip }
        });

        sendResponse(res, 200, true, 'Member removed successfully');
    } catch (error) {
        logger.error('Remove member error:', error);
        sendResponse(res, 500, false, 'Server error removing member');
    }
};

// Update workspace settings
exports.updateSettings = async (req, res) => {
    try {
        const { id: workspaceId } = req.params;
        const { section, updates } = req.body;
        const userId = req.user.id;

        // Check permissions
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        if (!userRoles.hasWorkspaceRole(workspaceId, 'admin')) {
            return sendResponse(res, 403, false, 'Admin permissions required to update settings');
        }

        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return sendResponse(res, 404, false, 'Workspace not found');
        }

        await workspace.updateSettings(section, updates);

        // Log activity
        await ActivityLog.logActivity({
            userId,
            action: 'settings_update',
            description: `Updated workspace settings: ${workspace.name}`,
            entity: { type: 'Workspace', id: workspaceId, name: workspace.name },
            workspaceId,
            metadata: {
                section,
                updates,
                ipAddress: req.ip
            }
        });

        sendResponse(res, 200, true, 'Settings updated successfully', {
            settings: workspace.settings
        });
    } catch (error) {
        logger.error('Update settings error:', error);
        sendResponse(res, 500, false, 'Server error updating settings');
    }
};

// Get workspace analytics
exports.getWorkspaceAnalytics = async (req, res) => {
    try {
        const { id: workspaceId } = req.params;
        const { timeframe = '30d' } = req.query;
        const userId = req.user.id;

        // Check access
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        if (!userRoles.hasWorkspaceRole(workspaceId)) {
            return sendResponse(res, 403, false, 'Access denied to this workspace');
        }

        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return sendResponse(res, 404, false, 'Workspace not found');
        }

        // Get analytics data
        const analytics = {
            overview: {
                totalMembers: workspace.usage.membersCount,
                totalSpaces: workspace.usage.spacesCount,
                totalBoards: workspace.usage.boardsCount,
                totalTasks: workspace.usage.tasksCount,
                storageUsed: workspace.usage.storageUsed
            },
            limits: workspace.limits,
            health: workspace.health,
            billing: workspace.billing
        };

        sendResponse(res, 200, true, 'Workspace analytics retrieved successfully', {
            analytics
        });
    } catch (error) {
        logger.error('Get workspace analytics error:', error);
        sendResponse(res, 500, false, 'Server error retrieving workspace analytics');
    }
};

// Transfer workspace ownership
exports.transferOwnership = async (req, res) => {
    try {
        const { id: workspaceId } = req.params;
        const { newOwnerId } = req.body;
        const userId = req.user.id;

        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return sendResponse(res, 404, false, 'Workspace not found');
        }

        // Only current owner can transfer ownership
        if (workspace.owner.toString() !== userId) {
            return sendResponse(res, 403, false, 'Only workspace owner can transfer ownership');
        }

        const newOwner = await User.findById(newOwnerId);
        if (!newOwner) {
            return sendResponse(res, 404, false, 'New owner not found');
        }

        // Transfer ownership
        await workspace.transferOwnership(newOwnerId);

        // Update user roles
        const currentOwnerRoles = await (await User.findById(userId)).getRoles();
        const newOwnerRoles = await newOwner.getRoles();

        // Update roles
        await currentOwnerRoles.addWorkspaceRole(workspaceId, 'admin');
        await newOwnerRoles.addWorkspaceRole(workspaceId, 'owner');

        // Log activity
        await ActivityLog.logActivity({
            userId,
            action: 'workspace_update',
            description: `Transferred workspace ownership: ${workspace.name}`,
            entity: { type: 'Workspace', id: workspaceId, name: workspace.name },
            relatedEntities: [{ type: 'User', id: newOwnerId, name: newOwner.name }],
            workspaceId,
            metadata: { ipAddress: req.ip },
            severity: 'warning'
        });

        sendResponse(res, 200, true, 'Ownership transferred successfully', {
            workspace: workspace.toObject(),
            newOwner: newOwner.getMinimalProfile()
        });
    } catch (error) {
        logger.error('Transfer ownership error:', error);
        sendResponse(res, 500, false, 'Server error transferring ownership');
    }
};
