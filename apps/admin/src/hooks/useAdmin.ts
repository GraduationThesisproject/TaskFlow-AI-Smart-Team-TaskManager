import { useCallback } from 'react';
import { useAppDispatch } from '../store';
import { AdminLoginCredentials } from '../types';
import { loginAdmin, logoutAdmin, getCurrentAdmin } from '../store/slices/adminSlice';

export const useAdmin = () => {
  const dispatch = useAppDispatch();

  const login = useCallback(async (credentials: AdminLoginCredentials) => {
    try {
      const result = await dispatch(loginAdmin(credentials)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const logout = useCallback(async () => {
    try {
      await dispatch(logoutAdmin()).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const getCurrentAdminData = useCallback(async () => {
    try {
      const result = await dispatch(getCurrentAdmin()).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  return {
    login,
    logout,
    getCurrentAdminData,
  };
};
