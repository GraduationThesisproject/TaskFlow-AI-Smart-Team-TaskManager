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

// 4-Digit Code Password Reset Flow
router.post('/forgot-password/send-code',
    validateMiddleware.validateBody(authSchemas.forgotPasswordSendCodeSchema),
    authController.sendForgotPasswordCode
);

router.post('/forgot-password/verify-code',
    validateMiddleware.validateBody(authSchemas.forgotPasswordVerifyCodeSchema),
    authController.verifyForgotPasswordCode
);

router.post('/forgot-password/reset',
    validateMiddleware.validateBody(authSchemas.forgotPasswordResetSchema),
    authController.resetPasswordWithCode
);

// Email Verification (support both path param and query param)
router.get('/verify-email', authController.verifyEmail);
router.get('/verify-email/:token', authController.verifyEmail);
// 4-digit code email verification flow (API used by mobile app)
router.post('/resend-verification', authController.resendVerificationCode);
router.post('/verify-email', authController.verifyEmailCode);

// OAuth Authentication
router.get('/google', authController.googleLogin);
router.get('/google/callback', authController.googleCallback);
router.get('/github', authController.githubLogin);
router.get('/github/callback', authController.githubCallback);

// Mobile OAuth Authentication
router.post('/google/mobile', authController.googleMobile);
router.post('/github/mobile', authController.githubMobile);

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

// Account Management
router.delete('/account',
    authMiddleware,
    rateLimitSensitiveOps(3, 60 * 60 * 1000), // 3 attempts per hour
    validateMiddleware.validateBody(authSchemas.deleteAccountSchema),
    authController.deleteAccount
);

// Activity Logging
router.get('/activity',
    authMiddleware,
    validateMiddleware.validateQuery(authSchemas.activityLogSchema),
    authController.getActivityLog
);

module.exports = router;
