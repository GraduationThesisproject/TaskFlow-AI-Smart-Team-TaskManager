const Invitation = require('../models/Invitation');
const Workspace = require('../models/Workspace');
const Space = require('../models/Space');
const User = require('../models/User');
const { sendResponse } = require('../utils/response');
const { sendEmail } = require('../utils/email');
const logger = require('../config/logger');

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

        // Check if user exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return sendResponse(res, 400, false, 'User with this email already exists');
        }

        // Check if invitation already exists
        const existingInvitation = await Invitation.findOne({
            'invitedUser.email': email.toLowerCase(),
            'targetEntity.id': targetEntity.id,
            'targetEntity.type': targetEntity.type,
            status: 'pending'
        });

        if (existingInvitation) {
            return sendResponse(res, 400, false, 'Invitation already exists for this user');
        }

        // SECURITY FIX: Use verified roles from auth middleware
        const userRoles = req.user.roles;
        let targetEntityDoc;
        let hasPermission = false;
        let userEntityRole = null;

        switch (targetEntity.type) {
            case 'Workspace':
                targetEntityDoc = await Workspace.findById(targetEntity.id);
                if (targetEntityDoc) {
                    userEntityRole = userRoles.workspaces.find(ws => 
                        ws.workspace.toString() === targetEntity.id
                    );
                    hasPermission = userEntityRole && (userEntityRole.role === 'admin' || userEntityRole.role === 'owner') || 
                                   targetEntityDoc.owner.toString() === userId;
                }
                break;
            case 'Space':
                targetEntityDoc = await Space.findById(targetEntity.id);
                if (targetEntityDoc) {
                    userEntityRole = userRoles.spaces.find(s => 
                        s.space.toString() === targetEntity.id
                    );
                    hasPermission = userEntityRole && (userEntityRole.role === 'admin') || 
                                   targetEntityDoc.owner.toString() === userId;
                }
                break;
        }

        if (!targetEntityDoc) {
            return sendResponse(res, 404, false, `${targetEntity.type} not found`);
        }

        if (!hasPermission) {
            return sendResponse(res, 403, false, 'Insufficient permissions to send invitations');
        }

        // SECURITY FIX: Validate role assignment permissions
        if (targetEntity.type === 'Workspace') {
            // Only workspace owners can assign admin roles
            if (role === 'admin' && userEntityRole && userEntityRole.role !== 'owner') {
                return sendResponse(res, 403, false, 'Only workspace owners can assign admin roles');
            }
            
            // Cannot assign owner role through invitation
            if (role === 'owner') {
                return sendResponse(res, 403, false, 'Cannot assign owner role through invitation');
            }
        } else if (targetEntity.type === 'Space') {
            // Only space admins can assign admin roles
            if (role === 'admin' && userEntityRole && userEntityRole.role !== 'admin') {
                return sendResponse(res, 403, false, 'Only space admins can assign admin roles');
            }
        }

        // Create invitation
        const invitation = new Invitation({
            type: targetEntity.type.toLowerCase(),
            invitedBy: userId,
            invitedUser: {
                email,
                name
            },
            targetEntity: {
                type: targetEntity.type,
                id: targetEntity.id,
                name: targetEntityDoc.name
            },
            role,
            message
        });

        await invitation.save();

        // Send invitation email
        await sendEmail({
            to: email,
            template: `${targetEntity.type.toLowerCase()}-invitation`,
            data: {
                inviterName: req.user.name,
                entityName: targetEntityDoc.name,
                entityType: targetEntity.type,
                role,
                message,
                invitationUrl: invitation.inviteUrl
            }
        });

        logger.info(`Invitation created: ${invitation._id} for ${email}`);

        sendResponse(res, 201, true, 'Invitation sent successfully', {
            invitation: {
                id: invitation._id,
                invitedUser: invitation.invitedUser,
                targetEntity: invitation.targetEntity,
                role: invitation.role,
                status: invitation.status,
                token: invitation.token,
                inviteUrl: invitation.inviteUrl
            }
        });
    } catch (error) {
        logger.error('Create invitation error:', error);
        sendResponse(res, 500, false, 'Server error creating invitation');
    }
};

