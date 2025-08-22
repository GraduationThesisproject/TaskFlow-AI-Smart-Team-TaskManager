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
        state.isAuthenticated = true;
        // Handle the response format from sendResponse utility
        const responseData = action.payload;

        state.currentAdmin = responseData.admin || responseData;
        state.permissions = (responseData.admin?.permissions || []).map(p => p.name || p.id);
        state.error = null;
        
        // Store token in localStorage
        if (responseData.token) {
          localStorage.setItem('adminToken', responseData.token);
        }
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

        state.currentAdmin = responseData.admin || responseData;
        state.permissions = (responseData.admin?.permissions || []).map(p => p.name || p.id);
        state.error = null;
      })
      .addCase(getCurrentAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.currentAdmin = null;
        state.permissions = [];
        state.error = action.payload as string;
        localStorage.removeItem('adminToken');
      });
  },
});

export const { clearError, setPermissions, updateAdminProfile } = adminSlice.actions;
export default adminSlice.reducer;
