import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, LoginCredentials, RegisterData, User } from '../../types/auth.types';
import { AuthService } from '../../services/authService';
import { getDeviceId } from '../../utils';

// Helper function to serialize user data (convert Date objects to ISO strings)
const serializeUser = (userData: any): User => {
  // Handle both flat and nested user structures
  if (userData.user) {
    // Nested structure (from /auth/me)
    const serializedUser = { ...userData };
    
    // Serialize basic user info
    if (serializedUser.user) {
      if (serializedUser.user.lastLogin instanceof Date) {
        serializedUser.user.lastLogin = serializedUser.user.lastLogin.toISOString();
      }
      if (serializedUser.user.createdAt instanceof Date) {
        serializedUser.user.createdAt = serializedUser.user.createdAt.toISOString();
      }
      if (serializedUser.user.updatedAt instanceof Date) {
        serializedUser.user.updatedAt = serializedUser.user.updatedAt.toISOString();
      }
    }
    
    // Serialize security dates
    if (serializedUser.security) {
      if (serializedUser.security.lastPasswordChange instanceof Date) {
        serializedUser.security.lastPasswordChange = serializedUser.security.lastPasswordChange.toISOString();
      }
      if (serializedUser.security.lockedUntil instanceof Date) {
        serializedUser.security.lockedUntil = serializedUser.security.lockedUntil.toISOString();
      }
      if (serializedUser.security.passwordExpiresAt instanceof Date) {
        serializedUser.security.passwordExpiresAt = serializedUser.security.passwordExpiresAt.toISOString();
      }
    }
    
    return serializedUser;
  } else {
    // Flat structure (from /auth/login) - convert to nested structure
    const serializedBasicUser = { ...userData };
    
    // Convert Date objects to ISO strings
    if (serializedBasicUser.lastLogin instanceof Date) {
      serializedBasicUser.lastLogin = serializedBasicUser.lastLogin.toISOString();
    }
    if (serializedBasicUser.createdAt instanceof Date) {
      serializedBasicUser.createdAt = serializedBasicUser.createdAt.toISOString();
    }
    if (serializedBasicUser.updatedAt instanceof Date) {
      serializedBasicUser.updatedAt = serializedBasicUser.updatedAt.toISOString();
    }
    
    // Convert flat structure to nested structure
    return {
      user: serializedBasicUser,
      preferences: {
        theme: { mode: 'system' },
        notifications: { email: true, push: true, sms: false, marketing: false },
        language: 'en',
        timezone: 'UTC',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h'
      },
      security: {
        twoFactorEnabled: false,
        loginAttempts: 0
      },
      roles: {
        global: [],
        workspaces: {},
        permissions: []
      }
    };
  }
};