// Get invitation by token
exports.getInvitation = async (req, res) => {
    try {
        const { token } = req.params;

        const invitation = await Invitation.findByToken(token);
        if (!invitation) {
            return sendResponse(res, 404, false, 'Invitation not found or expired');
        }

        if (invitation.status !== 'pending') {
            return sendResponse(res, 400, false, `Invitation has been ${invitation.status}`);
        }

        if (invitation.isExpired) {
            await invitation.updateOne({ status: 'expired' });
            return sendResponse(res, 400, false, 'Invitation has expired');
        }

        sendResponse(res, 200, true, 'Invitation retrieved successfully', {
            invitation: {
                id: invitation._id,
                type: invitation.type,
                invitedBy: invitation.invitedBy,
                targetEntity: invitation.targetEntity,
                role: invitation.role,
                message: invitation.message,
                expiresAt: invitation.expiresAt,
                createdAt: invitation.createdAt
            }
        });
    } catch (error) {
        logger.error('Get invitation error:', error);
        sendResponse(res, 500, false, 'Server error retrieving invitation');
    }
};

// Accept invitation
exports.acceptInvitation = async (req, res) => {
    try {
        const { token } = req.params;
        const userId = req.user.id;

        const invitation = await Invitation.findByToken(token);
        if (!invitation) {
            return sendResponse(res, 404, false, 'Invitation not found or expired');
        }

        if (invitation.status !== 'pending') {
            return sendResponse(res, 400, false, `Invitation has been ${invitation.status}`);
        }

        // Check if the user accepting is the one who was invited
        if (invitation.invitedUser.email !== req.user.email) {
            return sendResponse(res, 400, false, 'Only the invited user can accept this invitation');
        }

        // Check if invitation is expired
        if (invitation.expiresAt < new Date()) {
            await invitation.updateOne({ status: 'expired' });
            return sendResponse(res, 400, false, 'Invitation has expired');
        }

        // Check if targetEntity exists
        if (!invitation.targetEntity) {
            logger.error(`Invitation ${invitation._id} has no targetEntity`);
            return sendResponse(res, 500, false, 'Invalid invitation: missing target entity');
        }

        if (!invitation.targetEntity.id) {
            logger.error(`Invitation ${invitation._id} has no targetEntity.id`);
            return sendResponse(res, 500, false, 'Invalid invitation: missing target entity ID');
        }

        // Get user and roles
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();

        // Add role based on invitation type and add to entity membership
        if (invitation.targetEntity.type === 'Workspace') {
            await userRoles.addWorkspaceRole(invitation.targetEntity.id, invitation.role);
            const workspace = await Workspace.findById(invitation.targetEntity.id);
            if (workspace) {
                await workspace.addMember(userId, invitation.role, invitation.invitedBy);
            }
        } else if (invitation.targetEntity.type === 'Space') {
            await userRoles.addSpaceRole(invitation.targetEntity.id, invitation.role);
            const SpaceModel = require('../models/Space');
            const space = await SpaceModel.findById(invitation.targetEntity.id);
            if (space) {
                const isMember = (space.members || []).some(m => m.user.toString() === userId.toString());
                if (!isMember) {
                    space.members.push({ user: userId, role: invitation.role });
                    await space.save();
                }
            }
        }

        // Accept invitation
        await invitation.accept(userId);
// create a new notification for the user
const notification_receiver = new Notification({
    userId: userId,
    message: `You have been invited to ${invitation.targetEntity.name} by ${invitation.invitedBy.name}`,
    type: 'invitation',
    data: invitation
});
await notification_receiver.save();
const notification_sender = new Notification({
    userId: invitation.invitedBy,
    message: `You have invited ${invitation.invitedUser.name} to ${invitation.targetEntity.name}`,
    type: 'invitation',
    data: invitation
});
await notification_sender.save();
        sendResponse(res, 200, true, 'Invitation accepted successfully', {
            invitation: invitation
        });
    } catch (error) {
        logger.error('Accept invitation error:', error);
        sendResponse(res, 500, false, 'Failed to accept invitation');
    }
};

