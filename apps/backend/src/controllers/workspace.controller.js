const crypto = require('crypto');
const Workspace = require('../models/Workspace');
const User = require('../models/User');
const Invitation = require('../models/Invitation');
const ActivityLog = require('../models/ActivityLog');
const NotificationService = require('../services/notification.service');
const WorkspaceService = require('../services/workspace.service');
const { sendResponse } = require('../utils/response');
const { sendEmail } = require('../utils/email');
const logger = require('../config/logger');
const mongoose = require('mongoose');
const env  = require('../config/env')
// Get all workspaces for a specific user (owner or member)
exports.getAllWorkspaces = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { includeArchived, status } = req.query;

        // Determine status filter
        let statusFilter = 'active';
        if (status === 'archived') statusFilter = 'archived';
        if (status === 'all' || includeArchived === 'true') statusFilter = null;

        // Build filter
        const baseFilter = userId
            ? {
                $or: [
                    { owner: userId },
                    { 'members.user': userId }
                ]
            }
            : {};

        const filter = statusFilter ? { ...baseFilter, status: statusFilter } : baseFilter;

        const workspaces = await Workspace.find(filter)
            .populate('owner', 'name email avatar')
            .populate('members.user', 'name email avatar')
            .sort({ updatedAt: -1 })
            .lean();

        // Attach userRole and permissions
        const enrichedWorkspaces = workspaces.map(ws => {
            const uid = userId ? String(userId) : null;
            const member = uid
                ? ws.members.find(m => (
                    m?.user?._id?.toString?.() === uid ||
                    m?.user?.toString?.() === uid
                  ))
                : null;

            const isOwner = uid && ws?.owner?._id?.toString?.() === uid;

            return {
                ...ws,
                _id: ws._id.toString(),
                userRole: member ? member.role : (isOwner ? 'owner' : null),
                userPermissions: member ? member.permissions : null
            };
        });

        sendResponse(res, 200, true, 'User workspaces retrieved successfully', {
            workspaces: enrichedWorkspaces,
            count: enrichedWorkspaces.length
        });
    } catch (error) {
        logger.error('Get user workspaces error:', error);
        sendResponse(res, 500, false, 'Server error retrieving user workspaces');
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
            .populate({
                path: 'spaces',
                match: { isArchived: false }
              })
              

        if (!workspace) {
            return sendResponse(res, 404, false, 'Workspace not found');
        }

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
        const { name, description, plan = 'free', isPublic = false } = req.body;
        const userId = req.user.id;

        const workspace = await Workspace.create({
            name,
            description,
            owner: userId,
            plan,
            isPublic,
            members: [], // Owner is not included in members array
            usage: {
                membersCount: 1 // Owner counts as 1
            },
            settings: {
                features: {
                    integrations: true,
                    aiSuggestions: true,
                    timeTracking: true,
                    fileAttachments: true,
                    customFields: true
                },
                notifications: {
                    emailDigests: true,
                    slackIntegration: false,
                    webhooks: []
                },
                permissions: {
                    defaultMemberRole: 'member',
                    allowMemberInvites: true,
                    requireApprovalForMembers: false,
                    maxMembers: null,
                },
                defaultBoardVisibility: "workspace",
                branding: {
                    logo: null,
                    primaryColor: "#3B82F6"
                }
            }
        });

        // Add owner role
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

        // Create a system notification for the creator (non-blocking)
        try {
            await NotificationService.createNotification({
                title: 'Workspace created',
                message: `Your workspace "${name}" was created successfully`,
                type: 'workspace_created',
                recipient: userId,
                sender: userId,
                relatedEntity: {
                    entityType: 'workspace',
                    entityId: workspace._id
                },
                priority: 'medium',
                deliveryMethods: { inApp: true }
            });
        } catch (notifyErr) {
            logger.warn('Workspace create: notification not sent/saved', { error: notifyErr?.message });
        }

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
        const { name, description, settings, githubOrg } = req.body;
        const userId = req.user.id;
        // SECURITY FIX: Use verified roles from auth middleware
        const userRoles = req.user.roles;
        
        const workspaceRole = userRoles.workspaces.find(ws => 
            ws.workspace.toString() === workspaceId
        );

        // Fetch workspace to reliably determine ownership
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return sendResponse(res, 404, false, 'Workspace not found');
        }

        // Allow owners to edit settings regardless of cached roles on the token
        const isOwner = workspace.owner && workspace.owner.toString() === userId.toString();
        if (!isOwner) {
            if (!workspaceRole || !workspaceRole.permissions?.canEditSettings) {
                return sendResponse(res, 403, false, 'Insufficient permissions to edit workspace');
            }
        }

        // Update basic fields
        if (name) workspace.name = name;
        if (description) workspace.description = description;

        // Update GitHub organization if provided
        if (githubOrg !== undefined) {
            workspace.githubOrg = githubOrg;
        }

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
                newValues: { name, description, githubOrg },
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

