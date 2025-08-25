import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { 
  loginUser, 
  registerUser, 
  logoutUser, 
  clearError,
  checkAuthStatus,
  oauthLogin,
  oauthRegister,
  updateUser,
  refreshToken, 
  testConnection, 
  verifyEmail,
  resendVerificationCode,
  requestPasswordReset,
  resetPassword
} from '../store/slices/authSlice';
import type { LoginCredentials, RegisterData, OAuthCallbackData, EmailVerificationData, ResendVerificationData, PasswordResetRequestData, PasswordResetData } from '../types/auth.types';
import { oauthService } from '../services/oauthService';

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

  // OAuth login handler
  const handleOAuthLogin = useCallback(
    async (provider: 'google' | 'github', code: string) => {
      try {
        const callbackData: OAuthCallbackData = { code, provider };
        const result = await dispatch(oauthLogin(callbackData));
        return result;
      } catch (error) {
        console.error('OAuth login error:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const handleOAuthSignup = useCallback(
    async (provider: 'google' | 'github', code: string) => {
      try {
        const callbackData: OAuthCallbackData = { code, provider };
        const result = await dispatch(oauthRegister(callbackData));
        return result;
      } catch (error) {
        console.error('OAuth signup error:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // Handle OAuth callback
  const handleOAuthCallback = useCallback(
    async (code: string, provider: 'google' | 'github') => {
      const action = oauthService.getOAuthAction();
      const callbackData: OAuthCallbackData = { code, provider };
      
      if (action === 'login') {
        const result = await dispatch(oauthLogin(callbackData));
        return result;
      } else {
        const result = await dispatch(oauthRegister(callbackData));
        return result;
      }
    },
    [dispatch]
  );

  // Email verification methods
  const verifyUserEmail = useCallback(
    async (verificationData: EmailVerificationData) => {
      return dispatch(verifyEmail(verificationData));
    },
    [dispatch]
  );

  const resendVerificationCodeEmail = useCallback(
    async (resendData: ResendVerificationData) => {
      return await dispatch(resendVerificationCode(resendData)).unwrap();
    },
    [dispatch]
  );

  const requestPasswordResetEmail = useCallback(
    async (resetData: PasswordResetRequestData) => {
      return await dispatch(requestPasswordReset(resetData)).unwrap();
    },
    [dispatch]
  );

  const resetUserPassword = useCallback(
    async (resetData: PasswordResetData) => {
      return await dispatch(resetPassword(resetData)).unwrap();
    },
    [dispatch]
  );

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
    clearError,
    updateUser: updateUserData,
    loginWithOAuth,
    signupWithOAuth,
    handleOAuthCallback,
    verifyEmail: verifyUserEmail,
    resendVerificationCode: resendVerificationCodeEmail,
    requestPasswordReset: requestPasswordResetEmail,
    resetPassword: resetUserPassword,
  };
};