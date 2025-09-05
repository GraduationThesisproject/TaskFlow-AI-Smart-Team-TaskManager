import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { env } from './env';

// Create axios instance
// Normalize base URL to ensure it targets the backend API prefix
let rawBase = (env.API_BASE_URL || env.API_URL || '').trim();

// On Android emulator, localhost should point to the host machine via 10.0.2.2
if (env.IS_ANDROID && __DEV__) {
  rawBase = rawBase
    .replace('http://localhost', 'http://10.0.2.2')
    .replace('http://127.0.0.1', 'http://10.0.2.2');
}

const trimmed = rawBase.replace(/\/$/, '');
const baseURL = /\/api$/.test(trimmed) ? trimmed : `${trimmed}/api`;

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
    let token = await AsyncStorage.getItem('token');

    // DEV fallback token: allows testing protected endpoints before login
    const DEV_TOKEN = (env as any).DEV_TOKEN || (env as any).DEV_AUTH_TOKEN || (env as any).API_DEV_TOKEN;
    if (!token && __DEV__ && DEV_TOKEN) {
      token = DEV_TOKEN as string;
      if (env.ENABLE_DEBUG) {
        console.warn('⚠️ Using DEV_TOKEN from env for Authorization (development only).');
      }
    }
    
    if (env.ENABLE_DEBUG) {
      console.log('🔍 Axios Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        fullURL: `${config.baseURL}${config.url}`,
        hasToken: !!token
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
    const originalRequest = error?.config;

    // Handle common errors
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401: {
          // Attempt a single refresh+retry if we have a refresh token and haven't retried yet
          if (!originalRequest?._retry) {
            originalRequest._retry = true;
            try {
              const refreshToken = await AsyncStorage.getItem('refreshToken');
              if (refreshToken) {
                if (env.ENABLE_DEBUG) console.log('🔁 Attempting token refresh...');
                const refreshResp = await axiosInstance.post('/auth/refresh', { refreshToken });
                const accessToken = refreshResp?.data?.data?.token || refreshResp?.data?.accessToken;
                const newRefresh = refreshResp?.data?.data?.refreshToken || refreshResp?.data?.refreshToken;
                if (accessToken) {
                  await AsyncStorage.setItem('token', accessToken);
                  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                  originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
                }
                if (newRefresh) {
                  await AsyncStorage.setItem('refreshToken', newRefresh);
                }
                if (env.ENABLE_DEBUG) console.log('🔁 Refresh successful. Retrying original request...');
                return axiosInstance(originalRequest);
              }
            } catch (refreshErr) {
              console.error('🔁 Refresh failed:', refreshErr);
            }
          }
          // Unauthorized - clear token; navigation handled elsewhere
          console.error('Unauthorized access - Token may be invalid or expired');
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('refreshToken');
          break;
        }
        case 403:
          // Forbidden
          console.error('Access forbidden');
          break;
        case 404:
          // Not found
          console.error('Resource not found');
          break;
        case 500:
          // Server error
          console.error('Server error');
          break;
        case 503:
          // Service unavailable
          console.error('Service temporarily unavailable');
          break;
        default:
          console.error('API Error:', status, data);
      }
    } else if (error.request) {
      // Network error
      console.error('Network error:', error.request);
    } else {
      // Other error
      console.error('Error:', error.message);
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
