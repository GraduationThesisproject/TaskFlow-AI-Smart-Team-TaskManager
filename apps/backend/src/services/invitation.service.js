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
                        entityType: 'workspace',
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
                        entityType: 'space',
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

    // Invite GitHub organization members by email
    static async inviteGitHubMembers(workspaceId, memberEmails, role, inviterId, options = {}) {
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

            const results = {
                successful: [],
                failed: [],
                alreadyMembers: [],
                alreadyInvited: []
            };

            for (const email of memberEmails) {
                try {
                    // Check if user already exists
                    const existingUser = await User.findOne({ email });
                    
                    // Check if already a member
                    if (existingUser) {
                        const isMember = workspace.members.some(member => 
                            member.user.toString() === existingUser._id.toString()
                        ) || workspace.owner.toString() === existingUser._id.toString();

                        if (isMember) {
                            results.alreadyMembers.push({ email, reason: 'Already a member' });
                            continue;
                        }
                    }

                    // Check for existing pending invitation
                    const existingInvitation = await Invitation.findOne({
                        'invitedUser.email': email,
                        'targetEntity.type': 'Workspace',
                        'targetEntity.id': workspaceId,
                        status: 'pending'
                    });

                    if (existingInvitation) {
                        results.alreadyInvited.push({ email, reason: 'Invitation already exists' });
                        continue;
                    }

                    // Create invitation
                    const invitation = await Invitation.create({
                        type: 'workspace',
                        invitedBy: inviterId,
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
                        expiresAt: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000),
                        source: 'github_org' // Mark as from GitHub org
                    });

                    // Send invitation email
                    await this.sendInvitationEmail(invitation, inviter, workspace);

                    // Create notification for existing user
                    if (existingUser) {
                        await NotificationService.createNotification({
                            title: `Workspace invitation: ${workspace.name}`,
                            message: `${inviter.name} invited you to join workspace "${workspace.name}" via GitHub organization`,
                            type: 'workspace_invitation',
                            recipient: existingUser._id,
                            sender: inviterId,
                            relatedEntity: {
                                entityType: 'workspace',
                                entityId: workspaceId
                            },
                            deliveryMethods: { inApp: true }
                        });
                    }

                    results.successful.push({ email, invitationId: invitation._id });

                } catch (error) {
                    logger.error(`Error inviting GitHub member ${email}:`, error);
                    results.failed.push({ email, error: error.message });
                }
            }

            return results;

        } catch (error) {
            logger.error('Invite GitHub members error:', error);
            throw error;
        }
    }

    // Accept invitation
    static async acceptInvitation(invitationId, userId) {
        try {
            const invitation = await Invitation.findById(invitationId);
            if (!invitation) {
                throw new Error('Invitation not found');
            }

            if (invitation.status !== 'pending') {
                throw new Error('Invitation is no longer pending');
            }

            if (invitation.expiresAt < new Date()) {
                throw new Error('Invitation has expired');
            }

            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            // Verify email matches
            if (invitation.invitedUser.email !== user.email) {
                throw new Error('Email does not match invitation');
            }

            // Add user to the target entity
            if (invitation.targetEntity.type === 'Workspace') {
                const workspace = await Workspace.findById(invitation.targetEntity.id);
                if (!workspace) {
                    throw new Error('Workspace not found');
                }

                // Check if already a member
                const isAlreadyMember = workspace.members.some(member => 
                    member.user.toString() === userId
                ) || workspace.owner.toString() === userId;

                if (isAlreadyMember) {
                    throw new Error('User is already a member of this workspace');
                }

                // Add member
                workspace.members.push({
                    user: userId,
                    role: invitation.role,
                    joinedAt: new Date()
                });

                await workspace.save();

            } else if (invitation.targetEntity.type === 'Space') {
                const space = await Space.findById(invitation.targetEntity.id);
                if (!space) {
                    throw new Error('Space not found');
                }

                // Check if already a member
                const isAlreadyMember = space.members.some(member => 
                    member.user.toString() === userId
                ) || space.owner.toString() === userId;

                if (isAlreadyMember) {
                    throw new Error('User is already a member of this space');
                }

                // Add member
                space.members.push({
                    user: userId,
                    role: invitation.role,
                    joinedAt: new Date()
                });

                await space.save();
            }

            // Update invitation status
            invitation.status = 'accepted';
            invitation.acceptedAt = new Date();
            await invitation.save();

            // Create notification for inviter
            await NotificationService.createNotification({
                title: `Invitation accepted: ${invitation.targetEntity.name}`,
                message: `${user.name} accepted your invitation to join ${invitation.targetEntity.name}`,
                type: 'invitation_accepted',
                recipient: invitation.invitedBy,
                sender: userId,
                relatedEntity: {
                    entityType: invitation.targetEntity.type.toLowerCase(),
                    entityId: invitation.targetEntity.id
                },
                deliveryMethods: { inApp: true }
            });

            return invitation;

        } catch (error) {
            logger.error('Accept invitation error:', error);
            throw error;
        }
    }

    // Decline invitation
    static async declineInvitation(invitationId, userId) {
        try {
            const invitation = await Invitation.findById(invitationId);
            if (!invitation) {
                throw new Error('Invitation not found');
            }

            if (invitation.status !== 'pending') {
                throw new Error('Invitation is no longer pending');
            }

            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            // Verify email matches
            if (invitation.invitedUser.email !== user.email) {
                throw new Error('Email does not match invitation');
            }

            // Update invitation status
            invitation.status = 'declined';
            invitation.declinedAt = new Date();
            await invitation.save();

            // Create notification for inviter
            await NotificationService.createNotification({
                title: `Invitation declined: ${invitation.targetEntity.name}`,
                message: `${user.name} declined your invitation to join ${invitation.targetEntity.name}`,
                type: 'invitation_declined',
                recipient: invitation.invitedBy,
                sender: userId,
                relatedEntity: {
                    entityType: invitation.targetEntity.type.toLowerCase(),
                    entityId: invitation.targetEntity.id
                },
                deliveryMethods: { inApp: true }
            });

            return invitation;

        } catch (error) {
            logger.error('Decline invitation error:', error);
            throw error;
        }
    }

    // Get user's pending invitations
    static async getUserInvitations(userId, options = {}) {
        try {
            const { status = 'pending', limit = 50, skip = 0 } = options;

            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            const query = {
                'invitedUser.email': user.email,
                status
            };

            const invitations = await Invitation.find(query)
                .populate('invitedBy', 'name email avatar')
                .populate('invitedUser.userId', 'name email avatar')
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(skip);

            const total = await Invitation.countDocuments(query);

            // Transform invitations to include id field
            const transformedInvitations = invitations.map(invitation => ({
                ...invitation.toObject(),
                id: invitation._id.toString()
            }));

            return {
                invitations: transformedInvitations,
                total,
                hasMore: total > skip + invitations.length
            };

        } catch (error) {
            logger.error('Get user invitations error:', error);
            throw error;
        }
    }

    // Send invitation email
    static async sendInvitationEmail(invitation, inviter, targetEntity) {
        try {
            const invitationUrl = `${process.env.FRONTEND_URL}/invitation/${invitation._id}`;
            
            const emailData = {
                to: invitation.invitedUser.email,
                subject: `Invitation to join ${targetEntity.name}`,
                template: 'invitation',
                data: {
                    inviterName: inviter.name,
                    inviterEmail: inviter.email,
                    entityName: targetEntity.name,
                    entityType: invitation.targetEntity.type,
                    role: invitation.role,
                    message: invitation.message,
                    invitationUrl,
                    expiresAt: invitation.expiresAt
                }
            };

            await sendEmail(emailData);

        } catch (error) {
            logger.error('Send invitation email error:', error);
            throw error;
        }
    }

    // Bulk invite users
    static async bulkInvite(emails, entityType, entityId, role, inviterId, options = {}) {
        try {
            const { message, expiresInDays = 7 } = options;

            const results = {
                successful: [],
                failed: [],
                alreadyMembers: [],
                alreadyInvited: []
            };

            for (const email of emails) {
                try {
                    if (entityType === 'workspace') {
                        await this.inviteToWorkspace(entityId, email, role, inviterId, options);
                    } else if (entityType === 'space') {
                        await this.inviteToSpace(entityId, email, role, inviterId, options);
                    }

                    results.successful.push({ email });

                } catch (error) {
                    if (error.message.includes('already a member')) {
                        results.alreadyMembers.push({ email, reason: error.message });
                    } else if (error.message.includes('already exists')) {
                        results.alreadyInvited.push({ email, reason: error.message });
                    } else {
                        results.failed.push({ email, error: error.message });
                    }
                }
            }

            return results;

        } catch (error) {
            logger.error('Bulk invite error:', error);
            throw error;
        }
    }

    // Get invitation by ID
    static async getInvitationById(invitationId) {
        try {
            const invitation = await Invitation.findById(invitationId)
                .populate('invitedBy', 'name email avatar')
                .populate('invitedUser.userId', 'name email avatar');

            if (!invitation) {
                throw new Error('Invitation not found');
            }

            return invitation;

        } catch (error) {
            logger.error('Get invitation by ID error:', error);
            throw error;
        }
    }

    // Get invitation statistics
    static async getInvitationStats(entityType, entityId) {
        try {
            const stats = await Invitation.aggregate([
                {
                    $match: {
                        'targetEntity.type': entityType.charAt(0).toUpperCase() + entityType.slice(1),
                        'targetEntity.id': entityId
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
                total: 0,
                pending: 0,
                accepted: 0,
                declined: 0,
                expired: 0,
                cancelled: 0
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