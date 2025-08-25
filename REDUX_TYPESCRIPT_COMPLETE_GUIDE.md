# Redux + TypeScript Complete Implementation Guide

## Table of Contents
1. [What is Redux?](#what-is-redux)
2. [What is TypeScript?](#what-is-typescript)
3. [Why Use Redux + TypeScript Together?](#why-use-redux--typescript-together)
4. [Redux Core Concepts](#redux-core-concepts)
5. [Redux Toolkit](#redux-toolkit)
6. [TypeScript in Redux](#typescript-in-redux)
7. [Complete Implementation Example](#complete-implementation-example)
8. [Advanced Patterns](#advanced-patterns)
9. [Common Issues & Solutions](#common-issues--solutions)
10. [Best Practices](#best-practices)

## What is Redux?

Redux is a **predictable state container** for JavaScript applications. Think of it as a centralized "brain" that manages all the data (state) in your application.

### Key Concepts:
- **State**: The data your app uses (user info, posts, settings, etc.)
- **Store**: The single source of truth that holds all state
- **Actions**: Messages that describe what happened (like "user logged in")
- **Reducers**: Functions that update state based on actions
- **Dispatch**: The way to send actions to the store

### Why Redux?
- **Centralized State**: All data in one place
- **Predictable Updates**: State changes follow a clear pattern
- **Debugging**: Easy to track what changed and why
- **Performance**: Only re-renders components when their data changes

## What is TypeScript?

TypeScript is JavaScript with **static typing**. It adds type information to your code, which helps catch errors before your app runs.

### Key Benefits:
- **Type Safety**: Catches errors at compile time
- **Better IDE Support**: Autocomplete, refactoring, error detection
- **Self-Documenting Code**: Types serve as documentation
- **Easier Refactoring**: Safe to change code with confidence

### TypeScript vs JavaScript:
```typescript
// JavaScript (no types)
function addUser(user) {
  return user.name + " added";
}

// TypeScript (with types)
interface User {
  name: string;
  email: string;
  age: number;
}

function addUser(user: User): string {
  return `${user.name} added`;
}
```

## Why Use Redux + TypeScript Together?

### 1. **Type Safety for State**
- Know exactly what data is in your store
- Prevent accessing non-existent properties
- Catch errors when updating state incorrectly

### 2. **Better Developer Experience**
- Autocomplete for state properties
- Refactoring support
- Clear interfaces for actions and state

### 3. **Runtime Safety**
- TypeScript compiles to JavaScript
- Runtime errors are caught at compile time
- More reliable applications

## Redux Core Concepts

### 1. **Store**
The store is like a big JavaScript object that holds all your application state.

```typescript
// What the store looks like
const store = {
  user: {
    isLoggedIn: false,
    name: "",
    email: ""
  },
  posts: {
    items: [],
    loading: false,
    error: null
  },
  settings: {
    theme: "light",
    language: "en"
  }
}
```

### 2. **Actions**
Actions are plain JavaScript objects that describe what happened in your app.

```typescript
// Action examples
const loginAction = {
  type: "user/login",
  payload: {
    name: "John Doe",
    email: "john@example.com"
  }
}

const logoutAction = {
  type: "user/logout"
}
```

### 3. **Reducers**
Reducers are pure functions that take the current state and an action, then return new state.

```typescript
// Reducer example
function userReducer(state = initialState, action) {
  switch (action.type) {
    case "user/login":
      return {
        ...state,
        isLoggedIn: true,
        name: action.payload.name,
        email: action.payload.email
      }
    
    case "user/logout":
      return {
        ...state,
        isLoggedIn: false,
        name: "",
        email: ""
      }
    
    default:
      return state
  }
}
```

### 4. **Dispatch**
Dispatch is how you send actions to the store to trigger state changes.

```typescript
// Dispatching actions
store.dispatch(loginAction);
store.dispatch(logoutAction);
```

## Redux Toolkit

Redux Toolkit is the official, opinionated way to write Redux logic. It simplifies common Redux use cases.

### Key Features:
- **createSlice**: Combines actions and reducers
- **createAsyncThunk**: Handles async operations
- **configureStore**: Sets up store with good defaults
- **Immer**: Allows "mutating" code that's actually immutable

## TypeScript in Redux

### 1. **Typing the Store**

```typescript
// Define your root state type
export interface RootState {
  user: UserState;
  posts: PostsState;
  settings: SettingsState;
}

// Define individual state slices
export interface UserState {
  isLoggedIn: boolean;
  name: string;
  email: string;
  loading: boolean;
  error: string | null;
}

export interface PostsState {
  items: Post[];
  loading: boolean;
  error: string | null;
}

export interface SettingsState {
  theme: 'light' | 'dark';
  language: 'en' | 'es' | 'fr';
}
```

### 2. **Typing Actions**

```typescript
// Action types
export interface LoginAction {
  type: 'user/login';
  payload: {
    name: string;
    email: string;
  };
}

export interface LogoutAction {
  type: 'user/logout';
}

// Union type for all user actions
export type UserAction = LoginAction | LogoutAction;
```

### 3. **Typing Reducers**

```typescript
// Typed reducer
function userReducer(
  state: UserState = initialState,
  action: UserAction
): UserState {
  switch (action.type) {
    case 'user/login':
      return {
        ...state,
        isLoggedIn: true,
        name: action.payload.name,
        email: action.payload.email,
        loading: false,
        error: null
      };
    
    case 'user/logout':
      return {
        ...state,
        isLoggedIn: false,
        name: '',
        email: '',
        loading: false,
        error: null
      };
    
    default:
      return state;
  }
}
```

## Complete Implementation Example

Let's build a complete Redux + TypeScript implementation step by step.

### Step 1: Define Types

```typescript
// types/user.types.ts
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'user' | 'moderator';
}

export interface UserState {
  currentUser: User | null;
  users: User[];
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}
```

### Step 2: Create Redux Slice

```typescript
// store/slices/userSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { UserState, LoginCredentials, LoginResponse, User } from '../../types/user.types';

// Initial state
const initialState: UserState = {
  currentUser: null,
  users: [],
  loading: false,
  error: null
};

// Async thunk for login
export const loginUser = createAsyncThunk(
  'user/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/login', {
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

      const data: LoginResponse = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

// Async thunk for fetching users
export const fetchUsers = createAsyncThunk(
  'user/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to fetch users');
      }

      const users: User[] = await response.json();
      return users;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

// Create the slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Synchronous actions
    logout: (state) => {
      state.currentUser = null;
      state.users = [];
      state.error = null;
      localStorage.removeItem('token');
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...action.payload };
      }
    },
    
    addUser: (state, action: PayloadAction<User>) => {
      state.users.push(action.payload);
    },
    
    removeUser: (state, action: PayloadAction<string>) => {
      state.users = state.users.filter(user => user.id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload.user;
        state.error = null;
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch users cases
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
        state.error = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions and reducer
export const {
  logout,
  clearError,
  updateUser,
  addUser,
  removeUser
} = userSlice.actions;

export default userSlice.reducer;
```

### Step 3: Configure Store

```typescript
// store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import userReducer from './slices/userSlice';
import postsReducer from './slices/postsSlice';
import settingsReducer from './slices/settingsSlice';

// Create the store
export const store = configureStore({
  reducer: {
    user: userReducer,
    posts: postsReducer,
    settings: settingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

// Infer types from the store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Create typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

### Step 4: Create Selectors

```typescript
// store/selectors/userSelectors.ts
import { RootState } from '../index';

// Basic selectors
export const selectCurrentUser = (state: RootState) => state.user.currentUser;
export const selectUsers = (state: RootState) => state.user.users;
export const selectUserLoading = (state: RootState) => state.user.loading;
export const selectUserError = (state: RootState) => state.user.error;

// Derived selectors
export const selectIsLoggedIn = (state: RootState) => !!state.user.currentUser;
export const selectUserRole = (state: RootState) => state.user.currentUser?.role;
export const selectIsAdmin = (state: RootState) => state.user.currentUser?.role === 'admin';

// Memoized selectors (using reselect for performance)
import { createSelector } from '@reduxjs/toolkit';

export const selectUsersByRole = createSelector(
  [selectUsers],
  (users) => {
    return users.reduce((acc, user) => {
      if (!acc[user.role]) {
        acc[user.role] = [];
      }
      acc[user.role].push(user);
      return acc;
    }, {} as Record<string, typeof users>);
  }
);

export const selectActiveUsers = createSelector(
  [selectUsers],
  (users) => users.filter(user => user.id !== 'deleted')
);
```

### Step 5: Use in React Components

```typescript
// components/UserProfile.tsx
import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { selectCurrentUser, selectUserLoading, selectUserError } from '../store/selectors/userSelectors';
import { fetchUsers, updateUser } from '../store/slices/userSlice';

const UserProfile: React.FC = () => {
  const dispatch = useAppDispatch();
  
  // Use typed selectors
  const currentUser = useAppSelector(selectCurrentUser);
  const loading = useAppSelector(selectUserLoading);
  const error = useAppSelector(selectUserError);

  useEffect(() => {
    // Fetch users when component mounts
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleUpdateProfile = (updates: Partial<typeof currentUser>) => {
    if (currentUser) {
      dispatch(updateUser(updates));
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!currentUser) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h1>Welcome, {currentUser.name}!</h1>
      <p>Email: {currentUser.email}</p>
      <p>Role: {currentUser.role}</p>
      
      <button onClick={() => handleUpdateProfile({ name: 'New Name' })}>
        Update Name
      </button>
    </div>
  );
};

export default UserProfile;
```

### Step 6: Create Custom Hooks

```typescript
// hooks/useUser.ts
import { useAppDispatch, useAppSelector } from '../store';
import { selectCurrentUser, selectIsLoggedIn, selectUserRole } from '../store/selectors/userSelectors';
import { loginUser, logout, updateUser } from '../store/slices/userSlice';
import { LoginCredentials } from '../types/user.types';

export const useUser = () => {
  const dispatch = useAppDispatch();
  
  const currentUser = useAppSelector(selectCurrentUser);
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const userRole = useAppSelector(selectUserRole);

  const login = async (credentials: LoginCredentials) => {
    try {
      const result = await dispatch(loginUser(credentials)).unwrap();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error as string };
    }
  };

  const logoutUser = () => {
    dispatch(logout());
  };

  const updateProfile = (updates: Partial<typeof currentUser>) => {
    if (currentUser) {
      dispatch(updateUser(updates));
    }
  };

  return {
    currentUser,
    isLoggedIn,
    userRole,
    login,
    logout: logoutUser,
    updateProfile,
  };
};
```

## Advanced Patterns

### 1. **Normalized State Structure**

```typescript
// Instead of nested arrays, use normalized structure
interface NormalizedState {
  users: {
    byId: Record<string, User>;
    allIds: string[];
  };
  posts: {
    byId: Record<string, Post>;
    allIds: string[];
  };
}

// Benefits:
// - Faster lookups
// - Easier updates
// - Better performance
```

### 2. **Entity Adapters**

```typescript
import { createEntityAdapter, EntityState } from '@reduxjs/toolkit';

const usersAdapter = createEntityAdapter<User>({
  selectId: (user) => user.id,
  sortComparer: (a, b) => a.name.localeCompare(b.name),
});

interface UsersState extends EntityState<User> {
  loading: boolean;
  error: string | null;
}

const initialState = usersAdapter.getInitialState({
  loading: false,
  error: null,
});
```

### 3. **Middleware with TypeScript**

```typescript
// store/middleware/logger.ts
import { Middleware } from '@reduxjs/toolkit';
import { RootState } from '../index';

export const loggerMiddleware: Middleware<{}, RootState> = (store) => (next) => (action) => {
  console.log('Dispatching:', action);
  const result = next(action);
  console.log('New State:', store.getState());
  return result;
};
```

## Common Issues & Solutions

### 1. **TypeScript Errors with useDispatch/useSelector**

```typescript
// ❌ Wrong - loses type information
const dispatch = useDispatch();
const user = useSelector(state => state.user.currentUser);

// ✅ Correct - maintains type information
const dispatch = useAppDispatch();
const user = useAppSelector(state => state.user.currentUser);
```

### 2. **Action Type Errors**

```typescript
// ❌ Wrong - action type is 'any'
case 'user/login':
  return { ...state, user: action.payload };

// ✅ Correct - action type is properly inferred
case loginUser.fulfilled.type:
  return { ...state, user: action.payload };
```

### 3. **State Type Errors**

```typescript
// ❌ Wrong - state type is 'any'
function userReducer(state, action) {
  return { ...state, ...action.payload };
}

// ✅ Correct - state type is properly defined
function userReducer(state: UserState, action: UserAction): UserState {
  return { ...state, ...action.payload };
}
```

## Best Practices

### 1. **Type Everything**
- Define interfaces for all state slices
- Type all actions and payloads
- Use generic types where appropriate

### 2. **Use Selectors**
- Create selectors for all state access
- Use memoized selectors for expensive calculations
- Keep selectors close to their related slice

### 3. **Handle Async Operations**
- Use createAsyncThunk for API calls
- Handle loading, success, and error states
- Use unwrap() for better error handling

### 4. **Keep State Normalized**
- Avoid nested objects and arrays
- Use entity adapters for collections
- Maintain referential equality

### 5. **Test Your Redux Logic**
- Test reducers with different actions
- Test async thunks with mocked responses
- Test selectors with various state shapes

## Complete Example: User Management System

Let's build a complete user management system to see everything working together.

### 1. **Types**

```typescript
// types/user.types.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'admin' | 'manager' | 'user';
export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface CreateUserRequest {
  name: string;
  email: string;
  role: UserRole;
  password: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: UserRole;
  status?: UserStatus;
}

export interface UserFilters {
  role?: UserRole;
  status?: UserStatus;
  search?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

### 2. **Slice**

```typescript
// store/slices/userManagementSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  User, 
  CreateUserRequest, 
  UpdateUserRequest, 
  UserFilters, 
  PaginationParams,
  PaginatedResponse 
} from '../../types/user.types';

interface UserManagementState {
  users: User[];
  selectedUser: User | null;
  loading: boolean;
  error: string | null;
  filters: UserFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const initialState: UserManagementState = {
  users: [],
  selectedUser: null,
  loading: false,
  error: null,
  filters: {},
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

// Async thunks
export const fetchUsers = createAsyncThunk(
  'userManagement/fetchUsers',
  async (params: PaginationParams & UserFilters, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', params.page.toString());
      queryParams.append('limit', params.limit.toString());
      
      if (params.role) queryParams.append('role', params.role);
      if (params.status) queryParams.append('status', params.status);
      if (params.search) queryParams.append('search', params.search);

      const response = await fetch(`/api/users?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to fetch users');
      }

      const data: PaginatedResponse<User> = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const createUser = createAsyncThunk(
  'userManagement/createUser',
  async (userData: CreateUserRequest, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to create user');
      }

      const user: User = await response.json();
      return user;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const updateUser = createAsyncThunk(
  'userManagement/updateUser',
  async ({ id, userData }: { id: string; userData: UpdateUserRequest }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to update user');
      }

      const user: User = await response.json();
      return user;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'userManagement/deleteUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
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

// Create the slice
const userManagementSlice = createSlice({
  name: 'userManagement',
  initialState,
  reducers: {
    setSelectedUser: (state, action: PayloadAction<User | null>) => {
      state.selectedUser = action.payload;
    },
    
    setFilters: (state, action: PayloadAction<UserFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // Reset to first page when filters change
    },
    
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        };
        state.error = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create User
      .addCase(createUser.fulfilled, (state, action) => {
        state.users.unshift(action.payload);
        state.pagination.total += 1;
        state.error = null;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
      // Update User
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.selectedUser?.id === action.payload.id) {
          state.selectedUser = action.payload;
        }
        state.error = null;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
      // Delete User
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(user => user.id !== action.payload);
        state.pagination.total -= 1;
        if (state.selectedUser?.id === action.payload) {
          state.selectedUser = null;
        }
        state.error = null;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  setSelectedUser,
  setFilters,
  setPage,
  clearError,
} = userManagementSlice.actions;

export default userManagementSlice.reducer;
```

### 3. **Selectors**

```typescript
// store/selectors/userManagementSelectors.ts
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../index';

// Basic selectors
export const selectUsers = (state: RootState) => state.userManagement.users;
export const selectSelectedUser = (state: RootState) => state.userManagement.selectedUser;
export const selectUserLoading = (state: RootState) => state.userManagement.loading;
export const selectUserError = (state: RootState) => state.userManagement.error;
export const selectFilters = (state: RootState) => state.userManagement.filters;
export const selectPagination = (state: RootState) => state.userManagement.pagination;

// Derived selectors
export const selectFilteredUsers = createSelector(
  [selectUsers, selectFilters],
  (users, filters) => {
    return users.filter(user => {
      if (filters.role && user.role !== filters.role) return false;
      if (filters.status && user.status !== filters.status) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  }
);

export const selectUsersByRole = createSelector(
  [selectUsers],
  (users) => {
    return users.reduce((acc, user) => {
      if (!acc[user.role]) {
        acc[user.role] = [];
      }
      acc[user.role].push(user);
      return acc;
    }, {} as Record<string, typeof users>);
  }
);

export const selectActiveUsers = createSelector(
  [selectUsers],
  (users) => users.filter(user => user.status === 'active')
);

export const selectUserStats = createSelector(
  [selectUsers],
  (users) => {
    const total = users.length;
    const active = users.filter(u => u.status === 'active').length;
    const inactive = users.filter(u => u.status === 'inactive').length;
    const suspended = users.filter(u => u.status === 'suspended').length;
    
    const roleCounts = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      active,
      inactive,
      suspended,
      roleCounts,
    };
  }
);
```

### 4. **Custom Hook**

```typescript
// hooks/useUserManagement.ts
import { useAppDispatch, useAppSelector } from '../store';
import {
  selectUsers,
  selectSelectedUser,
  selectUserLoading,
  selectUserError,
  selectFilters,
  selectPagination,
  selectFilteredUsers,
  selectUserStats,
} from '../store/selectors/userManagementSelectors';
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  setSelectedUser,
  setFilters,
  setPage,
  clearError,
} from '../store/slices/userManagementSlice';
import { CreateUserRequest, UpdateUserRequest, UserFilters } from '../types/user.types';

export const useUserManagement = () => {
  const dispatch = useAppDispatch();

  // Selectors
  const users = useAppSelector(selectUsers);
  const selectedUser = useAppSelector(selectSelectedUser);
  const loading = useAppSelector(selectUserLoading);
  const error = useAppSelector(selectUserError);
  const filters = useAppSelector(selectFilters);
  const pagination = useAppSelector(selectPagination);
  const filteredUsers = useAppSelector(selectFilteredUsers);
  const userStats = useAppSelector(selectUserStats);

  // Actions
  const loadUsers = (page: number = 1, limit: number = 10) => {
    dispatch(fetchUsers({ page, limit, ...filters }));
  };

  const addUser = async (userData: CreateUserRequest) => {
    try {
      const result = await dispatch(createUser(userData)).unwrap();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error as string };
    }
  };

  const editUser = async (id: string, userData: UpdateUserRequest) => {
    try {
      const result = await dispatch(updateUser({ id, userData })).unwrap();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error as string };
    }
  };

  const removeUser = async (id: string) => {
    try {
      await dispatch(deleteUser(id)).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error: error as string };
    }
  };

  const selectUser = (user: User | null) => {
    dispatch(setSelectedUser(user));
  };

  const updateFilters = (newFilters: UserFilters) => {
    dispatch(setFilters(newFilters));
  };

  const changePage = (page: number) => {
    dispatch(setPage(page));
  };

  const clearUserError = () => {
    dispatch(clearError());
  };

  return {
    // State
    users,
    selectedUser,
    loading,
    error,
    filters,
    pagination,
    filteredUsers,
    userStats,
    
    // Actions
    loadUsers,
    addUser,
    editUser,
    removeUser,
    selectUser,
    updateFilters,
    changePage,
    clearError: clearUserError,
  };
};
```

### 5. **React Component**

```typescript
// components/UserManagement.tsx
import React, { useEffect, useState } from 'react';
import { useUserManagement } from '../hooks/useUserManagement';
import { CreateUserRequest, UpdateUserRequest } from '../types/user.types';

const UserManagement: React.FC = () => {
  const {
    users,
    selectedUser,
    loading,
    error,
    filters,
    pagination,
    filteredUsers,
    userStats,
    loadUsers,
    addUser,
    editUser,
    removeUser,
    selectUser,
    updateFilters,
    changePage,
    clearError,
  } = useUserManagement();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [filters, pagination.page]);

  const handleCreateUser = async (userData: CreateUserRequest) => {
    const result = await addUser(userData);
    if (result.success) {
      setShowCreateForm(false);
      clearError();
    }
  };

  const handleEditUser = async (userData: UpdateUserRequest) => {
    if (selectedUser) {
      const result = await editUser(selectedUser.id, userData);
      if (result.success) {
        setShowEditForm(false);
        selectUser(null);
        clearError();
      }
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      const result = await removeUser(userId);
      if (result.success) {
        clearError();
      }
    }
  };

  if (loading && users.length === 0) {
    return <div>Loading users...</div>;
  }

  return (
    <div className="user-management">
      {/* Header */}
      <div className="header">
        <h1>User Management</h1>
        <button onClick={() => setShowCreateForm(true)}>Add User</button>
      </div>

      {/* Stats */}
      <div className="stats">
        <div>Total: {userStats.total}</div>
        <div>Active: {userStats.active}</div>
        <div>Inactive: {userStats.inactive}</div>
        <div>Suspended: {userStats.suspended}</div>
      </div>

      {/* Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search users..."
          value={filters.search || ''}
          onChange={(e) => updateFilters({ search: e.target.value })}
        />
        <select
          value={filters.role || ''}
          onChange={(e) => updateFilters({ role: e.target.value as any || undefined })}
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="user">User</option>
        </select>
        <select
          value={filters.status || ''}
          onChange={(e) => updateFilters({ status: e.target.value as any || undefined })}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error">
          {error}
          <button onClick={clearError}>×</button>
        </div>
      )}

      {/* Users Table */}
      <table className="users-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map(user => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.status}</td>
              <td>
                <button onClick={() => selectUser(user)}>Edit</button>
                <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="pagination">
        <button
          disabled={pagination.page === 1}
          onClick={() => changePage(pagination.page - 1)}
        >
          Previous
        </button>
        <span>
          Page {pagination.page} of {pagination.totalPages}
        </span>
        <button
          disabled={pagination.page === pagination.totalPages}
          onClick={() => changePage(pagination.page + 1)}
        >
          Next
        </button>
      </div>

      {/* Create User Form */}
      {showCreateForm && (
        <CreateUserForm
          onSubmit={handleCreateUser}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Edit User Form */}
      {showEditForm && selectedUser && (
        <EditUserForm
          user={selectedUser}
          onSubmit={handleEditUser}
          onCancel={() => {
            setShowEditForm(false);
            selectUser(null);
          }}
        />
      )}
    </div>
  );
};

export default UserManagement;
```

## Summary

This comprehensive guide covers:

1. **Redux Fundamentals**: Store, actions, reducers, and dispatch
2. **TypeScript Integration**: How to type everything properly
3. **Redux Toolkit**: Modern Redux with less boilerplate
4. **Async Operations**: Handling API calls with createAsyncThunk
5. **Selectors**: Efficient data access and derived state
6. **Custom Hooks**: Encapsulating Redux logic for components
7. **Best Practices**: Type safety, performance, and maintainability

The key benefits of using Redux + TypeScript together are:
- **Type Safety**: Catch errors at compile time
- **Better Developer Experience**: Autocomplete, refactoring, error detection
- **Maintainable Code**: Clear interfaces and predictable state changes
- **Performance**: Only re-render when necessary
- **Debugging**: Easy to track state changes and actions

Remember to:
- Always define interfaces for your state
- Use typed hooks (useAppDispatch, useAppSelector)
- Create selectors for all state access
- Handle loading, success, and error states
- Keep your state normalized and flat
- Test your Redux logic thoroughly

This setup gives you a robust, type-safe state management system that scales with your application.
