const Analytics = require('../models/Analytics');
const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const logger = require('../config/logger');

class AnalyticsService {

    // Generate comprehensive project analytics
    static async generateProjectAnalytics(projectId, options = {}) {
        try {
            const { startDate, endDate, periodType = 'monthly', includeAI = true } = options;
            
            const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const end = endDate || new Date();

            // Get project data
            const project = await Project.findById(projectId)
                .populate('team.user', 'name email')
                .populate('owner', 'name email');

            if (!project) {
                throw new Error('Project not found');
            }

            // Get tasks data
            const tasks = await Task.find({ 
                project: projectId,
                createdAt: { $gte: start, $lte: end }
            }).populate('assignees', 'name').populate('reporter', 'name');

            // Generate analytics
            const analytics = {
                taskMetrics: await this.calculateTaskMetrics(tasks, start, end),
                timeMetrics: await this.calculateTimeMetrics(tasks, start, end),
                teamMetrics: await this.calculateTeamMetrics(projectId, start, end),
                qualityMetrics: await this.calculateQualityMetrics(tasks),
                customMetrics: await this.calculateCustomMetrics(projectId, start, end)
            };

            // Add AI insights if requested
            if (includeAI) {
                analytics.aiInsights = await this.generateAIInsights(projectId, analytics);
            }

            return analytics;

        } catch (error) {
            logger.error('Generate project analytics error:', error);
            throw error;
        }
    }

    // Calculate task-related metrics
    static async calculateTaskMetrics(tasks, startDate, endDate) {
        const metrics = {
            totalTasks: tasks.length,
            completedTasks: tasks.filter(t => t.status === 'completed').length,
            inProgressTasks: tasks.filter(t => t.status === 'in_progress').length,
            todoTasks: tasks.filter(t => t.status === 'todo').length,
            overdueTasks: tasks.filter(t => t.dueDate && t.dueDate < new Date() && t.status !== 'completed').length
        };

        metrics.completionRate = metrics.totalTasks > 0 ? 
            (metrics.completedTasks / metrics.totalTasks * 100).toFixed(2) : 0;

        // Task creation trend
        const tasksByDate = {};
        tasks.forEach(task => {
            const date = task.createdAt.toISOString().split('T')[0];
            tasksByDate[date] = (tasksByDate[date] || 0) + 1;
        });

        metrics.creationTrend = Object.keys(tasksByDate).map(date => ({
            date,
            count: tasksByDate[date]
        })).sort((a, b) => new Date(a.date) - new Date(b.date));

        // Priority distribution
        const priorityCount = { low: 0, medium: 0, high: 0, urgent: 0 };
        tasks.forEach(task => {
            priorityCount[task.priority] = (priorityCount[task.priority] || 0) + 1;
        });
        metrics.priorityDistribution = priorityCount;

        // Status changes over time
        metrics.statusChanges = await this.getTaskStatusChanges(tasks.map(t => t._id), startDate, endDate);

        return metrics;
    }

    // Calculate time-related metrics
    static async calculateTimeMetrics(tasks, startDate, endDate) {
        const metrics = {
            averageCompletionTime: 0,
            totalTimeSpent: 0,
            estimatedVsActual: [],
            burndownData: await this.calculateBurndown(tasks, startDate, endDate)
        };

        // Calculate completion times
        const completedTasks = tasks.filter(t => t.status === 'completed' && t.completedAt && t.createdAt);
        
        if (completedTasks.length > 0) {
            const totalCompletionTime = completedTasks.reduce((sum, task) => {
                return sum + (task.completedAt - task.createdAt);
            }, 0);

            metrics.averageCompletionTime = Math.round(totalCompletionTime / completedTasks.length / (1000 * 60 * 60)); // hours
        }

        // Calculate time spent vs estimated
        tasks.forEach(task => {
            if (task.estimatedHours && task.actualHours) {
                metrics.estimatedVsActual.push({
                    taskId: task._id,
                    estimated: task.estimatedHours,
                    actual: task.actualHours,
                    variance: ((task.actualHours - task.estimatedHours) / task.estimatedHours * 100).toFixed(2)
                });
            }
        });

        return metrics;
    }

