  import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { env } from './env';

// Create axios instance
// Normalize base URL to ensure it targets the backend API prefix
const rawBase = (env.API_BASE_URL || env.API_URL || '').trim();
const trimmed = rawBase.replace(/\/$/, '');
const baseURL = /\/api$/.test(trimmed) ? trimmed : `${trimmed}/api`;

const axiosInstance: AxiosInstance = axios.create({
  baseURL,
  timeout: 10000,
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage for each request
    const token = localStorage.getItem('token');
    
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
    
    // If sending FormData, let the browser set the multipart Content-Type with boundary
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      if (config.headers) {
        delete (config.headers as any)['Content-Type'];
      }
    } else {
      // For JSON payloads, axios sets Content-Type automatically when needed
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
  (error) => {
    // Handle common errors
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          console.error('Unauthorized access - Token may be invalid or expired');
          localStorage.removeItem('token');
          // Force page reload to trigger auth check
          window.location.href = '/';
          break;
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

export default axiosInstance;
