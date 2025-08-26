// Environment configuration for Vite
export const env = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',

  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001',
  
  // App Configuration
  APP_NAME: import.meta.env.VITE_APP_NAME || 'TaskFlow',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  
  // Feature Flags
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  ENABLE_DEBUG: import.meta.env.VITE_ENABLE_DEBUG === 'true',
  
  // Development
  IS_DEV: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
  
  // Build Info
  BUILD_TIME: import.meta.env.VITE_BUILD_TIME,
  COMMIT_HASH: import.meta.env.VITE_COMMIT_HASH,
  VITE_GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  VITE_GOOGLE_CLIENT_SECRET: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
  NODE_ENV: import.meta.env.NODE_ENV,
  MODE: import.meta.env.MODE
} as const;

// Development helpers (remove in production)
// These are only used for testing and development purposes
// Test workspace ID (you can update this based on your seeded data)
export const TEST_WORKSPACE_ID = "68a63eded82887a543145307";

// Test user ID (you can update this based on your seeded data)
export const TEST_USER_ID = "68a640b2c0902fc81fde876a";

// Test space ID (you can update this based on your seeded data)
export const TEST_SPACE_ID = "68a63eded82887a543145308";

// Test board ID (you can update this based on your seeded data)
export const TEST_BOARD_ID = "68a63eded82887a543145309";

/**
 * Get the test workspace ID
 */
export function getTestWorkspaceId(): string {
  return TEST_WORKSPACE_ID;
}

/**
 * Get the test user ID
 */
export function getTestUserId(): string {
  return TEST_USER_ID;
}

/**
 * Get the test space ID
 */
export function getTestSpaceId(): string {
  return TEST_SPACE_ID;
}

/**
 * Get the test board ID
 */
export function getTestBoardId(): string {
  return TEST_BOARD_ID;
}

// Type-safe environment variables
export type Env = typeof env;

// Helper function to get environment variable with fallback
export function getEnvVar(key: keyof Env, fallback?: string): string {
  return env[key] || fallback || '';
}

// Helper function to check if feature is enabled
export function isFeatureEnabled(feature: keyof Pick<Env, 'ENABLE_ANALYTICS' | 'ENABLE_DEBUG'>): boolean {
  return env[feature] === true;
}


