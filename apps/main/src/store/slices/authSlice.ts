import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, LoginCredentials, RegisterData, User } from '../../types/auth.types';
import { AuthService, AuthControllerClient } from '../../services/authService';
import { getDeviceId } from '../../utils';

const serializeUser = (userData: any): User => {
  if (userData.user) {
    const serializedUser = { ...userData };
    
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
    const serializedBasicUser = { ...userData };
    
    if (serializedBasicUser.lastLogin instanceof Date) {
      serializedBasicUser.lastLogin = serializedBasicUser.lastLogin.toISOString();
    }
    if (serializedBasicUser.createdAt instanceof Date) {
      serializedBasicUser.createdAt = serializedBasicUser.createdAt.toISOString();
    }
    if (serializedBasicUser.updatedAt instanceof Date) {
      serializedBasicUser.updatedAt = serializedBasicUser.updatedAt.toISOString();
    }
    
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

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await AuthService.login(credentials);
      
      if (!response.data.token) {
        throw new Error('No token received from server');
      }
      
      localStorage.setItem('token', response.data.token);
      
      const profileResponse = await AuthService.getProfile();
      
      return {
        ...response.data,
        user: serializeUser(profileResponse.data),
        token: response.data.token
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: RegisterData, { rejectWithValue }) => {
    try {
      const response = await AuthService.register(userData);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      const profileResponse = await AuthService.getProfile();
      
      return {
        ...response.data,
        user: serializeUser(profileResponse.data),
        token: response.data.token
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (refreshToken: string, { rejectWithValue }) => {
    try {
      const response = await AuthService.refreshToken(refreshToken);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      return {
        token: response.data.token,
        refreshToken: response.data.refreshToken
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Token refresh failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const testConnection = createAsyncThunk(
  'auth/testConnection',
  async (_, { rejectWithValue }) => {
    try {
      const response = await AuthService.testConnection();
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Connection test failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return { isAuthenticated: false, user: null, token: null };
      }
      
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Auth check timeout'));
        }, 5000);
      });
      
      const profilePromise = AuthService.getProfile();
      const response = await Promise.race([profilePromise, timeoutPromise]);
      
      return {
        isAuthenticated: true,
        user: serializeUser((response as any).data),
        token
      };
    } catch (error: any) {
      localStorage.removeItem('token');
      const errorMessage = error.response?.data?.message || error.message || 'Authentication check failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (params: { allDevices?: boolean } = {}, { rejectWithValue }) => {
    try {
      const { allDevices = false } = params;
      
      const deviceId = getDeviceId();
      
      await AuthService.logout(deviceId, allDevices);
      
      localStorage.removeItem('token');
      
      return true;
    } catch (error: any) {
      localStorage.removeItem('token');
      const errorMessage = error.response?.data?.message || error.message || 'Logout failed';
      return rejectWithValue(errorMessage);
    }
  }
);

// Update profile (JSON)
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (payload: { name?: string; avatar?: string; preferences?: any; metadata?: any }, { rejectWithValue }) => {
    try {
      const resp = await AuthControllerClient.updateProfile(payload);
      const u = (resp as any)?.data?.user ?? (resp as any)?.data ?? (resp as any)?.user;
      return serializeUser(u);
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Update profile failed';
      return rejectWithValue(msg);
    }
  }
);

// Secure profile update (multipart)
export const updateProfileSecure = createAsyncThunk(
  'auth/updateProfileSecure',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const resp = await AuthControllerClient.updateProfileSecure(formData);
      const u = (resp as any)?.data?.user ?? (resp as any)?.data ?? (resp as any)?.user;
      return serializeUser(u);
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Secure update failed';
      return rejectWithValue(msg);
    }
  }
);

// Change password
export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (payload: { currentPassword: string; newPassword: string }, { rejectWithValue }) => {
    try {
      const resp = await AuthControllerClient.changePassword(payload.currentPassword, payload.newPassword);
      return resp;
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Change password failed';
      return rejectWithValue(msg);
    }
  }
);

// Update preferences
export const updatePreferences = createAsyncThunk(
  'auth/updatePreferences',
  async (payload: { section: string; updates: any }, { rejectWithValue }) => {
    try {
      const resp = await AuthControllerClient.updatePreferences(payload.section, payload.updates);
      const newPrefs = (resp as any)?.data?.preferences ?? (resp as any)?.data;
      return newPrefs;
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Update preferences failed';
      return rejectWithValue(msg);
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
      })
      // Profile updates
      .addCase(updateProfile.pending, (state) => {
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        if (state.user && action.payload) {
          // Merge updated fields into existing user slice
          state.user.user = { ...state.user.user, ...(action.payload as any).user };
          state.user.preferences = { ...state.user.preferences, ...(action.payload as any).preferences };
          state.user.security = { ...state.user.security, ...(action.payload as any).security };
        } else if (action.payload) {
          state.user = action.payload as any;
        }
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(updateProfileSecure.pending, (state) => {
        state.error = null;
      })
      .addCase(updateProfileSecure.fulfilled, (state, action) => {
        if (state.user && action.payload) {
          state.user.user = { ...state.user.user, ...(action.payload as any).user };
          state.user.preferences = { ...state.user.preferences, ...(action.payload as any).preferences };
          state.user.security = { ...state.user.security, ...(action.payload as any).security };
        } else if (action.payload) {
          state.user = action.payload as any;
        }
      })
      .addCase(updateProfileSecure.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Preferences
      .addCase(updatePreferences.fulfilled, (state, action) => {
        if (state.user && action.payload) {
          state.user.preferences = { ...state.user.preferences, ...(action.payload as any) };
        }
      })
      .addCase(updatePreferences.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Change password
      .addCase(changePassword.rejected, (state, action) => {
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
