const express = require('express');
const router = express.Router();
const aiTokenController = require('../controllers/aiToken.controller');
const { authenticateAdmin } = require('../middlewares/adminAuth.middleware');

// Apply admin authentication to all routes
router.use(authenticateAdmin);

/**
 * @route   GET /api/admin/ai-tokens
 * @desc    Get all AI tokens
 * @access  Admin
 */
router.get('/', aiTokenController.getAiTokens);

/**
 * @route   GET /api/admin/ai-tokens/active/:provider
 * @desc    Get active token for provider
 * @access  Admin
 */
router.get('/active/:provider', aiTokenController.getActiveToken);

/**
 * @route   POST /api/admin/ai-tokens
 * @desc    Create new AI token
 * @access  Admin
 */
router.post('/', aiTokenController.createAiToken);

/**
 * @route   PUT /api/admin/ai-tokens/:tokenId
 * @desc    Update AI token
 * @access  Admin
 */
router.put('/:tokenId', aiTokenController.updateAiToken);

/**
 * @route   POST /api/admin/ai-tokens/:tokenId/activate
 * @desc    Activate AI token (will archive others)
 * @access  Admin
 */
router.post('/:tokenId/activate', aiTokenController.activateToken);

/**
 * @route   POST /api/admin/ai-tokens/:tokenId/archive
 * @desc    Archive AI token
 * @access  Admin
 */
router.post('/:tokenId/archive', aiTokenController.archiveToken);

/**
 * @route   DELETE /api/admin/ai-tokens/:tokenId
 * @desc    Delete AI token permanently
 * @access  Admin
 */
router.delete('/:tokenId', aiTokenController.deleteToken);

/**
 * @route   POST /api/admin/ai-tokens/:tokenId/test
 * @desc    Test AI token
 * @access  Admin
 */
router.post('/:tokenId/test', aiTokenController.testToken);

/**
 * @route   GET /api/admin/ai-tokens/stats
 * @desc    Get token usage statistics
 * @access  Admin
 */
router.get('/stats', aiTokenController.getTokenStats);

module.exports = router;
