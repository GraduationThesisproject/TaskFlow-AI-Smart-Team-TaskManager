# Redux + TypeScript Complete Guide

## What is Redux?

Redux is a **state management library** that acts as a central "brain" for your application. Think of it as a big container that holds all your app's data.

### Key Concepts:
- **State**: All the data your app uses (users, posts, settings, etc.)
- **Store**: The single place that holds all state
- **Actions**: Messages describing what happened ("user logged in", "post deleted")
- **Reducers**: Functions that update state based on actions
- **Dispatch**: How you send actions to the store

## What is TypeScript?

TypeScript is JavaScript with **type information**. It helps catch errors before your app runs and provides better development tools.

### Benefits:
- **Type Safety**: Catches errors at compile time
- **Better IDE Support**: Autocomplete, error detection, refactoring
- **Self-Documenting**: Types serve as documentation

## Why Use Redux + TypeScript Together?

1. **Type Safety**: Know exactly what data is in your store
2. **Better Development**: Autocomplete, error detection, refactoring
3. **Runtime Safety**: Catch errors before they reach users
4. **Maintainability**: Clear interfaces and predictable state changes

## Redux Core Concepts Explained

### 1. Store
The store is like a big JavaScript object that holds all your app's state.

```typescript
// Example store structure
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
  }
}
```

### 2. Actions
Actions are plain objects that describe what happened in your app.

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

### 3. Reducers
Reducers are functions that take current state and an action, then return new state.

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

### 4. Dispatch
Dispatch is how you send actions to the store to trigger state changes.

```typescript
// Dispatching actions
store.dispatch(loginAction);
store.dispatch(logoutAction);
```

## Redux Toolkit

Redux Toolkit is the modern way to write Redux. It simplifies common patterns and reduces boilerplate.

### Key Features:
- **createSlice**: Combines actions and reducers
- **createAsyncThunk**: Handles async operations (API calls)
- **configureStore**: Sets up store with good defaults
- **Immer**: Allows "mutating" code that's actually immutable

## TypeScript in Redux - Step by Step

### Step 1: Define Your State Types

```typescript
// types/user.types.ts
export interface User {
  id: string;
  name: string;
  email: string;
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
```

### Step 2: Create Redux Slice

```typescript
// store/slices/userSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { UserState, LoginCredentials, User } from '../../types/user.types';

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Login failed');
      }

      const data = await response.json();
      return data;
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
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...action.payload };
      }
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
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError, updateUser } = userSlice.actions;
export default userSlice.reducer;
```

### Step 3: Configure Store

```typescript
// store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import userReducer from './slices/userSlice';

// Create the store
export const store = configureStore({
  reducer: {
    user: userReducer,
  },
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
```

### Step 5: Use in React Components

```typescript
// components/UserProfile.tsx
import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { selectCurrentUser, selectUserLoading, selectUserError } from '../store/selectors/userSelectors';
import { loginUser, logout } from '../store/slices/userSlice';

const UserProfile: React.FC = () => {
  const dispatch = useAppDispatch();
  
  // Use typed selectors
  const currentUser = useAppSelector(selectCurrentUser);
  const loading = useAppSelector(selectUserLoading);
  const error = useAppSelector(selectUserError);

  const handleLogin = async (email: string, password: string) => {
    try {
      await dispatch(loginUser({ email, password })).unwrap();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!currentUser) {
    return (
      <div>
        <h2>Please Log In</h2>
        <button onClick={() => handleLogin('test@example.com', 'password')}>
          Login
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1>Welcome, {currentUser.name}!</h1>
      <p>Email: {currentUser.email}</p>
      <p>Role: {currentUser.role}</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default UserProfile;
```

## What Each Part Does

### 1. **Types/Interfaces**
- **Purpose**: Define the shape of your data
- **What it does**: Tells TypeScript what properties objects have
- **Example**: `User` interface defines that a user has `id`, `name`, `email`, and `role`

### 2. **Redux Slice**
- **Purpose**: Combines actions, reducers, and async logic
- **What it does**: 
  - Defines initial state
  - Creates actions (sync and async)
  - Handles state updates
  - Manages loading and error states

### 3. **Async Thunks**
- **Purpose**: Handle API calls and async operations
- **What it does**:
  - Makes HTTP requests
  - Updates loading state while waiting
  - Updates state with response data
  - Handles errors gracefully

### 4. **Store Configuration**
- **Purpose**: Set up the Redux store
- **What it does**:
  - Combines all reducers
  - Sets up middleware
  - Creates type-safe store