// Upload workspace avatar
exports.uploadWorkspaceAvatar = async (req, res) => {
    try {
        const { id: workspaceId } = req.params;
        const userId = req.user.id;
        
        // Check if file was uploaded
        if (!req.file) {
            return sendResponse(res, 400, false, 'No avatar file provided');
        }

        // SECURITY FIX: Use verified roles from auth middleware
        const userRoles = req.user.roles;
        
        const workspaceRole = userRoles.workspaces.find(ws => 
            ws.workspace.toString() === workspaceId
        );

        // Fetch workspace to reliably determine ownership
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return sendResponse(res, 404, false, 'Workspace not found');
        }

        // Allow owners to edit settings regardless of cached roles on the token
        const isOwner = workspace.owner && workspace.owner.toString() === userId.toString();
        if (!isOwner) {
            if (!workspaceRole || !workspaceRole.permissions?.canEditSettings) {
                return sendResponse(res, 403, false, 'Insufficient permissions to edit workspace');
            }
        }

        // Create file record
        const File = require('../models/File');
        const fileRecord = File.createFromUpload(req.file, userId, 'workspace_avatar', {
            workspace: workspaceId,
            attachedTo: {
                model: 'Workspace',
                objectId: workspaceId,
                attachedAt: new Date()
            }
        });

        await fileRecord.save();

        // Update workspace avatar
        workspace.avatar = fileRecord.url;
        await workspace.save();

        // Log activity
        await ActivityLog.logActivity({
            userId,
            action: 'workspace_avatar_upload',
            description: `Uploaded avatar for workspace: ${workspace.name}`,
            entity: { type: 'Workspace', id: workspaceId, name: workspace.name },
            workspaceId,
            metadata: {
                fileId: fileRecord._id,
                fileName: req.file.originalname,
                fileSize: req.file.size,
                ipAddress: req.ip
            }
        });

        sendResponse(res, 200, true, 'Workspace avatar uploaded successfully', {
            workspace: workspace.toObject(),
            avatar: {
                url: fileRecord.url,
                filename: fileRecord.filename,
                size: fileRecord.size
            }
        });
    } catch (error) {
        logger.error('Upload workspace avatar error:', error);
        sendResponse(res, 500, false, 'Server error uploading workspace avatar');
    }
};

// Remove workspace avatar
exports.removeWorkspaceAvatar = async (req, res) => {
    try {
        const { id: workspaceId } = req.params;
        const userId = req.user.id;
        
        // SECURITY FIX: Use verified roles from auth middleware
        const userRoles = req.user.roles;
        
        const workspaceRole = userRoles.workspaces.find(ws => 
            ws.workspace.toString() === workspaceId
        );

        // Fetch workspace to reliably determine ownership
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return sendResponse(res, 404, false, 'Workspace not found');
        }

        // Allow owners to edit settings regardless of cached roles on the token
        const isOwner = workspace.owner && workspace.owner.toString() === userId.toString();
        if (!isOwner) {
            if (!workspaceRole || !workspaceRole.permissions?.canEditSettings) {
                return sendResponse(res, 403, false, 'Insufficient permissions to edit workspace');
            }
        }

        // Remove avatar
        workspace.avatar = null;
        await workspace.save();

        // Log activity
        await ActivityLog.logActivity({
            userId,
            action: 'workspace_avatar_remove',
            description: `Removed avatar for workspace: ${workspace.name}`,
            entity: { type: 'Workspace', id: workspaceId, name: workspace.name },
            workspaceId,
            metadata: {
                ipAddress: req.ip
            }
        });

        sendResponse(res, 200, true, 'Workspace avatar removed successfully', {
            workspace: workspace.toObject()
        });
    } catch (error) {
        logger.error('Remove workspace avatar error:', error);
        sendResponse(res, 500, false, 'Server error removing workspace avatar');
    }
};

