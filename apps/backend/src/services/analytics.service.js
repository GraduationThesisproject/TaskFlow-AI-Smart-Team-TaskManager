const Analytics = require('../models/Analytics');
const Task = require('../models/Task');
const Space = require('../models/Space');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const logger = require('../config/logger');

class AnalyticsService {

    // Generate comprehensive space analytics
    static async generateSpaceAnalytics(spaceId, options = {}) {
        try {
            const { startDate, endDate, periodType = 'monthly', includeAI = true } = options;
            
            const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const end = endDate || new Date();

            // Get space data
            const space = await Space.findById(spaceId)
                .populate('members.user', 'name email')
                .populate('owner', 'name email');

            if (!space) {
                throw new Error('Space not found');
            }

            // Get tasks data
            const tasks = await Task.find({ 
                space: spaceId,
                createdAt: { $gte: start, $lte: end }
            }).populate('assignees', 'name').populate('reporter', 'name');

            // Generate analytics
            const taskMetrics = await this.calculateTaskMetrics(tasks, start, end);
            const timeMetrics = await this.calculateTimeMetrics(tasks, start, end);
            const teamMetrics = await this.calculateTeamMetrics(spaceId, start, end);
            const qualityMetrics = await this.calculateQualityMetrics(tasks);
            const customMetrics = await this.calculateCustomMetrics(spaceId, start, end);

            // Flatten analytics structure to match test expectations
            const analytics = {
                // Task metrics (flattened)
                totalTasks: taskMetrics.totalTasks,
                completedTasks: taskMetrics.completedTasks,
                inProgressTasks: taskMetrics.inProgressTasks,
                overdueTasks: taskMetrics.overdueTasks,
                completionRate: parseFloat(taskMetrics.completionRate),
                byPriority: taskMetrics.priorityDistribution,
                
                // Time metrics (flattened)
                averageCompletionTime: timeMetrics.averageCompletionTime,
                totalTimeSpent: timeMetrics.totalTimeSpent,
                
                // Team metrics (flattened)
                totalMembers: teamMetrics.totalMembers,
                activeMembers: teamMetrics.activeMembers,
                
                // Quality metrics (flattened)
                customerSatisfaction: qualityMetrics.customerSatisfaction,
                
                // Period information
                period: {
                    startDate: start,
                    endDate: end,
                    type: periodType
                },
                
                // Nested structures for detailed access
                taskMetrics,
                timeMetrics,
                teamMetrics,
                qualityMetrics,
                customMetrics
            };

            // Add AI insights if requested
            if (includeAI) {
                try {
                    analytics.aiInsights = await this.generateAIInsights(spaceId, analytics);
                } catch (error) {
                    logger.warn('AI insights generation failed, continuing without AI insights:', error.message);
                    analytics.aiInsights = {
                        riskAssessment: [],
                        recommendations: [],
                        predictedOutcomes: [],
                        anomalies: []
                    };
                }
            }

            return analytics;

        } catch (error) {
            logger.error('Generate space analytics error:', error);
            throw error;
        }
    }

