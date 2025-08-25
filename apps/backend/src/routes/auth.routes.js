const express = require('express');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validateMiddleware = require('../middlewares/validate.middleware');
const { uploadMiddlewares } = require('../middlewares/upload.middleware');
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

router.post('/avatar',
    authMiddleware,
    uploadMiddlewares.avatar,
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
// OAuth Routes (register only if handlers exist)
if (typeof authController.googleLogin === 'function') {
router.get('/google', authController.googleLogin);
}
if (typeof authController.googleCallback === 'function') {
router.get('/google/callback', authController.googleCallback);
}
module.exports = router;