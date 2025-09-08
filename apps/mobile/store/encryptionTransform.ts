// Temporarily disable encryption to fix the import issues
// This will be re-enabled once the package import is fixed

// Encryption key - in production, this should be stored securely
const ENCRYPTION_KEY = 'taskflow-mobile-encryption-key-2024';

// Export null for now to disable encryption
export const persistEncryptTransform = null;

// TODO: Re-enable encryption once the package import issue is resolved
// The correct implementation should be:
// import createEncryptor from 'redux-persist-transform-encrypt';
// export const persistEncryptTransform = createEncryptor({
//   secretKey: ENCRYPTION_KEY,
//   onError: (error) => {
//     console.error('Encryption error:', error);
//   }
// });
