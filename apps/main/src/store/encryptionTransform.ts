import { createTransform } from 'redux-persist';
import CryptoJS from 'crypto-js';
import { env } from '../config/env';

const secretKey = env.VITE_PERSIST_SECRET || 'fallback-secret-key';

export const persistEncryptTransform = createTransform(
  // Transform state on its way to being serialized and persisted
  (inboundState, key) => {
    try {
      const encrypted = CryptoJS.AES.encrypt(JSON.stringify(inboundState), secretKey).toString();
      return encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
      return inboundState;
    }
  },
  // Transform state being rehydrated
  (outboundState, key) => {
    try {
      const bytes = CryptoJS.AES.decrypt(outboundState, secretKey);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Decryption error:', error);
      return outboundState;
    }
  },
  // Define which reducers this transform should be applied to
  { whitelist: ['auth'] }
);