// Async thunk for login
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await AuthService.login(credentials);
      
      // Store token in localStorage
      localStorage.setItem('token', response.data.token);
      
      // After successful login, fetch the complete user profile
      // This ensures we get the same user shape as checkAuthStatus
      console.log('🔍 Login successful, fetching complete user profile...');
      const profileResponse = await AuthService.getProfile();
      
      // Serialize the complete user data before returning
      return {
        ...response.data,
        user: serializeUser(profileResponse.data),
        token: response.data.token
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

// Async thunk for register
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: RegisterData, { rejectWithValue }) => {
    try {
      const response = await AuthService.register(userData);
      
      // Store token in localStorage if provided
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      // Fetch complete user profile after registration
      const profileResponse = await AuthService.getProfile();
      
      return {
        ...response.data,
        user: serializeUser(profileResponse.data),
        token: response.data.token
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

// Async thunk for refresh token
export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (refreshToken: string, { rejectWithValue }) => {
    try {
      const response = await AuthService.refreshToken(refreshToken);
      
      // Update token in localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      return {
        token: response.data.token,
        refreshToken: response.data.refreshToken
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Token refresh failed');
    }
  }
);

// Async thunk for test connection
export const testConnection = createAsyncThunk(
  'auth/testConnection',
  async (_, { rejectWithValue }) => {
    try {
      const response = await AuthService.testConnection();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Connection test failed');
    }
  }
);

// Async thunk to check authentication status
export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔍 checkAuthStatus: Starting auth check...');
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('❌ No token found, user is not authenticated');
        return { isAuthenticated: false, user: null, token: null };
      }
      
      console.log('✅ Token found, checking with backend...');
      console.log('🌐 API URL:', import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api');
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          console.log('⏰ Auth check timeout after 5 seconds');
          reject(new Error('Auth check timeout'));
        }, 5000);
      });
      
      // Verify token by fetching user profile with timeout
      console.log('📡 Making API call to /auth/me...');
      const profilePromise = AuthService.getProfile();
      const response = await Promise.race([profilePromise, timeoutPromise]);
      
      console.log('✅ Auth check successful, user authenticated');
      console.log('👤 User data:', (response as any).data);
      return {
        isAuthenticated: true,
        user: serializeUser((response as any).data),
        token
      };
    } catch (error: any) {
      // Token is invalid or expired, clear it
      localStorage.removeItem('token');
      console.error('❌ Auth check failed:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
      
      // Don't reject, just return unauthenticated state
      return { isAuthenticated: false, user: null, token: null };
    }
  }
);

// Async thunk for logout
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (params: { allDevices?: boolean } = {}, { rejectWithValue }) => {
    try {
      const { allDevices = false } = params;
      
      // Get device ID for logout
      const deviceId = getDeviceId();
      
      // Call the logout API endpoint with device info
      await AuthService.logout(deviceId, allDevices);
      
      // Clear token from localStorage
      localStorage.removeItem('token');
      
      return true;
    } catch (error: any) {
      // Even if the API call fails, we should still clear the local state
      localStorage.removeItem('token');
      console.error('Logout API error:', error);
      return rejectWithValue(error.response?.data?.message || 'Logout failed');
    }
  }
);

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true, // Start with loading true to check auth status
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      // Ensure user data is serialized
      state.user = serializeUser(action.payload.user);
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        // Handle nested user updates
        const updates = action.payload;
        
        if (updates.user) {
          state.user.user = { ...state.user.user, ...updates.user };
        }
        if (updates.preferences) {
          state.user.preferences = { ...state.user.preferences, ...updates.preferences };
        }
        if (updates.security) {
          state.user.security = { ...state.user.security, ...updates.security };
        }
        if (updates.roles) {
          state.user.roles = { ...state.user.roles, ...updates.roles };
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Check Auth Status
      .addCase(checkAuthStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = action.payload.isAuthenticated;
        state.error = null;
      })
      .addCase(checkAuthStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = action.payload as string;
        console.error('Auth check rejected:', action.payload);
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        // User data is already serialized in the thunk
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        // Even if logout API fails, we should still clear the local state
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Refresh Token
      .addCase(refreshToken.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Test Connection (doesn't affect auth state, just for debugging)
      .addCase(testConnection.pending, (state) => {
        state.error = null;
      })
      .addCase(testConnection.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(testConnection.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCredentials, updateUser } = authSlice.actions;
export default authSlice.reducer;

// Selectors for easy access to user data
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectUserBasic = (state: { auth: AuthState }) => state.auth.user?.user;
export const selectUserPreferences = (state: { auth: AuthState }) => state.auth.user?.preferences;
export const selectUserSecurity = (state: { auth: AuthState }) => state.auth.user?.security;
export const selectUserRoles = (state: { auth: AuthState }) => state.auth.user?.roles;
export const selectUserPermissions = (state: { auth: AuthState }) => state.auth.user?.roles?.permissions || [];
export const selectUserWorkspaceRoles = (state: { auth: AuthState }) => state.auth.user?.roles?.workspaces || {};
export const selectUserTheme = (state: { auth: AuthState }) => state.auth.user?.preferences?.theme;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAuthToken = (state: { auth: AuthState }) => state.auth.token;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
