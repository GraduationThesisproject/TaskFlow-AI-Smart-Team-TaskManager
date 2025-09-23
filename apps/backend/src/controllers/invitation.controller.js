const Invitation = require('../models/Invitation');
const Workspace = require('../models/Workspace');
const Space = require('../models/Space');
const User = require('../models/User');
const Notification = require('../models/Notification');
const InvitationService = require('../services/invitation.service');
const { sendResponse } = require('../utils/response');
const { sendEmail } = require('../utils/email');
const logger = require('../config/logger');
const { emitInvitationReceived, emitWorkspaceEvent } = require('../utils/socketManager');

// Create invitation
exports.createInvitation = async (req, res) => {
    try {
        const { email, name, targetEntity, role, message } = req.body;
        const userId = req.user.id;

        // Validate target entity
        if (!targetEntity || !targetEntity.type || !targetEntity.id) {
            return sendResponse(res, 400, false, 'Target entity information is required');
        }

        // SECURITY FIX: Validate role parameter
        const allowedRoles = ['member', 'admin', 'viewer'];
        if (!allowedRoles.includes(role)) {
            return sendResponse(res, 400, false, 'Invalid role specified');
        }

        // Check if user exists (but don't block invitation creation)
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            // User already exists, check if they're already a member
            if (targetEntity.type === 'Workspace') {
                const workspace = await Workspace.findById(targetEntity.id);
                if (workspace) {
                    const isAlreadyMember = workspace.members.some(member => 
                        member.user.toString() === existingUser._id.toString()
                    );
                    if (isAlreadyMember) {
                        return sendResponse(res, 400, false, 'User is already a member of this workspace');
                    }
                }
            }
            // Allow invitation creation for existing users who aren't members
        }

        // Check if invitation already exists
        const existingInvitation = await Invitation.findOne({
            'invitedUser.email': email.toLowerCase(),
            'targetEntity.id': targetEntity.id,
            'targetEntity.type': targetEntity.type,
            status: 'pending'
        });

        if (existingInvitation) {
            // Extend the existing invitation instead of creating a new one
            existingInvitation.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
            existingInvitation.message = message || existingInvitation.message;
            existingInvitation.role = role || existingInvitation.role;
            await existingInvitation.save();
            
            return sendResponse(res, 200, true, 'Invitation extended successfully', {
                invitation: {
                    id: existingInvitation._id,
                    type: existingInvitation.type,
                    invitedBy: existingInvitation.invitedBy,
                    invitedUser: existingInvitation.invitedUser,
                    targetEntity: existingInvitation.targetEntity,
                    role: existingInvitation.role,
                    message: existingInvitation.message,
                    status: existingInvitation.status,
                    createdAt: existingInvitation.createdAt,
                    expiresAt: existingInvitation.expiresAt
                }
            });
        }

        // SECURITY FIX: Use verified roles from auth middleware
        const userRoles = req.user.roles;
        let targetEntityDoc;
        let hasPermission = false;
        let userEntityRole = null;

        if (targetEntity.type === 'Workspace') {
            targetEntityDoc = await Workspace.findById(targetEntity.id);
            if (!targetEntityDoc) {
                return sendResponse(res, 404, false, 'Workspace not found');
            }

            // Check if user is owner or admin
            if (targetEntityDoc.owner.toString() === userId) {
                hasPermission = true;
                userEntityRole = 'owner';
            } else {
                const member = targetEntityDoc.members.find(m => m.user.toString() === userId);
                if (member && ['admin', 'owner'].includes(member.role)) {
                    hasPermission = true;
                    userEntityRole = member.role;
                }
            }
        } else if (targetEntity.type === 'Space') {
            targetEntityDoc = await Space.findById(targetEntity.id);
            if (!targetEntityDoc) {
                return sendResponse(res, 404, false, 'Space not found');
            }

            // Check if user is owner or admin
            if (targetEntityDoc.owner.toString() === userId) {
                hasPermission = true;
                userEntityRole = 'owner';
            } else {
                const member = targetEntityDoc.members.find(m => m.user.toString() === userId);
                if (member && ['admin', 'owner'].includes(member.role)) {
                    hasPermission = true;
                    userEntityRole = member.role;
                }
            }
        }

        if (!hasPermission) {
            return sendResponse(res, 403, false, 'Insufficient permissions to create invitation');
        }

        // Create invitation
        const invitation = await Invitation.create({
            type: targetEntity.type.toLowerCase(),
            invitedBy: userId,
            invitedUser: {
                email: email.toLowerCase(),
                name: name || email.split('@')[0]
            },
            targetEntity: {
                type: targetEntity.type,
                id: targetEntity.id,
                name: targetEntityDoc.name
            },
            role,
            message,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        });

        // Send invitation email
        const inviter = await User.findById(userId);
        await InvitationService.sendInvitationEmail(invitation, inviter, targetEntityDoc);

        // Create notification for inviter
        await Notification.create({
            title: `Invitation sent to ${email}`,
            message: `You invited ${name || email} to join ${targetEntityDoc.name}`,
            type: 'invitation_sent',
            recipient: userId,
            relatedEntity: {
                entityType: targetEntity.type.toLowerCase(),
                entityId: targetEntity.id
            },
            deliveryMethods: { inApp: true }
        });

        // Emit real-time notification
        const io = getNamespace('notifications');
        if (io) {
            io.to(userId).emit('notification', {
                title: `Invitation sent to ${email}`,
                message: `You invited ${name || email} to join ${targetEntityDoc.name}`,
                type: 'invitation_sent'
            });
        }

        // Emit invitation-specific event for real-time updates
        logger.info(`Socket.IO notification namespace available: ${!!io}`);
        if (io) {
            // Notify the inviter
            io.to(userId).emit('invitation:created', {
                invitation: {
                    id: invitation._id,
                    type: invitation.type,
                    targetEntity: invitation.targetEntity,
                    invitedUser: invitation.invitedUser,
                    role: invitation.role,
                    status: invitation.status,
                    createdAt: invitation.createdAt,
                    expiresAt: invitation.expiresAt
                }
            });

            // Notify the invited user if they exist and are online
            try {
                const invitedUser = await User.findOne({ email: email.toLowerCase() });
                logger.info(`Invitation notification - Invited user found: ${!!invitedUser}, Email: ${email}`);
                
                if (invitedUser) {
                    logger.info(`Emitting invitation:received to user ${invitedUser._id} (${invitedUser.email})`);
                    logger.info(`Socket.IO namespace connected clients: ${io.sockets.sockets.size}`);
                    
                    // Also try emitting to the user's personal room
                    io.to(`notifications:${invitedUser._id}`).emit('invitation:received', {
                        invitation: {
                            id: invitation._id,
                            type: invitation.type,
                            targetEntity: invitation.targetEntity,
                            invitedBy: {
                                id: inviter._id,
                                name: inviter.name,
                                email: inviter.email
                            },
                            role: invitation.role,
                            status: invitation.status,
                            message: invitation.message,
                            createdAt: invitation.createdAt,
                            expiresAt: invitation.expiresAt
                        }
                    });
                    
                    io.to(invitedUser._id.toString()).emit('invitation:received', {
                        invitation: {
                            id: invitation._id,
                            type: invitation.type,
                            targetEntity: invitation.targetEntity,
                            invitedBy: {
                                id: inviter._id,
                                name: inviter.name,
                                email: inviter.email
                            },
                            role: invitation.role,
                            status: invitation.status,
                            message: invitation.message,
                            createdAt: invitation.createdAt,
                            expiresAt: invitation.expiresAt
                        }
                    });
                    logger.info(`Invitation:received event emitted successfully to user ${invitedUser._id}`);
                } else {
                    logger.info(`No user found with email ${email}, invitation will be sent via email only`);
                }
            } catch (error) {
                logger.error('Error notifying invited user:', error);
            }
        }

        sendResponse(res, 201, true, 'Invitation created successfully', {
            invitation: {
                id: invitation._id,
                email: invitation.invitedUser.email,
                name: invitation.invitedUser.name,
                role: invitation.role,
                status: invitation.status,
                expiresAt: invitation.expiresAt
            }
        });

    } catch (error) {
        logger.error('Create invitation error:', error);
        sendResponse(res, 500, false, 'Server error creating invitation');
    }
};

