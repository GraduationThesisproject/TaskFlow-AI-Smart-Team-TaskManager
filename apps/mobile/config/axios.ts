import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { env } from './env';
import { Platform } from 'react-native';

// Create axios instance
// Normalize base URL to ensure it targets the backend API prefix
let rawBase = (env.API_BASE_URL || env.API_URL || env.BASE_URL || 'http://192.168.1.14:3001').trim();

// On Android emulator, localhost should point to the host machine via 10.0.2.2
if (env.IS_ANDROID && __DEV__) {
  rawBase = rawBase
    .replace('http://localhost', 'http://10.0.2.2')
    .replace('http://127.0.0.1', 'http://10.0.2.2');
}

const trimmed = rawBase.replace(/\/$/, '');
const baseURL = /\/api$/.test(trimmed) ? trimmed : `${trimmed}/api`;

// In development, log the resolved base URL to catch stale configs
if (__DEV__) {
  console.log('🛠️ Axios base URL resolved to:', baseURL);
}

// Ensure we have a stable device id for session tracking
async function getOrCreateDeviceId(): Promise<string> {
  try {
    const saved = await AsyncStorage.getItem('deviceId');
    if (saved) return saved;
    const generated = `rn-${Platform.OS}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    await AsyncStorage.setItem('deviceId', generated);
    return generated;
  } catch {
    // Fallback if storage fails
    return `rn-${Platform.OS}-${Date.now().toString(36)}`;
  }
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
    let token = await AsyncStorage.getItem('token');

    // DEV fallback token: allows testing protected endpoints before login
    const DEV_TOKEN = (env as any).DEV_TOKEN || (env as any).DEV_AUTH_TOKEN || (env as any).API_DEV_TOKEN;
    if (!token && __DEV__ && DEV_TOKEN) {
      token = DEV_TOKEN as string;
      if (env.ENABLE_DEBUG) {
        console.warn('⚠️ Using DEV_TOKEN from env for Authorization (development only).');
      }
    }


    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add device info headers for mobile
    const deviceId = env.DEVICE_ID || await getOrCreateDeviceId();
    config.headers['X-Platform'] = env.PLATFORM;
    config.headers['X-App-Version'] = env.APP_VERSION;
    // Set both header variants to satisfy different middlewares
    config.headers['X-Device-Id'] = deviceId; // existing
    config.headers['X-Device-ID'] = deviceId; // backend expects capital ID

    // If sending FormData, let React Native set the multipart Content-Type with boundary
    if (config.data instanceof FormData) {
      if (config.headers) {
        delete (config.headers as any)['Content-Type'];
      }
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