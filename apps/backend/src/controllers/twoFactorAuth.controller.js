const TwoFactorAuthService = require('../services/twoFactorAuth.service');
const User = require('../models/User');
const { sendResponse } = require('../utils/response');
const logger = require('../config/logger');

/**
 * Enable 2FA for a user
 * POST /api/auth/2fa/enable
 */
exports.enable2FA = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user with 2FA fields
    const user = await User.findById(userId).select('+twoFactorAuth.secret +twoFactorAuth.backupCodes');
    
    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    if (user.hasTwoFactorAuth) {
      return sendResponse(res, 400, false, '2FA is already enabled');
    }

    // Generate new 2FA secret and QR code
    const { secret, otpauthUrl, qrCode } = await TwoFactorAuthService.generateSecret(
      user.email,
      'TaskFlow AI'
    );

    // Generate backup codes
    const backupCodes = TwoFactorAuthService.generateBackupCodes(10);

    // Store the secret temporarily (will be confirmed when user verifies first code)
    user.twoFactorAuth = {
      secret: secret,
      backupCodes: backupCodes.map(code => ({
        code: code,
        used: false
      })),
      enabledAt: null // Will be set when verified
    };

    await user.save();

    // Return setup data (secret will be hidden after setup)
    sendResponse(res, 200, true, '2FA setup initiated', {
      qrCode,
      otpauthUrl,
      secret, // Only show during setup
      backupCodes,
      message: 'Scan the QR code with your authenticator app, then verify with a code to complete setup'
    });

  } catch (error) {
    logger.error('Error enabling 2FA:', error);
    sendResponse(res, 500, false, 'Failed to enable 2FA');
  }
};

/**
 * Verify and complete 2FA setup
 * POST /api/auth/2fa/verify-setup
 */
exports.verify2FASetup = async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user.id;

    if (!token) {
      return sendResponse(res, 400, false, 'Verification token is required');
    }

    // Get user with 2FA secret
    const user = await User.findById(userId).select('+twoFactorAuth.secret');
    
    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    if (!user.twoFactorAuth?.secret) {
      return sendResponse(res, 400, false, '2FA setup not initiated');
    }

    if (user.hasTwoFactorAuth) {
      return sendResponse(res, 400, false, '2FA is already enabled');
    }

    // Verify the token
    const isValid = TwoFactorAuthService.verifyToken(token, user.twoFactorAuth.secret);
    
    if (!isValid) {
      return sendResponse(res, 400, false, 'Invalid verification code');
    }

    // Enable 2FA
    user.hasTwoFactorAuth = true;
    user.twoFactorAuth.enabledAt = new Date();
    user.twoFactorAuth.lastUsed = new Date();

    await user.save();

    // Log activity
    try {
      const ActivityLog = require('../models/ActivityLog');
      await ActivityLog.logActivity({
        userId: user._id,
        action: '2fa_enabled',
        description: 'User enabled two-factor authentication',
        entity: { type: 'User', id: user._id, email: user.email }
      });
    } catch (logError) {
      logger.warn('Failed to log 2FA enable activity:', logError.message);
    }

    sendResponse(res, 200, true, '2FA enabled successfully', {
      message: 'Two-factor authentication has been enabled for your account'
    });

  } catch (error) {
    logger.error('Error verifying 2FA setup:', error);
    sendResponse(res, 500, false, 'Failed to verify 2FA setup');
  }
};

/**
 * Verify 2FA token during login
 * POST /api/auth/2fa/verify
 */
