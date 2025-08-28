const express = require('express');
const adminController = require('../controllers/admin.controller');
const { authenticateAdmin } = require('../middlewares/adminAuth.middleware');
const { 
  requireUserManagementAccess, 
  requireUserManagementPermission 
} = require('../middlewares/accessControl.middleware');

// const { processUploadedFiles, uploadMiddlewares } = require('../middlewares/upload.middleware');


const router = express.Router();

// Admin authentication routes (public)
router.post('/auth/login', adminController.login);
router.post('/auth/login/2fa-complete', adminController.completeLoginWith2FA);
router.get('/auth/test-jwt', adminController.testJWT);

// Public endpoint for creating the first admin user (only works when no admins exist)
router.post('/auth/setup-first-admin', adminController.setupFirstAdmin);

// Apply admin authentication middleware to protected routes
router.use(authenticateAdmin);

// 2FA management routes (protected)
router.get('/2fa/status', adminController.get2FAStatus);
router.post('/2fa/enable', adminController.enable2FA);
router.post('/2fa/verify-setup', adminController.verify2FASetup);
router.post('/2fa/disable', adminController.disable2FA);
router.post('/2fa/backup-codes', adminController.generateBackupCodes);
router.post('/2fa/recovery-token', adminController.generateRecoveryToken);

// Protected admin routes
router.post('/auth/logout', adminController.logout);
router.get('/auth/me', adminController.getCurrentAdmin);
router.post('/auth/change-password', adminController.changePassword);
// Profile update route (simplified for now)
router.put('/auth/profile', adminController.updateProfile);

// Avatar upload route (simplified for now)
router.post('/auth/avatar', adminController.uploadAvatar);

// User management routes - specific routes first
router.get('/users', requireUserManagementAccess('view'), adminController.getUsers); // Admin users
router.get('/app-users', requireUserManagementAccess('view'), adminController.getAppUsers); // Regular app users
router.post('/users', requireUserManagementAccess('limited'), adminController.createUser);
router.post('/users/add-with-email', requireUserManagementAccess('limited'), adminController.addUserWithEmail);
router.post('/users/add-admin', requireUserManagementAccess('limited'), adminController.addAdminUser);
router.get('/users/available-roles', requireUserManagementAccess('view'), adminController.getAvailableRoles);
router.post('/users/reset-password', requireUserManagementAccess('limited'), adminController.resetUserPassword);

// Parameterized user routes - after specific routes
router.get('/users/:userId', requireUserManagementAccess('view'), adminController.getUser);
router.put('/users/:userId', requireUserManagementAccess('limited'), adminController.updateUser);
router.post('/users/:userId/ban', requireUserManagementPermission('delete'), adminController.deactivateUser);
router.post('/users/:userId/activate', requireUserManagementAccess('limited'), adminController.activateUser);
router.patch('/users/:userId/role', requireUserManagementPermission('role_assign'), adminController.changeUserRole);

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
