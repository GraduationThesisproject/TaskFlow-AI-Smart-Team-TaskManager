const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Apply auth middleware to all user routes
router.use(authMiddleware);

// Get all users (for autocomplete)
router.get('/', userController.getAllUsers);

// Search users - MUST come before /:id to avoid route shadowing
router.get('/search', userController.searchUsers);

// Get user by ID
router.get('/:id', userController.getUserById);

module.exports = router;
