import axiosInstance from '../config/axios';
import axios from 'axios';
import type { ApiResponse } from '../types/task.types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: any;
  refreshToken?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export class AuthService {
  // Login user
  static async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await axiosInstance.post('/auth/login', credentials);
      
      // Store token in localStorage
      if (response.data.data?.token) {
        localStorage.setItem('token', response.data.data.token);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  }

  // Register user
  static async register(data: RegisterData): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await axiosInstance.post('/auth/register', data);
      return response.data;
    } catch (error) {
      console.error('Error registering:', error);
      throw error;
    }
  }

  // Get current user profile
  static async getProfile(): Promise<ApiResponse<any>> {
    try {
      console.log('🔍 AuthService.getProfile: Making request to /auth/me');
      console.log('🔍 AuthService.getProfile: Base URL:', axiosInstance.defaults.baseURL);
      console.log('🔍 AuthService.getProfile: Headers:', axiosInstance.defaults.headers);
      
      const response = await axiosInstance.get('/auth/me');
      console.log('✅ AuthService.getProfile: Success:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ AuthService.getProfile: Error:', error);
      console.error('❌ AuthService.getProfile: Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
      throw error;
    }
  }

  // Refresh token
  static async refreshToken(refreshToken: string): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await axiosInstance.post('/auth/refresh', { refreshToken });
      return response.data;
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  }

  // Logout
  static async logout(deviceId?: string, allDevices: boolean = false): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.post('/auth/logout', {
        deviceId,
        allDevices
      });
      return response.data;
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  }

  // Test connection without auth
  static async testConnection(): Promise<ApiResponse<any>> {
    try {
      // Create a temporary axios instance without auth headers
      const tempAxios = axios.create({
        baseURL: 'http://localhost:3001',
        timeout: 5000,
      });
      
      const response = await tempAxios.get('/health');
      return response.data;
    } catch (error) {
      console.error('Error testing connection:', error);
      throw error;
    }
  }
}
