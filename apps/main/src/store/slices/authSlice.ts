import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, LoginCredentials, User } from '../../types/auth.types';

import { env } from '../../config/env';

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
      // Replace with your actual API call
      const response = await fetch('http://localhost:3001/api/auth/login', {
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

      const body = await response.json();
      localStorage.setItem('token', body.data.token)
      
      // Serialize the user data before returning
      return {
        ...body.data,
        user: serializeUser(body.data.user)
      };
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

// Async thunk for logout
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      // Replace with your actual logout API call
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      localStorage.removeItem('token');
      return true;
    } catch (error) {
      return rejectWithValue('Logout failed');
    }
  }
);

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
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
        
        // Store token in localStorage
        // localStorage.setItem('token', action.payload.token);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { clearError, setCredentials, updateUser } = authSlice.actions;
export default authSlice.reducer;
