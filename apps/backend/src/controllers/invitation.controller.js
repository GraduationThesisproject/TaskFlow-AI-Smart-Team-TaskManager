const Invitation = require('../models/Invitation');
const User = require('../models/User');
const Workspace = require('../models/Workspace');
const Project = require('../models/Project');
const ActivityLog = require('../models/ActivityLog');
const { sendResponse } = require('../utils/response');
const { sendEmail } = require('../utils/email');
const logger = require('../config/logger');

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

        if (invitation.isExpired) {
            await invitation.updateOne({ status: 'expired' });
            return sendResponse(res, 400, false, 'Invitation has expired');
        }

        // Get user and roles
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();

        // Process invitation based on type
        let targetEntity;
        
        switch (invitation.targetEntity.type) {
            case 'Workspace':
                targetEntity = await Workspace.findById(invitation.targetEntity.id);
                if (targetEntity) {
                    await targetEntity.addMember(userId, invitation.role, invitation.invitedBy);
                    await userRoles.addWorkspaceRole(targetEntity._id, invitation.role);
                }
                break;
                
            case 'Project':
                targetEntity = await Project.findById(invitation.targetEntity.id);
                if (targetEntity) {
                    await targetEntity.addTeamMember(userId, invitation.role);
                    await userRoles.addProjectRole(targetEntity._id, invitation.role);
                }
                break;
                
            case 'Space':
                const Space = require('../models/Space');
                targetEntity = await Space.findById(invitation.targetEntity.id);
                if (targetEntity) {
                    await targetEntity.addMember(userId, invitation.role, invitation.invitedBy);
                    // Add space role
                    userRoles.spaces.push({
                        space: targetEntity._id,
                        role: invitation.role,
                        permissions: targetEntity.getDefaultPermissions(invitation.role)
                    });
                    await userRoles.save();
                }
                break;
                
            default:
                return sendResponse(res, 400, false, 'Invalid invitation type');
        }

        if (!targetEntity) {
            return sendResponse(res, 404, false, `${invitation.targetEntity.type} not found`);
        }

        // Accept invitation
        await invitation.accept(userId);

        // Log activity
        await ActivityLog.logActivity({
            userId,
            action: `${invitation.targetEntity.type.toLowerCase()}_member_add`,
            description: `Accepted invitation to ${invitation.targetEntity.type.toLowerCase()}: ${targetEntity.name}`,
            entity: { 
                type: invitation.targetEntity.type, 
                id: invitation.targetEntity.id, 
                name: targetEntity.name 
            },
            relatedEntities: [{ type: 'Invitation', id: invitation._id, name: 'Invitation' }],
            workspaceId: invitation.targetEntity.type === 'Workspace' ? invitation.targetEntity.id : targetEntity.workspace,
            projectId: invitation.targetEntity.type === 'Project' ? invitation.targetEntity.id : targetEntity.project,
            metadata: {
                invitationToken: token,
                role: invitation.role,
                ipAddress: req.ip
            }
        });

        logger.info(`Invitation accepted: ${token} by user ${userId}`);

        sendResponse(res, 200, true, 'Invitation accepted successfully', {
            entity: {
                id: targetEntity._id,
                name: targetEntity.name,
                type: invitation.targetEntity.type
            },
            role: invitation.role
        });
    } catch (error) {
        logger.error('Accept invitation error:', error);
        sendResponse(res, 500, false, 'Server error accepting invitation');
    }
};

// Decline invitation
exports.declineInvitation = async (req, res) => {
    try {
        const { token } = req.params;

        const invitation = await Invitation.findByToken(token);
        if (!invitation) {
            return sendResponse(res, 404, false, 'Invitation not found or expired');
        }

        if (invitation.status !== 'pending') {
            return sendResponse(res, 400, false, `Invitation has been ${invitation.status}`);
        }

        await invitation.decline();

        sendResponse(res, 200, true, 'Invitation declined successfully');
    } catch (error) {
        logger.error('Decline invitation error:', error);
        sendResponse(res, 500, false, 'Server error declining invitation');
    }
};

// Get user's pending invitations
exports.getUserInvitations = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        const invitations = await Invitation.findPending(user.email);

        sendResponse(res, 200, true, 'User invitations retrieved successfully', {
            invitations,
            count: invitations.length
        });
    } catch (error) {
        logger.error('Get user invitations error:', error);
        sendResponse(res, 500, false, 'Server error retrieving user invitations');
    }
};

