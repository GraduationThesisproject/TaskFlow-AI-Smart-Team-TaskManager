const express = require('express');
const authController = require('../controllers/auth.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const validateMiddleware = require('../middlewares/validate.middleware');
const { rateLimitSensitiveOps } = require('../middlewares/permission.middleware');
const { createMulterUpload } = require('../config/multer');

// Import validation schemas
const authSchemas = require('./validator').auth;

// Initialize router
const router = express.Router();

// ============================================================================
// PUBLIC ROUTES (No Authentication Required)
// ============================================================================

// User Registration & Invitation
router.post('/register', 
    validateMiddleware.validateBody(authSchemas.registerSchema), 
    authController.register
);

// User Authentication
router.post('/login', 
    validateMiddleware.validateBody(authSchemas.loginSchema), 
    authController.login
);

router.post('/login/2fa-complete', 
    validateMiddleware.validateBody(authSchemas.completeLogin2FASchema),
    authController.completeLoginWith2FA
);

// Password Reset
router.post('/password-reset/request',
    validateMiddleware.validateBody(authSchemas.passwordResetRequestSchema),
    authController.requestPasswordReset
);

router.put('/password-reset/confirm',
    validateMiddleware.validateBody(authSchemas.passwordResetSchema),
    authController.resetPassword
);

// Email Verification
router.get('/verify-email/:token',
    authController.verifyEmail
);

// OAuth Authentication
router.get('/google', authController.googleLogin);
router.get('/google/callback', authController.googleCallback);
router.get('/github', authController.githubLogin);
router.get('/github/callback', authController.githubCallback);

// ============================================================================
// PROTECTED ROUTES (Authentication Required)
// ============================================================================

// User Profile Management
router.get('/me', 
    authMiddleware, 
    authController.getMe
);

router.put('/profile', 
    authMiddleware,
    validateMiddleware.validateBody(authSchemas.updateProfileSchema),
    authController.updateProfile
);

router.put('/profile/secure',
    authMiddleware,
    validateMiddleware.validateBody(authSchemas.secureProfileUpdateSchema),
    authController.updateProfileSecure
);

// Password & Security
router.put('/change-password',
    authMiddleware,
    rateLimitSensitiveOps(5, 15 * 60 * 1000), 
    validateMiddleware.validateBody(authSchemas.changePasswordSchema),
    authController.changePassword
);

// User Preferences & Settings
router.put('/preferences',
    authMiddleware,
    validateMiddleware.validateBody(authSchemas.updatePreferencesSchema),
    authController.updatePreferences
);

// Session Management
router.post('/logout',
    authMiddleware,
    validateMiddleware.validateBody(authSchemas.logoutSchema),
    authController.logout
);

router.get('/sessions',
    authMiddleware,
    authController.getSessions
);

router.delete('/sessions/:sessionId',
    authMiddleware,
    validateMiddleware.validateParams(authSchemas.sessionIdSchema),
    authController.endSession
);

// Activity Logging
router.get('/activity',
    authMiddleware,
    validateMiddleware.validateQuery(authSchemas.activityLogSchema),
    authController.getActivityLog
);

module.exports = router;
