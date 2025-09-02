import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { env } from '../../config/env';
import { Admin, AdminLoginCredentials, AdminResponse } from '../../types/admin.types';
import { storeAdminToken, removeAdminToken } from '../../utils/tokenUtils';

interface AdminState {
  currentAdmin: Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  permissions: string[];
}

const initialState: AdminState = {
  currentAdmin: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  permissions: []
};

// Async thunks
export const loginAdmin = createAsyncThunk(
  'admin/login',
  async (credentials: AdminLoginCredentials, { rejectWithValue }) => {
    try {
      console.log('Environment config:', env);
      console.log('API_BASE_URL:', env.API_BASE_URL);
      console.log('Full login URL:', `${env.API_BASE_URL}/admin/auth/login`);
      
      const response = await fetch(`${env.API_BASE_URL}/admin/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Login failed');
      }

      const data: AdminResponse = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

// Complete login with 2FA verification
export const complete2FALogin = createAsyncThunk(
  'admin/complete2FA',
  async (credentials: { userId: string; token: string; sessionId: string; rememberMe?: boolean }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${env.API_BASE_URL}/admin/auth/login/2fa-complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || '2FA verification failed');
      }

      const data: AdminResponse = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const logoutAdmin = createAsyncThunk(
  'admin/logout',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`${env.API_BASE_URL}/admin/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Logout failed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const getCurrentAdmin = createAsyncThunk(
  'admin/getCurrent',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${env.API_BASE_URL}/admin/auth/me`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        return rejectWithValue('Failed to get admin info');
      }

      const data: AdminResponse = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const updateAdminProfileAsync = createAsyncThunk(
  'admin/updateProfile',
  async (profileData: Partial<Admin>, { rejectWithValue }) => {
    try {
      const response = await fetch(`${env.API_BASE_URL}/admin/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to update profile');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const uploadAdminAvatar = createAsyncThunk(
  'admin/uploadAvatar',
  async (file: File, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch(`${env.API_BASE_URL}/admin/auth/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          // Don't set Content-Type manually - let the browser set it with boundary for FormData
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to upload avatar');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setPermissions: (state, action: PayloadAction<string[]>) => {
      state.permissions = action.payload;
    },
    updateAdminProfile: (state, action: PayloadAction<Partial<Admin>>) => {
      if (state.currentAdmin) {
        state.currentAdmin = { ...state.currentAdmin, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        
        // Handle the response format from sendResponse utility
        const responseData = action.payload;

        // Check if 2FA is required
        if (responseData.data?.requires2FA) {
          // 2FA is required - don't authenticate yet, don't save token
          state.isAuthenticated = false;
          state.currentAdmin = null;
          state.permissions = [];
          state.error = null;
          return; // Exit early, don't proceed with normal login flow
        }

        // Normal login flow - 2FA not required
        state.isAuthenticated = true;
        
        // The response is wrapped in a data property by sendResponse utility
        const adminData = responseData.data || responseData;
        
        // Ensure we have admin data before proceeding
        if (adminData.admin) {
          state.currentAdmin = adminData.admin;
          
          // Safely handle permissions - ensure it's an array before mapping
          try {
            const permissions = adminData.admin.permissions;
            if (Array.isArray(permissions)) {
              state.permissions = permissions.map((p: any) => p.name || p.id);
            } else if (permissions && typeof permissions === 'object') {
              // If permissions is an object, try to extract values
              state.permissions = Object.values(permissions).map((p: any) => p.name || p.id || p);
            } else {
              state.permissions = [];
            }
          } catch (error) {
            state.permissions = [];
          }
        } else {
          // No admin data - this shouldn't happen in normal login
          state.currentAdmin = null;
          state.permissions = [];
        }
        
        state.error = null;
        
        // Store token in localStorage - token is in data.token
        
        // The token should be in responseData.data.token based on the backend response structure
        // Backend sends: { success: true, message: "...", data: { admin: {...}, token: "..." } }
        const token = responseData.data?.token;
        
        console.log('=== TOKEN STORAGE DEBUG ===');
        console.log('Response data:', responseData);
        console.log('Token extracted:', token);
        console.log('Token type:', typeof token);
        console.log('Token length:', token ? token.length : 0);
        
        if (token && token !== 'null' && token !== 'undefined') {
          const success = storeAdminToken(token);
          
          if (!success) {
            // Don't store invalid tokens
            removeAdminToken();
          }
        } else {
          // Invalid token detected
          removeAdminToken();
        }
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Complete 2FA Login
      .addCase(complete2FALogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(complete2FALogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        
        // Handle the response format from sendResponse utility
        const responseData = action.payload;
        const adminData = responseData.data || responseData;
        
        // For 2FA completion, the admin data should be in adminData.admin
        if (adminData && adminData.admin) {
          state.currentAdmin = adminData.admin as Admin;
          
          // Safely handle permissions
          try {
            const permissions = adminData.admin.permissions;
            if (Array.isArray(permissions)) {
              state.permissions = permissions.map((p: any) => p.name || p.id);
            } else if (permissions && typeof permissions === 'object') {
              state.permissions = Object.values(permissions).map((p: any) => p.name || p.id || p);
            } else {
              state.permissions = [];
            }
          } catch (error) {
            state.permissions = [];
          }
        } else {
          state.currentAdmin = null;
          state.permissions = [];
        }
        
        state.error = null;
        
        // Store token in localStorage
        const token = responseData.data?.token;
        if (token && token !== 'null' && token !== 'undefined') {
          const success = storeAdminToken(token);
          if (!success) {
            removeAdminToken();
          }
        } else {
          removeAdminToken();
        }
      })
      .addCase(complete2FALogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Logout
      .addCase(logoutAdmin.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.currentAdmin = null;
        state.permissions = [];
        removeAdminToken();
      })
      
      // Get Current Admin
      .addCase(getCurrentAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCurrentAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        // Handle the response format from sendResponse utility
        const responseData = action.payload;

        // The response is wrapped in a data property by sendResponse utility
        const adminData = responseData.data || responseData;

        state.currentAdmin = adminData.admin || adminData;
        
        // Safely handle permissions - ensure it's an array before mapping
        try {
          const permissions = adminData.admin?.permissions;
          if (Array.isArray(permissions)) {
            state.permissions = permissions.map((p: any) => p.name || p.id);
          } else if (permissions && typeof permissions === 'object') {
            // If permissions is an object, try to extract values
            state.permissions = Object.values(permissions).map((p: any) => p.name || p.id || p);
                  } else {
          state.permissions = [];
        }
      } catch (error) {
        state.permissions = [];
      }
        
        state.error = null;
      })
      .addCase(getCurrentAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.currentAdmin = null;
        state.permissions = [];
        state.error = action.payload as string;
        // Remove invalid token to prevent infinite loops
        removeAdminToken();
      })
      
      // Update Profile
      .addCase(updateAdminProfileAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateAdminProfileAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update the current admin with new profile data
        if (state.currentAdmin) {
          const responseData = action.payload;
          const adminData = responseData.data || responseData;
          state.currentAdmin = { ...state.currentAdmin, ...adminData.admin };
        }
        state.error = null;
      })
      .addCase(updateAdminProfileAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Upload Avatar
      .addCase(uploadAdminAvatar.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadAdminAvatar.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update the current admin's avatar
        if (state.currentAdmin) {
          const responseData = action.payload;
          const adminData = responseData.data || responseData;
          
          // Update the avatar field
          if (adminData.admin && adminData.admin.avatar) {
            state.currentAdmin.avatar = adminData.admin.avatar;
          }
        }
        state.error = null;
      })
      .addCase(uploadAdminAvatar.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setPermissions, updateAdminProfile } = adminSlice.actions;
export default adminSlice.reducer;
