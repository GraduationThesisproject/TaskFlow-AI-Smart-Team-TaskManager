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
    validateMiddleware(aiSchemas.taskSuggestionsSchema),
    aiController.generateTaskSuggestions
);

router.get('/risks/space/:spaceId', aiController.analyzeTaskRisks);
router.get('/risks/board/:boardId', aiController.analyzeTaskRisks);

router.post('/parse',
    validateMiddleware(aiSchemas.naturalLanguageSchema),
    aiController.parseNaturalLanguage
);

router.post('/timeline/:spaceId',
    validateMiddleware(aiSchemas.timelineSchema),
    aiController.generateSpaceTimeline
);

router.get('/recommendations/:spaceId', aiController.getSmartRecommendations);

router.get('/performance/:spaceId', aiController.analyzeTeamPerformance);

router.post('/description',
    validateMiddleware(aiSchemas.taskDescriptionSchema),
    aiController.generateTaskDescription
);

module.exports = router;
