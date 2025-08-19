const express = require('express');
const aiController = require('../controllers/ai.controller');
const validateMiddleware = require('../middlewares/validate.middleware');

const router = express.Router();

// Validation schemas
const taskSuggestionsSchema = {
    spaceGoal: { required: true, minLength: 10, maxLength: 1000 },
    spaceContext: { maxLength: 2000 },
    boardType: { enum: ['kanban', 'list', 'calendar', 'timeline'], default: 'kanban' }
};

const naturalLanguageSchema = {
    input: { required: true, minLength: 3, maxLength: 500 },
    boardId: { required: true, objectId: true }
};

const timelineSchema = {
    startDate: { date: true },
    targetEndDate: { date: true },
    priorities: { array: true }
};

const taskDescriptionSchema = {
    title: { required: true, minLength: 2, maxLength: 200 },
    spaceContext: { maxLength: 500 },
    taskType: { maxLength: 100 }
};

// Routes
router.post('/suggestions',
    validateMiddleware(taskSuggestionsSchema),
    aiController.generateTaskSuggestions
);

router.get('/risks/space/:spaceId', aiController.analyzeTaskRisks);
router.get('/risks/board/:boardId', aiController.analyzeTaskRisks);

router.post('/parse',
    validateMiddleware(naturalLanguageSchema),
    aiController.parseNaturalLanguage
);

router.post('/timeline/:spaceId',
    validateMiddleware(timelineSchema),
    aiController.generateSpaceTimeline
);

router.get('/recommendations/:spaceId', aiController.getSmartRecommendations);

router.get('/performance/:spaceId', aiController.analyzeTeamPerformance);

router.post('/description',
    validateMiddleware(taskDescriptionSchema),
    aiController.generateTaskDescription
);

module.exports = router;