// Decline invitation
exports.declineInvitation = async (req, res) => {
    try {
        const { token } = req.params;
        const { reason } = req.body;

        const invitation = await Invitation.findByToken(token);
        if (!invitation) {
            return sendResponse(res, 404, false, 'Invitation not found or expired');
        }

        if (invitation.status !== 'pending') {
            return sendResponse(res, 400, false, `Invitation has been ${invitation.status}`);
        }

        await invitation.decline();

        sendResponse(res, 200, true, 'Invitation declined successfully', {
            invitation: {
                id: invitation._id,
                status: invitation.status,
                declinedAt: invitation.declinedAt
            }
        });
    } catch (error) {
        logger.error('Decline invitation error:', error);
        sendResponse(res, 500, false, 'Server error declining invitation');
    }
};

// Get user's sent invitations
exports.getUserInvitations = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status, entityType } = req.query;

        let query = { invitedBy: userId };
        
        if (status) {
            query.status = status;
        }
        
        if (entityType) {
            query['targetEntity.type'] = entityType;
        }

        const invitations = await Invitation.find(query)
            .populate('invitedBy', 'name avatar')
            .populate('invitedUser.userId', 'name avatar')
            .sort({ createdAt: -1 });

        sendResponse(res, 200, true, 'Invitations retrieved successfully', {
            invitations,
            count: invitations.length
        });
    } catch (error) {
        logger.error('Get user invitations error:', error);
        sendResponse(res, 500, false, 'Server error retrieving invitations');
    }
};

// Get entity invitations (for admins)
exports.getEntityInvitations = async (req, res) => {
    try {
        const { entityType, entityId } = req.params;
        const { status } = req.query;
        const userId = req.user.id;

        // Check permissions
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        let hasPermission = false;

        switch (entityType) {
            case 'workspace':
                hasPermission = userRoles.hasWorkspaceRole(entityId, 'admin');
                break;
            case 'space':
                hasPermission = userRoles.hasSpacePermission(entityId, 'canManageMembers');
                break;
        }

        if (!hasPermission) {
            return sendResponse(res, 403, false, 'Insufficient permissions to view invitations');
        }

        // Build query with status filter if provided
        let query = {
            'targetEntity.type': entityType.charAt(0).toUpperCase() + entityType.slice(1),
            'targetEntity.id': entityId
        };

        if (status) {
            query.status = status;
        }

        const invitations = await Invitation.find(query)
            .populate('invitedBy', 'name avatar')
            .populate('invitedUser.userId', 'name avatar')
            .sort({ createdAt: -1 });

        sendResponse(res, 200, true, 'Entity invitations retrieved successfully', {
            invitations,
            count: invitations.length
        });
    } catch (error) {
        logger.error('Get entity invitations error:', error);
        sendResponse(res, 500, false, 'Server error retrieving entity invitations');
    }
};

// Cancel invitation
exports.cancelInvitation = async (req, res) => {
    try {
        const { id: invitationId } = req.params;
        const userId = req.user.id;

        const invitation = await Invitation.findById(invitationId);
        if (!invitation) {
            return sendResponse(res, 404, false, 'Invitation not found');
        }

        // Check permissions - only inviter or entity admin can cancel
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        let canCancel = invitation.invitedBy.toString() === userId;

        if (!canCancel) {
            switch (invitation.targetEntity.type) {
                case 'Workspace':
                    canCancel = userRoles.hasWorkspaceRole(invitation.targetEntity.id, 'admin');
                    break;
                case 'Space':
                    canCancel = userRoles.hasSpacePermission(invitation.targetEntity.id, 'canManageMembers');
                    break;
            }
        }

        if (!canCancel) {
            return sendResponse(res, 403, false, 'Insufficient permissions to cancel this invitation');
        }

        await invitation.cancel();

        sendResponse(res, 200, true, 'Invitation cancelled successfully');
    } catch (error) {
        logger.error('Cancel invitation error:', error);
        sendResponse(res, 500, false, 'Server error cancelling invitation');
    }
};

