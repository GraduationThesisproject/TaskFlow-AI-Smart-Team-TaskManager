const Workspace = require('../models/Workspace');
const User = require('../models/User');
const Invitation = require('../models/Invitation');
const ActivityLog = require('../models/ActivityLog');
const WorkspaceService = require('../services/workspace.service');
const { sendResponse } = require('../utils/response');
const { sendEmail } = require('../utils/email');
const logger = require('../config/logger');
const crypto = require('crypto');

// Get all workspaces for the current user
exports.getAllWorkspaces = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Find all workspaces where the user is a member
        const workspaces = await Workspace.find({
            $or: [
                { owner: userId },
                { 'members.user': userId }
            ]
        })
        .populate('owner', 'name email avatar')
        .populate('members.user', 'name email avatar')
        .sort({ updatedAt: -1 });

        // SECURITY FIX: Use verified roles from auth middleware
        const userRoles = req.user.roles || {};
        const userWorkspaces = userRoles.workspaces || [];

        const enrichedWorkspaces = workspaces.map(workspace => {
            const userRole = userWorkspaces.find(ws => 
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
        const userId = req.user?.id;

        // Workspace existence (access may be unchecked when auth is disabled during testing)
        const workspace = await Workspace.findById(workspaceId)
            .populate('owner', 'name email avatar')
            .populate('members.user', 'name email avatar')
            .populate('spaces');

        // SECURITY FIX: Use verified roles from auth middleware
        let userRole = null;
        let userPermissions = null;
        if (userId && req.user.roles) {
            const userWorkspaceRole = req.user.roles.hasWorkspaceRole(workspaceId);
            if (userWorkspaceRole) {
                userRole = userWorkspaceRole.role;
                userPermissions = userWorkspaceRole.permissions;
            }
        }

        sendResponse(res, 200, true, 'Workspace retrieved successfully', {
            workspace: {
                ...workspace.toObject(),
                stats: workspace.stats,
                health: workspace.health,
                availableFeatures: workspace.availableFeatures
            },
            userRole,
            userPermissions
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

        // SECURITY FIX: Use verified roles from auth middleware and add owner role
        const userRoles = req.user.roles;
        await userRoles.addWorkspaceRole(workspace._id, 'owner');

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

        // SECURITY FIX: Use verified roles from auth middleware
        const userRoles = req.user.roles;
        
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

        // SECURITY FIX: Use verified roles from auth middleware
        const userRoles = req.user.roles;
        
        const workspaceRole = userRoles.workspaces.find(ws => 
            ws.workspace.toString() === workspaceId
        );

        if (!workspaceRole || !workspaceRole.permissions.canManageMembers) {
            return sendResponse(res, 403, false, 'Insufficient permissions to invite members');
        }

        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return sendResponse(res, 404, false, 'Workspace not found');
        }

        // SECURITY FIX: Validate role assignment permissions
        // Only workspace owners can assign admin roles, admins can only assign member roles
        if (role === 'admin' && workspaceRole.role !== 'owner') {
            return sendResponse(res, 403, false, 'Only workspace owners can assign admin roles');
        }

        if (role === 'owner') {
            return sendResponse(res, 403, false, 'Cannot assign owner role through invitation');
        }

        // Validate role is one of the allowed values
        const allowedRoles = ['member', 'admin'];
        if (!allowedRoles.includes(role)) {
            return sendResponse(res, 400, false, 'Invalid role specified');
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
        const crypto = require('crypto');
        const invitation = new Invitation({
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
            message,
            token: crypto.randomBytes(32).toString('hex')
        });
        await invitation.save();
        
        // Debug logging
        logger.info(`Invitation created - id: ${invitation._id}, token: ${invitation.token}, targetEntity: ${JSON.stringify(invitation.targetEntity)}`);

        // Send invitation email
        await sendEmail({
            to: email,
            template: 'workspace-invitation',
            data: {
                inviterName: req.user.name,
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

        sendResponse(res, 201, true, 'Invitation sent successfully', {
            invitation: {
                email,
                role,
                expiresAt: invitation.expiresAt,
                token: invitation.token
            }
        });
    } catch (error) {
        logger.error('Invite member error:', error);
        sendResponse(res, 500, false, 'Server error inviting member');
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

// Generate invite link for workspace
exports.generateInviteLink = async (req, res) => {
    try {
        const { id: workspaceId } = req.params;
        const userId = req.user.id;

        // Find the workspace
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return sendResponse(res, 404, false, 'Workspace not found');
        }

        // Debug log workspace members
        console.log('Workspace members:', workspace.members);
        console.log('Current user ID:', userId);

        // Check if user is a member with invite permissions
        const member = workspace.members.find(m => {
            const isUser = m.user && (m.user._id ? m.user._id.toString() === userId.toString() : m.user.toString() === userId.toString());
            const hasPermission = ['admin', 'owner'].includes(m.role);
            console.log(`Member check - User: ${m.user}, Role: ${m.role}, isUser: ${isUser}, hasPermission: ${hasPermission}`);
            return isUser && hasPermission;
        });

        if (!member) {
            console.log('Permission denied - Member not found or insufficient permissions');
            return sendResponse(res, 403, false, 'You need to be an admin or owner to generate invite links');
        }

        // Generate a unique token for the invite link
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // Link expires in 7 days

        // Save the invite token to the workspace
        workspace.inviteTokens = workspace.inviteTokens || [];
        workspace.inviteTokens.push({
            token,
            createdBy: userId,
            expiresAt,
            used: false
        });

        await workspace.save();

        // Construct the invite link
        const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/join-workspace?token=${token}&workspace=${workspaceId}`;

        sendResponse(res, 200, true, 'Invite link generated successfully', {
            link: inviteLink,
            expiresAt,
            enabled: true
        });
    } catch (error) {
        logger.error('Generate invite link error:', error);
        sendResponse(res, 500, false, 'Failed to generate invite link');
    }
};

// Get workspace members
exports.getWorkspaceMembers = async (req, res) => {
    try {
        const { id: workspaceId } = req.params;
        // const workspaceId = '68a6f2ad09162ad369df8692';

        const { q } = req.query;
        const userId = req.user?.id;

        // Optional access check (only when authenticated)
        if (userId) {
            const user = await User.findById(userId);
            const userRoles = await user.getRoles();
            if (!userRoles.hasWorkspaceRole(workspaceId)) {
                return sendResponse(res, 403, false, 'Access denied to this workspace');
            }
        }

        const workspace = await Workspace.findById(workspaceId)
            .populate('owner', 'name email avatar lastLogin')
            .populate('members.user', 'name email avatar lastLogin')
            .populate('members.invitedBy', 'name avatar');

        if (!workspace) {
            return sendResponse(res, 404, false, 'Workspace not found');
        }

        // Format member data with statistics
        let members = [
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

        // Optional filter by name/email if `q` provided
        if (q && typeof q === 'string') {
            const query = q.trim().toLowerCase();
            if (query.length > 0) {
                members = members.filter((m) => {
                    const name = (m.user?.name || '').toLowerCase();
                    const email = (m.user?.email || '').toLowerCase();
                    return name.includes(query) || email.includes(query);
                });
            }
        }

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


exports.deleteWorkspace = async (req, res) => {
    try {
        const { id: workspaceId } = req.params;
        const userId = req.user.id;

        // Prevent CastError
        if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
            return sendResponse(res, 400, false, 'Invalid workspace ID format');
        }

        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return sendResponse(res, 404, false, 'Workspace not found');
        }
 
        // Owner can delete directly
        if (workspace.owner.toString() === userId.toString()) {
            await WorkspaceService.deleteWorkspace(workspaceId, userId);
            return sendResponse(res, 200, true, 'Workspace deleted successfully', { id: workspaceId });
        }

        // Check permissions
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        const wsRole = userRoles.workspaces.find(
            (ws) => ws.workspace.toString() === workspaceId.toString()
        );

        if (wsRole?.permissions?.canDeleteWorkspace) {
            await WorkspaceService.deleteWorkspace(workspaceId, workspace.owner);
            return sendResponse(res, 200, true, 'Workspace deleted successfully', { id: workspaceId });
        }

        return sendResponse(res, 403, false, 'You do not have permission to delete this workspace');
    } catch (error) {
        logger.error('Delete workspace error:', error);
        return sendResponse(res, 500, false, 'Server error deleting workspace');
    }
};