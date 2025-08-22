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

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, token, isAuthenticated, isLoading, error } = useAppSelector(
    (state) => state.auth
  );

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const result = await dispatch(loginUser(credentials));
      return result;
    },
    [dispatch]
  );

  const register = useCallback(
    async (userData: RegisterData) => {
      const result = await dispatch(registerUser(userData));
      return result;
    },
    [dispatch]
  );

  const logoutUserHandler = useCallback(async (allDevices: boolean = false) => {
    await dispatch(logoutUser({ allDevices }));
  }, [dispatch]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const refreshTokenHandler = useCallback(
    async (token: string) => {
      const result = await dispatch(refreshToken(token));
      return result;
    },
    [dispatch]
  );

  const testConnectionHandler = useCallback(
    async () => {
      const result = await dispatch(testConnection());
      return result;
    },
    [dispatch]
  );

  const updateUserData = (userData: any) => {
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
    register,
    logout: logoutUserHandler,
    refreshToken: refreshTokenHandler,
    testConnection: testConnectionHandler,
    clearAuthError,
    updateUser: updateUserData,
  };
};