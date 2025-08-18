const Project = require('../models/Project');
const Board = require('../models/Board');
const Task = require('../models/Task');
const User = require('../models/User');

class ProjectService {
    // Get project statistics
    async getProjectStats(projectId) {
        const [
            totalTasks,
            completedTasks,
            inProgressTasks,
            totalBoards,
            totalMembers
        ] = await Promise.all([
            Task.countDocuments({ project: projectId }),
            Task.countDocuments({ project: projectId, status: 'completed' }),
            Task.countDocuments({ project: projectId, status: 'in-progress' }),
            Board.countDocuments({ project: projectId, archived: false }),
            Project.findById(projectId).then(p => p ? p.members.length : 0)
        ]);

        // Calculate completion rate
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        // Get overdue tasks
        const overdueTasks = await Task.countDocuments({
            project: projectId,
            dueDate: { $lt: new Date() },
            status: { $ne: 'completed' }
        });

        return {
            totalTasks,
            completedTasks,
            inProgressTasks,
            totalBoards,
            totalMembers,
            completionRate,
            overdueTasks
        };
    }

    // Get project activity feed
    async getProjectActivity(projectId, limit = 20) {
        const Task = require('../models/Task');
        const Comment = require('../models/Comment');

        // Get recent tasks
        const recentTasks = await Task.find({ project: projectId })
            .populate('reporter', 'name avatar')
            .populate('assignees', 'name avatar')
            .sort({ updatedAt: -1 })
            .limit(limit);

        // Get recent comments
        const recentComments = await Comment.find()
            .populate('task', 'title project')
            .populate('author', 'name avatar')
            .sort({ createdAt: -1 })
            .limit(limit);

        // Filter comments for this project
        const projectComments = recentComments.filter(
            comment => comment.task && comment.task.project.toString() === projectId
        );

        // Combine and sort activities
        const activities = [
            ...recentTasks.map(task => ({
                type: 'task',
                action: task.isNew ? 'created' : 'updated',
                data: task,
                timestamp: task.updatedAt,
                user: task.reporter
            })),
            ...projectComments.map(comment => ({
                type: 'comment',
                action: 'added',
                data: comment,
                timestamp: comment.createdAt,
                user: comment.author
            }))
        ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        return activities.slice(0, limit);
    }

    // Generate project insights
    async generateProjectInsights(projectId) {
        const stats = await this.getProjectStats(projectId);
        
        // Get task completion trend (last 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const dailyCompletions = await Task.aggregate([
            {
                $match: {
                    project: projectId,
                    completedAt: { $gte: thirtyDaysAgo },
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$completedAt"
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Get team performance
        const teamPerformance = await Task.aggregate([
            { $match: { project: projectId } },
            { $unwind: '$assignees' },
            {
                $group: {
                    _id: '$assignees',
                    totalTasks: { $sum: 1 },
                    completedTasks: {
                        $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                    }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $project: {
                    user: { name: '$user.name', avatar: '$user.avatar' },
                    totalTasks: 1,
                    completedTasks: 1,
                    completionRate: {
                        $round: [
                            { $multiply: [{ $divide: ['$completedTasks', '$totalTasks'] }, 100] },
                            1
                        ]
                    }
                }
            }
        ]);

        return {
            ...stats,
            trends: {
                dailyCompletions
            },
            teamPerformance
        };
    }

    // Clone project
    async cloneProject(projectId, userId, newProjectName) {
        const originalProject = await Project.findById(projectId)
            .populate('members.user');

        if (!originalProject) {
            throw new Error('Project not found');
        }

        // Create new project
        const newProject = await Project.create({
            name: newProjectName,
            description: originalProject.description,
            color: originalProject.color,
            owner: userId,
            members: [{
                user: userId,
                role: 'admin'
            }],
            settings: originalProject.settings
        });

        // Clone boards
        const boards = await Board.find({ project: projectId });
        
        for (const board of boards) {
            const newBoard = await Board.create({
                name: board.name,
                description: board.description,
                type: board.type,
                project: newProject._id,
                settings: board.settings
            });

            // Clone columns
            const Column = require('../models/Column');
            const columns = await Column.find({ board: board._id });
            
            for (const column of columns) {
                await Column.create({
                    name: column.name,
                    board: newBoard._id,
                    position: column.position,
                    color: column.color,
                    wipLimit: column.wipLimit
                });
            }
        }

        return newProject;
    }

    // Archive project
    async archiveProject(projectId, userId) {
        const project = await Project.findById(projectId);

        if (!project) {
            throw new Error('Project not found');
        }

        // Check permissions
        if (project.owner.toString() !== userId) {
            throw new Error('Only project owner can archive the project');
        }

        project.status = 'archived';
        await project.save();

        // Archive all boards in the project
        await Board.updateMany(
            { project: projectId },
            { archived: true, archivedAt: new Date() }
        );

        return project;
    }

    // Get project members with their roles and activity
    async getProjectMembers(projectId) {
        const project = await Project.findById(projectId)
            .populate('members.user', 'name email avatar lastLogin');

        if (!project) {
            throw new Error('Project not found');
        }

        // Get task counts for each member
        const membersWithStats = await Promise.all(
            project.members.map(async (member) => {
                const taskStats = await Task.aggregate([
                    {
                        $match: {
                            project: projectId,
                            assignees: member.user._id
                        }
                    },
                    {
                        $group: {
                            _id: '$status',
                            count: { $sum: 1 }
                        }
                    }
                ]);

                const stats = taskStats.reduce((acc, stat) => {
                    acc[stat._id] = stat.count;
                    return acc;
                }, {});

                return {
                    ...member.toObject(),
                    stats: {
                        total: Object.values(stats).reduce((sum, count) => sum + count, 0),
                        completed: stats.completed || 0,
                        'in-progress': stats['in-progress'] || 0,
                        todo: stats.todo || 0
                    }
                };
            })
        );

        return membersWithStats;
    }
}

module.exports = new ProjectService();
