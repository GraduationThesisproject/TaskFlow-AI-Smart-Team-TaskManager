// Environment configuration for Vite
export const env = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  
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
} as const;

// Test token for development (remove in production)
export const TEST_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YTYzZWQ4ZDgyODg3YTU0MzE0NTFlZCIsImlhdCI6MTc1NTczMTMzMCwiZXhwIjoxNzU2MzM2MTMwLCJhdWQiOiJ0YXNrZmxvdy11c2VycyIsImlzcyI6InRhc2tmbG93LWFwaSJ9.SI0I8dgbUI6eB-ezhlnasmh_9p17tlTscbzrEKxbQoQ";

// Test workspace ID for development (remove in production)
export const TEST_WORKSPACE_ID = "68a63eded82887a543145307";

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

// Helper functions for test workspace
export function getTestWorkspaceId(): string {
  return TEST_WORKSPACE_ID;
}

export function isTestEnvironment(): boolean {
  return env.IS_DEV || env.IS_PRODUCTION === false;
}
