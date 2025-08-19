const Analytics = require('../models/Analytics');
const Space = require('../models/Space');
const Task = require('../models/Task');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { sendResponse } = require('../utils/response');
const logger = require('../config/logger');

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

        const analyticsService = require('../services/analytics.service');
        
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

        const analyticsService = require('../services/analytics.service');
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
        const { period = 'monthly', startDate, endDate } = req.query;
        const userId = req.user.id;

        // Check workspace access
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        if (!userRoles.hasWorkspaceRole(workspaceId)) {
            return sendResponse(res, 403, false, 'Access denied to this workspace');
        }

        const analyticsService = require('../services/analytics.service');
        
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

        const analyticsService = require('../services/analytics.service');
        
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();

        const teamAnalytics = await analyticsService.generateTeamPerformanceAnalytics(spaceId, {
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

        const analyticsService = require('../services/analytics.service');
        
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
