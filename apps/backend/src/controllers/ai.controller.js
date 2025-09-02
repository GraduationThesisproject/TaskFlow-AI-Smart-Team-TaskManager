const aiService = require('../services/ai.service');
const { sendResponse } = require('../utils/response');
const logger = require('../config/logger');

// Generate task suggestions based on space goal
exports.generateTaskSuggestions = async (req, res) => {
    try {
        const { spaceGoal, spaceContext, boardType = 'kanban' } = req.body;

        if (!spaceGoal) {
            return sendResponse(res, 400, false, 'Space goal is required');
        }

        const suggestions = await aiService.generateTaskSuggestions({
            goal: spaceGoal,
            context: spaceContext,
            boardType
        });

        logger.info(`AI task suggestions generated for user: ${req.user.id}`);

        sendResponse(res, 200, true, 'Task suggestions generated successfully', {
            suggestions,
            goal: spaceGoal
        });
    } catch (error) {
        logger.error('Generate task suggestions error:', error);
        sendResponse(res, 500, false, 'Server error generating task suggestions');
    }
};

// Analyze tasks for potential delays and risks
exports.analyzeTaskRisks = async (req, res) => {
    try {
        const { spaceId, boardId } = req.params;

        const riskAnalysis = await aiService.analyzeTaskRisks({
            spaceId,
            boardId,
            userId: req.user.id
        });

        logger.info(`AI risk analysis completed for space: ${spaceId}`);

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

// Generate space timeline and milestones
exports.generateSpaceTimeline = async (req, res) => {
    try {
        const { spaceId } = req.params;
        const { startDate, targetEndDate, priorities } = req.body;

        const timeline = await aiService.generateSpaceTimeline({
            spaceId,
            startDate: startDate ? new Date(startDate) : new Date(),
            targetEndDate: targetEndDate ? new Date(targetEndDate) : null,
            priorities: priorities || []
        });

        logger.info(`AI timeline generated for space: ${spaceId}`);

        sendResponse(res, 200, true, 'Space timeline generated successfully', {
            timeline
        });
    } catch (error) {
        logger.error('Generate space timeline error:', error);
        sendResponse(res, 500, false, 'Server error generating space timeline');
    }
};

// Get smart recommendations for space
exports.getSmartRecommendations = async (req, res) => {
    try {
        const { spaceId } = req.params;
        const { type = 'all' } = req.query;

        const recommendations = await aiService.getSmartRecommendations({
            spaceId,
            type,
            userId: req.user.id
        });

        logger.info(`AI recommendations generated for space: ${spaceId}`);

        sendResponse(res, 200, true, 'Smart recommendations generated successfully', {
            recommendations
        });
    } catch (error) {
        logger.error('Get smart recommendations error:', error);
        sendResponse(res, 500, false, 'Server error generating smart recommendations');
    }
};

// Analyze team performance
exports.analyzeTeamPerformance = async (req, res) => {
    try {
        const { spaceId } = req.params;
        const { period = '30d' } = req.query;

        const performance = await aiService.analyzeTeamPerformance({
            spaceId,
            period,
            userId: req.user.id
        });

        logger.info(`AI team performance analysis completed for space: ${spaceId}`);

        sendResponse(res, 200, true, 'Team performance analysis completed successfully', {
            performance
        });
    } catch (error) {
        logger.error('Analyze team performance error:', error);
        sendResponse(res, 500, false, 'Server error analyzing team performance');
    }
};

// Generate task description
exports.generateTaskDescription = async (req, res) => {
    try {
        const { title, spaceContext, taskType } = req.body;

        if (!title) {
            return sendResponse(res, 400, false, 'Task title is required');
        }

        const description = await aiService.generateTaskDescription({
            title,
            context: spaceContext,
            taskType
        });

        logger.info(`AI task description generated for: "${title}"`);

        sendResponse(res, 200, true, 'Task description generated successfully', {
            description,
            title
        });
    } catch (error) {
        logger.error('Generate task description error:', error);
        sendResponse(res, 500, false, 'Server error generating task description');
    }
};
