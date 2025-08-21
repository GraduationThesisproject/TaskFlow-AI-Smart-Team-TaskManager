import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { setToken, setUser, logout } from '../store/slices/authSlice';
import { TEST_TOKEN } from '../config/env';
import axiosInstance from '../config/axios';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { token, user, isAuthenticated, isLoading, error } = useAppSelector(state => state.auth);

  // Initialize authentication on mount
  useEffect(() => {
    if (!token && TEST_TOKEN) {
      dispatch(setToken(TEST_TOKEN));
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

  const login = (userToken: string, userData?: any) => {
    dispatch(setToken(userToken));
    if (userData) {
      dispatch(setUser(userData));
    }
  };

  const logoutUser = () => {
    dispatch(logout());
    // Clear axios headers
    delete axiosInstance.defaults.headers.common['Authorization'];
  };

  const updateUser = (userData: any) => {
    dispatch(setUser(userData));
  };

  return {
    token,
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout: logoutUser,
    updateUser,
  };
};
