import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Admin, AdminLoginCredentials, AdminResponse } from '../../types/admin.types';
import { env } from '../../config/env';

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

export const logoutAdmin = createAsyncThunk(
  'admin/logout',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Logout thunk: making API call to logout endpoint...');
      const token = localStorage.getItem('adminToken');
      console.log('Logout thunk: token from localStorage:', !!token);
      
      const response = await fetch(`${env.API_BASE_URL}/admin/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Logout thunk: response status:', response.status);
      console.log('Logout thunk: response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.log('Logout thunk: error response:', errorData);
        return rejectWithValue(errorData.message || 'Logout failed');
      }

      const data = await response.json();
      console.log('Logout thunk: success response:', data);
      return data;
    } catch (error) {
      console.error('Logout thunk: network error:', error);
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
      formData.append('file', file);

      const response = await fetch(`${env.API_BASE_URL}/admin/auth/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
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
        console.log('AdminSlice: login fulfilled, payload:', action.payload);
        state.isLoading = false;
        state.isAuthenticated = true;
        // Handle the response format from sendResponse utility
        const responseData = action.payload;

        // The response is wrapped in a data property by sendResponse utility
        const adminData = responseData.data || responseData;
        
        console.log('AdminSlice: adminData:', adminData);
        console.log('AdminSlice: permissions data:', adminData.admin?.permissions);
        
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
            console.warn('AdminSlice: permissions is not an array or object:', permissions);
            state.permissions = [];
          }
        } catch (error) {
          console.error('AdminSlice: error processing permissions:', error);
          state.permissions = [];
        }
        
        state.error = null;
        
        // Store token in localStorage - token is in data.token
        if (adminData.token) {
          console.log('AdminSlice: storing token in localStorage');
          localStorage.setItem('adminToken', adminData.token);
        } else {
          console.warn('AdminSlice: no token in response data:', adminData);
        }
        
        console.log('AdminSlice: final state:', { 
          isAuthenticated: state.isAuthenticated, 
          hasAdmin: !!state.currentAdmin,
          hasToken: !!localStorage.getItem('adminToken'),
          permissions: state.permissions
        });
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Logout
      .addCase(logoutAdmin.fulfilled, (state) => {
        console.log('Logout reducer: clearing state...');
        state.isAuthenticated = false;
        state.currentAdmin = null;
        state.permissions = [];
        localStorage.removeItem('adminToken');
        console.log('Logout reducer: state cleared, isAuthenticated:', state.isAuthenticated);
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
            console.warn('AdminSlice: permissions is not an array or object:', permissions);
            state.permissions = [];
          }
        } catch (error) {
          console.error('AdminSlice: error processing permissions:', error);
          state.permissions = [];
        }
        
        state.error = null;
      })
      .addCase(getCurrentAdmin.rejected, (state, action) => {
        console.log('AdminSlice: getCurrentAdmin rejected:', action.payload);
        state.isLoading = false;
        state.isAuthenticated = false;
        state.currentAdmin = null;
        state.permissions = [];
        state.error = action.payload as string;
        // Don't remove token on failure - let the user try again
        // localStorage.removeItem('adminToken');
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
          const avatarData = responseData.data || responseData;
          state.currentAdmin.avatar = avatarData.avatar;
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
