const Analytics = require('../models/Analytics');
const Space = require('../models/Space');
const Task = require('../models/Task');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { sendResponse } = require('../utils/response');
const logger = require('../config/logger');
const AnalyticsService = require('../services/analytics.service');
const analyticsService = new AnalyticsService();
// Get space analytics
exports.getSpaceAnalytics = async (req, res) => {
    try {
        const { spaceId } = req.params;
        const { period = 'monthly', startDate, endDate } = req.query;
        const userId = req.user.id;

        // Check space access
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        if (!userRoles.hasSpaceRole(spaceId)) {
            return sendResponse(res, 403, false, 'Access denied to this space');
        }

        
        let analytics;
        
        if (startDate && endDate) {
            analytics = await analyticsService.generateSpaceAnalytics(spaceId, {
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                periodType: period,
                includeAI: false
            });
        } else {
            analytics = await analyticsService.generateSpaceAnalytics(spaceId, {
                periodType: period,
                includeAI: false
            });
        }

        const normalizedAnalytics = {
            ...analytics,
            taskMetrics: {
                ...(analytics.taskMetrics || {}),
                total: analytics.taskMetrics?.totalTasks,
                completed: analytics.taskMetrics?.completedTasks,
                inProgress: analytics.taskMetrics?.inProgressTasks,
                overdue: analytics.taskMetrics?.overdueTasks,
                completionRate: analytics.taskMetrics?.completionRate ? parseFloat(analytics.taskMetrics.completionRate) : 0
            }
        };

        sendResponse(res, 200, true, 'Space analytics retrieved successfully', {
            analytics: normalizedAnalytics,
            period,
            count: 1
        });
    } catch (error) {
        logger.error('Get space analytics error:', error);
        sendResponse(res, 500, false, 'Server error retrieving space analytics');
    }
};

// Generate analytics for space
exports.generateSpaceAnalytics = async (req, res) => {
    try {
        const { spaceId } = req.params;
        const { 
            periodType = 'monthly', 
            startDate, 
            endDate,
            includeAI = true 
        } = req.body;
        const userId = req.user.id;

        // Check space access
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        if (!userRoles.hasSpaceRole(spaceId, 'member')) {
            return sendResponse(res, 403, false, 'Access denied to this space');
        }

        const space = await Space.findById(spaceId);
        if (!space) {
            return sendResponse(res, 404, false, 'Space not found');
        }

        // Set date range
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();

        const calculationStart = Date.now();

        // Generate comprehensive analytics
        const analytics = await analyticsService.generateSpaceAnalytics(spaceId, {
            startDate: start,
            endDate: end,
            periodType,
            includeAI
        });

        const calculationTime = Date.now() - calculationStart;

        // Create analytics record
        const analyticsRecord = await Analytics.create({
            scopeType: 'space',
            scopeId: spaceId,
            kind: 'custom',
            data: analytics,
            period: {
                start: start,
                end: end
            },
            calculatedAt: new Date(),
            calculationTime
        });

        // Log activity
        await ActivityLog.create({
            userId,
            action: 'analytics_generated',
            entityType: 'Analytics',
            entityId: analyticsRecord._id,
            description: `Generated analytics for space: ${space.name}`,
            metadata: {
                spaceId,
                periodType,
                calculationTime,
                includeAI
            },
            relatedEntities: [
                { type: 'Space', id: spaceId, name: space.name }
            ]
        });

        sendResponse(res, 201, true, 'Space analytics generated successfully', {
            analytics: {
                ...analytics,
                id: analyticsRecord._id,
                calculationTime
            },
            space: {
                id: space._id,
                name: space.name
            }
        });
    } catch (error) {
        logger.error('Generate space analytics error:', error);
        sendResponse(res, 500, false, 'Server error generating space analytics');
    }
};

// Get workspace analytics
exports.getWorkspaceAnalytics = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        console.log("workspaceId", workspaceId)
        const { period = 'monthly', startDate, endDate } = req.query;
        const userId = req.user.id;

        // Check workspace access
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        if (!userRoles.hasWorkspaceRole(workspaceId)) {
            return sendResponse(res, 403, false, 'Access denied to this workspace');
        }
        
        let analytics;
        
        if (startDate && endDate) {
            analytics = await analyticsService.generateWorkspaceAnalytics(workspaceId, {
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                periodType: period,
                includeAI: false
            });
        } else {
            analytics = await analyticsService.generateWorkspaceAnalytics(workspaceId, {
                periodType: period,
                includeAI: false
            });
        }

        sendResponse(res, 200, true, 'Workspace analytics retrieved successfully', {
            analytics,
            period,
            count: 1
        });
    } catch (error) {
        logger.error('Get workspace analytics error:', error);
        sendResponse(res, 500, false, 'Server error retrieving workspace analytics');
    }
};

