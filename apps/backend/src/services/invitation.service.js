const Invitation = require('../models/Invitation');
const User = require('../models/User');
const Workspace = require('../models/Workspace');
const Space = require('../models/Space');
const NotificationService = require('./notification.service');
const { sendEmail } = require('../utils/email');
const logger = require('../config/logger');

class InvitationService {

    // Create and send workspace invitation
    static async inviteToWorkspace(workspaceId, invitedEmail, role, inviterId, options = {}) {
        try {
            const { message, expiresInDays = 7 } = options;

            const workspace = await Workspace.findById(workspaceId);
            if (!workspace) {
                throw new Error('Workspace not found');
            }

            const inviter = await User.findById(inviterId);
            if (!inviter) {
                throw new Error('Inviter not found');
            }

            // Check if user already exists
            const existingUser = await User.findOne({ email: invitedEmail });
            
            // Check if already a member
            if (existingUser) {
                const isMember = workspace.members.some(member => 
                    member.user.toString() === existingUser._id.toString()
                ) || workspace.owner.toString() === existingUser._id.toString();

                if (isMember) {
                    throw new Error('User is already a member of this workspace');
                }
            }

            // Check for existing pending invitation
            const existingInvitation = await Invitation.findOne({
                'invitedUser.email': invitedEmail,
                'targetEntity.type': 'Workspace',
                'targetEntity.id': workspaceId,
                status: 'pending'
            });

            if (existingInvitation) {
                throw new Error('Invitation already exists for this user');
            }

            // Create invitation
            const invitation = await Invitation.create({
                type: 'workspace',
                invitedBy: inviterId,
                invitedUser: {
                    email: invitedEmail,
                    userId: existingUser ? existingUser._id : null
                },
                targetEntity: {
                    type: 'Workspace',
                    id: workspaceId,
                    name: workspace.name
                },
                role,
                message,
                expiresAt: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
            });

            // Send invitation email
            await this.sendInvitationEmail(invitation, inviter, workspace);

            // Create notification for existing user
            if (existingUser) {
                await NotificationService.createNotification({
                    title: `Workspace invitation: ${workspace.name}`,
                    message: `${inviter.name} invited you to join workspace "${workspace.name}"`,
                    type: 'workspace_invitation',
                    recipient: existingUser._id,
                    sender: inviterId,
                    relatedEntity: {
                        entityType: 'Workspace',
                        entityId: workspaceId
                    },
                    deliveryMethods: { inApp: true }
                });
            }

            return invitation;

        } catch (error) {
            logger.error('Invite to workspace error:', error);
            throw error;
        }
    }

    // Create and send space invitation
    static async inviteToSpace(spaceId, invitedEmail, role, inviterId, options = {}) {
        try {
            const { message, expiresInDays = 7 } = options;

            const space = await Space.findById(spaceId);
            if (!space) {
                throw new Error('Space not found');
            }

            const inviter = await User.findById(inviterId);
            if (!inviter) {
                throw new Error('Inviter not found');
            }

            // Check if user already exists
            const existingUser = await User.findOne({ email: invitedEmail });
            
            // Check if already a member
            if (existingUser) {
                const isMember = space.members.some(member => 
                    member.user.toString() === existingUser._id.toString()
                ) || space.owner.toString() === existingUser._id.toString();

                if (isMember) {
                    throw new Error('User is already a member of this space');
                }
            }

            // Create invitation
            const invitation = await Invitation.create({
                type: 'space',
                invitedBy: inviterId,
                invitedUser: {
                    email: invitedEmail,
                    userId: existingUser ? existingUser._id : null
                },
                targetEntity: {
                    type: 'Space',
                    id: spaceId,
                    name: space.name
                },
                role,
                message,
                expiresAt: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
            });

            // Send invitation email
            await this.sendInvitationEmail(invitation, inviter, space);

            // Create notification for existing user
            if (existingUser) {
                await NotificationService.createNotification({
                    title: `Space invitation: ${space.name}`,
                    message: `${inviter.name} invited you to join space "${space.name}"`,
                    type: 'space_invitation',
                    recipient: existingUser._id,
                    sender: inviterId,
                    relatedEntity: {
                        entityType: 'Space',
                        entityId: spaceId
                    },
                    deliveryMethods: { inApp: true }
                });
            }

            return invitation;

        } catch (error) {
            logger.error('Invite to space error:', error);
            throw error;
        }
    }

    // Send invitation email
    static async sendInvitationEmail(invitation, inviter, entity) {
        try {
            const emailTemplate = `${invitation.type}-invitation`;
            const actionUrl = invitation.inviteUrl;

            const emailData = {
                inviterName: inviter.name,
                entityName: entity.name,
                entityType: invitation.type,
                role: invitation.role,
                message: invitation.message,
                invitationUrl: actionUrl,
                expiresAt: invitation.expiresAt.toDateString()
            };

            await sendEmail({
                to: invitation.invitedUser.email,
                subject: `You're invited to join ${entity.name}`,
                template: emailTemplate,
                data: emailData
            });

        } catch (error) {
            logger.error('Send invitation email error:', error);
            throw error;
        }
    }

    // Process accepted invitation
    static async processAcceptedInvitation(invitation, userId) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            const userRoles = await user.getRoles();

