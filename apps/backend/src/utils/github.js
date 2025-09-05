const crypto = require('crypto');
const logger = require('../config/logger');

// Helper function to encrypt GitHub access token
function encryptToken(token) {
  try {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key', 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (error) {
    logger.error('Error encrypting GitHub token:', error);
    throw new Error('Failed to encrypt GitHub token');
  }
}

// Helper function to decrypt GitHub access token
function decryptToken(encryptedToken) {
  try {
    if (!encryptedToken) return null;
    
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key', 'salt', 32);
    const [ivHex, encrypted] = encryptedToken.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    logger.error('Error decrypting GitHub token:', error);
    return null;
  }
}

// Helper function to validate GitHub token format
function isValidGitHubToken(token) {
  return token && typeof token === 'string' && token.length > 0;
}

// Helper function to check if GitHub integration is properly configured
function isGitHubConfigured() {
  return !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET);
}

module.exports = {
  encryptToken,
  decryptToken,
  isValidGitHubToken,
  isGitHubConfigured
};