// Get user invitations
exports.getUserInvitations = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status = 'pending', limit = 50, skip = 0 } = req.query;

        const result = await InvitationService.getUserInvitations(userId, {
            status,
            limit: parseInt(limit),
            skip: parseInt(skip)
        });

        sendResponse(res, 200, true, 'User invitations retrieved successfully', result);

    } catch (error) {
        logger.error('Get user invitations error:', error);
        sendResponse(res, 500, false, 'Server error retrieving invitations');
    }
};

// Accept invitation
exports.acceptInvitation = async (req, res) => {
    try {
        const { invitationId } = req.params;
        const userId = req.user.id;

        const invitation = await InvitationService.acceptInvitation(invitationId, userId);

        // Emit real-time notifications
        const io = getNamespace('notifications');
        const workspaceIo = getNamespace('workspace');
        
        if (io) {
            // Notify inviter about acceptance
            io.to(invitation.invitedBy.toString()).emit('notification', {
                title: `Invitation accepted: ${invitation.targetEntity.name}`,
                message: `Your invitation to join ${invitation.targetEntity.name} was accepted`,
                type: 'invitation_accepted'
            });

            // Emit invitation update event
            io.to(invitation.invitedBy.toString()).emit('invitation:updated', {
                invitation: {
                    id: invitation._id,
                    status: invitation.status,
                    acceptedAt: invitation.acceptedAt
                }
            });
        }

        // Emit workspace updates for real-time member list updates
        if (workspaceIo && invitation.targetEntity.type === 'Workspace') {
            // Notify all workspace members about new member
            workspaceIo.to(invitation.targetEntity.id).emit('workspace:member_added', {
                workspaceId: invitation.targetEntity.id,
                member: {
                    id: req.user.id,
                    name: req.user.name,
                    email: req.user.email,
                    role: invitation.role,
                    joinedAt: new Date()
                }
            });

            // Notify the new member about workspace access
            workspaceIo.to(req.user.id.toString()).emit('workspace:access_granted', {
                workspaceId: invitation.targetEntity.id,
                workspaceName: invitation.targetEntity.name,
                role: invitation.role
            });
        }

        sendResponse(res, 200, true, 'Invitation accepted successfully', {
            invitation: {
                id: invitation._id,
                status: invitation.status,
                acceptedAt: invitation.acceptedAt
            }
        });

    } catch (error) {
        logger.error('Accept invitation error:', error);
        if (error.message.includes('not found') || error.message.includes('expired') || error.message.includes('no longer pending')) {
            sendResponse(res, 400, false, error.message);
        } else {
            sendResponse(res, 500, false, 'Server error accepting invitation');
        }
    }
};

