const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');
const logger = require('../config/logger');

class TwoFactorAuthService {
  /**
   * Generate a new TOTP secret for a user
   * @param {string} userEmail - User's email address
   * @param {string} appName - Application name for the authenticator app
   * @returns {Object} Secret and QR code data
   */
  static async generateSecret(userEmail, appName = 'TaskFlow AI') {
    try {
      // Generate a new secret
      const secret = speakeasy.generateSecret({
        name: userEmail,
        issuer: appName,
        length: 32
      });

      // Generate QR code URL
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

      return {
        secret: secret.base32,
        otpauthUrl: secret.otpauth_url,
        qrCode: qrCodeUrl
      };
    } catch (error) {
      logger.error('Error generating 2FA secret:', error);
      throw new Error('Failed to generate 2FA secret');
    }
  }

  /**
   * Verify a TOTP token
   * @param {string} token - The 6-digit token from authenticator app
   * @param {string} secret - The user's TOTP secret
   * @param {number} window - Time window for verification (default: 2)
   * @returns {boolean} Whether the token is valid
   */
  static verifyToken(token, secret, window = 2) {
    try {
      return speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token,
        window: window // Allow for 2 time steps (60 seconds) of clock skew
      });
    } catch (error) {
      logger.error('Error verifying 2FA token:', error);
      return false;
    }
  }

  /**
   * Generate backup codes for account recovery
   * @param {number} count - Number of backup codes to generate (default: 10)
   * @returns {Array} Array of backup codes
   */
  static generateBackupCodes(count = 10) {
    try {
      const codes = [];
      for (let i = 0; i < count; i++) {
        // Generate 8-character alphanumeric codes
        const code = crypto.randomBytes(4).toString('hex').toUpperCase();
        codes.push(code);
      }
      return codes;
    } catch (error) {
      logger.error('Error generating backup codes:', error);
      throw new Error('Failed to generate backup codes');
    }
  }

  /**
   * Verify a backup code
   * @param {string} code - The backup code to verify
   * @param {Array} usedCodes - Array of already used backup codes
   * @returns {boolean} Whether the backup code is valid and unused
   */
  static verifyBackupCode(code, usedCodes = []) {
    if (!code || typeof code !== 'string') {
      return false;
    }

    // Check if code format is valid (8 characters, alphanumeric)
    if (!/^[A-F0-9]{8}$/.test(code)) {
      return false;
    }

    // Check if code has already been used
    if (usedCodes.includes(code)) {
      return false;
    }

    return true;
  }

  /**
   * Generate a recovery token for 2FA disable
   * @returns {Object} Recovery token and expiry
   */
  static generateRecoveryToken() {
    try {
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      return {
        token,
        expiresAt
      };
    } catch (error) {
      logger.error('Error generating recovery token:', error);
      throw new Error('Failed to generate recovery token');
    }
  }

  /**
   * Validate recovery token
   * @param {string} token - The recovery token to validate
   * @param {string} storedToken - The stored recovery token
   * @param {Date} expiresAt - The expiry date of the stored token
   * @returns {boolean} Whether the recovery token is valid
   */
  static validateRecoveryToken(token, storedToken, expiresAt) {
    if (!token || !storedToken || !expiresAt) {
      return false;
    }

    // Check if token has expired
    if (new Date() > new Date(expiresAt)) {
      return false;
    }

    // Compare tokens
    return token === storedToken;
  }

  /**
   * Generate a device verification token for "remember this device"
   * @param {string} deviceId - Unique device identifier
   * @param {string} userAgent - User agent string
   * @returns {string} Device verification token
   */
  static generateDeviceToken(deviceId, userAgent) {
    try {
      const data = `${deviceId}:${userAgent}:${Date.now()}`;
      return crypto.createHash('sha256').update(data).digest('hex');
    } catch (error) {
      logger.error('Error generating device token:', error);
      throw new Error('Failed to generate device token');
    }
  }

  /**
   * Validate device token
   * @param {string} token - The device token to validate
   * @param {string} deviceId - The device ID
   * @param {string} userAgent - The user agent
   * @param {number} maxAge - Maximum age of token in milliseconds (default: 30 days)
   * @returns {boolean} Whether the device token is valid
   */
  static validateDeviceToken(token, deviceId, userAgent, maxAge = 30 * 24 * 60 * 60 * 1000) {
    try {
      // Extract timestamp from token (last part after the last colon)
      const parts = token.split(':');
      if (parts.length < 3) {
        return false;
      }

      const timestamp = parseInt(parts[parts.length - 1]);
      if (isNaN(timestamp)) {
        return false;
      }

      // Check if token is too old
      if (Date.now() - timestamp > maxAge) {
        return false;
      }

      // Reconstruct expected token
      const expectedData = `${deviceId}:${userAgent}:${timestamp}`;
      const expectedToken = crypto.createHash('sha256').update(expectedData).digest('hex');

      return token === expectedToken;
    } catch (error) {
      logger.error('Error validating device token:', error);
      return false;
    }
  }
}

module.exports = TwoFactorAuthService;
