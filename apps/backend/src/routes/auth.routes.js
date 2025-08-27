const express = require('express');
const authController = require('../controllers/auth.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const validateMiddleware = require('../middlewares/validate.middleware');
const { rateLimitSensitiveOps } = require('../middlewares/permission.middleware');
const { createMulterUpload } = require('../config/multer');

// Robust router initialization to avoid "router.post is not a function"
function createRouter() {
  try {
    const r = express.Router();
    if (r && typeof r.post === 'function' && typeof r.get === 'function') return r;
  } catch (_) {}
  try {
    // Fallback to the underlying router package used by Express v5
    const fallback = require('router')();
    if (fallback && typeof fallback.post === 'function' && typeof fallback.get === 'function') return fallback;
  } catch (_) {}
  throw new Error('Failed to initialize Router');
}
const router = createRouter();

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


const secureProfileUpdateSchema = {
    name: { minLength: 2, maxLength: 100 },
    currentPassword: { required: true },
    newPassword: { required: true, minLength: 8 }
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

router.post('/login/2fa-complete', 
    authController.completeLoginWith2FA
);

router.post('/password-reset/request',
    validateMiddleware(passwordResetRequestSchema),
    authController.requestPasswordReset
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


const uploadAvatar = createMulterUpload('avatar', false);
router.put(
    '/profile/secure',
    uploadAvatar,       // Multer handles avatar file and populates req.body
    (req, res, next) => {
                       // Optional: simple validation here manually
      const { currentPassword, name } = req.body;
      if (!currentPassword) return res.status(400).json({ message: 'Current password required' });
      if (name && name.length < 2) return res.status(400).json({ message: 'Name too short' });
      next();
    },
    authMiddleware,
    authController.updateProfileSecure
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