/*🔐 AuthService.ts - Fully Typed & Refactored*/

//--------------------- Imports --------------------

import axiosInstance from '../config/axios';
import axios from 'axios';
import type { ApiResponse } from '../types/task.types';
import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  OAuthUserData,
  EmailVerificationData,
  ResendVerificationData,
  PasswordResetRequestData,
  PasswordResetData
} from '../types/auth.types';

//------------------- AuthService Class -------------------

export class AuthService {

  // Login user
  static async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await axiosInstance.post('/auth/login', credentials);
      if (response.data.data?.token) localStorage.setItem('token', response.data.data.token);
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

  // Get current profile
  static async getProfile(): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await axiosInstance.get('/auth/me');
      return response.data;
    } catch (error: any) {
      console.error('Error getting profile:', error);
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
      const response = await axiosInstance.post('/auth/logout', { deviceId, allDevices });
      return response.data;
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  }

  // Test connection without auth
  static async testConnection(): Promise<ApiResponse<any>> {
    try {
      const tempAxios = axios.create({ baseURL: 'http://localhost:3001', timeout: 5000 });
      const response = await tempAxios.get('/health');
      return response.data;
    } catch (error) {
      console.error('Error testing connection:', error);
      throw error;
    }
  }

  //------------------- OAuth -------------------
  static async oauthLogin(oauthData: OAuthUserData): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await axiosInstance.post('/auth/oauth/login', oauthData);
      if (response.data.data?.token) localStorage.setItem('token', response.data.data.token);
      return response.data;
    } catch (error) {
      console.error('Error with OAuth login:', error);
      throw error;
    }
  }

  static async oauthRegister(oauthData: OAuthUserData): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await axiosInstance.post('/auth/oauth/register', oauthData);
      if (response.data.data?.token) localStorage.setItem('token', response.data.data.token);
      return response.data;
    } catch (error) {
      console.error('Error with OAuth registration:', error);
      throw error;
    }
  }

  static async oauthTokenExchange(code: string, provider: string, redirectUri: string): Promise<any> {
    try {
      const response = await axiosInstance.post('/auth/oauth/token-exchange', { code, provider, redirectUri });
      return response.data;
    } catch (error) {
      console.error('Error with OAuth token exchange:', error);
      throw error;
    }
  }

  //------------------- Email Verification -------------------
  static async verifyEmail(verificationData: EmailVerificationData): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await axiosInstance.post('/auth/verify-email', verificationData);
      if (response.data.data?.token) localStorage.setItem('token', response.data.data.token);
      return response.data;
    } catch (error) {
      console.error('Error verifying email:', error);
      throw error;
    }
  }

  static async resendVerificationCode(resendData: ResendVerificationData): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await axiosInstance.post('/auth/resend-verification', resendData);
      return response.data;
    } catch (error) {
      console.error('Error resending verification code:', error);
      throw error;
    }
  }

  //------------------- Password Reset -------------------
  static async requestPasswordReset(resetData: PasswordResetRequestData): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await axiosInstance.post('/auth/password-reset/request', resetData);
      return response.data;
    } catch (error) {
      console.error('Error requesting password reset:', error);
      throw error;
    }
  }

  static async resetPassword(resetData: PasswordResetData): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await axiosInstance.post('/auth/password-reset/confirm', resetData);
      return response.data;
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }

//------------------- Secure Profile & Preferences -------------------
static async updateProfile({
  name,
  currentPassword,
  avatar,
}: {
  name?: string;
  currentPassword: string;
  avatar?: File | null;
}) {
  const formData = new FormData();
  formData.append('currentPassword', currentPassword);

  if (name) formData.append('name', name);
  if (avatar) formData.append('avatar', avatar);

  const response = await axiosInstance.put('/auth/profile/secure', formData, {
    withCredentials: true,
    timeout: 30000,
    validateStatus: (status) => status < 500,
  });
  return response.data;
}





  static async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.put('/auth/change-password', { currentPassword, newPassword });
      return response.data;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }

  static async updatePreferences(section: string, updates: any): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.put('/auth/preferences', { section, updates });
      return response.data;
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  }

  static async getSessions(): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.get('/auth/sessions');
      return response.data;
    } catch (error) {
      console.error('Error fetching sessions:', error);
      throw error;
    }
  }

  static async endSession(sessionId: string): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.delete(`/auth/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Error ending session:', error);
      throw error;
    }
  }

  static async getActivity(): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.get('/auth/activity');
      return response.data;
    } catch (error) {
      console.error('Error fetching activity:', error);
      throw error;
    }
  }
}
