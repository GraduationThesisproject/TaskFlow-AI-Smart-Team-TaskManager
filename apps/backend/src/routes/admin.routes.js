const express = require('express');
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireSystemAdmin } = require('../middlewares/permission.middleware');
const validateMiddleware = require('../middlewares/validate.middleware');

const router = express.Router();

// Apply admin authentication middleware to all routes
router.use(authMiddleware);
router.use(requireSystemAdmin);

// Admin authentication routes
router.post('/auth/login', adminController.login);
router.post('/auth/logout', adminController.logout);
router.get('/auth/me', adminController.getCurrentAdmin);

// User management routes
router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.get('/users/:userId', adminController.getUser);
router.put('/users/:userId', adminController.updateUser);
router.delete('/users/:userId', adminController.deleteUser);
router.post('/users/:userId/ban', adminController.banUser);
router.post('/users/:userId/activate', adminController.activateUser);
router.post('/users/reset-password', adminController.resetUserPassword);

// Analytics routes
router.get('/analytics', adminController.getAnalytics);
router.get('/analytics/export', adminController.exportAnalytics);

// System health routes
router.get('/system/health', adminController.getSystemHealth);

// Templates routes
router.get('/templates/projects', adminController.getProjectTemplates);
router.post('/templates/projects', adminController.createProjectTemplate);
router.put('/templates/projects/:templateId', adminController.updateProjectTemplate);
router.delete('/templates/projects/:templateId', adminController.deleteProjectTemplate);

router.get('/templates/tasks', adminController.getTaskTemplates);
router.get('/templates/ai-prompts', adminController.getAIPrompts);
router.get('/templates/branding', adminController.getBrandingAssets);

module.exports = router;
