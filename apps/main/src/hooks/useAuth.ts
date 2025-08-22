/*🧩 useAuth.ts - Custom Hook Explained for Beginners
What is this file?
useAuth.ts
 is a custom React hook that acts as a convenient wrapper around your authentication logic. It does NOT replace 
authService.ts
 - instead, it uses the auth service internally and makes it easier to work with in React components.*/
/*Relationship Between Files
authService.ts  ←--uses--  useAuth.ts  ←--uses--  React Components
     ↓                        ↓                        ↓
  Raw API calls         Redux integration        Easy-to-use hook

authService.ts
: Direct API communication with backend
useAuth.ts
: React hook that combines authService + Redux
Components: Use the hook for clean, simple authentication*/

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { 
  loginUser, 
  registerUser, 
  logoutUser, 
  refreshToken, 
  testConnection, 
  clearError, 
  updateUser 
} from '../store/slices/authSlice';
import type { LoginCredentials, RegisterData } from '../types/auth.types';
/*hat these do:

useCallback: Prevents functions from being recreated on every render (performance optimization)
useAppDispatch: Sends actions to Redux store
useAppSelector: Reads data from Redux store
Redux actions: The actual functions that update auth state
Contains actions like loginUser, logoutUser, clearError, updateUser.

These actions change the auth state in Redux (user, token, isAuthenticated, etc.).
*/
export const useAuth = () => {
  /*This creates the hook useAuth.*/
  const dispatch = useAppDispatch();
 // Send actions to Redux
  const { user, token, isAuthenticated, isLoading, error } = useAppSelector(
    (state) => state.auth
  );
/*
useAppSelector grabs data from the Redux auth slice:

user: current logged-in user info

token: authentication token (JWT)

isAuthenticated: whether the user is logged in

isLoading: shows if a login/logout request is still running

error: any error messages*/
  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const result = await dispatch(loginUser(credentials));
      return result;
    },
    [dispatch]
  );
/*login() takes email + password.

Calls the Redux loginUser async function.

Updates the Redux state with the logged-in user + token*/

  const register = useCallback(
    async (userData: RegisterData) => {
      const result = await dispatch(registerUser(userData));
      return result;
    },
    [dispatch]
  );
/*register() takes name, email + password.

Calls the Redux registerUser async function.

Updates the Redux state with the new user + token*/
  const logoutUserHandler = useCallback(async (allDevices: boolean = false) => {
    await dispatch(logoutUser({ allDevices }));
    // Token is cleared in the logout thunk and axios interceptor handles it
  }, [dispatch]);
/*Logs the user out.

If allDevices = true, it logs the user out of all devices (like WhatsApp Web).*/
  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);
/*Removes error messages from Redux (useful after showing an error to the user).*/

  const refreshTokenHandler = useCallback(
    async (token: string) => {
      const result = await dispatch(refreshToken(token));
      return result;
    },
    [dispatch]
  );
/*Refreshes the authentication token.

Calls the Redux refreshToken async function.

Updates the Redux state with the new token*/

  const testConnectionHandler = useCallback(
    async () => {
      const result = await dispatch(testConnection());
      return result;
    },
    [dispatch]
  );
/*Tests connection to the backend server.

Calls the Redux testConnection async function.

Useful for debugging connection issues*/
  const updateUserData = (userData: any) => {
    // Convert any Date objects to ISO strings before dispatching
    const serializedUserData = Object.keys(userData).reduce((acc, key) => {
      const value = userData[key];
      if (value instanceof Date) {
        acc[key] = value.toISOString();
      } else {
        acc[key] = value;
      }
      return acc;
    }, {} as any);
    
    dispatch(updateUser(serializedUserData));
  };
/*Updates the user profile in Redux.

Converts any Date objects → ISO strings (so Redux can store them safely).*/
  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout: logoutUserHandler,
    refreshToken: refreshTokenHandler,
    testConnection: testConnectionHandler,
    clearAuthError,
    updateUser: updateUserData,
  };
};
/*The hook gives back all the auth-related state and functions.*/
//-------------------------------------------------------------------
/*So in your React components, you can do:

const { 
  user, 
  login, 
  register, 
  logout, 
  refreshToken, 
  testConnection, 
  isAuthenticated 
} = useAuth();

// Login example
if (!isAuthenticated) {
  login({ email: "test@test.com", password: "123456" });
}

// Register example
register({ 
  name: "John Doe", 
  email: "john@example.com", 
  password: "securePassword123" 
});

// Test connection example
testConnection();

✅ Beginner Summary

useAuth is a custom hook that centralizes ALL authentication logic.

Instead of importing dispatch(loginUser(...)) everywhere, you just call the functions from this hook.

It returns:

State: user, token, isAuthenticated, isLoading, error

Actions: login, register, logout, refreshToken, testConnection, clearAuthError, updateUser

This makes your code cleaner, reusable, and provides access to all AuthService functions through Redux.*/




















//----------------------------------------------------------
/*Refactoring Complete! Clean Architecture Achieved
Summary of Changes
I've successfully refactored your authentication system to eliminate code duplication and create a clean separation of concerns:

✅ What Was Accomplished
Centralized TypeScript Types - Moved all interfaces to 
auth.types.ts
Eliminated Duplication - Removed duplicate interfaces from 
authService.ts
Enhanced Redux Integration - Added all AuthService functions to 
authSlice.ts
Complete Hook Refactoring - Updated 
useAuth.ts
 to provide access to all authentication functions
🏗️ New Clean Architecture
📁 types/auth.types.ts          ← All TypeScript interfaces
    ↓ imports
📁 services/authService.ts      ← Raw API calls to backend
    ↓ used by
📁 store/slices/authSlice.ts    ← Redux state management + async thunks
    ↓ used by
📁 hooks/useAuth.ts             ← React hook wrapper
    ↓ used by
📁 components/                  ← React components
🔧 Available Functions in useAuth Hook
Your components can now access all authentication functionality through one clean interface:

typescript
const { 
  // State
  user, token, isAuthenticated, isLoading, error,
  
  // Actions
  login,           // Login with email/password
  register,        // Register new user
  logout,          // Logout (single/all devices)
  refreshToken,    // Refresh expired token
  testConnection,  // Test backend connectivity
  clearAuthError,  // Clear error messages
  updateUser       // Update user profile
} = useAuth();
🎯 Benefits Achieved
No Code Duplication - Single source of truth for interfaces
Clean Separation - Types, API calls, state management, and hooks are separate
Better Maintainability - Changes in one place affect the whole system
Type Safety - Consistent TypeScript interfaces throughout
Complete Functionality - All AuthService functions available as hooks
Your authentication system now follows modern React/Redux patterns with excellent separation of concerns. Components can use any authentication function through the simple 
useAuth()
 hook interface!*/