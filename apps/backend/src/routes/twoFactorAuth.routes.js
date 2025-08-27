const express = require('express');
const router = express.Router();
const twoFactorAuthController = require('../controllers/twoFactorAuth.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

// All 2FA routes require authentication
router.use(authMiddleware);

// Enable 2FA
router.post('/enable', twoFactorAuthController.enable2FA);

// Verify 2FA setup
router.post('/verify-setup', twoFactorAuthController.verify2FASetup);

// Verify 2FA token (for login)
router.post('/verify', twoFactorAuthController.verify2FA);

// Disable 2FA
router.post('/disable', twoFactorAuthController.disable2FA);

// Generate new backup codes
router.post('/backup-codes', twoFactorAuthController.generateBackupCodes);

// Get 2FA status
router.get('/status', twoFactorAuthController.get2FAStatus);

// Generate recovery token
router.post('/recovery-token', twoFactorAuthController.generateRecoveryToken);

module.exports = router;