// Get team performance analytics
exports.getTeamPerformance = async (req, res) => {
    try {
        const { spaceId } = req.params;
        const { period = 'monthly', startDate, endDate } = req.query;
        const userId = req.user.id;

        // Check space access
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        if (!userRoles.hasSpaceRole(spaceId)) {
            return sendResponse(res, 403, false, 'Access denied to this space');
        }

        
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();

        const teamAnalytics = await analyticsService.getTeamPerformance(spaceId, {
            startDate: start,
            endDate: end,
            periodType: period
        });

        sendResponse(res, 200, true, 'Team performance analytics retrieved successfully', {
            analytics: teamAnalytics,
            period,
            spaceId
        });
    } catch (error) {
        logger.error('Get team performance error:', error);
        sendResponse(res, 500, false, 'Server error retrieving team performance');
    }
};

// Export analytics data
exports.exportAnalytics = async (req, res) => {
    try {
        const { spaceId } = req.params;
        const { format = 'json', period = 'monthly', startDate, endDate } = req.query;
        const userId = req.user.id;

        // Check space access
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        if (!userRoles.hasSpaceRole(spaceId)) {
            return sendResponse(res, 403, false, 'Access denied to this space');
        }
        
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();

        const exportData = await analyticsService.exportSpaceAnalytics(spaceId, {
            format,
            startDate: start,
            endDate: end,
            periodType: period
        });

        // Log export activity
        await ActivityLog.create({
            userId,
            action: 'analytics_exported',
            entityType: 'Analytics',
            entityId: spaceId,
            description: `Exported analytics for space in ${format.toUpperCase()} format`,
            metadata: {
                format,
                period,
                startDate: start,
                endDate: end
            },
            relatedEntities: [
                { type: 'Space', id: spaceId, name: 'Space' }
            ]
        });

        // Set response headers for file download
        res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="space-analytics-${spaceId}-${period}.${format}"`);

        sendResponse(res, 200, true, 'Analytics exported successfully', {
            data: exportData,
            format,
            period,
            spaceId
        });
    } catch (error) {
        logger.error('Export analytics error:', error);
        sendResponse(res, 500, false, 'Server error exporting analytics');
    }
};

// Get current user's analytics
exports.getUserAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;
        // Frontend passes range like '1m' | '3m' | '6m' | '12m'. Map to periodType.
        const { range = '3m' } = req.query;

        // Map range to period type understood by service
        // daily (1d) | weekly (7d) | monthly (30d) | quarterly (90d) | yearly (365d)
        let periodType = 'monthly';
        switch (range) {
            case '1m': periodType = 'monthly'; break;
            case '3m': periodType = 'quarterly'; break;
            case '6m': periodType = 'yearly'; break; // closest aggregation window
            case '12m': periodType = 'yearly'; break;
            default: periodType = 'monthly';
        }

        const analytics = await analyticsService.generateUserAnalytics(userId, { periodType, includeAI: false });

        // Shape response for frontend expectations (safe fallbacks)
        // Basic metrics
        const tasksAssigned = analytics?.taskMetrics?.total || 0;
        const tasksCompleted = analytics?.taskMetrics?.completed || 0;
        const completionRate = analytics?.taskMetrics?.completionRate || 0;

        // Last active
        const lastActivity = await ActivityLog.findOne({ userId }).sort({ createdAt: -1 }).select('createdAt');

        // Task status breakdown
        const taskStatusBreakdown = {
            completed: analytics?.taskMetrics?.completed || 0,
            inProgress: analytics?.taskMetrics?.inProgress || 0,
            pending: analytics?.taskMetrics?.todo || 0,
            overdue: analytics?.taskMetrics?.overdue || 0
        };

        // Activity heatmap: transform activityTrend -> [{ date, value }]
        const activityHeatmap = (analytics?.activityTrend || []).map(p => ({ date: p.date, value: p.activityCount }));

        // Recent tasks (last 5 involving the user)
        const recentTasksDocs = await Task.find({
            $or: [{ assignees: userId }, { reporter: userId }]
        }).sort({ updatedAt: -1 }).limit(5).select('title status updatedAt');

        const recentTasks = recentTasksDocs.map(t => ({
            id: t._id.toString(),
            title: t.title,
            status: t.status,
            updatedAt: t.updatedAt
        }));

        // Optional fields not strictly needed by UI but included when available
        // Projects concept maps closest to Spaces in this app; keep undefined to let UI fallback safely

        return sendResponse(res, 200, true, 'User analytics retrieved successfully', {
            tasksAssigned,
            tasksCompleted,
            completionRate,
            lastActiveAt: lastActivity?.createdAt || null,
            taskStatusBreakdown,
            activityHeatmap,
            recentTasks
        });
    } catch (error) {
        logger.error('Get user analytics error:', error);
        return sendResponse(res, 500, false, 'Server error retrieving user analytics');
    }
};
