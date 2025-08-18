const Analytics = require('../models/Analytics');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { sendResponse } = require('../utils/response');
const logger = require('../config/logger');

// Get project analytics
exports.getProjectAnalytics = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { period = 'monthly', startDate, endDate } = req.query;
        const userId = req.user.id;

        // Check project access
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        if (!userRoles.hasProjectRole(projectId)) {
            return sendResponse(res, 403, false, 'Access denied to this project');
        }

        let analytics;
        
        if (startDate && endDate) {
            analytics = await Analytics.findByDateRange(
                projectId, 
                new Date(startDate), 
                new Date(endDate)
            );
        } else {
            analytics = await Analytics.findByProject(projectId, period);
        }

        // Get latest analytics if available
        const latestAnalytics = await Analytics.findLatest(projectId);

        sendResponse(res, 200, true, 'Project analytics retrieved successfully', {
            analytics,
            latest: latestAnalytics,
            period,
            count: analytics.length
        });
    } catch (error) {
        logger.error('Get project analytics error:', error);
        sendResponse(res, 500, false, 'Server error retrieving project analytics');
    }
};

// Generate analytics for project
exports.generateProjectAnalytics = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { 
            periodType = 'monthly', 
            startDate, 
            endDate,
            includeAI = true 
        } = req.body;
        const userId = req.user.id;

        // Check project access
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        if (!userRoles.hasProjectRole(projectId, 'member')) {
            return sendResponse(res, 403, false, 'Access denied to this project');
        }

        const project = await Project.findById(projectId);
        if (!project) {
            return sendResponse(res, 404, false, 'Project not found');
        }

        // Set date range
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();

        const analyticsService = require('../services/analytics.service');
        const calculationStart = Date.now();

        // Generate comprehensive analytics
        const analytics = await analyticsService.generateProjectAnalytics(projectId, {
            startDate: start,
            endDate: end,
            periodType,
            includeAI
        });

        const calculationDuration = Date.now() - calculationStart;

        // Save analytics to database
        const analyticsRecord = await Analytics.create({
            project: projectId,
            period: {
                startDate: start,
                endDate: end,
                type: periodType
            },
            ...analytics,
            calculationDuration,
            isCalculated: true
        });

        await analyticsRecord.markAsCalculated(calculationDuration);

        // Log activity
        await ActivityLog.logActivity({
            userId,
            action: 'analytics_generate',
            description: `Generated analytics for project: ${project.name}`,
            entity: { type: 'Analytics', id: analyticsRecord._id, name: 'Project Analytics' },
            relatedEntities: [{ type: 'Project', id: projectId, name: project.name }],
            projectId,
            metadata: {
                periodType,
                calculationDuration,
                includeAI,
                ipAddress: req.ip
            }
        });

        logger.info(`Analytics generated for project: ${projectId}`);

        sendResponse(res, 200, true, 'Project analytics generated successfully', {
            analytics: {
                ...analyticsRecord.toObject(),
                projectHealth: analyticsRecord.projectHealth,
                trendIndicators: analyticsRecord.trendIndicators
            }
        });
    } catch (error) {
        logger.error('Generate project analytics error:', error);
        sendResponse(res, 500, false, 'Server error generating project analytics');
    }
};

// Get user analytics
exports.getUserAnalytics = async (req, res) => {
    try {
        const { timeframe = '30d' } = req.query;
        const userId = req.user.id;

        const analyticsService = require('../services/analytics.service');
        const userAnalytics = await analyticsService.getUserAnalytics(userId, timeframe);

        sendResponse(res, 200, true, 'User analytics retrieved successfully', {
            analytics: userAnalytics,
            timeframe
        });
    } catch (error) {
        logger.error('Get user analytics error:', error);
        sendResponse(res, 500, false, 'Server error retrieving user analytics');
    }
};

// Get workspace analytics
exports.getWorkspaceAnalytics = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const { timeframe = '30d' } = req.query;
        const userId = req.user.id;

        // Check workspace access
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        if (!userRoles.hasWorkspaceRole(workspaceId)) {
            return sendResponse(res, 403, false, 'Access denied to this workspace');
        }

        const analyticsService = require('../services/analytics.service');
        const workspaceAnalytics = await analyticsService.getWorkspaceAnalytics(workspaceId, timeframe);

        sendResponse(res, 200, true, 'Workspace analytics retrieved successfully', {
            analytics: workspaceAnalytics,
            timeframe
        });
    } catch (error) {
        logger.error('Get workspace analytics error:', error);
        sendResponse(res, 500, false, 'Server error retrieving workspace analytics');
    }
};

// Get team performance analytics
exports.getTeamPerformance = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { timeframe = '30d' } = req.query;
        const userId = req.user.id;

        // Check project access
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        if (!userRoles.hasProjectRole(projectId)) {
            return sendResponse(res, 403, false, 'Access denied to this project');
        }

        const analyticsService = require('../services/analytics.service');
        const teamPerformance = await analyticsService.getTeamPerformance(projectId, timeframe);

        sendResponse(res, 200, true, 'Team performance analytics retrieved successfully', {
            performance: teamPerformance,
            timeframe
        });
    } catch (error) {
        logger.error('Get team performance error:', error);
        sendResponse(res, 500, false, 'Server error retrieving team performance');
    }
};

// Export analytics data
exports.exportAnalytics = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { format = 'json', includeCharts = false } = req.query;
        const userId = req.user.id;

        // Check project access
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        if (!userRoles.hasProjectRole(projectId)) {
            return sendResponse(res, 403, false, 'Access denied to this project');
        }

        const analyticsService = require('../services/analytics.service');
        const exportData = await analyticsService.exportProjectAnalytics(projectId, {
            format,
            includeCharts
        });

        // Set appropriate headers for download
        if (format === 'csv') {
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="project-${projectId}-analytics.csv"`);
        } else if (format === 'pdf') {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="project-${projectId}-analytics.pdf"`);
        }

        // Log activity
        await ActivityLog.logActivity({
            userId,
            action: 'analytics_export',
            description: `Exported analytics for project`,
            entity: { type: 'Project', id: projectId, name: 'Project' },
            projectId,
            metadata: {
                format,
                includeCharts,
                ipAddress: req.ip
            }
        });

        if (format === 'json') {
            sendResponse(res, 200, true, 'Analytics exported successfully', {
                data: exportData
            });
        } else {
            res.send(exportData);
        }
    } catch (error) {
        logger.error('Export analytics error:', error);
        sendResponse(res, 500, false, 'Server error exporting analytics');
    }
};