            switch (invitation.targetEntity.type) {
                case 'Workspace':
                    await this.addToWorkspace(invitation, userId, userRoles);
                    break;
                case 'Space':
                    await this.addToSpace(invitation, userId, userRoles);
                    break;
                default:
                    throw new Error('Unknown invitation type');
            }

            // Update invitation status
            await invitation.accept(userId);

            // Notify inviter
            await NotificationService.createNotification({
                title: 'Invitation accepted',
                message: `${user.name} accepted your invitation to ${invitation.targetEntity.name}`,
                type: 'invitation_accepted',
                recipient: invitation.invitedBy,
                sender: userId,
                relatedEntity: {
                    entityType: invitation.targetEntity.type,
                    entityId: invitation.targetEntity.id
                },
                deliveryMethods: { inApp: true, email: true }
            });

        } catch (error) {
            logger.error('Process accepted invitation error:', error);
            throw error;
        }
    }

    // Add user to workspace
    static async addToWorkspace(invitation, userId, userRoles) {
        const workspace = await Workspace.findById(invitation.targetEntity.id);
        if (!workspace) {
            throw new Error('Workspace not found');
        }

        await workspace.addMember(userId, invitation.role, invitation.invitedBy);
        await userRoles.addWorkspaceRole(workspace._id, invitation.role);
    }



    // Add user to space
    static async addToSpace(invitation, userId, userRoles) {
        const Space = require('../models/Space');
        const space = await Space.findById(invitation.targetEntity.id);
        if (!space) {
            throw new Error('Space not found');
        }

        await space.addMember(userId, invitation.role, invitation.invitedBy);
        
        userRoles.spaces.push({
            space: space._id,
            role: invitation.role,
            permissions: space.getDefaultPermissions(invitation.role)
        });
        await userRoles.save();
    }

    // Bulk invite users
    static async bulkInvite(emails, entityType, entityId, role, inviterId, options = {}) {
        try {
            const results = [];
            const errors = [];

            for (const email of emails) {
                try {
                    let invitation;
                    
                    switch (entityType) {
                        case 'workspace':
                            invitation = await this.inviteToWorkspace(entityId, email, role, inviterId, options);
                            break;
                        case 'space':
                            invitation = await this.inviteToSpace(entityId, email, role, inviterId, options);
                            break;
                        default:
                            throw new Error('Unsupported entity type for bulk invite');
                    }

                    results.push({
                        email,
                        invitationId: invitation._id,
                        status: 'sent'
                    });

                } catch (error) {
                    errors.push({
                        email,
                        error: error.message
                    });
                }
            }

            return { results, errors };

        } catch (error) {
            logger.error('Bulk invite error:', error);
            throw error;
        }
    }

    // Send reminder for pending invitation
    static async sendInvitationReminder(invitationId) {
        try {
            const invitation = await Invitation.findById(invitationId)
                .populate('invitedBy', 'name')
                .populate('targetEntity.id');

            if (!invitation || invitation.status !== 'pending') {
                throw new Error('Invitation not found or not pending');
            }

            if (invitation.isExpired) {
                throw new Error('Invitation has expired');
            }

            // Send reminder email
            await this.sendInvitationEmail(invitation, invitation.invitedBy, invitation.targetEntity.id);
            
            // Update reminder count
            await invitation.sendReminder();

            return invitation;

        } catch (error) {
            logger.error('Send invitation reminder error:', error);
            throw error;
        }
    }

    // Auto-cleanup expired invitations
    static async cleanupExpiredInvitations() {
        try {
            const result = await Invitation.updateMany(
                {
                    expiresAt: { $lt: new Date() },
                    status: 'pending'
                },
                {
                    status: 'expired'
                }
            );

            logger.info(`Marked ${result.modifiedCount} invitations as expired`);
            return result;

        } catch (error) {
            logger.error('Cleanup expired invitations error:', error);
            throw error;
        }
    }

    // Get invitation statistics for entity
    static async getInvitationStats(entityType, entityId) {
        try {
            const stats = await Invitation.aggregate([
                {
                    $match: {
                        'targetEntity.type': entityType.charAt(0).toUpperCase() + entityType.slice(1),
                        'targetEntity.id': mongoose.Types.ObjectId(entityId)
                    }
                },
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]);

            const result = {
                pending: 0,
                accepted: 0,
                declined: 0,
                expired: 0,
                cancelled: 0,
                total: 0
            };

            stats.forEach(stat => {
                result[stat._id] = stat.count;
                result.total += stat.count;
            });

            return result;

        } catch (error) {
            logger.error('Get invitation stats error:', error);
            throw error;
        }
    }

    // Cancel pending invitations for user
    static async cancelUserInvitations(email, entityType, entityId) {
        try {
            const result = await Invitation.updateMany(
                {
                    'invitedUser.email': email,
                    'targetEntity.type': entityType.charAt(0).toUpperCase() + entityType.slice(1),
                    'targetEntity.id': entityId,
                    status: 'pending'
                },
                {
                    status: 'cancelled'
                }
            );

            return result.modifiedCount;

        } catch (error) {
            logger.error('Cancel user invitations error:', error);
            throw error;
        }
    }
}

module.exports = InvitationService;
