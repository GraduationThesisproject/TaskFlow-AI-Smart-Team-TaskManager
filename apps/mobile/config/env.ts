import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { getApiConfig, logNetworkConfig } from '../utils/network-detector';

// Get automatic network configuration
const networkConfig = getApiConfig();

// Environment configuration for React Native/Expo
export const env = {
  // Server Configuration
  NODE_ENV: __DEV__ ? 'development' : 'production',
  PORT: 3001,
    
  // API Configuration - Auto-detected
  API_BASE_URL: networkConfig.API_BASE_URL,
  API_URL: networkConfig.API_URL,
  SOCKET_URL: networkConfig.SOCKET_URL,
  BASE_URL: networkConfig.BASE_URL,
  
  // App Configuration
  APP_NAME: Constants.expoConfig?.name || 'TaskFlow',
  APP_VERSION: Constants.expoConfig?.version || '1.0.0',
  
  // Feature Flags
  ENABLE_ANALYTICS: process.env.EXPO_PUBLIC_ENABLE_ANALYTICS === 'true' || Constants.expoConfig?.extra?.enableAnalytics === true,
  ENABLE_DEBUG: __DEV__,
  
  // OAuth Configuration
  GOOGLE_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || Constants.expoConfig?.extra?.googleClientId || '625288272720-qem1ue46j75pt272mab8f35baimqgeag.apps.googleusercontent.com',
  GOOGLE_CLIENT_SECRET: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_SECRET || Constants.expoConfig?.extra?.googleClientSecret || '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',
  GOOGLE_CALLBACK_URL: process.env.EXPO_PUBLIC_GOOGLE_CALLBACK_URL || Constants.expoConfig?.extra?.googleCallbackUrl || 'taskflow://auth/google/callback',
  GITHUB_CLIENT_ID: process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID || Constants.expoConfig?.extra?.githubClientId || 'Ov23liwZN5YwJ4eZvffU',
  GITHUB_CLIENT_SECRET: process.env.EXPO_PUBLIC_GITHUB_CLIENT_SECRET || Constants.expoConfig?.extra?.githubClientSecret || '1b3a20e1252907cce61a9e382c33f90142a8e73b',
  GITHUB_CALLBACK_URL: process.env.EXPO_PUBLIC_GITHUB_CALLBACK_URL || Constants.expoConfig?.extra?.githubCallbackUrl || 'taskflow://auth/github/callback',
  
  // Storage Configuration
  UPLOAD_DIR: 'uploads',
  MAX_FILE_SIZE: 10485760, // 10MB
  
  // Development Tools
  IS_DEV: __DEV__,
  IS_PRODUCTION: !__DEV__,
  ENABLE_DEVTOOLS: __DEV__,
  ENABLE_API_MOCKING: false, // Disabled to use real authentication from team
  
  // Build Info
  BUILD_TIME: process.env.EXPO_PUBLIC_BUILD_TIME || Constants.expoConfig?.extra?.buildTime,
  COMMIT_HASH: process.env.EXPO_PUBLIC_COMMIT_HASH || Constants.expoConfig?.extra?.commitHash,
  
  // Platform specific
  PLATFORM: Platform.OS,
  IS_IOS: Platform.OS === 'ios',
  IS_ANDROID: Platform.OS === 'android',
  
  // Device Info
  DEVICE_ID: process.env.EXPO_PUBLIC_DEVICE_ID || Constants.expoConfig?.extra?.deviceId,
  DEVICE_NAME: process.env.EXPO_PUBLIC_DEVICE_NAME || Constants.expoConfig?.extra?.deviceName,
  
  // App Store URLs
  APP_STORE_URL: process.env.EXPO_PUBLIC_APP_STORE_URL || Constants.expoConfig?.extra?.appStoreUrl,
  PLAY_STORE_URL: process.env.EXPO_PUBLIC_PLAY_STORE_URL || Constants.expoConfig?.extra?.playStoreUrl,
  
  // Deep Linking
  DEEP_LINK_SCHEME: Constants.expoConfig?.scheme || 'taskflow',
  DEEP_LINK_HOST: process.env.EXPO_PUBLIC_DEEP_LINK_HOST || Constants.expoConfig?.extra?.deepLinkHost || 'taskflow.com',
  
  // Push Notifications
  PUSH_NOTIFICATION_TOKEN: process.env.EXPO_PUBLIC_PUSH_NOTIFICATION_TOKEN || Constants.expoConfig?.extra?.pushNotificationToken,
  
  // Analytics
  ANALYTICS_ID: process.env.EXPO_PUBLIC_ANALYTICS_ID || Constants.expoConfig?.extra?.analyticsId,
  
  // Crash Reporting
  CRASH_REPORTING_ENABLED: process.env.EXPO_PUBLIC_CRASH_REPORTING_ENABLED === 'true' || Constants.expoConfig?.extra?.crashReportingEnabled === true,
  
  // Performance Monitoring
  PERFORMANCE_MONITORING_ENABLED: process.env.EXPO_PUBLIC_PERFORMANCE_MONITORING_ENABLED === 'true' || Constants.expoConfig?.extra?.performanceMonitoringEnabled === true,
  
  // Environment specific URLs
  DEVELOPMENT_API_URL: process.env.EXPO_PUBLIC_DEV_API_URL || 'http://localhost:3001/api',
  STAGING_API_URL: process.env.EXPO_PUBLIC_STAGING_API_URL || 'https://staging-api.taskflow.com/api',
  PRODUCTION_API_URL: process.env.EXPO_PUBLIC_PROD_API_URL || 'https://api.taskflow.com/api',
  
  // Feature toggles
  ENABLE_PUSH_NOTIFICATIONS: process.env.EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS === 'true' || Constants.expoConfig?.extra?.enablePushNotifications === true,
  ENABLE_DEEP_LINKING: process.env.EXPO_PUBLIC_ENABLE_DEEP_LINKING === 'true' || Constants.expoConfig?.extra?.enableDeepLinking === true,
  ENABLE_BIOMETRIC_AUTH: process.env.EXPO_PUBLIC_ENABLE_BIOMETRIC_AUTH === 'true' || Constants.expoConfig?.extra?.enableBiometricAuth === true,
  
  // Third-party services
  SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN || Constants.expoConfig?.extra?.sentryDsn,
  MIXPANEL_TOKEN: process.env.EXPO_PUBLIC_MIXPANEL_TOKEN || Constants.expoConfig?.extra?.mixpanelToken,
  AMPLITUDE_API_KEY: process.env.EXPO_PUBLIC_AMPLITUDE_API_KEY || Constants.expoConfig?.extra?.amplitudeApiKey,
  
  // App configuration
  DEFAULT_LANGUAGE: process.env.EXPO_PUBLIC_DEFAULT_LANGUAGE || 'en',
  SUPPORTED_LANGUAGES: (process.env.EXPO_PUBLIC_SUPPORTED_LANGUAGES || 'en,es,fr').split(','),
  DEFAULT_THEME: process.env.EXPO_PUBLIC_DEFAULT_THEME || 'system',
  
} as const;