// Decline invitation
exports.declineInvitation = async (req, res) => {
    try {
        const { invitationId } = req.params;
        const userId = req.user.id;

        logger.info('Declining invitation:', { invitationId, userId });

        const invitation = await InvitationService.declineInvitation(invitationId, userId);
        
        logger.info('Invitation declined successfully:', { 
            invitationId: invitation._id, 
            status: invitation.status,
            declinedAt: invitation.declinedAt 
        });

        // Emit real-time notification
        try {
            // Emit invitation update event to the inviter
            emitInvitationReceived(invitation.invitedBy, {
                invitation: {
                    id: invitation._id,
                    status: invitation.status,
                    declinedAt: invitation.declinedAt,
                    type: invitation.type,
                    targetEntity: invitation.targetEntity
                }
            });
            
            logger.info('Socket.IO invitation declined event emitted to inviter:', invitation.invitedBy);
        } catch (socketError) {
            logger.error('Failed to emit Socket.IO events for declined invitation:', socketError);
        }

        sendResponse(res, 200, true, 'Invitation declined successfully', {
            invitation: {
                id: invitation._id,
                status: invitation.status,
                declinedAt: invitation.declinedAt
            }
        });

    } catch (error) {
        logger.error('Decline invitation error:', error);
        if (error.message.includes('not found') || error.message.includes('no longer pending')) {
            sendResponse(res, 400, false, error.message);
        } else {
            sendResponse(res, 500, false, 'Server error declining invitation');
        }
    }
};