exports.verify2FA = async (req, res) => {
  try {
    const { token, userId, rememberDevice } = req.body;

    if (!token || !userId) {
      return sendResponse(res, 400, false, 'Token and user ID are required');
    }

    // Get user with 2FA fields
    const user = await User.findById(userId).select('+twoFactorAuth.secret +twoFactorAuth.backupCodes');
    
    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    if (!user.hasTwoFactorAuth) {
      return sendResponse(res, 400, false, '2FA is not enabled for this account');
    }

    // Check if it's a backup code
    const backupCode = user.twoFactorAuth.backupCodes.find(
      bc => bc.code === token && !bc.used
    );

    if (backupCode) {
      // Use backup code
      backupCode.used = true;
      backupCode.usedAt = new Date();
      user.twoFactorAuth.lastUsed = new Date();
      
      await user.save();

      // Log backup code usage
      try {
        const ActivityLog = require('../models/ActivityLog');
        await ActivityLog.logActivity({
          userId: user._id,
          action: '2fa_backup_code_used',
          description: 'User used backup code for 2FA',
          entity: { type: 'User', id: user._id, email: user.email }
        });
      } catch (logError) {
        logger.warn('Failed to log backup code usage:', logError.message);
      }

      return sendResponse(res, 200, true, '2FA verification successful', {
        message: 'Backup code used successfully',
        requiresNewBackupCodes: user.twoFactorAuth.backupCodes.filter(bc => !bc.used).length < 3
      });
    }

    // Verify TOTP token
    const isValid = TwoFactorAuthService.verifyToken(token, user.twoFactorAuth.secret);
    
    if (!isValid) {
      return sendResponse(res, 400, false, 'Invalid verification code');
    }

    // Update last used timestamp
    user.twoFactorAuth.lastUsed = new Date();
    await user.save();

    // Generate device token if remember device is requested
    let deviceToken = null;
    if (rememberDevice) {
      const deviceId = req.headers['x-device-id'] || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';
      deviceToken = TwoFactorAuthService.generateDeviceToken(deviceId, userAgent);
    }

    sendResponse(res, 200, true, '2FA verification successful', {
      message: 'Two-factor authentication verified successfully',
      deviceToken,
      requiresNewBackupCodes: user.twoFactorAuth.backupCodes.filter(bc => !bc.used).length < 3
    });

  } catch (error) {
    logger.error('Error verifying 2FA:', error);
    sendResponse(res, 500, false, 'Failed to verify 2FA');
  }
};

/**
 * Disable 2FA for a user
 * POST /api/auth/2fa/disable
 */
exports.disable2FA = async (req, res) => {
  try {
    const { token, recoveryToken } = req.body;
    const userId = req.user.id;

    if (!token && !recoveryToken) {
      return sendResponse(res, 400, false, 'Verification token or recovery token is required');
    }

    // Get user with 2FA fields
    const user = await User.findById(userId).select('+twoFactorAuth.secret +twoFactorAuth.backupCodes +twoFactorAuth.recoveryToken +twoFactorAuth.recoveryTokenExpires');
    
    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    if (!user.hasTwoFactorAuth) {
      return sendResponse(res, 400, false, '2FA is not enabled for this account');
    }

    let isValid = false;

    if (recoveryToken) {
      // Verify recovery token
      isValid = TwoFactorAuthService.validateRecoveryToken(
        recoveryToken,
        user.twoFactorAuth.recoveryToken,
        user.twoFactorAuth.recoveryTokenExpires
      );
    } else {
      // Verify TOTP token
      isValid = TwoFactorAuthService.verifyToken(token, user.twoFactorAuth.secret);
    }

    if (!isValid) {
      return sendResponse(res, 400, false, 'Invalid verification code or recovery token');
    }

    // Disable 2FA
    user.hasTwoFactorAuth = false;
    user.twoFactorAuth = {
      secret: null,
      backupCodes: [],
      recoveryToken: null,
      recoveryTokenExpires: null,
      enabledAt: null,
      lastUsed: null
    };

    await user.save();

    // Log activity
    try {
      const ActivityLog = require('../models/ActivityLog');
      await ActivityLog.logActivity({
        userId: user._id,
        action: '2fa_disabled',
        description: 'User disabled two-factor authentication',
        entity: { type: 'User', id: user._id, email: user.email }
      });
    } catch (logError) {
      logger.warn('Failed to log 2FA disable activity:', logError.message);
    }

    sendResponse(res, 200, true, '2FA disabled successfully', {
      message: 'Two-factor authentication has been disabled for your account'
    });

  } catch (error) {
    logger.error('Error disabling 2FA:', error);
    sendResponse(res, 500, false, 'Failed to disable 2FA');
  }
};