// Invite member to workspace
exports.inviteMember = async (req, res) => {
    try {
        const { id: workspaceId } = req.params;
        const { email, role = 'member', message } = req.body;
        const userId = req.user.id;




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
        const crypto = require('crypto');
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
        
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
            token: crypto.randomBytes(32).toString('hex'),
            expiresAt
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
                invitationUrl: invitation.inviteUrl,
                supportUrl: `${env.FRONTEND_URL}/support`,
                docsUrl: `${env.FRONTEND_URL}/docs`
            }
        });

        // Notify invited user in-app if they already have an account
        try {
            if (existingUser) {
                await NotificationService.createNotification({
                    title: 'Workspace invitation',
                    message: `${req.user.name} invited you to join workspace "${workspace.name}" as ${role}`,
                    type: 'workspace_invitation',
                    recipient: existingUser._id,
                    sender: userId,
                    relatedEntity: { entityType: 'workspace', entityId: workspace._id },
                    priority: 'medium',
                    deliveryMethods: { inApp: true }
                });
            }
        } catch (notifyErr) {
            logger.warn('Invite member: notification not sent', { error: notifyErr?.message });
        }

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

        // Notify inviter: Invitation accepted
        try {
            if (invitation.invitedBy) {
                await NotificationService.createNotification({
                    title: 'Invitation accepted',
                    message: `${req.user.name} accepted your invitation to join "${workspace.name}"`,
                    type: 'invitation_accepted',
                    recipient: invitation.invitedBy,
                    sender: userId,
                    relatedEntity: { entityType: 'workspace', entityId: workspace._id },
                    priority: 'medium',
                    deliveryMethods: { inApp: true }
                });
            }
        } catch (notifyErr) {
            logger.warn('Accept invitation: notification not sent', { error: notifyErr?.message });
        }

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



        // Generate a unique token for the invite link
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // Link expires in 7 days

        // Create a proper invitation record
        const Invitation = require('../models/Invitation');
        const invitation = new Invitation({
            type: 'workspace',
            invitedBy: userId,
            invitedUser: {
                email: null, // Will be filled when someone uses the link
                userId: null
            },
            targetEntity: {
                type: 'Workspace',
                id: workspaceId,
                name: workspace.name
            },
            role: 'member', // Default role for invite links
            message: 'Join via invite link',
            token: token,
            status: 'pending',
            expiresAt: expiresAt,
            metadata: {
                invitationMethod: 'link'
            }
        });
        await invitation.save();

        // Also save the invite token to the workspace for backward compatibility
        workspace.inviteTokens = workspace.inviteTokens || [];
        workspace.inviteTokens.push({
            token,
            createdBy: userId,
            expiresAt,
            used: false
        });

        await workspace.save();

        // Construct the invite link
        const inviteLink = `${env.FRONTEND_URL || 'http://localhost:3000'}/join-workspace?token=${token}&workspace=${workspaceId}`;

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
                // return sendResponse(res, 403, false, 'Access denied to this workspace');
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
            // return sendResponse(res, 403, false, 'Admin permissions required to remove members');
        }

        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return sendResponse(res, 404, false, 'Workspace not found');
        }

        // Can't remove workspace owner
        if (workspace.owner.toString() === memberId) {
            // return sendResponse(res, 400, false, 'Cannot remove workspace owner');
        }

        // Remove member from workspace
        await workspace.removeMember(memberId);

        // Remove workspace roles from user
        const member = await User.findById(memberId);
        if (!member) {
            // Member user record not found; membership was removed from workspace above
            // Return success to keep the operation idempotent and avoid leaking existence
            return sendResponse(res, 200, true, 'Member removed successfully');
        }
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

        // Check permissions - only allow workspace owners to update settings
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        if (!userRoles.hasWorkspaceRole(workspaceId, 'admin')) {
            // return sendResponse(res, 403, false, 'Admin permissions required to update settings');
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

        // Access control handled by middleware

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
            // return sendResponse(res, 403, false, 'Only workspace owner can transfer ownership');
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

// Restore archived workspace
exports.restoreWorkspace = async (req, res) => {
    try {
        const { id: workspaceId } = req.params;
        const userId = req.user.id;

        if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
            return sendResponse(res, 400, false, 'Invalid workspace ID format');
        }

        const restored = await WorkspaceService.restoreWorkspace(workspaceId, userId);

        return sendResponse(res, 200, true, 'Workspace restored successfully', {
            workspace: restored
        });
    } catch (error) {
        logger.error('Restore workspace error:', error);
        return sendResponse(res, 500, false, error?.message || 'Server error restoring workspace');
    }
};

