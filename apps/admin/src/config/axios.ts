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
          localStorage.removeItem('adminToken');
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