// Resend invitation
exports.resendInvitation = async (req, res) => {
    try {
        const { id: invitationId } = req.params;
        const userId = req.user.id;

        const invitation = await Invitation.findById(invitationId)
            .populate('invitedBy', 'name');

        if (!invitation) {
            return sendResponse(res, 404, false, 'Invitation not found');
        }

        if (invitation.status !== 'pending') {
            return sendResponse(res, 400, false, 'Can only resend pending invitations');
        }

        // Check permissions
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        let canResend = invitation.invitedBy._id.toString() === userId;

        if (!canResend) {
            switch (invitation.targetEntity.type) {
                case 'Workspace':
                    canResend = userRoles.hasWorkspaceRole(invitation.targetEntity.id, 'admin');
                    break;
            }
        }

        if (!canResend) {
            return sendResponse(res, 403, false, 'Insufficient permissions to resend this invitation');
        }

        // Send invitation email
        const emailTemplate = `${invitation.targetEntity.type.toLowerCase()}-invitation`;
        await sendEmail({
            to: invitation.invitedUser.email,
            template: emailTemplate,
            data: {
                inviterName: invitation.invitedBy.name,
                entityName: invitation.targetEntity.name,
                role: invitation.role,
                message: invitation.message,
                invitationUrl: invitation.inviteUrl
            }
        });

        // Update reminder tracking
        await invitation.sendReminder();

        sendResponse(res, 200, true, 'Invitation resent successfully', {
            invitation: {
                id: invitation._id,
                resentAt: invitation.lastReminderAt,
                resentCount: invitation.remindersSent
            }
        });
    } catch (error) {
        logger.error('Resend invitation error:', error);
        sendResponse(res, 500, false, 'Server error resending invitation');
    }
};

// Extend invitation expiration
exports.extendInvitation = async (req, res) => {
    try {
        const { id: invitationId } = req.params;
        const { days = 7 } = req.body;
        const userId = req.user.id;

        const invitation = await Invitation.findById(invitationId);
        if (!invitation) {
            return sendResponse(res, 404, false, 'Invitation not found');
        }

        // Check permissions - only inviter or entity admin can extend
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        let canExtend = invitation.invitedBy.toString() === userId;

        if (!canExtend) {
            switch (invitation.targetEntity.type) {
                case 'Workspace':
                    canExtend = userRoles.hasWorkspaceRole(invitation.targetEntity.id, 'admin');
                    break;
            }
        }

        if (!canExtend) {
            return sendResponse(res, 403, false, 'Insufficient permissions to extend this invitation');
        }

        await invitation.extendExpiration(days);

        sendResponse(res, 200, true, 'Invitation expiration extended successfully', {
            invitation: {
                id: invitation._id,
                newExpiresAt: invitation.expiresAt
            }
        });
    } catch (error) {
        logger.error('Extend invitation error:', error);
        sendResponse(res, 500, false, 'Server error extending invitation');
    }
};

