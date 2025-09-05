import { createTransform } from 'redux-persist';
import CryptoJS from 'crypto-js';

// Encryption key - in production, this should be stored securely
const ENCRYPTION_KEY = 'taskflow-mobile-encryption-key-2024';

export const persistEncryptTransform = createTransform(
  // Transform state on its way to being serialized and persisted
  (inboundState, key) => {
    try {
      const serializedState = JSON.stringify(inboundState);
      const encryptedState = CryptoJS.AES.encrypt(serializedState, ENCRYPTION_KEY).toString();
      return encryptedState;
    } catch (error) {
      console.error('Error encrypting state:', error);
      return inboundState;
    }
  },
  // Transform state being rehydrated
  (outboundState, key) => {
    try {
      if (typeof outboundState === 'string') {
        const decryptedState = CryptoJS.AES.decrypt(outboundState, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
        return JSON.parse(decryptedState);
      }
      return outboundState;
    } catch (error) {
      console.error('Error decrypting state:', error);
      return outboundState;
    }
  },
  // Define which reducers this transform should be applied to
  {
    whitelist: ['auth', 'workspace', 'boards', 'spaces']
  }
);
