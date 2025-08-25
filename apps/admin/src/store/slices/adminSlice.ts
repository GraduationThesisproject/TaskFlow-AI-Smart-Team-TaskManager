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
      console.log('LoginAdmin thunk: starting login process...');
      console.log('LoginAdmin thunk: credentials:', credentials);
      console.log('LoginAdmin thunk: API URL:', `${env.API_BASE_URL}/admin/auth/login`);
      
      const response = await fetch(`${env.API_BASE_URL}/admin/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      console.log('LoginAdmin thunk: response status:', response.status);
      console.log('LoginAdmin thunk: response ok:', response.ok);
      console.log('LoginAdmin thunk: response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json();
        console.error('LoginAdmin thunk: error response:', errorData);
        return rejectWithValue(errorData.message || 'Login failed');
      }

      const data: AdminResponse = await response.json();
      console.log('LoginAdmin thunk: success response raw data:', data);
      console.log('LoginAdmin thunk: response data type:', typeof data);
      console.log('LoginAdmin thunk: response data keys:', Object.keys(data || {}));
      
      // Additional debugging for the response structure
      console.log('LoginAdmin thunk: data.success:', data.success);
      console.log('LoginAdmin thunk: data.message:', data.message);
      console.log('LoginAdmin thunk: data.data exists:', !!data.data);
      if (data.data) {
        console.log('LoginAdmin thunk: data.data keys:', Object.keys(data.data));
        console.log('LoginAdmin thunk: data.data.admin exists:', !!data.data.admin);
        console.log('LoginAdmin thunk: data.data.token exists:', !!data.data.token);
        console.log('LoginAdmin thunk: data.data.token value:', data.data.token ? `${data.data.token.substring(0, 20)}...` : 'undefined');
      }
      
      return data;
    } catch (error) {
      console.error('LoginAdmin thunk: network error:', error);
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
      console.log('uploadAdminAvatar: starting upload for file:', file.name, file.size, file.type);
      
      const formData = new FormData();
      formData.append('file', file);
      
      console.log('uploadAdminAvatar: FormData created, file appended with key "file"');
      console.log('uploadAdminAvatar: FormData contents:', Array.from(formData.entries()));

      const response = await fetch(`${env.API_BASE_URL}/admin/auth/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          // Don't set Content-Type manually - let the browser set it with boundary for FormData
        },
        body: formData,
      });

      console.log('uploadAdminAvatar: Response status:', response.status);
      console.log('uploadAdminAvatar: Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json();
        console.error('uploadAdminAvatar: Error response:', errorData);
        return rejectWithValue(errorData.message || 'Failed to upload avatar');
      }

      const data = await response.json();
      console.log('uploadAdminAvatar: Success response:', data);
      return data;
    } catch (error) {
      console.error('uploadAdminAvatar: Network error:', error);
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
        console.log('AdminSlice: payload type:', typeof action.payload);
        console.log('AdminSlice: payload keys:', Object.keys(action.payload || {}));
        
        state.isLoading = false;
        state.isAuthenticated = true;
        
        // Handle the response format from sendResponse utility
        const responseData = action.payload;
        console.log('AdminSlice: responseData:', responseData);

        // The response is wrapped in a data property by sendResponse utility
        const adminData = responseData.data || responseData;
        console.log('AdminSlice: adminData:', adminData);
        console.log('AdminSlice: adminData keys:', Object.keys(adminData || {}));
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
        console.log('AdminSlice: checking for token...');
        console.log('AdminSlice: adminData.token:', adminData.token);
        console.log('AdminSlice: responseData.data?.token:', responseData.data?.token);
        
        // The token should be in responseData.data.token based on the backend response structure
        // Backend sends: { success: true, message: "...", data: { admin: {...}, token: "..." } }
        const token = responseData.data?.token;
        console.log('AdminSlice: extracted token:', token);
        
        if (token && token !== 'null' && token !== 'undefined') {
          console.log('AdminSlice: storing token in localStorage:', token);
          localStorage.setItem('adminToken', token);
          console.log('AdminSlice: token stored, verifying...');
          const storedToken = localStorage.getItem('adminToken');
          console.log('AdminSlice: localStorage.getItem("adminToken"):', storedToken);
          
          if (storedToken === token) {
            console.log('AdminSlice: ✅ Token successfully stored in localStorage');
          } else {
            console.error('AdminSlice: ❌ Token storage verification failed!');
            console.error('AdminSlice: Expected:', token);
            console.error('AdminSlice: Got:', storedToken);
          }
        } else {
          console.error('AdminSlice: ❌ Invalid token detected:', token);
          console.error('AdminSlice: Token type:', typeof token);
          console.error('AdminSlice: Token value:', token);
          console.error('AdminSlice: responseData structure:', {
            success: responseData.success,
            message: responseData.message,
            hasData: !!responseData.data,
            dataKeys: responseData.data ? Object.keys(responseData.data) : 'no data',
            adminDataKeys: adminData ? Object.keys(adminData) : 'no adminData'
          });
          
          // Don't store invalid tokens
          localStorage.removeItem('adminToken');
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
          const adminData = responseData.data || responseData;
          console.log('uploadAdminAvatar fulfilled: responseData:', responseData);
          console.log('uploadAdminAvatar fulfilled: adminData:', adminData);
          
          // Update the avatar field
          if (adminData.admin && adminData.admin.avatar) {
            state.currentAdmin.avatar = adminData.admin.avatar;
            console.log('uploadAdminAvatar fulfilled: Avatar updated to:', adminData.admin.avatar);
          } else {
            console.warn('uploadAdminAvatar fulfilled: No avatar data found in response');
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