/**
 * Generate new backup codes
 * POST /api/auth/2fa/backup-codes
 */
exports.generateBackupCodes = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user with 2FA fields
    const user = await User.findById(userId).select('+twoFactorAuth.backupCodes');
    
    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    if (!user.hasTwoFactorAuth) {
      return sendResponse(res, 400, false, '2FA is not enabled for this account');
    }

    // Generate new backup codes
    const newBackupCodes = TwoFactorAuthService.generateBackupCodes(10);

    // Replace existing backup codes
    user.twoFactorAuth.backupCodes = newBackupCodes.map(code => ({
      code: code,
      used: false
    }));

    await user.save();

    // Log activity
    try {
      const ActivityLog = require('../models/ActivityLog');
      await ActivityLog.logActivity({
        userId: user._id,
        action: '2fa_backup_codes_regenerated',
        description: 'User regenerated backup codes',
        entity: { type: 'User', id: user._id, email: user.email }
      });
    } catch (logError) {
      logger.warn('Failed to log backup codes regeneration:', logError.message);
    }

    sendResponse(res, 200, true, 'Backup codes generated successfully', {
      backupCodes: newBackupCodes,
      message: 'New backup codes have been generated. Save these codes in a secure location.'
    });

  } catch (error) {
    logger.error('Error generating backup codes:', error);
    sendResponse(res, 500, false, 'Failed to generate backup codes');
  }
};

/**
 * Get 2FA status and remaining backup codes
 * GET /api/auth/2fa/status
 */
exports.get2FAStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user with 2FA fields
    const user = await User.findById(userId).select('+twoFactorAuth.backupCodes');
    
    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    const remainingBackupCodes = user.twoFactorAuth?.backupCodes?.filter(bc => !bc.used) || [];
    const usedBackupCodes = user.twoFactorAuth?.backupCodes?.filter(bc => bc.used) || [];

    sendResponse(res, 200, true, '2FA status retrieved successfully', {
      isEnabled: user.hasTwoFactorAuth,
      enabledAt: user.twoFactorAuth?.enabledAt,
      lastUsed: user.twoFactorAuth?.lastUsed,
      remainingBackupCodes: remainingBackupCodes.length,
      totalBackupCodes: (user.twoFactorAuth?.backupCodes?.length || 0),
      needsNewBackupCodes: remainingBackupCodes.length < 3
    });

  } catch (error) {
    logger.error('Error getting 2FA status:', error);
    sendResponse(res, 500, false, 'Failed to get 2FA status');
  }
};

/**
 * Generate recovery token for 2FA disable
 * POST /api/auth/2fa/recovery-token
 */
exports.generateRecoveryToken = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user with 2FA fields
    const user = await User.findById(userId).select('+twoFactorAuth.recoveryToken +twoFactorAuth.recoveryTokenExpires');
    
    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    if (!user.hasTwoFactorAuth) {
      return sendResponse(res, 400, false, '2FA is not enabled for this account');
    }

    // Generate new recovery token
    const { token, expiresAt } = TwoFactorAuthService.generateRecoveryToken();

    // Store recovery token
    user.twoFactorAuth.recoveryToken = token;
    user.twoFactorAuth.recoveryTokenExpires = expiresAt;

    await user.save();

    sendResponse(res, 200, true, 'Recovery token generated successfully', {
      recoveryToken: token,
      expiresAt,
      message: 'Recovery token generated. Use this token to disable 2FA if you lose access to your authenticator app.'
    });

  } catch (error) {
    logger.error('Error generating recovery token:', error);
    sendResponse(res, 500, false, 'Failed to generate recovery token');
  }
};
