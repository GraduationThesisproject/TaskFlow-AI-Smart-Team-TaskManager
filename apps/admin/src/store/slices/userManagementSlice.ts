import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, UserRole, UserStatus, UserFilters, Pagination } from '../../types/userManagement.types';

interface UserManagementState {
  users: User[];
  filteredUsers: User[];
  isLoading: boolean;
  error: string | null;
  filters: UserFilters;
  pagination: Pagination;
  selectedUser: User | null;
  showAddUserModal: boolean;
  showEditUserModal: boolean;
}

const initialState: UserManagementState = {
  users: [],
  filteredUsers: [],
  isLoading: false,
  error: null,
  filters: {
    searchTerm: '',
    role: 'All Roles',
    status: 'All Statuses',
    workspace: 'All Workspaces'
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0
  },
  selectedUser: null,
  showAddUserModal: false,
  showEditUserModal: false
};

// Async thunks
export const fetchUsers = createAsyncThunk(
  'userManagement/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to fetch users');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const createUser = createAsyncThunk(
  'userManagement/createUser',
  async (userData: Partial<User>, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to create user');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const updateUser = createAsyncThunk(
  'userManagement/updateUser',
  async ({ userId, userData }: { userId: string; userData: Partial<User> }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to update user');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'userManagement/deleteUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to delete user');
      }

      return userId;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const banUser = createAsyncThunk(
  'userManagement/banUser',
  async ({ userId, reason }: { userId: string; reason?: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/ban`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to ban user');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const activateUser = createAsyncThunk(
  'userManagement/activateUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/activate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to activate user');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const resetUserPassword = createAsyncThunk(
  'userManagement/resetPassword',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/admin/users/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to reset password');
      }

      return { email, success: true };
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

const userManagementSlice = createSlice({
  name: 'userManagement',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<UserFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // Reset to first page when filters change
    },
    clearFilters: (state) => {
      state.filters = {
        searchTerm: '',
        role: 'All Roles',
        status: 'All Statuses',
        workspace: 'All Workspaces'
      };
      state.pagination.page = 1;
    },
    setPagination: (state, action: PayloadAction<Partial<Pagination>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setSelectedUser: (state, action: PayloadAction<User | null>) => {
      state.selectedUser = action.payload;
    },
    setShowAddUserModal: (state, action: PayloadAction<boolean>) => {
      state.showAddUserModal = action.payload;
    },
    setShowEditUserModal: (state, action: PayloadAction<boolean>) => {
      state.showEditUserModal = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    // Local state updates for immediate UI feedback
    updateUserLocally: (state, action: PayloadAction<Partial<User> & { id: string }>) => {
      const index = state.users.findIndex(user => user.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = { ...state.users[index], ...action.payload };
      }
      
      const filteredIndex = state.filteredUsers.findIndex(user => user.id === action.payload.id);
      if (filteredIndex !== -1) {
        state.filteredUsers[filteredIndex] = { ...state.filteredUsers[filteredIndex], ...action.payload };
      }
    },
    removeUserLocally: (state, action: PayloadAction<string>) => {
      state.users = state.users.filter(user => user.id !== action.payload);
      state.filteredUsers = state.filteredUsers.filter(user => user.id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.users || [];
        state.filteredUsers = action.payload.users || [];
        state.pagination.total = action.payload.total || 0;
        state.error = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create User
      .addCase(createUser.fulfilled, (state, action) => {
        const newUser = action.payload.user;
        state.users.unshift(newUser);
        state.filteredUsers.unshift(newUser);
        state.pagination.total += 1;
        state.showAddUserModal = false;
      })
      
      // Update User
      .addCase(updateUser.fulfilled, (state, action) => {
        const updatedUser = action.payload.user;
        const userIndex = state.users.findIndex(user => user.id === updatedUser.id);
        if (userIndex !== -1) {
          state.users[userIndex] = updatedUser;
        }
        
        const filteredIndex = state.filteredUsers.findIndex(user => user.id === updatedUser.id);
        if (filteredIndex !== -1) {
          state.filteredUsers[filteredIndex] = updatedUser;
        }
        
        state.showEditUserModal = false;
        state.selectedUser = null;
      })
      
      // Delete User
      .addCase(deleteUser.fulfilled, (state, action) => {
        const deletedUserId = action.payload;
        state.users = state.users.filter(user => user.id !== deletedUserId);
        state.filteredUsers = state.filteredUsers.filter(user => user.id !== deletedUserId);
        state.pagination.total -= 1;
      })
      
      // Ban User
      .addCase(banUser.fulfilled, (state, action) => {
        const bannedUser = action.payload.user;
        const userIndex = state.users.findIndex(user => user.id === bannedUser.id);
        if (userIndex !== -1) {
          state.users[userIndex] = bannedUser;
        }
        
        const filteredIndex = state.filteredUsers.findIndex(user => user.id === bannedUser.id);
        if (filteredIndex !== -1) {
          state.filteredUsers[filteredIndex] = bannedUser;
        }
      })
      
      // Activate User
      .addCase(activateUser.fulfilled, (state, action) => {
        const activatedUser = action.payload.user;
        const userIndex = state.users.findIndex(user => user.id === activatedUser.id);
        if (userIndex !== -1) {
          state.users[userIndex] = activatedUser;
        }
        
        const filteredIndex = state.filteredUsers.findIndex(user => user.id === activatedUser.id);
        if (filteredIndex !== -1) {
          state.filteredUsers[filteredIndex] = activatedUser;
        }
      });
  },
});

export const {
  setFilters,
  clearFilters,
  setPagination,
  setSelectedUser,
  setShowAddUserModal,
  setShowEditUserModal,
  clearError,
  updateUserLocally,
  removeUserLocally
} = userManagementSlice.actions;

export default userManagementSlice.reducer;
