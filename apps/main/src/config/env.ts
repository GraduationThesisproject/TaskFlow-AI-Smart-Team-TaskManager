// Environment configuration for Vite
export const env = {
  // Server Configuration
  NODE_ENV: import.meta.env.VITE_NODE_ENV || 'development',
  PORT: parseInt(import.meta.env.VITE_PORT || '5173', 10),
  
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001',
  
  // App Configuration
  APP_NAME: import.meta.env.VITE_APP_NAME || 'TaskFlow',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  BASE_URL: import.meta.env.VITE_BASE_URL || 'http://localhost:5173',
  
  // Feature Flags
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  ENABLE_DEBUG: import.meta.env.VITE_ENABLE_DEBUG === 'true',
  
  // OAuth Configuration
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '',
  GOOGLE_CALLBACK_URL: import.meta.env.VITE_GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/google/callback',
  GITHUB_CLIENT_ID: import.meta.env.VITE_GITHUB_CLIENT_ID || '',
  GITHUB_CLIENT_SECRET: import.meta.env.VITE_GITHUB_CLIENT_SECRET || '',
  GITHUB_CALLBACK_URL: import.meta.env.VITE_GITHUB_CALLBACK_URL || 'http://localhost:3001/api/auth/github/callback',
  
  // Storage Configuration
  UPLOAD_DIR: import.meta.env.VITE_UPLOAD_DIR || 'uploads',
  MAX_FILE_SIZE: parseInt(import.meta.env.VITE_MAX_FILE_SIZE || '10485760', 10),
  
  // Development Tools
  IS_DEV: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
  ENABLE_DEVTOOLS: import.meta.env.VITE_ENABLE_DEVTOOLS === 'true',
  ENABLE_API_MOCKING: import.meta.env.VITE_ENABLE_API_MOCKING === 'true',
  
  // Build Info
  BUILD_TIME: import.meta.env.VITE_BUILD_TIME,
  COMMIT_HASH: import.meta.env.VITE_COMMIT_HASH,
  MODE: import.meta.env.MODE,



} as const;




// Type-safe environment variables
export type Env = typeof env;

// Helper function to get environment variable with type safety and fallback
export function getEnvVar<T extends keyof Env>(key: T, fallback?: Env[T]): Env[T] {
  return env[key] ?? fallback ?? ('' as Env[T]);
}

// Helper function to check if feature is enabled
export function isFeatureEnabled(feature: keyof Pick<Env, 
  'ENABLE_ANALYTICS' | 
  'ENABLE_DEBUG' | 
  'ENABLE_DEVTOOLS' | 
  'ENABLE_API_MOCKING'
>): boolean {
  return env[feature] === true;
}

// Helper function to get API URLs
export function getApiUrl(path: string = ''): string {
  return `${env.API_BASE_URL}${path}`;
}

// Helper function to check environment
export function isEnvironment(environment: 'development' | 'production' | 'test'): boolean {
  return env.NODE_ENV === environment;
}

// Helper to get file size in readable format
export function getMaxFileSize(): string {
  const bytes = env.MAX_FILE_SIZE;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Byte';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
  return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
}


