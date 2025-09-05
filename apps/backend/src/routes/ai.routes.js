const express = require('express');
const aiController = require('../controllers/ai.controller');
const validateMiddleware = require('../middlewares/validate.middleware');
const { ai: aiSchemas } = require('./validator');
const { authMiddleware } = require('../middlewares/auth.middleware');

const router = express.Router();

// Apply authentication to all routes
router.use(authMiddleware);

// Routes
router.post('/suggestions',
    validateMiddleware.validateBody(aiSchemas.taskSuggestionsSchema),
    aiController.generateTaskSuggestions
);

router.get('/risks/space/:spaceId', aiController.analyzeTaskRisks);
router.get('/risks/board/:boardId', aiController.analyzeTaskRisks);

router.post('/parse',
    validateMiddleware.validateBody(aiSchemas.naturalLanguageSchema),
    aiController.parseNaturalLanguage
);

router.post('/timeline/:spaceId',
    validateMiddleware.validateBody(aiSchemas.timelineSchema),
    aiController.generateSpaceTimeline
);

router.get('/recommendations/:spaceId', aiController.getSmartRecommendations);

router.get('/performance/:spaceId', aiController.analyzeTeamPerformance);

router.post('/description',
    validateMiddleware.validateBody(aiSchemas.taskDescriptionSchema),
    aiController.generateTaskDescription
);

module.exports = router;