    // Calculate team performance metrics
    static async calculateTeamMetrics(projectId, startDate, endDate) {
        const project = await Project.findById(projectId).populate('team.user', 'name email');
        const tasks = await Task.find({ 
            project: projectId,
            $or: [
                { createdAt: { $gte: startDate, $lte: endDate } },
                { completedAt: { $gte: startDate, $lte: endDate } }
            ]
        }).populate('assignees', 'name').populate('reporter', 'name');

        const teamMetrics = {
            totalMembers: project.team.length,
            activeMembers: 0,
            memberPerformance: [],
            collaborationIndex: 0,
            workloadDistribution: []
        };

        // Calculate per-member metrics
        for (const member of project.team) {
            const memberTasks = tasks.filter(task => 
                task.assignees.some(assignee => assignee._id.toString() === member.user._id.toString())
            );

            const completedTasks = memberTasks.filter(t => t.status === 'completed');
            const memberPerf = {
                userId: member.user._id,
                name: member.user.name,
                tasksAssigned: memberTasks.length,
                tasksCompleted: completedTasks.length,
                completionRate: memberTasks.length > 0 ? 
                    (completedTasks.length / memberTasks.length * 100).toFixed(2) : 0,
                averageTaskDuration: 0
            };

            if (completedTasks.length > 0) {
                const totalDuration = completedTasks.reduce((sum, task) => {
                    return sum + (task.completedAt - task.createdAt);
                }, 0);
                memberPerf.averageTaskDuration = Math.round(totalDuration / completedTasks.length / (1000 * 60 * 60));
            }

            if (memberTasks.length > 0) {
                teamMetrics.activeMembers++;
            }

            teamMetrics.memberPerformance.push(memberPerf);
            teamMetrics.workloadDistribution.push({
                userId: member.user._id,
                name: member.user.name,
                taskCount: memberTasks.length
            });
        }

        // Calculate collaboration index (tasks with multiple assignees)
        const collaborativeTasks = tasks.filter(task => task.assignees.length > 1);
        teamMetrics.collaborationIndex = tasks.length > 0 ? 
            (collaborativeTasks.length / tasks.length * 100).toFixed(2) : 0;

        return teamMetrics;
    }

    // Calculate quality metrics
    static async calculateQualityMetrics(tasks) {
        const metrics = {
            averageTaskComplexity: 0,
            reworkRate: 0,
            defectRate: 0,
            customerSatisfaction: 0
        };

        // Task complexity based on checklist items, comments, etc.
        let totalComplexityScore = 0;
        let tasksWithComplexity = 0;

        for (const task of tasks) {
            let complexityScore = 1; // Base complexity
            
            if (task.checklist && task.checklist.length > 0) {
                complexityScore += task.checklist.length * 0.1;
            }
            
            if (task.comments && task.comments.length > 5) {
                complexityScore += 0.5;
            }
            
            if (task.priority === 'high' || task.priority === 'urgent') {
                complexityScore += 0.3;
            }

            totalComplexityScore += complexityScore;
            tasksWithComplexity++;
        }

        metrics.averageTaskComplexity = tasksWithComplexity > 0 ? 
            (totalComplexityScore / tasksWithComplexity).toFixed(2) : 0;

        // Rework rate (tasks reopened after completion)
        const activityLogs = await ActivityLog.find({
            'entity.type': 'Task',
            'entity.id': { $in: tasks.map(t => t._id) },
            action: 'task_update',
            'metadata.oldStatus': 'completed',
            'metadata.newStatus': { $ne: 'completed' }
        });

        metrics.reworkRate = tasks.length > 0 ? 
            (activityLogs.length / tasks.length * 100).toFixed(2) : 0;

        return metrics;
    }

    // Calculate custom project-specific metrics
    static async calculateCustomMetrics(projectId, startDate, endDate) {
        const metrics = {
            velocityTrend: await this.calculateVelocity(projectId, startDate, endDate),
            riskIndicators: await this.calculateRiskIndicators(projectId),
            milestoneProgress: await this.calculateMilestoneProgress(projectId),
            resourceUtilization: await this.calculateResourceUtilization(projectId, startDate, endDate)
        };

        return metrics;
    }

    // Generate AI-powered insights
    static async generateAIInsights(projectId, analytics) {
        try {
            const aiService = require('./ai.service');
            
            const insights = await aiService.analyzeProjectMetrics(projectId, analytics);
            
            return {
                riskAssessment: insights.risks || [],
                recommendations: insights.recommendations || [],
                predictedOutcomes: insights.predictions || [],
                anomalies: insights.anomalies || []
            };
        } catch (error) {
            logger.error('Generate AI insights error:', error);
            return {
                riskAssessment: [],
                recommendations: [],
                predictedOutcomes: [],
                anomalies: []
            };
        }
    }

