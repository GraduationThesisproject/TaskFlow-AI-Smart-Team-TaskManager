import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { loginUser, logoutUser, clearError, updateUser } from '../store/slices/authSlice';

/**
 * Custom hook for authentication management
 * 
 * Note: User date fields (lastLogin, createdAt, updatedAt) are stored as ISO strings in Redux
 * to ensure serialization compatibility. Use the utility functions from utils/index.ts
 * to convert them back to Date objects when needed:
 * - fromISODateString() - Convert ISO string to Date
 * - formatDate() - Format date for display
 * - formatDateTime() - Format date and time for display
 */
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, token, isAuthenticated, isLoading, error } = useAppSelector(
    (state) => state.auth
  );

  // Note: Token is now handled by axios interceptor from localStorage
  // No need to manually set axios headers here

  const login = useCallback(
    async (credentials: { email: string; password: string }) => {
      const result = await dispatch(loginUser(credentials));
      return result;
    },
    [dispatch]
  );

  const logoutUserHandler = useCallback(async (allDevices: boolean = false) => {
    await dispatch(logoutUser({ allDevices }));
    // Token is cleared in the logout thunk and axios interceptor handles it
  }, [dispatch]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

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

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout: logoutUserHandler,
    clearAuthError,
    updateUser: updateUserData,
  };
};