### 5. **Selectors**
- **Purpose**: Access state data efficiently
- **What it does**:
  - Gets data from store
  - Computes derived data
  - Only re-renders when relevant data changes

### 6. **Typed Hooks**
- **Purpose**: Use Redux in React components with type safety
- **What it does**:
  - `useAppDispatch`: Send actions to store
  - `useAppSelector`: Get data from store
  - Maintains TypeScript types

## Data Flow Explained

### 1. **Component Triggers Action**
```typescript
// User clicks login button
const handleLogin = () => {
  dispatch(loginUser({ email: 'user@example.com', password: '123' }));
};
```

### 2. **Async Thunk Executes**
```typescript
// loginUser thunk runs
export const loginUser = createAsyncThunk(
  'user/login',
  async (credentials) => {
    const response = await fetch('/api/login', { /* ... */ });
    return response.json();
  }
);
```

### 3. **State Updates**
```typescript
// Reducer handles the action
.addCase(loginUser.pending, (state) => {
  state.loading = true;  // Show loading spinner
})
.addCase(loginUser.fulfilled, (state, action) => {
  state.loading = false;  // Hide loading spinner
  state.currentUser = action.payload.user;  // Set user data
})
.addCase(loginUser.rejected, (state, action) => {
  state.loading = false;  // Hide loading spinner
  state.error = action.payload;  // Show error message
});
```

### 4. **Component Re-renders**
```typescript
// Component automatically updates with new data
const currentUser = useAppSelector(selectCurrentUser);
const loading = useAppSelector(selectUserLoading);
const error = useAppSelector(selectUserError);
```

## Common Patterns

### 1. **Loading States**
Always handle three states:
- **Loading**: Show spinner, disable buttons
- **Success**: Show data, enable interactions
- **Error**: Show error message, allow retry

### 2. **Error Handling**
```typescript
// In async thunk
if (!response.ok) {
  const errorData = await response.json();
  return rejectWithValue(errorData.message || 'Operation failed');
}

// In component
if (error) {
  return <div>Error: {error}</div>;
}
```

### 3. **Optimistic Updates**
```typescript
// Update UI immediately, then sync with server
.addCase(updateUser.fulfilled, (state, action) => {
  const index = state.users.findIndex(u => u.id === action.payload.id);
  if (index !== -1) {
    state.users[index] = action.payload;
  }
});
```

## Best Practices

### 1. **Type Everything**
- Define interfaces for all state
- Type action payloads
- Use generic types where appropriate

### 2. **Use Selectors**
- Create selectors for all state access
- Use memoized selectors for expensive calculations
- Keep selectors close to their slice

### 3. **Handle All States**
- Always handle loading, success, and error
- Show appropriate UI for each state
- Provide user feedback

### 4. **Keep State Normalized**
- Avoid nested objects and arrays
- Use flat structure for better performance
- Maintain referential equality

## Common Issues & Solutions

### 1. **TypeScript Errors**
```typescript
// ❌ Wrong - loses type information
const dispatch = useDispatch();
const user = useSelector(state => state.user.currentUser);

// ✅ Correct - maintains types
const dispatch = useAppDispatch();
const user = useAppSelector(state => state.user.currentUser);
```

### 2. **State Not Updating**
```typescript
// ❌ Wrong - mutating state directly
state.users.push(newUser);

// ✅ Correct - using Immer (Redux Toolkit handles this)
state.users.push(newUser); // This actually works with Redux Toolkit!
```

### 3. **Async Operations Not Working**
```typescript
// ❌ Wrong - not handling promise
dispatch(loginUser(credentials));

// ✅ Correct - handling promise
try {
  await dispatch(loginUser(credentials)).unwrap();
  // Success
} catch (error) {
  // Handle error
}
```

## Summary

Redux + TypeScript gives you:

1. **Centralized State Management**: All data in one place
2. **Type Safety**: Catch errors before runtime
3. **Predictable Updates**: Clear data flow patterns
4. **Better Development Experience**: Autocomplete, refactoring, error detection
5. **Performance**: Only re-render when necessary
6. **Maintainability**: Clear interfaces and predictable state changes

The key is to:
- **Define types** for all your data
- **Use Redux Toolkit** for modern Redux patterns
- **Create selectors** for efficient data access
- **Handle all states** (loading, success, error)
- **Use typed hooks** for type safety

This setup creates a robust, maintainable state management system that scales with your application.
