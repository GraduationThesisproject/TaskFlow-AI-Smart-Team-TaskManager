import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { env } from './env';

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage
    const token = localStorage.getItem('adminToken');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    

    
    return config;
  },
  (error) => {
    console.error('Admin request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - redirect to admin login
          // Clear all admin-related data
          const keysToRemove = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (
              key.includes('admin') ||
              key.includes('taskflow') ||
              key.includes('auth') ||
              key.includes('user') ||
              key.includes('workspace') ||
              key.includes('board') ||
              key.includes('space') ||
              key.includes('language') ||
              key.includes('direction') ||
              key.includes('test-') // Remove test keys
            )) {
              keysToRemove.push(key);
            }
          }
          
          // Remove identified keys
          keysToRemove.forEach(key => localStorage.removeItem(key));
          window.location.href = '/login';
          break;
        case 403:
          // Forbidden - admin access denied
          console.error('Admin access forbidden');
          break;
        case 404:
          // Not found
          console.error('Admin resource not found');
          break;
        case 500:
          // Server error
          console.error('Admin server error');
          break;
        default:
          console.error('Admin API Error:', status, data);
      }
    } else if (error.request) {
      // Network error
      console.error('Admin network error:', error.request);
    } else {
      // Other error
      console.error('Admin error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