    // Helper methods
    static async getTaskStatusChanges(taskIds, startDate, endDate) {
        const statusChanges = await ActivityLog.find({
            'entity.type': 'Task',
            'entity.id': { $in: taskIds },
            action: 'task_update',
            'metadata.statusChanged': true,
            createdAt: { $gte: startDate, $lte: endDate }
        }).sort({ createdAt: 1 });

        return statusChanges.map(log => ({
            taskId: log.entity.id,
            fromStatus: log.metadata.oldStatus,
            toStatus: log.metadata.newStatus,
            date: log.createdAt,
            userId: log.userId
        }));
    }

    static async calculateBurndown(tasks, startDate, endDate) {
        const burndownData = [];
        const totalTasks = tasks.length;
        
        // Group tasks by completion date
        const tasksByCompletion = {};
        tasks.forEach(task => {
            if (task.completedAt) {
                const date = task.completedAt.toISOString().split('T')[0];
                tasksByCompletion[date] = (tasksByCompletion[date] || 0) + 1;
            }
        });

        // Generate daily burndown
        const currentDate = new Date(startDate);
        let remainingTasks = totalTasks;

        while (currentDate <= endDate) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const completedToday = tasksByCompletion[dateStr] || 0;
            remainingTasks -= completedToday;

            burndownData.push({
                date: dateStr,
                remaining: remainingTasks,
                completed: totalTasks - remainingTasks
            });

            currentDate.setDate(currentDate.getDate() + 1);
        }