// Type-safe environment variables
export type Env = typeof env;

// Helper function to get environment variable with type safety and fallback
export function getEnvVar<T extends keyof Env>(key: T, fallback?: Env[T]): Env[T] {
  // Provide smart fallbacks for base URLs at runtime
  if ((key === 'API_BASE_URL' || key === 'API_URL') && (env[key] as any) == null) {
    return env.API_BASE_URL as any;
  }
  if (key === 'SOCKET_URL' && (env[key] as any) == null) {
    return env.SOCKET_URL as any;
  }
  if (key === 'BASE_URL' && (env[key] as any) == null) {
    return env.BASE_URL as any;
  }
  if (key === 'DEVELOPMENT_API_URL' && (env[key] as any) == null) {
    return env.API_BASE_URL as any;
  }
  return (env[key] ?? fallback ?? ('' as Env[T]));
}

// Helper function to check if feature is enabled
export function isFeatureEnabled(feature: keyof Pick<Env, 
  'ENABLE_ANALYTICS' | 
  'ENABLE_DEBUG' | 
  'ENABLE_DEVTOOLS' | 
  'ENABLE_API_MOCKING' |
  'CRASH_REPORTING_ENABLED' |
  'PERFORMANCE_MONITORING_ENABLED' |
  'ENABLE_PUSH_NOTIFICATIONS' |
  'ENABLE_DEEP_LINKING' |
  'ENABLE_BIOMETRIC_AUTH'
>): boolean {
  return env[feature] === true;
}

// Helper function to get API URLs based on environment
export function getApiUrl(path: string = ''): string {
  const baseUrl = env.IS_DEV ? getEnvVar('DEVELOPMENT_API_URL') : 
                 env.IS_PRODUCTION ? getEnvVar('PRODUCTION_API_URL') : 
                 getEnvVar('STAGING_API_URL');
  return `${baseUrl}${path}`;
}

// Helper function to check environment
export function isEnvironment(environment: 'development' | 'production' | 'test'): boolean {
  return env.NODE_ENV === environment;
}

// Helper to get file size in readable format
export function getMaxFileSize(): string {
  const bytes = env.MAX_FILE_SIZE;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes <= 0) return '0 Byte';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
  return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
}

// Helper to get platform-specific configuration
export function getPlatformConfig<T>(config: {
  ios?: T;
  android?: T;
  default?: T;
}): T {
  if (env.IS_IOS && config.ios !== undefined) {
    return config.ios;
  }
  if (env.IS_ANDROID && config.android !== undefined) {
    return config.android;
  }
  return config.default as T;
}

// Helper to check if running on simulator/emulator
export function isSimulator(): boolean {
  return Constants.expoConfig?.extra?.isSimulator === true;
}

// Helper to get app bundle identifier
export function getBundleIdentifier(): string {
  return Constants.expoConfig?.ios?.bundleIdentifier || 
         Constants.expoConfig?.android?.package || 
         'com.taskflow.app';
}

// Helper to get environment-specific configuration
export function getEnvironmentConfig() {
  return {
    isDevelopment: env.IS_DEV,
    isProduction: env.IS_PRODUCTION,
    isStaging: !env.IS_DEV && !env.IS_PRODUCTION,
    apiUrl: getApiUrl(),
    socketUrl: getEnvVar('SOCKET_URL'),
    enableDebug: env.ENABLE_DEBUG,
    enableAnalytics: env.ENABLE_ANALYTICS,
  };
}

// Helper to validate environment configuration
export function validateEnvironment(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check required API URLs
  if (!getEnvVar('API_BASE_URL')) {
    errors.push('API_BASE_URL is required');
  }
  
  // Check OAuth configuration
  if (!env.GOOGLE_CLIENT_ID) {
    errors.push('GOOGLE_CLIENT_ID is required for Google OAuth');
  }
  
  if (!env.GITHUB_CLIENT_ID) {
    errors.push('GITHUB_CLIENT_ID is required for GitHub OAuth');
  }
  
  // Check deep linking configuration
  if (!env.DEEP_LINK_SCHEME) {
    errors.push('DEEP_LINK_SCHEME is required for deep linking');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Export environment validation on load
if (__DEV__) {
  const validation = validateEnvironment();
  if (!validation.isValid) {
    console.warn('⚠️ Environment configuration issues:', validation.errors);
  }
  
  // Log network configuration for debugging
  logNetworkConfig();
}