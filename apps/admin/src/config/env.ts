// Environment configuration
export const env = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api',
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001',
  
  // App Configuration
  APP_NAME: import.meta.env.VITE_APP_NAME || 'TaskFlow Admin',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  
  // Feature Flags
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  ENABLE_NOTIFICATIONS: import.meta.env.VITE_ENABLE_NOTIFICATIONS === 'true',
  ENABLE_ADMIN_FEATURES: import.meta.env.VITE_ENABLE_ADMIN_FEATURES === 'true',
  ENABLE_POWERBI: import.meta.env.VITE_ENABLE_POWERBI === 'true',
  
  // Power BI Configuration
  POWERBI_CLIENT_ID: import.meta.env.VITE_POWERBI_CLIENT_ID || '',
  POWERBI_TENANT_ID: import.meta.env.VITE_POWERBI_TENANT_ID || '',
  POWERBI_WORKSPACE_ID: import.meta.env.VITE_POWERBI_WORKSPACE_ID || '',
  
  // Development
  DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE === 'true',
  NODE_ENV: import.meta.env.MODE,
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
};

export default env;
