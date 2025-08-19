import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { AuthState, LoginCredentials, RegisterData } from '../types';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  const login = useCallback(async (credentials: LoginCredentials) => {
    // Implement login logic
    console.log('Login with:', credentials);
  }, [dispatch]);

  const register = useCallback(async (data: RegisterData) => {
    // Implement register logic
    console.log('Register with:', data);
  }, [dispatch]);

  const logout = useCallback(() => {
    // Implement logout logic
    console.log('Logout');
  }, [dispatch]);

  const refreshToken = useCallback(async () => {
    // Implement token refresh logic
    console.log('Refresh token');
  }, [dispatch]);

  return {
    ...auth,
    login,
    register,
    logout,
    refreshToken,
  };
};
