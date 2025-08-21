import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { loginUser, logoutUser, clearError, setCredentials, updateUser } from '../store/slices/authSlice';
import { TEST_TOKEN } from '../config/env';
import axiosInstance from '../config/axios';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, token, isAuthenticated, isLoading, error } = useAppSelector(
    (state) => state.auth
  );

  // Initialize authentication on mount
  useEffect(() => {
    if (!token && TEST_TOKEN) {
      // Create a mock user for test token
      const mockUser = {
        id: 'test-user',
        name: 'Test User',
        email: 'test@example.com',
        emailVerified: true,
        isActive: true,
        lastLogin: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      dispatch(setCredentials({ user: mockUser, token: TEST_TOKEN }));
    }
  }, [dispatch, token]);

  // Set up axios interceptor to use token from Redux
  useEffect(() => {
    if (token) {
      // Set the token in axios defaults
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      // Remove the token from axios defaults
      delete axiosInstance.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const login = useCallback(
    async (credentials: { email: string; password: string }) => {
      const result = await dispatch(loginUser(credentials));
      return result;
    },
    [dispatch]
  );

  const logoutUserHandler = useCallback(async () => {
    await dispatch(logoutUser());
    // Clear axios headers
    delete axiosInstance.defaults.headers.common['Authorization'];
  }, [dispatch]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const updateUserData = (userData: any) => {
    dispatch(updateUser(userData));
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
