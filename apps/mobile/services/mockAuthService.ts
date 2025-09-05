// Mock Authentication Service for Testing
// This provides a static login account until the full authentication system is ready

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ApiResponse } from '../types/task.types';
import type { AuthResponse, LoginCredentials } from '../types/auth.types';

// Static test account
const STATIC_TEST_ACCOUNT = {
  email: 'test@taskflow.com',
  password: 'test123',
  user: {
    id: 'test-user-123',
    name: 'Test User',
    email: 'test@taskflow.com',
    avatar: 'https://via.placeholder.com/150',
    role: 'member',
    isActive: true,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  },
  token: 'mock-jwt-token-' + Date.now(),
  refreshToken: 'mock-refresh-token-' + Date.now(),
};

export class MockAuthService {
  // Mock login - accepts static credentials
  static async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    console.log('🔧 MockAuthService: Processing login request');
    console.log('📧 Email:', credentials.email);
    console.log('🔑 Password:', credentials.password ? '***' : 'empty');

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if credentials match our static account
    if (credentials.email === STATIC_TEST_ACCOUNT.email && 
        credentials.password === STATIC_TEST_ACCOUNT.password) {
      
      console.log('✅ MockAuthService: Login successful');
      
      // Store token in AsyncStorage
      await AsyncStorage.setItem('token', STATIC_TEST_ACCOUNT.token);
      await AsyncStorage.setItem('refreshToken', STATIC_TEST_ACCOUNT.refreshToken);
      
      return {
        success: true,
        message: 'Login successful',
        data: {
          token: STATIC_TEST_ACCOUNT.token,
          refreshToken: STATIC_TEST_ACCOUNT.refreshToken,
          user: STATIC_TEST_ACCOUNT.user,
        }
      };
    } else {
      console.log('❌ MockAuthService: Invalid credentials');
      throw new Error('Invalid email or password');
    }
  }

  // Mock get profile
  static async getProfile(): Promise<ApiResponse<AuthResponse>> {
    console.log('🔧 MockAuthService: Getting user profile');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const token = await AsyncStorage.getItem('token');
    
    if (!token) {
      throw new Error('No token found');
    }

    return {
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: STATIC_TEST_ACCOUNT.user,
        token: token,
      }
    };
  }

  // Mock refresh token
  static async refreshToken(refreshToken: string): Promise<ApiResponse<AuthResponse>> {
    console.log('🔧 MockAuthService: Refreshing token');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (refreshToken === STATIC_TEST_ACCOUNT.refreshToken) {
      const newToken = 'mock-jwt-token-refreshed-' + Date.now();
      await AsyncStorage.setItem('token', newToken);
      
      return {
        success: true,
        message: 'Token refreshed successfully',
        data: {
          token: newToken,
          refreshToken: STATIC_TEST_ACCOUNT.refreshToken,
        }
      };
    } else {
      throw new Error('Invalid refresh token');
    }
  }

  // Mock logout
  static async logout(): Promise<ApiResponse<any>> {
    console.log('🔧 MockAuthService: Logging out');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Clear tokens from AsyncStorage
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('refreshToken');
    
    return {
      success: true,
      message: 'Logged out successfully',
      data: {}
    };
  }

  // Check if user is authenticated
  static async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem('token');
    return !!token;
  }

  // Get current token
  static async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem('token');
  }

  // Get static test account info
  static getTestAccountInfo() {
    return {
      email: STATIC_TEST_ACCOUNT.email,
      password: STATIC_TEST_ACCOUNT.password,
      user: STATIC_TEST_ACCOUNT.user,
    };
  }
}

// Export static account info for easy access
export const TEST_ACCOUNT = MockAuthService.getTestAccountInfo();
