import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../services/api';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });
  
  const isMountedRef = useRef(true);

  useEffect(() => {
    loadStoredAuth();
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadStoredAuth = async () => {
    try {
      const [token, userData] = await Promise.all([
        AsyncStorage.getItem('auth_token'),
        AsyncStorage.getItem('auth_user'),
      ]);

      if (!isMountedRef.current) return;

      if (token && userData) {
        const user = JSON.parse(userData);
        apiService.setToken(token);
        setAuthState({
          user,
          token,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Failed to load stored auth:', error);
      if (isMountedRef.current) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    }
  };

  const login = async (email: string, password: string) => {
    try {
      if (!isMountedRef.current) return { success: false, error: 'Component unmounted' };
      
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const response = await apiService.login(email, password);
      
      if (!isMountedRef.current) return { success: false, error: 'Component unmounted' };
      
      if (response.success && response.data) {
        const { user, token } = response.data;
        
        await Promise.all([
          AsyncStorage.setItem('auth_token', token),
          AsyncStorage.setItem('auth_user', JSON.stringify(user)),
        ]);

        if (!isMountedRef.current) return { success: false, error: 'Component unmounted' };

        apiService.setToken(token);
        
        setAuthState({
          user,
          token,
          isLoading: false,
          isAuthenticated: true,
        });

        return { success: true };
      } else {
        if (isMountedRef.current) {
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
        return { success: false, error: response.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      if (isMountedRef.current) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
      return { success: false, error: 'Login failed' };
    }
  };

  const register = async (userData: { name: string; email: string; password: string }) => {
    try {
      if (!isMountedRef.current) return { success: false, error: 'Component unmounted' };
      
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const response = await apiService.register(userData);
      
      if (!isMountedRef.current) return { success: false, error: 'Component unmounted' };
      
      if (response.success && response.data) {
        const { user, token } = response.data;
        
        await Promise.all([
          AsyncStorage.setItem('auth_token', token),
          AsyncStorage.setItem('auth_user', JSON.stringify(user)),
        ]);

        if (!isMountedRef.current) return { success: false, error: 'Component unmounted' };

        apiService.setToken(token);
        
        setAuthState({
          user,
          token,
          isLoading: false,
          isAuthenticated: true,
        });

        return { success: true };
      } else {
        if (isMountedRef.current) {
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
        return { success: false, error: response.error || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      if (isMountedRef.current) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
      return { success: false, error: 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    }

    await Promise.all([
      AsyncStorage.removeItem('auth_token'),
      AsyncStorage.removeItem('auth_user'),
    ]);

    apiService.clearToken();
    
    setAuthState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    });
  };

  const updateProfile = async (userData: Partial<{ name: string; email: string; avatar: string }>) => {
    try {
      if (!isMountedRef.current) return { success: false, error: 'Component unmounted' };
      
      const response = await apiService.updateProfile(userData);
      
      if (!isMountedRef.current) return { success: false, error: 'Component unmounted' };
      
      if (response.success && response.data) {
        const updatedUser = response.data;
        
        await AsyncStorage.setItem('auth_user', JSON.stringify(updatedUser));
        
        if (isMountedRef.current) {
          setAuthState(prev => ({
            ...prev,
            user: updatedUser,
          }));
        }

        return { success: true };
      } else {
        return { success: false, error: response.error || 'Profile update failed' };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: 'Profile update failed' };
    }
  };

  return {
    ...authState,
    login,
    register,
    logout,
    updateProfile,
  };
}