// Permanently delete an archived workspace
exports.permanentDeleteWorkspace = async (req, res) => {
    try {
        const { id: workspaceId } = req.params;
        const userId = req.user.id;

        if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
            return sendResponse(res, 400, false, 'Invalid workspace ID format');
        }

        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return sendResponse(res, 404, false, 'Workspace not found');
        }

        if (workspace.owner.toString() !== userId.toString()) {
            return sendResponse(res, 403, false, 'Only the workspace owner can permanently delete this workspace');
        }

        if (workspace.status !== 'archived') {
            return sendResponse(res, 400, false, 'Workspace must be archived before permanent deletion');
        }

        const result = await WorkspaceService.deleteWorkspace(workspaceId, userId);
        return sendResponse(res, 200, true, result?.message || 'Workspace permanently deleted');
    } catch (error) {
        logger.error('Permanent delete workspace error:', error);
        return sendResponse(res, 500, false, 'Server error deleting workspace permanently');
    }
};

// Delete workspace
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

        // Owner can archive directly
        if (workspace.owner.toString() === userId.toString()) {
            const archived = await WorkspaceService.softDeleteWorkspace(workspaceId, userId);
            return sendResponse(res, 200, true, 'Workspace archived successfully', {
                workspace: {
                    id: archived._id,
                    status: archived.status,
                    archivedAt: archived.archivedAt,
                    archiveExpiresAt: archived.archiveExpiresAt,
                    archiveCountdownSeconds: Math.max(0, Math.floor((new Date(archived.archiveExpiresAt).getTime() - Date.now()) / 1000))
                }
            });
        }

        // Check permissions
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        const wsRole = userRoles.workspaces.find(
            (ws) => ws.workspace.toString() === workspaceId.toString()
        );

        if (wsRole?.permissions?.canDeleteWorkspace) {
            // Service enforces owner-only; pass owner id to authorize archival
            const archived = await WorkspaceService.softDeleteWorkspace(workspaceId, workspace.owner);
            return sendResponse(res, 200, true, 'Workspace archived successfully', {
                workspace: {
                    id: archived._id,
                    status: archived.status,
                    archivedAt: archived.archivedAt,
                    archiveExpiresAt: archived.archiveExpiresAt,
                    archiveCountdownSeconds: Math.max(0, Math.floor((new Date(archived.archiveExpiresAt).getTime() - Date.now()) / 1000))
                }
            });
        }

        return sendResponse(res, 403, false, 'You do not have permission to delete this workspace');
    } catch (error) {
        logger.error('Delete workspace error:', error);
        return sendResponse(res, 500, false, 'Server error deleting workspace');
    }
};

// Workspace Rules Controllers

/**
 * Get workspace rules
 */
