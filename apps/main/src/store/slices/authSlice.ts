import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, LoginCredentials, User } from '../../types/auth.types';
import { AuthService } from '../../services/authService';
import { getDeviceId } from '../../utils';

// Helper function to serialize user data (convert Date objects to ISO strings)
const serializeUser = (user: any): User => {
  const serializedUser = { ...user };
  
  // Convert Date objects to ISO strings
  if (serializedUser.lastLogin instanceof Date) {
    serializedUser.lastLogin = serializedUser.lastLogin.toISOString();
  }
  if (serializedUser.createdAt instanceof Date) {
    serializedUser.createdAt = serializedUser.createdAt.toISOString();
  }
  if (serializedUser.updatedAt instanceof Date) {
    serializedUser.updatedAt = serializedUser.updatedAt.toISOString();
  }
  
  return serializedUser;
};

// Async thunk for login
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await AuthService.login(credentials);
      
      // Store token in localStorage
      localStorage.setItem('token', response.data.token);
      
      // Serialize the user data before returning
      return {
        ...response.data,
        user: serializeUser(response.data.user)
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
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
        // Ensure updated user data is serialized
        const serializedUpdates = serializeUser(action.payload);
        state.user = { ...state.user, ...serializedUpdates };
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
      });
  },
});

export const { clearError, setCredentials, updateUser } = authSlice.actions;
export default authSlice.reducer;