// Bulk invite users
exports.bulkInvite = async (req, res) => {
    try {
        const { emails, entityType, entityId, role = 'member', message } = req.body;
        const userId = req.user.id;

        if (!Array.isArray(emails) || emails.length === 0) {
            return sendResponse(res, 400, false, 'Emails array is required');
        }

        // SECURITY FIX: Validate role parameter
        const allowedRoles = ['member', 'admin', 'viewer'];
        if (!allowedRoles.includes(role)) {
            return sendResponse(res, 400, false, 'Invalid role specified');
        }

        // SECURITY FIX: Use verified roles from auth middleware
        const userRoles = req.user.roles;
        
        let hasPermission = false;
        let targetEntity;
        let userEntityRole = null;

        switch (entityType) {
            case 'workspace':
                targetEntity = await Workspace.findById(entityId);
                if (targetEntity) {
                    userEntityRole = userRoles.workspaces.find(ws => 
                        ws.workspace.toString() === entityId
                    );
                    hasPermission = userEntityRole && (userEntityRole.role === 'admin' || userEntityRole.role === 'owner');
                }
                break;
            case 'space':
                targetEntity = await Space.findById(entityId);
                if (targetEntity) {
                    userEntityRole = userRoles.spaces.find(s => 
                        s.space.toString() === entityId
                    );
                    hasPermission = userEntityRole && userEntityRole.role === 'admin';
                }
                break;
        }

        if (!targetEntity) {
            return sendResponse(res, 404, false, `${entityType} not found`);
        }

        if (!hasPermission) {
            return sendResponse(res, 403, false, 'Insufficient permissions to send invitations');
        }

        // SECURITY FIX: Validate role assignment permissions
        if (entityType === 'workspace') {
            // Only workspace owners can assign admin roles
            if (role === 'admin' && userEntityRole && userEntityRole.role !== 'owner') {
                return sendResponse(res, 403, false, 'Only workspace owners can assign admin roles');
            }
            
            // Cannot assign owner role through invitation
            if (role === 'owner') {
                return sendResponse(res, 403, false, 'Cannot assign owner role through invitation');
            }
        } else if (entityType === 'space') {
            // Only space admins can assign admin roles
            if (role === 'admin' && userEntityRole && userEntityRole.role !== 'admin') {
                return sendResponse(res, 403, false, 'Only space admins can assign admin roles');
            }
        }

        // Process each email
        const results = [];
        const errors = [];

        for (const email of emails) {
            try {
                // Check if user already exists and is member
                const existingUser = await User.findOne({ email });
                let isAlreadyMember = false;

                if (existingUser) {
                    switch (entityType) {
                        case 'workspace':
                            isAlreadyMember = targetEntity.members.some(m => 
                                m.user.toString() === existingUser._id.toString()
                            ) || targetEntity.owner.toString() === existingUser._id.toString();
                            break;
                        case 'space':
                            isAlreadyMember = targetEntity.members.some(m => 
                                m.user.toString() === existingUser._id.toString()
                            );
                            break;
                    }
                }

                if (isAlreadyMember) {
                    errors.push({ email, error: 'User is already a member' });
                    continue;
                }

                // Check if invitation already exists
                const existingInvitation = await Invitation.findOne({
                    'invitedUser.email': email.toLowerCase(),
                    'targetEntity.id': entityId,
                    'targetEntity.type': entityType === 'workspace' ? 'Workspace' : 'Space',
                    status: 'pending'
                });

                if (existingInvitation) {
                    errors.push({ email, error: 'Invitation already exists' });
                    continue;
                }

                // Create invitation
                const invitation = new Invitation({
                    type: entityType,
                    invitedBy: userId,
                    invitedUser: {
                        email,
                        userId: existingUser ? existingUser._id : null
                    },
                    targetEntity: {
                        type: entityType === 'workspace' ? 'Workspace' : 'Space',
                        id: entityId,
                        name: targetEntity.name
                    },
                    role,
                    message
                });

                await invitation.save();
                results.push({ email, invitationId: invitation._id });

            } catch (error) {
                logger.error(`Error processing email ${email}:`, error);
                errors.push({ email, error: 'Failed to create invitation' });
            }
        }

        // Send invitation emails
        for (const result of results) {
            try {
                await sendEmail({
                    to: result.email,
                    template: `${entityType}-invitation`,
                    data: {
                        inviterName: req.user.name,
                        entityName: targetEntity.name,
                        entityType: entityType === 'workspace' ? 'Workspace' : 'Space',
                        role,
                        message
                    }
                });
            } catch (error) {
                logger.error(`Error sending email to ${result.email}:`, error);
            }
        }

        sendResponse(res, 200, true, 'Bulk invitations processed', {
            results,
            errors,
            totalProcessed: results.length,
            totalErrors: errors.length
        });
    } catch (error) {
        logger.error('Bulk invite error:', error);
        sendResponse(res, 500, false, 'Server error processing bulk invitations');
    }
};

// Cleanup expired invitations
exports.cleanupExpired = async (req, res) => {
    try {
        const result = await Invitation.cleanupExpired();

        sendResponse(res, 200, true, 'Expired invitations cleaned up', {
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        logger.error('Cleanup expired invitations error:', error);
        sendResponse(res, 500, false, 'Server error cleaning up expired invitations');
    }
};
