const Workspace = require('../models/Workspace');
const User = require('../models/User');
const Space = require('../models/Space');
const ActivityLog = require('../models/ActivityLog');

class WorkspaceService {
    // Get workspace statistics
    async getWorkspaceStats(workspaceId) {
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            throw new Error('Workspace not found');
        }

        const spaces = await Space.find({ workspace: workspaceId, isActive: true });

        // Calculate detailed statistics
        const stats = {
            overview: workspace.usage,
            limits: workspace.limits,
            health: workspace.health,
            spaces: {
                total: spaces.length,
                active: spaces.filter(s => !s.isArchived).length,
                needingAttention: spaces.filter(s => s.healthStatus === 'needs_attention').length
            }
        };

        return stats;
    }

    // Get workspace activity feed
    async getWorkspaceActivity(workspaceId, limit = 50) {
        const activities = await ActivityLog.findByWorkspace(workspaceId, limit);
        return activities;
    }

    // Get workspace members with detailed information
    async getWorkspaceMembers(workspaceId) {
        const workspace = await Workspace.findById(workspaceId)
            .populate('owner', 'name email avatar lastLogin')
            .populate('members.user', 'name email avatar lastLogin')
            .populate('members.invitedBy', 'name avatar');

        if (!workspace) {
            throw new Error('Workspace not found');
        }

        // Get additional statistics for each member
        const membersWithStats = await Promise.all(
            workspace.members.map(async (member) => {
                const userStats = await this.getMemberStats(workspaceId, member.user._id);
                return {
                    ...member.toObject(),
                    stats: userStats
                };
            })
        );

        // Add owner with stats
        const ownerStats = await this.getMemberStats(workspaceId, workspace.owner._id);
        const owner = {
            user: workspace.owner,
            role: 'owner',
            joinedAt: workspace.createdAt,
            permissions: workspace.settings.permissions,
            stats: ownerStats
        };

        return {
            owner,
            members: membersWithStats,
            total: membersWithStats.length + 1
        };
    }

    // Get member statistics within workspace
    async getMemberStats(workspaceId, userId) {
        const spaces = await Space.find({ 
            workspace: workspaceId,
            'members.user': userId 
        });

        const spaceIds = spaces.map(s => s._id);

        const Task = require('../models/Task');
        const [
            totalTasks,
            completedTasks,
            spacesCount
        ] = await Promise.all([
            Task.countDocuments({ space: { $in: spaceIds } }),
            Task.countDocuments({ space: { $in: spaceIds }, status: 'done' }),
            Space.countDocuments({ workspace: workspaceId, 'members.user': userId })
        ]);

        return {
            totalTasks,
            completedTasks,
            completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
            spacesCount,
            lastActivity: new Date() // This could be enhanced with actual last activity
        };
    }

    // Upgrade workspace plan
    async upgradeWorkspace(workspaceId, newPlan, billingInfo) {
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            throw new Error('Workspace not found');
        }

        const oldPlan = workspace.plan;
        workspace.plan = newPlan;

        // Update limits based on plan
        const planLimits = {
            free: { maxMembers: 10, maxSpaces: 5, maxBoards: 20, maxStorage: 1000 },
            basic: { maxMembers: 25, maxSpaces: 15, maxBoards: 100, maxStorage: 5000 },
            premium: { maxMembers: 100, maxSpaces: 50, maxBoards: 500, maxStorage: 25000 },
            enterprise: { maxMembers: 1000, maxSpaces: 200, maxBoards: 2000, maxStorage: 100000 }
        };

        workspace.limits = planLimits[newPlan] || planLimits.free;

        // Update billing information
        if (billingInfo) {
            Object.assign(workspace.billing, billingInfo);
        }

        await workspace.save();

        // Log activity
        await ActivityLog.logActivity({
            userId: workspace.owner,
            action: 'workspace_update',
            description: `Upgraded workspace plan from ${oldPlan} to ${newPlan}`,
            entity: { type: 'Workspace', id: workspaceId, name: workspace.name },
            workspaceId,
            metadata: { oldPlan, newPlan, billingInfo },
            severity: 'info'
        });

        return workspace;
    }

    // Check workspace limits
    async checkWorkspaceLimits(workspaceId) {
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            throw new Error('Workspace not found');
        }

        const warnings = [];
        const errors = [];

        // Check member limit
        if (workspace.usage.membersCount >= workspace.limits.maxMembers) {
            errors.push({
                type: 'member_limit',
                message: 'Workspace member limit reached',
                current: workspace.usage.membersCount,
                limit: workspace.limits.maxMembers
            });
        } else if (workspace.usage.membersCount >= workspace.limits.maxMembers * 0.8) {
            warnings.push({
                type: 'member_limit_warning',
                message: 'Workspace member limit approaching',
                current: workspace.usage.membersCount,
                limit: workspace.limits.maxMembers
            });
        }

        // Check space limit
        if (workspace.usage.spacesCount >= workspace.limits.maxSpaces) {
            errors.push({
                type: 'space_limit',
                message: 'Workspace space limit reached',
                current: workspace.usage.spacesCount,
                limit: workspace.limits.maxSpaces
            });
        }

        // Check storage limit
        if (workspace.usage.storageUsed >= workspace.limits.maxStorage) {
            errors.push({
                type: 'storage_limit',
                message: 'Workspace storage limit reached',
                current: workspace.usage.storageUsed,
                limit: workspace.limits.maxStorage
            });
        }

        return {
            withinLimits: errors.length === 0,
            warnings,
            errors,
            usage: workspace.usage,
            limits: workspace.limits
        };
    }

    // Get workspace insights
    async getWorkspaceInsights(workspaceId) {
        const [stats, activity, limits] = await Promise.all([
            this.getWorkspaceStats(workspaceId),
            this.getWorkspaceActivity(workspaceId, 20),
            this.checkWorkspaceLimits(workspaceId)
        ]);

        const insights = {
            stats,
            recentActivity: activity,
            limits,
            recommendations: this.generateRecommendations(stats, limits)
        };

        return insights;
    }

    // Generate recommendations based on workspace data
    generateRecommendations(stats, limits) {
        const recommendations = [];

        if (limits.warnings.length > 0) {
            recommendations.push({
                type: 'upgrade_plan',
                priority: 'medium',
                message: 'Consider upgrading your plan to avoid hitting limits',
                action: 'upgrade'
            });
        }

        if (stats.spaces.needingAttention > 0) {
            recommendations.push({
                type: 'space_attention',
                priority: 'high',
                message: `${stats.spaces.needingAttention} spaces need attention`,
                action: 'review_spaces'
            });
        }

        if (stats.spaces.overdue > 0) {
            recommendations.push({
                type: 'overdue_spaces',
                priority: 'high',
                message: `${stats.spaces.overdue} spaces are overdue`,
                action: 'review_deadlines'
            });
        }

        return recommendations;
    }

    // Clone workspace
    async cloneWorkspace(workspaceId, userId, newWorkspaceName) {
        const originalWorkspace = await Workspace.findById(workspaceId);
        if (!originalWorkspace) {
            throw new Error('Workspace not found');
        }

        // Create new workspace
        const newWorkspace = await Workspace.create({
            name: newWorkspaceName,
            description: originalWorkspace.description,
            owner: userId,
            plan: 'free', // New workspace starts with free plan
            settings: originalWorkspace.settings
        });

        // Add owner role
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        await userRoles.addWorkspaceRole(newWorkspace._id, 'owner');

        return newWorkspace;
    }

    // Delete workspace and all related data
    async deleteWorkspace(workspaceId, userId) {
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            throw new Error('Workspace not found');
        }

        // Only owner can delete at service level; controller may add broader checks if needed
        if (workspace.owner.toString() !== userId.toString()) {
            throw new Error('Only workspace owner can delete the workspace');
        }

        // Require models locally to avoid duplicate top-level declarations
        const Task = require('../models/Task');
        const Board = require('../models/Board');
        const File = require('../models/File');
        const Notification = require('../models/Notification');
        const Checklist = require('../models/Checklist');
        const Reminder = require('../models/Reminder');
        const Analytics = require('../models/Analytics');
        const Tag = require('../models/Tag');

        await Promise.all([
            Space.deleteMany({ workspace: workspaceId }),
            Task.deleteMany({ workspace: workspaceId }),
            Board.deleteMany({ workspace: workspaceId }),
            File.deleteMany({ workspace: workspaceId }),
            Notification.deleteMany({ workspace: workspaceId }),
            Checklist.deleteMany({ workspace: workspaceId }),
            Reminder.deleteMany({ workspace: workspaceId }),
            Analytics.deleteMany({ workspace: workspaceId }),
            Tag.deleteMany({ workspace: workspaceId }),
        ]);

        await Workspace.findByIdAndDelete(workspaceId);

        return { success: true, message: 'Workspace deleted successfully' };
    }

    // Soft delete workspace (preferred)
    async softDeleteWorkspace(workspaceId, userId) {
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) throw new Error('Workspace not found');
        if (workspace.owner.toString() !== userId.toString()) {
            throw new Error('Only workspace owner can delete the workspace');
        }

        // Mark as archived; isActive will be synced by pre-save hook
        workspace.status = 'archived';
        const now = new Date();
        workspace.archivedAt = now;
        // 24 hours timer until potential purge/restore window ends
        const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
        workspace.archiveExpiresAt = new Date(now.getTime() + TWENTY_FOUR_HOURS_MS);
        workspace.archivedBy = userId;
        await workspace.save();

        // Log activity
        await ActivityLog.logActivity({
            userId,
            action: 'workspace_delete',
            description: `Archived workspace: ${workspace.name}`,
            entity: { type: 'Workspace', id: workspace._id, name: workspace.name },
            workspaceId,
            severity: 'warning'
        });

        return workspace.toObject();
    }

    // Restore soft-deleted workspace
    async restoreWorkspace(workspaceId, userId) {
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) throw new Error('Workspace not found');

        // Owner can restore; fallback: user who deleted or any owner
        if (workspace.owner.toString() !== userId.toString()) {
            throw new Error('Only workspace owner can restore the workspace');
        }

        workspace.status = 'active';
        workspace.archivedAt = null;
        workspace.archivedBy = null;
        workspace.archiveExpiresAt = null;
        await workspace.save();

        await ActivityLog.logActivity({
            userId,
            action: 'workspace_restore',
            description: `Restored workspace: ${workspace.name}`,
            entity: { type: 'Workspace', id: workspace._id, name: workspace.name },
            workspaceId,
            severity: 'info'
        });

        return workspace.toObject();
    }
}

module.exports = new WorkspaceService();