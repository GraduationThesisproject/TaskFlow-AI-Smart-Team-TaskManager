const express = require('express');
const adminController = require('../controllers/admin.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { requireSystemAdmin } = require('../middlewares/permission.middleware');

// const { processUploadedFiles, uploadMiddlewares } = require('../middlewares/upload.middleware');


const router = express.Router();

// Admin authentication routes (public)
router.post('/auth/login', adminController.login);
router.get('/auth/test-jwt', adminController.testJWT);

// Apply admin authentication middleware to protected routes
router.use(authMiddleware);
router.use(requireSystemAdmin);

// Protected admin routes
router.post('/auth/logout', adminController.logout);
router.get('/auth/me', adminController.getCurrentAdmin);
router.post('/auth/change-password', adminController.changePassword);
// Profile update route (simplified for now)
router.put('/auth/profile', adminController.updateProfile);

// Avatar upload route (simplified for now)
router.post('/auth/avatar', adminController.uploadAvatar);

// User management routes
router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.get('/users/:userId', adminController.getUser);
router.put('/users/:userId', adminController.updateUser);

router.post('/users/:userId/ban', adminController.deactivateUser);
router.post('/users/:userId/activate', adminController.activateUser);
router.post('/users/reset-password', adminController.resetUserPassword);
router.patch('/users/:userId/role', adminController.changeUserRole);

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