exports.getWorkspaceRules = async (req, res) => {
    try {
        const { id: workspaceId } = req.params;
        const userId = req.user.id;

        // Get workspace with rules populated
        const workspace = await Workspace.findById(workspaceId).populate('rules.lastUpdatedBy', 'name email');
        if (!workspace) {
            return sendResponse(res, 404, false, 'Workspace not found');
        }

        // If rules exist but lastUpdatedBy is not populated, populate it manually
        if (workspace.rules && workspace.rules.lastUpdatedBy && typeof workspace.rules.lastUpdatedBy === 'string') {
            const user = await User.findById(workspace.rules.lastUpdatedBy).select('name email');
            if (user) {
                workspace.rules.lastUpdatedBy = user;
            }
        }

        logger.info('Workspace fetched from database:', {
            workspaceId,
            hasRules: !!workspace.rules,
            hasContent: !!workspace.rules?.content,
            contentLength: workspace.rules?.content?.length || 0,
            rulesStructure: workspace.rules
        });

        // If no rules exist, create default rules
        const hasRules = !!workspace.rules;
        const hasContent = !!workspace.rules?.content;
        const contentLength = workspace.rules?.content?.length || 0;
        const contentTrimmed = workspace.rules?.content?.trim() || '';
        const shouldCreateRules = !hasRules || !hasContent || contentTrimmed === '';
        
        logger.info('Rules creation check:', {
            workspaceId,
            hasRules,
            hasContent,
            contentLength,
            contentTrimmed,
            shouldCreateRules,
            rulesObject: workspace.rules
        });
        
        if (shouldCreateRules) {
            logger.info('Creating default rules for workspace:', workspaceId);
            await workspace.getOrCreateRules(userId);
            // Refresh the workspace after creating rules
            const updatedWorkspace = await Workspace.findById(workspaceId).populate('rules.lastUpdatedBy', 'name email');
            workspace.rules = updatedWorkspace.rules;
        } else {
            logger.info('Rules already exist, skipping creation:', workspaceId);
        }

        // Check if rules exist
        if (!workspace.rules) {
            logger.error('Workspace rules is null after getOrCreateRules:', { workspaceId });
            return sendResponse(res, 500, false, 'Failed to retrieve workspace rules');
        }

        logger.info('Workspace rules before formatting:', {
            workspaceId,
            rules: workspace.rules,
            hasContent: !!workspace.rules.content,
            contentLength: workspace.rules.content?.length || 0,
            contentValue: workspace.rules.content
        });

        // Add formatted content to rules
        const rulesWithFormatted = {
            ...workspace.rules.toObject({ virtuals: true }),
            formattedContent: workspace.rulesFormattedContent || ''
        };

        logger.info('Workspace rules response:', {
            workspaceId,
            rules: rulesWithFormatted,
            hasContent: !!rulesWithFormatted.content,
            contentLength: rulesWithFormatted.content?.length || 0
        });

        // Send response with rules directly in the response object (not nested in data)
        res.status(200).json({
            success: true,
            message: 'Workspace rules retrieved successfully',
            rules: rulesWithFormatted,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('Error getting workspace rules:', error);
        sendResponse(res, 500, false, 'Internal server error');
    }
};

/**
 * Update workspace rules
 */
exports.updateWorkspaceRules = async (req, res) => {
    try {
        const { id: workspaceId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;

        // Get workspace
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return sendResponse(res, 404, false, 'Workspace not found');
        }

        // Update rules
        await workspace.updateRules(content, userId);
        
        // Populate the lastUpdatedBy field
        await workspace.populate('rules.lastUpdatedBy', 'name email');

        // Add formatted content to rules
        const rulesWithFormatted = {
            ...workspace.rules.toObject(),
            formattedContent: workspace.rulesFormattedContent
        };

        sendResponse(res, 200, true, 'Workspace rules updated successfully', {
            rules: rulesWithFormatted
        });
    } catch (error) {
        logger.error('Error updating workspace rules:', error);
        sendResponse(res, 500, false, 'Internal server error');
    }
};

/**
 * Upload workspace rules as PDF file
 */
exports.uploadWorkspaceRules = async (req, res) => {
    try {
        const { id: workspaceId } = req.params;
        const userId = req.user.id;

        if (!req.file) {
            return sendResponse(res, 400, false, 'No file uploaded');
        }

        // Get workspace
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return sendResponse(res, 404, false, 'Workspace not found');
        }

        // Upload rules file
        await workspace.uploadRulesFile(req.file, userId);
        
        // Populate the lastUpdatedBy field
        await workspace.populate('rules.lastUpdatedBy', 'name email');

        // Add formatted content to rules
        const rulesWithFormatted = {
            ...workspace.rules.toObject(),
            formattedContent: workspace.rulesFormattedContent
        };

        sendResponse(res, 200, true, 'Workspace rules uploaded successfully', {
            rules: rulesWithFormatted
        });
    } catch (error) {
        logger.error('Error uploading workspace rules:', error);
        sendResponse(res, 500, false, 'Internal server error');
    }
};

/**
 * Delete workspace rules (reset to default)
 */
exports.deleteWorkspaceRules = async (req, res) => {
    try {
        const { id: workspaceId } = req.params;

        // Get workspace
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return sendResponse(res, 404, false, 'Workspace not found');
        }

        // Delete workspace rules
        await workspace.deleteRules();

        sendResponse(res, 200, true, 'Workspace rules deleted successfully');
    } catch (error) {
        logger.error('Error deleting workspace rules:', error);
        sendResponse(res, 500, false, 'Internal server error');
    }
};