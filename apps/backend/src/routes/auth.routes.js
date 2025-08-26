const express = require('express');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validateMiddleware = require('../middlewares/validate.middleware');
const { uploadMiddlewares, processUploadedFiles, createUploadMiddleware } = require('../middlewares/upload.middleware');
const { rateLimitSensitiveOps } = require('../middlewares/permission.middleware');

const router = express.Router();

// Validation schemas
const registerSchema = {
    name: { required: true, minLength: 2, maxLength: 100 },
    email: { required: true, email: true },
    password: { required: true, minLength: 8 },
    inviteToken: { string: true }, // optional
    device: {
        deviceId: { string: true },
        deviceInfo: {
            type: { enum: ['web', 'mobile', 'desktop'] },
            os: { string: true },
            browser: { string: true }
        }
    }
};

const loginSchema = {
    email: { required: true, email: true },
    password: { required: true },
    rememberMe: { boolean: true },
    device: {
        deviceId: { string: true },
        deviceInfo: {
            type: { enum: ['web', 'mobile', 'desktop'] },
            os: { string: true },
            browser: { string: true }
        }
    }
};

const changePasswordSchema = {
    currentPassword: { required: true },
    newPassword: { required: true, minLength: 8 }
};

const updateProfileSchema = {
    name: { minLength: 2, maxLength: 100 },
    avatar: { string: true },
    preferences: { object: true },
    metadata: { object: true }
};

const updatePreferencesSchema = {
    section: { string: true },
    updates: { object: true }
};

const logoutSchema = {
    deviceId: { string: true, required: false },
    allDevices: { boolean: true, required: false }
};

const passwordResetRequestSchema = {
    email: { required: true, email: true }
};

const passwordResetSchema = {
    token: { required: true, string: true },
    newPassword: { required: true, minLength: 8 }
};

const secureProfileUpdateSchema = {
    name: { minLength: 2, maxLength: 100 },
    // Make password optional: if provided, validate as string; otherwise skip
    currentPassword: { string: true }
};

// Public routes
router.post('/register', 
    validateMiddleware(registerSchema), 
    authController.register
);

router.post('/login', 
    validateMiddleware(loginSchema), 
    authController.login
);

router.post('/password-reset/request',
    validateMiddleware(passwordResetRequestSchema),
    authController.requestPasswordReset
);

router.post('/password-reset/confirm',
    validateMiddleware(passwordResetSchema),
    authController.resetPassword
);

router.get('/verify-email/:token',
    authController.verifyEmail
);

// Protected routes
router.get('/me', 
    authMiddleware, 
    authController.getMe
);

router.post('/logout', 
    authMiddleware,
    validateMiddleware(logoutSchema),
    authController.logout
);

router.put('/profile', 
    authMiddleware,
    validateMiddleware(updateProfileSchema),
    authController.updateProfile
);

router.put('/profile/secure',
    authMiddleware,
    createUploadMiddleware('avatar', false, 1, true),
    processUploadedFiles,
    validateMiddleware(secureProfileUpdateSchema),
    authController.updateProfileSecure
);

router.post('/avatar',
    authMiddleware,
    uploadMiddlewares.avatar,
    processUploadedFiles,
    authController.updateProfile
);

router.put('/change-password',
    authMiddleware,
    rateLimitSensitiveOps(5, 15 * 60 * 1000), // 5 requests per 15 minutes
    validateMiddleware(changePasswordSchema),
    authController.changePassword
);

router.put('/preferences',
    authMiddleware,
    validateMiddleware(updatePreferencesSchema),
    authController.updatePreferences
);

router.get('/sessions',
    authMiddleware,
    authController.getSessions
);

router.delete('/sessions/:sessionId',
    authMiddleware,
    authController.endSession
);

router.get('/activity',
    authMiddleware,
    authController.getActivityLog
);

// OAuth Routes
router.get('/google', authController.googleLogin);
router.get('/google/callback', authController.googleCallback);

router.get('/github', authController.githubLogin);
router.get('/github/callback', authController.githubCallback);

module.exports = router;