const crypto = require('crypto');
const logger = require('../config/logger');

class EncryptionService {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.keyLength = 32; // 256 bits
    this.ivLength = 16; // 128 bits
    this.tagLength = 16; // 128 bits
    this.saltLength = 64; // 512 bits
    
    // Get encryption key from environment
    this.encryptionKey = process.env.ENCRYPTION_KEY;
    
    if (!this.encryptionKey) {
      logger.warn('ENCRYPTION_KEY not found in environment variables. Using fallback key (NOT SECURE FOR PRODUCTION)');
      this.encryptionKey = 'fallback-key-not-secure-for-production-use';
    }
    
    if (this.encryptionKey.length < 32) {
      throw new Error('ENCRYPTION_KEY must be at least 32 characters long');
    }
  }

  /**
   * Generate a secure random key
   */
  generateKey(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate a secure random IV
   */
  generateIV() {
    return crypto.randomBytes(this.ivLength);
  }

  /**
   * Derive a key from the master key and salt
   */
  deriveKey(salt) {
    return crypto.pbkdf2Sync(
      this.encryptionKey,
      salt,
      100000, // iterations
      this.keyLength,
      'sha512'
    );
  }

  /**
   * Encrypt sensitive data
   * @param {string} plaintext - Data to encrypt
   * @returns {string} - Encrypted data in format: salt:iv:tag:ciphertext
   */
  encrypt(plaintext) {
    try {
      if (!plaintext) {
        return null;
      }

      // Generate salt and IV
      const salt = crypto.randomBytes(this.saltLength);
      const iv = this.generateIV();

      // Derive key from master key and salt
      const key = this.deriveKey(salt);

      // Create cipher
      const cipher = crypto.createCipher(this.algorithm, key);
      cipher.setAAD(Buffer.from('TaskFlow Integration', 'utf8'));

      // Encrypt data
      let encrypted = cipher.update(plaintext, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      // Get authentication tag
      const tag = cipher.getAuthTag();

      // Combine all components
      const result = [
        salt.toString('hex'),
        iv.toString('hex'),
        tag.toString('hex'),
        encrypted
      ].join(':');

      return result;
    } catch (error) {
      logger.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt sensitive data
   * @param {string} encryptedData - Data to decrypt in format: salt:iv:tag:ciphertext
   * @returns {string} - Decrypted data
   */
  decrypt(encryptedData) {
    try {
      if (!encryptedData) {
        return null;
      }

      // Split the encrypted data
      const parts = encryptedData.split(':');
      if (parts.length !== 4) {
        throw new Error('Invalid encrypted data format');
      }

      const [saltHex, ivHex, tagHex, ciphertext] = parts;

      // Convert hex strings back to buffers
      const salt = Buffer.from(saltHex, 'hex');
      const iv = Buffer.from(ivHex, 'hex');
      const tag = Buffer.from(tagHex, 'hex');

      // Derive key from master key and salt
      const key = this.deriveKey(salt);

      // Create decipher
      const decipher = crypto.createDecipher(this.algorithm, key);
      decipher.setAAD(Buffer.from('TaskFlow Integration', 'utf8'));
      decipher.setAuthTag(tag);

      // Decrypt data
      let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      logger.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Hash data for comparison (one-way)
   * @param {string} data - Data to hash
   * @returns {string} - Hashed data
   */
  hash(data) {
    if (!data) {
      return null;
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(data, salt, 100000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
  }

  /**
   * Verify hashed data
   * @param {string} data - Plain data
   * @param {string} hashedData - Hashed data to compare against
   * @returns {boolean} - Whether the data matches
   */
  verifyHash(data, hashedData) {
    if (!data || !hashedData) {
      return false;
    }

    try {
      const [salt, hash] = hashedData.split(':');
      const verifyHash = crypto.pbkdf2Sync(data, salt, 100000, 64, 'sha512').toString('hex');
      return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(verifyHash, 'hex'));
    } catch (error) {
      logger.error('Hash verification failed:', error);
      return false;
    }
  }

  /**
   * Generate a secure random string
   * @param {number} length - Length of the string
   * @returns {string} - Random string
   */
  generateRandomString(length = 32) {
    return crypto.randomBytes(length).toString('base64url');
  }

  /**
   * Encrypt API key for storage
   * @param {string} apiKey - API key to encrypt
   * @returns {string} - Encrypted API key
   */
  encryptApiKey(apiKey) {
    if (!apiKey) {
      return null;
    }
    return this.encrypt(apiKey);
  }

  /**
   * Decrypt API key for use
   * @param {string} encryptedApiKey - Encrypted API key
   * @returns {string} - Decrypted API key
   */
  decryptApiKey(encryptedApiKey) {
    if (!encryptedApiKey) {
      return null;
    }
    return this.decrypt(encryptedApiKey);
  }

  /**
   * Check if data is encrypted
   * @param {string} data - Data to check
   * @returns {boolean} - Whether data appears to be encrypted
   */
  isEncrypted(data) {
    if (!data || typeof data !== 'string') {
      return false;
    }
    
    const parts = data.split(':');
    return parts.length === 4 && 
           parts[0].length === this.saltLength * 2 && // hex length
           parts[1].length === this.ivLength * 2 && // hex length
           parts[2].length === this.tagLength * 2; // hex length
  }

  /**
   * Rotate encryption key (for key rotation)
   * @param {string} oldEncryptedData - Data encrypted with old key
   * @returns {string} - Data encrypted with new key
   */
  rotateKey(oldEncryptedData) {
    if (!oldEncryptedData) {
      return null;
    }

    try {
      // Decrypt with old key (this would need the old key to be available)
      const decrypted = this.decrypt(oldEncryptedData);
      
      // Re-encrypt with new key
      return this.encrypt(decrypted);
    } catch (error) {
      logger.error('Key rotation failed:', error);
      throw new Error('Failed to rotate encryption key');
    }
  }
}

// Create singleton instance
const encryptionService = new EncryptionService();

module.exports = encryptionService;