// Get invitation by ID
exports.getInvitationById = async (req, res) => {
    try {
        const { invitationId } = req.params;
        const userId = req.user.id;

        const invitation = await InvitationService.getInvitationById(invitationId);

        // Verify user has access to this invitation
        if (invitation.invitedUser.email !== req.user.email) {
            return sendResponse(res, 403, false, 'Access denied to this invitation');
        }

        sendResponse(res, 200, true, 'Invitation retrieved successfully', {
            invitation: {
                id: invitation._id,
                type: invitation.type,
                invitedBy: invitation.invitedBy,
                invitedUser: invitation.invitedUser,
                targetEntity: invitation.targetEntity,
                role: invitation.role,
                message: invitation.message,
                status: invitation.status,
                createdAt: invitation.createdAt,
                expiresAt: invitation.expiresAt,
                acceptedAt: invitation.acceptedAt,
                declinedAt: invitation.declinedAt
            }
        });

    } catch (error) {
        logger.error('Get invitation by ID error:', error);
        if (error.message.includes('not found')) {
            sendResponse(res, 404, false, error.message);
        } else {
            sendResponse(res, 500, false, 'Server error retrieving invitation');
        }
    }
};

// Get invitation by token
exports.getByToken = async (req, res) => {
    try {
        const { token } = req.params;
        const userId = req.user.id;

        const invitation = await Invitation.findByToken(token);

        if (!invitation) {
            return sendResponse(res, 404, false, 'Invitation not found');
        }

        // Check if invitation is expired
        if (invitation.expiresAt < new Date()) {
            return sendResponse(res, 400, false, 'Invitation has expired');
        }

        // Check if invitation is already processed
        if (invitation.status !== 'pending') {
            return sendResponse(res, 400, false, 'Invitation has already been processed');
        }

        // Verify user has access to this invitation
        if (invitation.invitedUser.email !== req.user.email) {
            return sendResponse(res, 403, false, 'Access denied to this invitation');
        }

        sendResponse(res, 200, true, 'Invitation retrieved successfully', {
            invitation: {
                id: invitation._id,
                type: invitation.type,
                invitedBy: invitation.invitedBy,
                invitedUser: invitation.invitedUser,
                targetEntity: invitation.targetEntity,
                role: invitation.role,
                message: invitation.message,
                status: invitation.status,
                createdAt: invitation.createdAt,
                expiresAt: invitation.expiresAt
            }
        });

    } catch (error) {
        logger.error('Get invitation by token error:', error);
        if (error.message.includes('not found')) {
            sendResponse(res, 404, false, error.message);
        } else {
            sendResponse(res, 500, false, 'Server error retrieving invitation');
        }
    }
};

// Bulk invite users
exports.bulkInvite = async (req, res) => {
    try {
        const { emails, entityType, entityId, role = 'member', message } = req.body;
        const userId = req.user.id;

        if (!Array.isArray(emails) || emails.length === 0) {
            return sendResponse(res, 400, false, 'Emails array is required and must not be empty');
        }

        if (emails.length > 50) {
            return sendResponse(res, 400, false, 'Cannot invite more than 50 users at once');
        }

        // Validate entity type
        if (!['workspace', 'space'].includes(entityType)) {
            return sendResponse(res, 400, false, 'Invalid entity type');
        }

        // Validate role
        const allowedRoles = ['member', 'admin', 'viewer'];
        if (!allowedRoles.includes(role)) {
            return sendResponse(res, 400, false, 'Invalid role specified');
        }

        const result = await InvitationService.bulkInvite(emails, entityType, entityId, role, userId, {
            message,
            expiresInDays: 7
        });

        sendResponse(res, 201, true, 'Bulk invitation completed', result);

    } catch (error) {
        logger.error('Bulk invite error:', error);
        sendResponse(res, 500, false, 'Server error processing bulk invitation');
    }
};

