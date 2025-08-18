const aiService = require('../services/ai.service');
const { sendResponse } = require('../utils/response');
const logger = require('../config/logger');

// Generate task suggestions based on project goal
exports.generateTaskSuggestions = async (req, res) => {
    try {
        const { projectGoal, projectContext, boardType = 'kanban' } = req.body;

        if (!projectGoal) {
            return sendResponse(res, 400, false, 'Project goal is required');
        }

        const suggestions = await aiService.generateTaskSuggestions({
            goal: projectGoal,
            context: projectContext,
            boardType
        });

        logger.info(`AI task suggestions generated for user: ${req.user.id}`);

        sendResponse(res, 200, true, 'Task suggestions generated successfully', {
            suggestions,
            goal: projectGoal
        });
    } catch (error) {
        logger.error('Generate task suggestions error:', error);
        sendResponse(res, 500, false, 'Server error generating task suggestions');
    }
};

// Analyze tasks for potential delays and risks
exports.analyzeTaskRisks = async (req, res) => {
    try {
        const { projectId, boardId } = req.params;

        const riskAnalysis = await aiService.analyzeTaskRisks({
            projectId,
            boardId,
            userId: req.user.id
        });

        logger.info(`AI risk analysis completed for project: ${projectId}`);

        sendResponse(res, 200, true, 'Risk analysis completed successfully', {
            analysis: riskAnalysis
        });
    } catch (error) {
        logger.error('Analyze task risks error:', error);
        sendResponse(res, 500, false, 'Server error analyzing task risks');
    }
};

// Parse natural language input to create tasks
exports.parseNaturalLanguage = async (req, res) => {
    try {
        const { input, boardId } = req.body;

        if (!input) {
            return sendResponse(res, 400, false, 'Natural language input is required');
        }

        const parsedTask = await aiService.parseNaturalLanguageTask({
            input,
            boardId,
            userId: req.user.id
        });

        logger.info(`AI parsed natural language task: "${input}"`);

        sendResponse(res, 200, true, 'Task parsed successfully', {
            parsedTask,
            originalInput: input
        });
    } catch (error) {
        logger.error('Parse natural language error:', error);
        sendResponse(res, 500, false, 'Server error parsing natural language');
    }
};

// Generate project timeline and milestones
exports.generateProjectTimeline = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { startDate, targetEndDate, priorities } = req.body;

        const timeline = await aiService.generateProjectTimeline({
            projectId,
            startDate: startDate ? new Date(startDate) : new Date(),
            targetEndDate: targetEndDate ? new Date(targetEndDate) : null,
            priorities: priorities || []
        });

        logger.info(`AI timeline generated for project: ${projectId}`);

        sendResponse(res, 200, true, 'Project timeline generated successfully', {
            timeline
        });
    } catch (error) {
        logger.error('Generate project timeline error:', error);
        sendResponse(res, 500, false, 'Server error generating project timeline');
    }
};

// Get smart task recommendations based on user behavior
exports.getSmartRecommendations = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { type = 'next_tasks' } = req.query;

        const recommendations = await aiService.getSmartRecommendations({
            userId: req.user.id,
            projectId,
            type
        });

        sendResponse(res, 200, true, 'Smart recommendations retrieved successfully', {
            recommendations,
            type
        });
    } catch (error) {
        logger.error('Get smart recommendations error:', error);
        sendResponse(res, 500, false, 'Server error getting smart recommendations');
    }
};

// Analyze team performance and provide insights
exports.analyzeTeamPerformance = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { timeframe = '30d' } = req.query;

        const analysis = await aiService.analyzeTeamPerformance({
            projectId,
            timeframe,
            userId: req.user.id
        });

        logger.info(`AI team performance analysis for project: ${projectId}`);

        sendResponse(res, 200, true, 'Team performance analysis completed', {
            analysis,
            timeframe
        });
    } catch (error) {
        logger.error('Analyze team performance error:', error);
        sendResponse(res, 500, false, 'Server error analyzing team performance');
    }
};

// Generate automated task descriptions based on title
exports.generateTaskDescription = async (req, res) => {
    try {
        const { title, projectContext, taskType } = req.body;

        if (!title) {
            return sendResponse(res, 400, false, 'Task title is required');
        }

        const description = await aiService.generateTaskDescription({
            title,
            projectContext,
            taskType
        });

        sendResponse(res, 200, true, 'Task description generated successfully', {
            description,
            title
        });
    } catch (error) {
        logger.error('Generate task description error:', error);
        sendResponse(res, 500, false, 'Server error generating task description');
    }
};
