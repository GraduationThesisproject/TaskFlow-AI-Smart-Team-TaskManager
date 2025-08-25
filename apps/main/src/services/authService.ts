/*🔐 AuthService.ts - Complete Beginner's Guide
What is this file?
Think of authService.ts as your authentication toolbox - it contains all the functions your app needs to handle user login, signup, logout, and profile management. It's the bridge between your React components and your backend server.
*/
//--------------------------------------1. Imports & Setup---------------
import axiosInstance from '../config/axios';
//a pre-configured version of axios (probably with base URL + auth headers already set).
import axios from 'axios';
//the raw axios library, used only in special cases
import type { ApiResponse } from '../types/task.types';
import type { LoginCredentials, RegisterData, AuthResponse, OAuthUserData, EmailVerificationData, ResendVerificationData, PasswordResetRequestData, PasswordResetData } from '../types/auth.types';
// Import TypeScript types from centralized location

// All TypeScript interfaces are now imported from auth.types.ts for better separation of concerns





//3. The AuthService Class (Main Functions)
export class AuthService {

  /*This class has functions for everything related to authentication. Each function talks to the backend using axiosInstance.*/

  // Login user
  static async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await axiosInstance.post('/auth/login', credentials);
      
      // Store token in localStorage
      if (response.data.data?.token) {
        localStorage.setItem('token',response.data.data.token);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  }
/*Sends the email + password to /auth/login.
If backend returns a token → store it in localStorage so the app remembers the user.
Returns the whole API response.*/
/*How to use in a component:
const handleLogin = async () => {
  try {
    const result = await AuthService.login({
      email: "user@example.com",
      password: "password123"
    });
    console.log("Login successful!", result);
  } catch (error) {
    console.error("Login failed:", error);
  }
};
-------------------------------------*/
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
/*Sends name, email, password to /auth/register.
Returns the backend’s response (probably user info + token).*/
/*
/*const handleSignup = async () => {
  try {
    const result = await AuthService.register({
      name: "John Doe",
      email: "john@example.com",
      password: "securePassword123"
    });
    console.log("Signup successful!", result);
  } catch (error) {
    console.error("Signup failed:", error);
  }
};*/
//----------------------------------
  // Get current user profile
  static async getProfile(): Promise<ApiResponse<any>> {
    try {
      console.log('🔍 AuthService.getProfile: Making request to /auth/me');
      console.log('🔍 AuthService.getProfile: Base URL:', axiosInstance.defaults.baseURL);
      console.log('🔍 AuthService.getProfile: Headers:', axiosInstance.defaults.headers);
      //this is to show what the custom axios instance contains
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

/*Sends name, email, password to /auth/register.

Returns the backend’s response (probably user info + token).*/
/*const loadUserProfile = async () => {
  try {
    const profile = await AuthService.getProfile();
    console.log("User profile:", profile);
  } catch (error) {
    console.error("Failed to load profile:", error);
  }
};---------------------------------*/

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
/*If the token expires, you can use the refreshToken to get a new one without making the user log in again. Extends session automatically*/
/*
const handleRefreshToken = async () => {
  try {
    const result = await AuthService.refreshToken("your-refresh-token");
    console.log("Token refreshed!", result);
  } catch (error) {
    console.error("Failed to refresh token:", error);
  }
};
!!!!!!!!this is done automatically by axiosInstance i just want to clarify it 
-------------------------------------*/


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
/*Calls /auth/logout.

What it does:

Logs user out from current device or all devices
Clears tokens from backend
Removes stored tokens from browser
*/
/*const handleLogout = async () => {
  try {
    await AuthService.logout();
    console.log("Logged out successfully");
  } catch (error) {
    console.error("Logout failed:", error);
  }
};----------------------------------------------*/
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

  // OAuth Login
  static async oauthLogin(oauthData: OAuthUserData): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await axiosInstance.post('/auth/oauth/login', oauthData);
      
      // Store token in localStorage
      if (response.data.data?.token) {
        localStorage.setItem('token', response.data.data.token);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error with OAuth login:', error);
      throw error;
    }
  }

  // OAuth Register
  static async oauthRegister(oauthData: OAuthUserData): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await axiosInstance.post('/auth/oauth/register', oauthData);
      
      // Store token in localStorage
      if (response.data.data?.token) {
        localStorage.setItem('token', response.data.data.token);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error with OAuth registration:', error);
      throw error;
    }
  }