// Get entity invitations (for admins)
exports.getEntityInvitations = async (req, res) => {
    try {
        const { entityType, entityId } = req.params;
        const userId = req.user.id;

        // Check permissions
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        let hasPermission = false;

        switch (entityType) {
            case 'workspace':
                hasPermission = userRoles.hasWorkspaceRole(entityId, 'admin');
                break;
            case 'project':
                hasPermission = userRoles.hasProjectRole(entityId, 'admin');
                break;
            case 'space':
                hasPermission = userRoles.hasSpacePermission(entityId, 'canManageMembers');
                break;
        }

        if (!hasPermission) {
            return sendResponse(res, 403, false, 'Insufficient permissions to view invitations');
        }

        const invitations = await Invitation.findByEntity(
            entityType.charAt(0).toUpperCase() + entityType.slice(1),
            entityId
        );

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
                case 'Project':
                    canCancel = userRoles.hasProjectRole(invitation.targetEntity.id, 'admin');
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

        // Log activity
        await ActivityLog.logActivity({
            userId,
            action: 'invitation_cancel',
            description: `Cancelled invitation to ${invitation.targetEntity.type.toLowerCase()}`,
            entity: { type: 'Invitation', id: invitationId, name: 'Invitation' },
            relatedEntities: [{ 
                type: invitation.targetEntity.type, 
                id: invitation.targetEntity.id, 
                name: invitation.targetEntity.name 
            }],
            metadata: {
                invitedEmail: invitation.invitedUser.email,
                role: invitation.role,
                ipAddress: req.ip
            }
        });

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
            .populate('invitedBy', 'name')
            .populate('targetEntity.id');

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
                case 'Project':
                    canResend = userRoles.hasProjectRole(invitation.targetEntity.id, 'admin');
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
                email: invitation.invitedUser.email,
                remindersSent: invitation.remindersSent
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
                case 'Project':
                    canExtend = userRoles.hasProjectRole(invitation.targetEntity.id, 'admin');
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

        // Check permissions
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        let hasPermission = false;
        let targetEntity;

        switch (entityType) {
            case 'workspace':
                targetEntity = await Workspace.findById(entityId);
                hasPermission = userRoles.hasWorkspaceRole(entityId, 'admin');
                break;
            case 'project':
                targetEntity = await Project.findById(entityId);
                hasPermission = userRoles.hasProjectRole(entityId, 'admin');
                break;
        }

        if (!targetEntity) {
            return sendResponse(res, 404, false, `${entityType} not found`);
        }

        if (!hasPermission) {
            return sendResponse(res, 403, false, 'Insufficient permissions to send invitations');
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
                        case 'project':
                            isAlreadyMember = targetEntity.team.some(m => 
                                m.user.toString() === existingUser._id.toString()
                            ) || targetEntity.owner.toString() === existingUser._id.toString();
                            break;
                    }
                }

                if (isAlreadyMember) {
                    errors.push({ email, error: 'User is already a member' });
                    continue;
                }

                // Create invitation
                const invitation = await Invitation.create({
                    type: entityType,
                    invitedBy: userId,
                    invitedUser: {
                        email,
                        userId: existingUser ? existingUser._id : null
                    },
                    targetEntity: {
                        type: entityType.charAt(0).toUpperCase() + entityType.slice(1),
                        id: entityId,
                        name: targetEntity.name
                    },
                    role,
                    message,
                    metadata: {
                        invitationMethod: 'bulk'
                    }
                });

                // Send invitation email
                await sendEmail({
                    to: email,
                    template: `${entityType}-invitation`,
                    data: {
                        inviterName: user.name,
                        entityName: targetEntity.name,
                        entityType,
                        role,
                        message,
                        invitationUrl: invitation.inviteUrl
                    }
                });

                results.push({
                    email,
                    invitationId: invitation._id,
                    status: 'sent'
                });

            } catch (emailError) {
                logger.error(`Bulk invite error for ${email}:`, emailError);
                errors.push({ email, error: emailError.message });
            }
        }

        // Log activity
        await ActivityLog.logActivity({
            userId,
            action: 'invitation_bulk_send',
            description: `Sent ${results.length} bulk invitations to ${entityType}`,
            entity: { 
                type: entityType.charAt(0).toUpperCase() + entityType.slice(1), 
                id: entityId, 
                name: targetEntity.name 
            },
            metadata: {
                successCount: results.length,
                errorCount: errors.length,
                role,
                ipAddress: req.ip
            }
        });

        sendResponse(res, 200, true, 'Bulk invitations processed', {
            successful: results,
            errors,
            summary: {
                total: emails.length,
                successful: results.length,
                failed: errors.length
            }
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