// Invite GitHub organization members
exports.inviteGitHubMembers = async (req, res) => {
    try {
        const { workspaceId, memberEmails, role = 'member', message } = req.body;
        const userId = req.user.id;

        if (!workspaceId) {
            return sendResponse(res, 400, false, 'Workspace ID is required');
        }

        if (!Array.isArray(memberEmails) || memberEmails.length === 0) {
            return sendResponse(res, 400, false, 'Member emails array is required and must not be empty');
        }

        if (memberEmails.length > 50) {
            return sendResponse(res, 400, false, 'Cannot invite more than 50 members at once');
        }

        // Validate role
        const allowedRoles = ['member', 'admin', 'viewer'];
        if (!allowedRoles.includes(role)) {
            return sendResponse(res, 400, false, 'Invalid role specified');
        }

        // Check if user has permission to invite to this workspace
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return sendResponse(res, 404, false, 'Workspace not found');
        }

        const isOwner = workspace.owner.toString() === userId;
        const isAdmin = workspace.members.some(member => 
            member.user.toString() === userId && ['admin', 'owner'].includes(member.role)
        );

        if (!isOwner && !isAdmin) {
            return sendResponse(res, 403, false, 'Insufficient permissions to invite members to this workspace');
        }

        const result = await InvitationService.inviteGitHubMembers(workspaceId, memberEmails, role, userId, {
            message,
            expiresInDays: 7
        });

        sendResponse(res, 201, true, 'GitHub member invitations completed', result);

    } catch (error) {
        logger.error('Invite GitHub members error:', error);
        sendResponse(res, 500, false, 'Server error processing GitHub member invitations');
    }
};

// Get invitation statistics
exports.getInvitationStats = async (req, res) => {
    try {
        const { entityType, entityId } = req.params;
        const userId = req.user.id;

        // Validate entity type
        if (!['workspace', 'space'].includes(entityType)) {
            return sendResponse(res, 400, false, 'Invalid entity type');
        }

        // Check if user has permission to view stats
        let hasPermission = false;
        if (entityType === 'workspace') {
            const workspace = await Workspace.findById(entityId);
            if (workspace) {
                hasPermission = workspace.owner.toString() === userId || 
                    workspace.members.some(member => 
                        member.user.toString() === userId && ['admin', 'owner'].includes(member.role)
                    );
            }
        } else if (entityType === 'space') {
            const space = await Space.findById(entityId);
            if (space) {
                hasPermission = space.owner.toString() === userId || 
                    space.members.some(member => 
                        member.user.toString() === userId && ['admin', 'owner'].includes(member.role)
                    );
            }
        }

        if (!hasPermission) {
            return sendResponse(res, 403, false, 'Insufficient permissions to view invitation statistics');
        }

        const stats = await InvitationService.getInvitationStats(entityType, entityId);

        sendResponse(res, 200, true, 'Invitation statistics retrieved successfully', stats);

    } catch (error) {
        logger.error('Get invitation stats error:', error);
        sendResponse(res, 500, false, 'Server error retrieving invitation statistics');
    }
};

// Cancel invitation
exports.cancelInvitation = async (req, res) => {
    try {
        const { invitationId } = req.params;
        const userId = req.user.id;

        const invitation = await Invitation.findById(invitationId);
        if (!invitation) {
            return sendResponse(res, 404, false, 'Invitation not found');
        }

        // Check if user has permission to cancel this invitation
        if (invitation.invitedBy.toString() !== userId) {
            return sendResponse(res, 403, false, 'Insufficient permissions to cancel this invitation');
        }

        if (invitation.status !== 'pending') {
            return sendResponse(res, 400, false, 'Only pending invitations can be cancelled');
        }

        invitation.status = 'cancelled';
        invitation.cancelledAt = new Date();
        await invitation.save();

        sendResponse(res, 200, true, 'Invitation cancelled successfully', {
            invitation: {
                id: invitation._id,
                status: invitation.status,
                cancelledAt: invitation.cancelledAt
            }
        });

    } catch (error) {
        logger.error('Cancel invitation error:', error);
        sendResponse(res, 500, false, 'Server error cancelling invitation');
    }
};

// Cleanup expired invitations
exports.cleanupExpiredInvitations = async (req, res) => {
    try {
        const result = await Invitation.updateMany(
            {
                status: 'pending',
                expiresAt: { $lt: new Date() }
            },
            {
                status: 'expired'
            }
        );

        logger.info(`Cleaned up ${result.modifiedCount} expired invitations`);

        sendResponse(res, 200, true, 'Expired invitations cleaned up successfully', {
            cleanedCount: result.modifiedCount
        });
    } catch (error) {
        logger.error('Cleanup expired invitations error:', error);
        sendResponse(res, 500, false, 'Server error cleaning up expired invitations');
    }
};