    // Calculate task-related metrics
    static async calculateTaskMetrics(tasks, startDate, endDate) {
        const metrics = {
            totalTasks: tasks.length,
            completedTasks: tasks.filter(t => t.status === 'done').length,
            inProgressTasks: tasks.filter(t => t.status === 'in_progress').length,
            todoTasks: tasks.filter(t => t.status === 'todo').length,
            overdueTasks: tasks.filter(t => t.dueDate && t.dueDate < new Date() && t.status !== 'done').length
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
        const completedTasks = tasks.filter(t => t.status === 'done' && t.completedAt && t.createdAt);
        
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
    static async calculateTeamMetrics(spaceId, startDate, endDate) {
        const space = await Space.findById(spaceId).populate('members.user', 'name email');
        const tasks = await Task.find({ 
            space: spaceId,
            $or: [
                { createdAt: { $gte: startDate, $lte: endDate } },
                { completedAt: { $gte: startDate, $lte: endDate } }
            ]
        }).populate('assignees', 'name').populate('reporter', 'name');

        const teamMetrics = {
            totalMembers: space.members.length,
            activeMembers: 0,
            memberPerformance: [],
            collaborationIndex: 0,
            workloadDistribution: []
        };

        // Calculate per-member metrics
        for (const member of space.members) {
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
            customerSatisfaction: 1 // Default to minimum value since we can't calculate real customer satisfaction
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

    // Calculate custom space-specific metrics
    static async calculateCustomMetrics(spaceId, startDate, endDate) {
        const metrics = {
            velocityTrend: await this.calculateVelocity(spaceId, startDate, endDate),
            riskIndicators: await this.calculateRiskIndicators(spaceId),
            milestoneProgress: await this.calculateMilestoneProgress(spaceId),
            resourceUtilization: await this.calculateResourceUtilization(spaceId, startDate, endDate)
        };

        return metrics;
    }

    // Generate AI-powered insights
    static async generateAIInsights(spaceId, analytics) {
        try {
            const aiService = require('./ai.service');
            

            
            const insights = await aiService.analyzeSpaceMetrics(spaceId, analytics);
            
            // Convert insights array to the expected format
            const recommendations = insights.map(insight => ({
                type: 'ai_insight',
                title: insight.title,
                description: insight.description,
                priority: insight.priority,
                action: insight.action,
                aiGenerated: true
            }));
            
            return {
                riskAssessment: [],
                recommendations: recommendations,
                predictedOutcomes: [],
                anomalies: []
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

    static async calculateVelocity(spaceId, startDate, endDate) {
        // Calculate weekly velocity (tasks completed per week)
        const weeks = Math.ceil((endDate - startDate) / (7 * 24 * 60 * 60 * 1000));
        const velocityData = [];

        for (let week = 0; week < weeks; week++) {
            const weekStart = new Date(startDate.getTime() + week * 7 * 24 * 60 * 60 * 1000);
            const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

            const completedTasks = await Task.countDocuments({
                space: spaceId,
                status: 'done',
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

    static async calculateRiskIndicators(spaceId) {
        const risks = [];
        
        // Overdue tasks risk
        const overdueTasks = await Task.countDocuments({
            space: spaceId,
            dueDate: { $lt: new Date() },
            status: { $ne: 'done' }
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
        const space = await Space.findById(spaceId);
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        
        const inactiveMembers = [];
        for (const member of space.members) {
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

    static async calculateMilestoneProgress(spaceId) {
        // This would integrate with milestone tracking if implemented
        return [];
    }

    static async calculateResourceUtilization(spaceId, startDate, endDate) {
        const space = await Space.findById(spaceId);
        const utilization = [];

        for (const member of space.members) {
            const assignedTasks = await Task.countDocuments({
                space: spaceId,
                assignees: member.user,
                createdAt: { $gte: startDate, $lte: endDate }
            });

            const completedTasks = await Task.countDocuments({
                space: spaceId,
                assignees: member.user,
                status: 'done',
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

            const spaces = await Space.find({ workspace: workspaceId });
            const spaceIds = spaces.map(s => s._id);

            const analytics = {
                totalSpaces: spaces.length,
                activeSpaces: spaces.filter(s => s.status === 'active').length,
                totalTasks: await Task.countDocuments({ space: { $in: spaceIds } }),
                completedTasks: await Task.countDocuments({ 
                    space: { $in: spaceIds }, 
                    status: 'done' 
                }),
                activeMembers: workspace.members.length, // Add activeMembers field
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

    // Get team performance analytics
    static async getTeamPerformance(spaceId, options = {}) {
        try {
            const { startDate, endDate } = options;
            
            const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const end = endDate || new Date();

            const space = await Space.findById(spaceId)
                .populate('members.user', 'name email')
                .populate('owner', 'name email');

            if (!space) {
                throw new Error('Space not found');
            }

            const tasks = await Task.find({
                space: spaceId,
                createdAt: { $gte: start, $lte: end }
            }).populate('assignees', 'name').populate('reporter', 'name');

            // Create team members list, ensuring owner is included with correct role
            const teamMembers = [...space.members];
            
            // Helper to normalize user id from either populated doc or ObjectId
            const getIdString = (user) => (user && user._id ? user._id.toString() : user.toString());
            
            // Remove duplicates based on user ID
            const uniqueMembers = teamMembers.filter((member, index, arr) => {
                const memberId = getIdString(member.user);
                const firstIndex = arr.findIndex(m => getIdString(m.user) === memberId);
                return index === firstIndex;
            });
            
            // Check if owner is already in the team
            const ownerInTeam = uniqueMembers.find(member => 
                getIdString(member.user) === getIdString(space.owner)
            );
            
            let finalTeamMembers;
            if (ownerInTeam) {
                // Update owner's role to 'owner' if they're already in the team
                ownerInTeam.role = 'owner';
                finalTeamMembers = uniqueMembers;
            } else {
                // Add owner if they're not in the team
                finalTeamMembers = [...uniqueMembers, { user: space.owner, role: 'owner' }];
            }
            const memberPerformance = [];

            for (const member of finalTeamMembers) {
                const memberTasks = tasks.filter(task => 
                    task.assignees.some(assignee => assignee._id.toString() === member.user._id.toString())
                );

                const completedTasks = memberTasks.filter(task => task.status === 'done');
                const totalHours = memberTasks.reduce((sum, task) => sum + (task.actualHours || 0), 0);
                const averageTaskTime = completedTasks.length > 0 ? 
                    totalHours / completedTasks.length : 0;

                const onTimeCompletions = completedTasks.filter(task => 
                    !task.dueDate || task.completedAt <= task.dueDate
                ).length;

                const onTimeRate = completedTasks.length > 0 ? 
                    (onTimeCompletions / completedTasks.length * 100).toFixed(2) : 0;

                memberPerformance.push({
                    userId: member.user._id,
                    name: member.user.name,
                    email: member.user.email,
                    role: member.role,
                    tasksCompleted: completedTasks.length,
                    totalTasks: memberTasks.length,
                    totalHours,
                    averageTaskTime: parseFloat(averageTaskTime.toFixed(2)),
                    onTimeCompletionRate: parseFloat(onTimeRate),
                    productivity: completedTasks.length > 0 ? 
                        (completedTasks.length / totalHours).toFixed(2) : 0
                });
            }

            // Calculate team averages
            const totalCompleted = memberPerformance.reduce((sum, m) => sum + m.tasksCompleted, 0);
            const totalHours = memberPerformance.reduce((sum, m) => sum + m.totalHours, 0);
            const averageCompletionTime = totalCompleted > 0 ? 
                (totalHours / totalCompleted).toFixed(2) : 0;

            return {
                members: memberPerformance,
                teamMetrics: {
                    totalMembers: finalTeamMembers.length,
                    activeMembers: memberPerformance.filter(m => m.tasksCompleted > 0).length,
                    totalTasksCompleted: totalCompleted,
                    averageCompletionTime: parseFloat(averageCompletionTime),
                    averageProductivity: memberPerformance.length > 0 ? 
                        (memberPerformance.reduce((sum, m) => sum + parseFloat(m.productivity), 0) / memberPerformance.length).toFixed(2) : 0
                },
                averageCompletionTime: parseFloat(averageCompletionTime),
                period: {
                    startDate: start,
                    endDate: end
                },
                productivityTrends: await this.calculateProductivityTrends(spaceId, start, end)
            };

        } catch (error) {
            logger.error('Get team performance error:', error);
            throw error;
        }
    }

    static async calculateProductivityTrends(spaceId, startDate, endDate) {
        // Calculate weekly productivity trends
        const weeks = Math.ceil((endDate - startDate) / (7 * 24 * 60 * 60 * 1000));
        const trends = [];

        for (let week = 0; week < weeks; week++) {
            const weekStart = new Date(startDate.getTime() + week * 7 * 24 * 60 * 60 * 1000);
            const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

            const weekTasks = await Task.find({
                space: spaceId,
                completedAt: { $gte: weekStart, $lte: weekEnd }
            });

            const totalHours = weekTasks.reduce((sum, task) => sum + (task.actualHours || 0), 0);
            const productivity = totalHours > 0 ? (weekTasks.length / totalHours).toFixed(2) : 0;

            trends.push({
                week: week + 1,
                startDate: weekStart,
                endDate: weekEnd,
                tasksCompleted: weekTasks.length,
                totalHours,
                productivity: parseFloat(productivity)
            });
        }

        return trends;
    }

    // Export analytics data
    static async exportSpaceAnalytics(spaceId, options = {}) {
        try {
            const { format = 'json', includeCharts = false } = options;
            
            // Generate fresh analytics instead of using stored data
            const analytics = await this.generateSpaceAnalytics(spaceId, {
                includeAI: false
            });
            
            switch (format) {
                case 'csv':
                    return this.exportToCSV(analytics);
                case 'pdf':
                    return this.exportToPDF(analytics, includeCharts);
                default:
                    return { analytics };
            }
        } catch (error) {
            logger.error('Export analytics error:', error);
            throw error;
        }
    }

    static async exportToCSV(analytics) {
        // Implement CSV export logic without external deps
        const headers = ['totalTasks', 'completedTasks', 'completionRate', 'averageCompletionTime', 'totalMembers', 'activeMembers'];
        const values = [
            analytics.totalTasks ?? 0,
            analytics.completedTasks ?? 0,
            analytics.completionRate ?? 0,
            analytics.averageCompletionTime ?? 0,
            analytics.totalMembers ?? 0,
            analytics.activeMembers ?? 0
        ];
        
        const escape = (v) => {
            const str = String(v);
            return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
        };
        
        const output = headers.map(escape).join(',') + '\n' + values.map(escape).join(',');
        return output;
    }

    static async exportToPDF(analytics, includeCharts) {
        // Implement PDF export logic - would use a library like puppeteer or pdfkit
        throw new Error('PDF export not implemented yet');
    }
}

module.exports = AnalyticsService;
