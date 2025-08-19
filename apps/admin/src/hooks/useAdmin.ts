import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { AdminState, AdminLoginCredentials } from '../types';

export const useAdmin = () => {
  const dispatch = useAppDispatch();
  const admin = useAppSelector((state) => state.admin);

  const login = useCallback(async (credentials: AdminLoginCredentials) => {
    // Implement admin login logic
    console.log('Admin login with:', credentials);
  }, [dispatch]);

  const logout = useCallback(() => {
    // Implement admin logout logic
    console.log('Admin logout');
  }, [dispatch]);

  const refreshToken = useCallback(async () => {
    // Implement token refresh logic
    console.log('Admin refresh token');
  }, [dispatch]);

  return {
    ...admin,
    login,
    logout,
    refreshToken,
  };
};