        return burndownData;
    }

    static async calculateVelocity(projectId, startDate, endDate) {
        // Calculate weekly velocity (tasks completed per week)
        const weeks = Math.ceil((endDate - startDate) / (7 * 24 * 60 * 60 * 1000));
        const velocityData = [];

        for (let week = 0; week < weeks; week++) {
            const weekStart = new Date(startDate.getTime() + week * 7 * 24 * 60 * 60 * 1000);
            const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

            const completedTasks = await Task.countDocuments({
                project: projectId,
                status: 'completed',
                completedAt: { $gte: weekStart, $lte: weekEnd }
            });

            velocityData.push({
                week: week + 1,
                startDate: weekStart,
                endDate: weekEnd,
                tasksCompleted: completedTasks
            });
        }

        return velocityData;
    }

    static async calculateRiskIndicators(projectId) {
        const risks = [];
        
        // Overdue tasks risk
        const overdueTasks = await Task.countDocuments({
            project: projectId,
            dueDate: { $lt: new Date() },
            status: { $ne: 'completed' }
        });

        if (overdueTasks > 0) {
            risks.push({
                type: 'overdue_tasks',
                severity: overdueTasks > 5 ? 'high' : 'medium',
                count: overdueTasks,
                message: `${overdueTasks} tasks are overdue`
            });
        }

        // Inactive team members risk
        const project = await Project.findById(projectId);
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        
        const inactiveMembers = [];
        for (const member of project.team) {
            const recentActivity = await ActivityLog.countDocuments({
                userId: member.user,
                createdAt: { $gte: thirtyDaysAgo }
            });
            
            if (recentActivity === 0) {
                inactiveMembers.push(member.user);
            }
        }

        if (inactiveMembers.length > 0) {
            risks.push({
                type: 'inactive_members',
                severity: 'medium',
                count: inactiveMembers.length,
                message: `${inactiveMembers.length} team members haven't been active recently`
            });
        }

        return risks;
    }

    static async calculateMilestoneProgress(projectId) {
        // This would integrate with milestone tracking if implemented
        return [];
    }

    static async calculateResourceUtilization(projectId, startDate, endDate) {
        const project = await Project.findById(projectId);
        const utilization = [];

        for (const member of project.team) {
            const assignedTasks = await Task.countDocuments({
                project: projectId,
                assignees: member.user,
                createdAt: { $gte: startDate, $lte: endDate }
            });

            const completedTasks = await Task.countDocuments({
                project: projectId,
                assignees: member.user,
                status: 'completed',
                completedAt: { $gte: startDate, $lte: endDate }
            });

            utilization.push({
                userId: member.user,
                assignedTasks,
                completedTasks,
                utilizationRate: assignedTasks > 0 ? 
                    (completedTasks / assignedTasks * 100).toFixed(2) : 0
            });
        }

        return utilization;
    }

    // User analytics
    static async getUserAnalytics(userId, timeframe = '30d') {
        try {
            const days = parseInt(timeframe.replace('d', ''));
            const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

            const userTasks = await Task.find({
                $or: [
                    { assignees: userId },
                    { reporter: userId }
                ],
                createdAt: { $gte: startDate }
            });

            const analytics = {
                tasksAssigned: userTasks.filter(t => t.assignees.includes(userId)).length,
                tasksCreated: userTasks.filter(t => t.reporter.toString() === userId).length,
                tasksCompleted: userTasks.filter(t => 
                    t.status === 'completed' && t.assignees.includes(userId)
                ).length,
                productivityScore: 0,
                activityTrend: await this.getUserActivityTrend(userId, startDate)
            };

            // Calculate productivity score
            const completedTasks = analytics.tasksCompleted;
            const assignedTasks = analytics.tasksAssigned;
            analytics.productivityScore = assignedTasks > 0 ? 
                (completedTasks / assignedTasks * 100).toFixed(2) : 0;

            return analytics;
        } catch (error) {
            logger.error('Get user analytics error:', error);
            throw error;
        }
    }

    static async getUserActivityTrend(userId, startDate) {
        const activities = await ActivityLog.find({
            userId,
            createdAt: { $gte: startDate }
        }).sort({ createdAt: 1 });

        const activityByDate = {};
        activities.forEach(activity => {
            const date = activity.createdAt.toISOString().split('T')[0];
            activityByDate[date] = (activityByDate[date] || 0) + 1;
        });

        return Object.keys(activityByDate).map(date => ({
            date,
            activityCount: activityByDate[date]
        })).sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    // Workspace analytics
    static async getWorkspaceAnalytics(workspaceId, timeframe = '30d') {
        try {
            const days = parseInt(timeframe.replace('d', ''));
            const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

            const Workspace = require('../models/Workspace');
            const workspace = await Workspace.findById(workspaceId);

            const projects = await Project.find({ workspace: workspaceId });
            const projectIds = projects.map(p => p._id);

            const analytics = {
                totalProjects: projects.length,
                activeProjects: projects.filter(p => p.status === 'active').length,
                totalTasks: await Task.countDocuments({ project: { $in: projectIds } }),
                completedTasks: await Task.countDocuments({ 
                    project: { $in: projectIds }, 
                    status: 'completed' 
                }),
                memberActivity: await this.getWorkspaceMemberActivity(workspaceId, startDate),
                storageUsage: workspace.usage
            };

            return analytics;
        } catch (error) {
            logger.error('Get workspace analytics error:', error);
            throw error;
        }
    }

    static async getWorkspaceMemberActivity(workspaceId, startDate) {
        const Workspace = require('../models/Workspace');
        const workspace = await Workspace.findById(workspaceId).populate('members.user', 'name');

        const activity = [];
        
        for (const member of workspace.members) {
            const activityCount = await ActivityLog.countDocuments({
                userId: member.user._id,
                workspaceId: workspaceId,
                createdAt: { $gte: startDate }
            });

            activity.push({
                userId: member.user._id,
                name: member.user.name,
                role: member.role,
                activityCount,
                lastActive: await ActivityLog.findOne({
                    userId: member.user._id,
                    workspaceId: workspaceId
                }).sort({ createdAt: -1 }).select('createdAt')
            });
        }

        return activity.sort((a, b) => b.activityCount - a.activityCount);
    }

    // Export analytics data
    static async exportProjectAnalytics(projectId, options = {}) {
        try {
            const { format = 'json', includeCharts = false } = options;
            
            const analytics = await Analytics.findLatest(projectId);
            
            if (!analytics) {
                throw new Error('No analytics data available');
            }

            switch (format) {
                case 'csv':
                    return this.exportToCSV(analytics);
                case 'pdf':
                    return this.exportToPDF(analytics, includeCharts);
                default:
                    return analytics.toObject();
            }
        } catch (error) {
            logger.error('Export analytics error:', error);
            throw error;
        }
    }

    static async exportToCSV(analytics) {
        // Implement CSV export logic
        const csv = require('csv-stringify');
        
        const data = [
            ['Metric', 'Value'],
            ['Total Tasks', analytics.taskMetrics.totalTasks],
            ['Completed Tasks', analytics.taskMetrics.completedTasks],
            ['Completion Rate', analytics.taskMetrics.completionRate + '%'],
            ['Average Completion Time', analytics.timeMetrics.averageCompletionTime + ' hours'],
            ['Team Size', analytics.teamMetrics.totalMembers],
            ['Active Members', analytics.teamMetrics.activeMembers]
        ];
        
        return new Promise((resolve, reject) => {
            csv(data, (err, output) => {
                if (err) reject(err);
                else resolve(output);
            });
        });
    }

    static async exportToPDF(analytics, includeCharts) {
        // Implement PDF export logic - would use a library like puppeteer or pdfkit
        throw new Error('PDF export not implemented yet');
    }
}

module.exports = AnalyticsService;
