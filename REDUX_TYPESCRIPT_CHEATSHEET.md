# Redux + TypeScript Quick Reference

## 🎯 Core Concepts

### Redux
- **Store**: Central container for all app state
- **Actions**: Objects describing what happened
- **Reducers**: Functions that update state
- **Dispatch**: How you send actions to store

### TypeScript
- **Interfaces**: Define object shapes
- **Types**: Union types, generics, etc.
- **Type Safety**: Catch errors at compile time

## 📝 Basic Setup

### 1. Store Configuration
```typescript
import { configureStore } from '@reduxjs/toolkit';

export const store = configureStore({
  reducer: {
    user: userReducer,
    posts: postsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### 2. Typed Hooks
```typescript
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

## 🔧 Redux Slice

### Basic Slice
```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  name: string;
  email: string;
  loading: boolean;
}

const initialState: UserState = {
  name: '',
  email: '',
  loading: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
    setEmail: (state, action: PayloadAction<string>) => {
      state.email = action.payload;
    },
  },
});

export const { setName, setEmail } = userSlice.actions;
export default userSlice.reducer;
```

### Async Thunk
```typescript
import { createAsyncThunk } from '@reduxjs/toolkit';

export const fetchUser = createAsyncThunk(
  'user/fetchUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) {
        return rejectWithValue('Failed to fetch user');
      }
      return response.json();
    } catch (error) {
      return rejectWithValue('Network error');
    }
  }
);

// In slice extraReducers:
extraReducers: (builder) => {
  builder
    .addCase(fetchUser.pending, (state) => {
      state.loading = true;
    })
    .addCase(fetchUser.fulfilled, (state, action) => {
      state.loading = false;
      state.name = action.payload.name;
      state.email = action.payload.email;
    })
    .addCase(fetchUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
}
```

## 🎨 React Components

### Using Redux in Components
```typescript
import React from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { selectUser, selectUserLoading } from '../store/selectors/userSelectors';
import { setName, fetchUser } from '../store/slices/userSlice';

const UserProfile: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const loading = useAppSelector(selectUserLoading);

  const handleNameChange = (name: string) => {
    dispatch(setName(name));
  };

  const handleFetchUser = async () => {
    try {
      await dispatch(fetchUser('123')).unwrap();
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <input
        value={user.name}
        onChange={(e) => handleNameChange(e.target.value)}
      />
      <button onClick={handleFetchUser}>Fetch User</button>
    </div>
  );
};
```

## 🔍 Selectors

### Basic Selectors
```typescript
import { RootState } from '../store';

export const selectUser = (state: RootState) => state.user;
export const selectUserName = (state: RootState) => state.user.name;
export const selectUserLoading = (state: RootState) => state.user.loading;
```

### Memoized Selectors
```typescript
import { createSelector } from '@reduxjs/toolkit';

export const selectUserFullName = createSelector(
  [selectUser],
  (user) => `${user.firstName} ${user.lastName}`
);

export const selectActiveUsers = createSelector(
  [selectUsers],
  (users) => users.filter(user => user.status === 'active')
);
```

## 📊 State Management Patterns

### Loading States
```typescript
interface State {
  data: Data | null;
  loading: boolean;
  error: string | null;
}

// Always handle these three states:
if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
if (!data) return <NoDataMessage />;
```

### Error Handling
```typescript
// In async thunk
if (!response.ok) {
  const errorData = await response.json();
  return rejectWithValue(errorData.message || 'Operation failed');
}

// In component
try {
  await dispatch(someAction()).unwrap();
  // Success
} catch (error) {
  // Handle error
}
```

## 🚨 Common Issues & Solutions

### 1. TypeScript Errors
```typescript
// ❌ Wrong
const dispatch = useDispatch();
const user = useSelector(state => state.user);

// ✅ Correct
const dispatch = useAppDispatch();
const user = useAppSelector(state => state.user);
```

### 2. State Not Updating
```typescript
// ❌ Wrong - mutating state
state.users.push(newUser);

// ✅ Correct - Redux Toolkit handles this
state.users.push(newUser); // Works with Redux Toolkit!
```

### 3. Async Operations
```typescript
// ❌ Wrong - not handling promise
dispatch(fetchUser(id));

// ✅ Correct - handling promise
try {
  await dispatch(fetchUser(id)).unwrap();
} catch (error) {
  // Handle error
}
```

## 🔐 Type Definitions

### Basic Types
```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
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

### Action Types
```typescript
export interface LoginAction {
  type: 'user/login';
  payload: User;
}

export interface LogoutAction {
  type: 'user/logout';
}

export type UserAction = LoginAction | LogoutAction;
```

## 🎯 Best Practices

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

## 📚 File Structure
```
src/
├── store/
│   ├── index.ts              # Store configuration
│   ├── slices/
│   │   ├── userSlice.ts      # User state management
│   │   └── postsSlice.ts     # Posts state management
│   └── selectors/
│       ├── userSelectors.ts  # User selectors
│       └── postsSelectors.ts # Posts selectors
├── types/
│   ├── user.types.ts         # User type definitions
│   └── posts.types.ts        # Posts type definitions
└── components/
    └── UserProfile.tsx       # Component using Redux
```

## 🚀 Quick Start Checklist

- [ ] Define TypeScript interfaces for your state
- [ ] Create Redux slices with createSlice
- [ ] Set up async thunks for API calls
- [ ] Configure store with configureStore
- [ ] Create typed hooks (useAppDispatch, useAppSelector)
- [ ] Build selectors for state access
- [ ] Handle loading, success, and error states
- [ ] Use components with typed Redux hooks

## 💡 Pro Tips

1. **Use Redux DevTools** for debugging
2. **Normalize your state** for better performance
3. **Create custom hooks** to encapsulate Redux logic
4. **Test your reducers** with different actions
5. **Use TypeScript strict mode** for better type safety
6. **Keep actions simple** and focused
7. **Use selectors** instead of accessing state directly
8. **Handle errors gracefully** in async operations

This cheat sheet covers the essential patterns you need for Redux + TypeScript development!
