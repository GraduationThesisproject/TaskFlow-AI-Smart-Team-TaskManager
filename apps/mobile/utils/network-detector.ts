import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Automatically detect the correct API URL based on platform and environment
 * This eliminates the need to manually update IP addresses when switching devices
 */
export function getNetworkConfig() {
  const isDev = __DEV__;
  const isAndroid = Platform.OS === 'android';
  const isIOS = Platform.OS === 'ios';
  
  // For development, try to detect the network IP
  // In production, use the production URLs
  if (isDev) {
    // Android emulator uses 10.0.2.2 to access host machine
    if (isAndroid) {
      return {
        apiBaseUrl: 'http://10.0.2.2:3001/api',
        baseUrl: 'http://10.0.2.2:3001',
        socketUrl: 'http://10.0.2.2:3001',
        frontendUrl: 'http://10.0.2.2:5173',
      };
    }
    
    // iOS simulator and web can use localhost
    if (isIOS || Platform.OS === 'web') {
      return {
        apiBaseUrl: 'http://localhost:3001/api',
        baseUrl: 'http://localhost:3001',
        socketUrl: 'http://localhost:3001',
        frontendUrl: 'http://localhost:5173',
      };
    }
    
    // For physical devices, try to use environment variables or fallback
    const envApiUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
    if (envApiUrl) {
      const baseUrl = envApiUrl.replace('/api', '');
      return {
        apiBaseUrl: envApiUrl,
        baseUrl: baseUrl,
        socketUrl: baseUrl,
        frontendUrl: baseUrl.replace(':3001', ':5173'),
      };
    }
  }
  
  // Production URLs
  return {
    apiBaseUrl: 'https://api.taskflow.com/api',
    baseUrl: 'https://api.taskflow.com',
    socketUrl: 'https://api.taskflow.com',
    frontendUrl: 'https://taskflow.com',
  };
}

/**
 * Get the current network configuration with fallbacks
 */
export function getApiConfig() {
  const networkConfig = getNetworkConfig();
  
  return {
    // API URLs
    API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || networkConfig.apiBaseUrl,
    API_URL: process.env.EXPO_PUBLIC_API_URL || networkConfig.apiBaseUrl,
    BASE_URL: process.env.EXPO_PUBLIC_BASE_URL || networkConfig.baseUrl,
    SOCKET_URL: process.env.EXPO_PUBLIC_SOCKET_URL || networkConfig.socketUrl,
    
    // Development URLs
    DEVELOPMENT_API_URL: process.env.EXPO_PUBLIC_DEV_API_URL || networkConfig.apiBaseUrl,
    STAGING_API_URL: process.env.EXPO_PUBLIC_STAGING_API_URL || 'https://staging-api.taskflow.com/api',
    PRODUCTION_API_URL: process.env.EXPO_PUBLIC_PROD_API_URL || 'https://api.taskflow.com/api',
    
    // Platform detection
    IS_ANDROID: Platform.OS === 'android',
    IS_IOS: Platform.OS === 'ios',
    IS_WEB: Platform.OS === 'web',
    IS_DEV: __DEV__,
  };
}

/**
 * Log current network configuration for debugging
 */
export function logNetworkConfig() {
  if (__DEV__) {
    const config = getApiConfig();
    console.log('🌐 Network Configuration:', {
      platform: Platform.OS,
      isDev: __DEV__,
      apiBaseUrl: config.API_BASE_URL,
      baseUrl: config.BASE_URL,
      socketUrl: config.SOCKET_URL,
    });
  }
}

