import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { env } from './env';

// Create axios instance
// Normalize base URL to ensure it targets the backend API prefix
const rawBase = (env.API_BASE_URL || env.API_URL || '').trim();
const trimmed = rawBase.replace(/\/$/, '');
// Ensure the URL has a proper scheme (http:// or https://)
const baseURL = /\/api$/.test(trimmed) ? trimmed : `${trimmed}/api`;

// Debug logging to see what URL is being used
if (env.ENABLE_DEBUG) {
  console.log('🔧 Axios Base URL Configuration:', {
    rawBase,
    trimmed,
    baseURL,
    envAPI_BASE_URL: env.API_BASE_URL,
    envAPI_URL: env.API_URL
  });
}

const axiosInstance: AxiosInstance = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Get token from AsyncStorage for each request
    const token = await AsyncStorage.getItem('token');
    
    if (env.ENABLE_DEBUG) {
      console.log('🔍 Axios Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        fullURL: `${config.baseURL}${config.url}`,
        hasToken: !!token,
        tokenPreview: token ? token.substring(0, 20) + '...' : 'none'
      });
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      if (env.ENABLE_DEBUG) {
        console.log('🔑 Token added to request headers');
      }
    }
    
    // Add device info headers for mobile
    config.headers['X-Platform'] = env.PLATFORM;
    config.headers['X-App-Version'] = env.APP_VERSION;
    config.headers['X-Device-Id'] = env.DEVICE_ID || 'unknown';
    
    // If sending FormData, let React Native set the multipart Content-Type with boundary
    if (config.data instanceof FormData) {
      if (config.headers) {
        delete (config.headers as any)['Content-Type'];
      }
    }
    
    // Optional extra request log in debug mode
    if (env.ENABLE_DEBUG) {
      console.log('📡 Making request to:', `${config.baseURL}${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Add debug logging when explicitly enabled
    if (env.ENABLE_DEBUG) {
      console.log('✅ Axios Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data
      });
    }
    
    return response;
  },
  async (error) => {
    // Handle common errors
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          if (env.ENABLE_DEBUG) {
            console.warn('🔐 Unauthorized access - Token may be invalid or expired');
          }
          await AsyncStorage.removeItem('token');
          // In React Native, we need to handle navigation differently
          // This will be handled by the app's navigation system
          break;
        case 403:
          // Forbidden - user doesn't have permission for this resource
          if (env.ENABLE_DEBUG) {
            console.warn('🚫 Access forbidden - insufficient permissions for this resource');
          }
          break;
        case 404:
          // Not found
          if (env.ENABLE_DEBUG) {
            console.warn('🔍 Resource not found:', error.config?.url);
          }
          break;
        case 500:
          // Server error
          if (env.ENABLE_DEBUG) {
            console.error('🔥 Server error:', data?.message || 'Internal server error');
          }
          break;
        case 503:
          // Service unavailable
          if (env.ENABLE_DEBUG) {
            console.warn('⏳ Service temporarily unavailable');
          }
          break;
        default:
          if (env.ENABLE_DEBUG) {
            console.warn('⚠️ API Error:', status, data);
          }
      }
    } else if (error.request) {
      // Network error
      if (env.ENABLE_DEBUG) {
        console.warn('🌐 Network error - check your internet connection');
      }
    } else {
      // Other error
      if (env.ENABLE_DEBUG) {
        console.warn('❓ Request setup error:', error.message);
      }
    }
    
    return Promise.reject(error);
  }
);

// Helper function to set auth token
export async function setAuthToken(token: string): Promise<void> {
  await AsyncStorage.setItem('token', token);
  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Helper function to clear auth token
export async function clearAuthToken(): Promise<void> {
  await AsyncStorage.removeItem('token');
  delete axiosInstance.defaults.headers.common['Authorization'];
}

// Set auth header for current process only (no persistence)
export function setAuthHeaderOnly(token: string): void {
  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Helper function to get auth token
export async function getAuthToken(): Promise<string | null> {
  return await AsyncStorage.getItem('token');
}

// Helper function to check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const token = await AsyncStorage.getItem('token');
  return !!token;
}

// Helper function to refresh token
export async function refreshToken(): Promise<boolean> {
  try {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    if (!refreshToken) {
      return false;
    }
    
    const response = await axiosInstance.post('/auth/refresh', {
      refreshToken,
    });
    
    const { accessToken } = response.data;
    await setAuthToken(accessToken);
    return true;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    await clearAuthToken();
    return false;
  }
}

export default axiosInstance;