  // Email Verification
  static async verifyEmail(verificationData: EmailVerificationData): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await axiosInstance.post('/auth/verify-email', verificationData);
      
      // Store token in localStorage if provided
      if (response.data.data?.token) {
        localStorage.setItem('token', response.data.data.token);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error verifying email:', error);
      throw error;
    }
  }

  // Resend verification code
  static async resendVerificationCode(resendData: ResendVerificationData): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await axiosInstance.post('/auth/resend-verification', resendData);
      return response.data;
    } catch (error) {
      console.error('Error resending verification code:', error);
      throw error;
    }
  }

  // Request password reset
  static async requestPasswordReset(resetData: PasswordResetRequestData): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await axiosInstance.post('/auth/request-password-reset', resetData);
      return response.data;
    } catch (error) {
      console.error('Error requesting password reset:', error);
      throw error;
    }
  }

  // Reset password
  static async resetPassword(resetData: PasswordResetData): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await axiosInstance.post('/auth/reset-password', resetData);
      return response.data;
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }
}

// Additional auth endpoints mapped to backend auth.controller routes
export class AuthControllerClient {
  // PUT /api/auth/profile (JSON)
  static async updateProfile(payload: { name?: string; avatar?: string; preferences?: any; metadata?: any }): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.put('/auth/profile', payload);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  // PUT /api/auth/profile/secure (multipart: expects field "avatar")
  static async updateProfileSecure(formData: FormData): Promise<ApiResponse<any>> {
    try {
      // Do not set Content-Type manually; let the browser set the correct multipart boundary
      const response = await axiosInstance.put('/auth/profile/secure', formData);
      return response.data;
    } catch (error) {
      console.error('Error updating secure profile:', error);
      throw error;
    }
  }

  // PUT /api/auth/change-password
  static async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.put('/auth/change-password', { currentPassword, newPassword });
      return response.data;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }

  // PUT /api/auth/preferences
  static async updatePreferences(section: string, updates: any): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.put('/auth/preferences', { section, updates });
      return response.data;
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  }

  // GET /api/auth/sessions
  static async getSessions(): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.get('/auth/sessions');
      return response.data;
    } catch (error) {
      console.error('Error fetching sessions:', error);
      throw error;
    }
  }

  // DELETE /api/auth/sessions/:sessionId
  static async endSession(sessionId: string): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.delete(`/auth/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Error ending session:', error);
      throw error;
    }
  }

  // GET /api/auth/activity
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

/*------------------------------------
/*How This Integrates with React + Redux
The Flow:
React Component calls 
AuthService.login()
AuthService sends HTTP request to backend
Backend responds with user data + token

localStorage keeps the token so you don’t get logged out when refreshing the page.

Redux slices will dispatch actions that use these services to update global auth state (user, isAuthenticated, token).
All future API calls automatically include the token

axiosInstance automatically adds the token in requests, so protected API calls work.*/




/*
Example React Component Usage:
typescript
import { AuthService } from '../services/authService';
import { useAuth } from '../hooks/useAuth';

const LoginForm = () => {
  const { login } = useAuth(); // This uses AuthService internally
  
  const handleSubmit = async (formData) => {
    // Option 1: Use the hook (recommended)
    await login(formData);
    
    // Option 2: Use service directly
    // await AuthService.login(formData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
     {Your form fields} 
    </form>
  );
};
*/


/*Key Benefits of This Architecture
Separation of Concerns: API logic separate from UI components
Reusability: Same functions used across different components
Type Safety: TypeScript ensures correct data structures
Automatic Token Management: No manual token handling needed
Error Handling: Centralized error management
Testing: Easy to test API functions independently*/


/*For Beginners: Next Steps
Start with login/logout - These are the most common operations
Use the 
useAuth
 hook - It wraps these services nicely for React
Check the Redux store - See how auth state is managed globally
Look at protected routes - Understand how authentication controls access
Test with your backend - Make sure all endpoints work correctly
Your authentication service is well-structured and follows modern React/TypeScript patterns. The comments you added make it very beginner-friendly!*/