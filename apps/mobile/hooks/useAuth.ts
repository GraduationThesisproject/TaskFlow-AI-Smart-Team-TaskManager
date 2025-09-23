import { useCallback, useState } from 'react';
import { useAppDispatch, useAppSelector, type AppDispatch } from '../store';
import { useNavigate } from 'react-router-dom';
import { 
  loginUser, 
  registerUser, 
  logoutUser, 
  deleteUserAccount,
  clearError,
  oauthLogin,
  oauthRegister,
  updateUser,
  refreshToken, 
  testConnection, 
  verifyEmail,
  resendVerificationCode,
  requestPasswordReset,
  resetPassword,
  updateProfile,
  updateProfileSecure,
  changePassword,
} from '../store/slices/authSlice';
import type { LoginCredentials, RegisterData, OAuthCallbackData, EmailVerificationData, ResendVerificationData, PasswordResetRequestData, PasswordResetData } from '../types/auth.types';
import { oauthService } from '../services/oauthService';

type UseOAuthReturn = {
  loginWithOAuth: (provider: 'google' | 'github') => void;
  signupWithOAuth: (provider: 'google' | 'github') => void;
};

type UseOAuthCallbackReturn = {
  handleOAuthCallback: (provider: 'google' | 'github', code: string, state?: string) => Promise<any>;
  isProcessing: boolean;
  error: string | null;
  clearError: () => void;
};

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

  const logoutUserHandler = useCallback(async (params: { allDevices?: boolean, navigate?: (path: string) => void } = {}) => {
    const { allDevices = false, navigate } = params;
    await dispatch(logoutUser({ allDevices, navigate }));
  }, [dispatch]);

  const deleteAccountHandler = useCallback(async (params: { password?: string, navigate?: (path: string) => void } = {}) => {
    const { password, navigate } = params;
    await dispatch(deleteUserAccount({ password, navigate }));
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

  const loginWithOAuth = useCallback(
    (provider: 'google' | 'github') => {
      try {
        return oauthService.initiateLogin(provider);
      } catch (error) {
        console.error('OAuth login error:', error);
        throw error;
      }
    },
    []
  );

  const signupWithOAuth = useCallback(
    (provider: 'google' | 'github') => {
      try {
        return oauthService.initiateSignup(provider);
      } catch (error) {
        console.error('OAuth signup error:', error);
        throw error;
      }
    },
    []
  );

  const handleOAuthCallback = useCallback(
    async (provider: 'google' | 'github', code: string, state?: string) => {
      try {
        const result = await oauthService.handleCallback(window.location.href);
        
        if (result.action === 'login') {
          const loginResult = await dispatch(oauthLogin({ code, provider }));
          return loginResult;
        } else {
          const registerResult = await dispatch(oauthRegister({ code, provider }));
          return registerResult;
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        throw error;
      }
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

  // Email verification methods
  const verifyUserEmail = useCallback(
    async (verificationData: EmailVerificationData) => {
      return dispatch(verifyEmail(verificationData));
    },
    [dispatch]
  );

  const resendVerificationCodeEmail = useCallback(
    async (resendData: ResendVerificationData) => {
      // Return the action result without throwing on reject
      return await dispatch(resendVerificationCode(resendData));
    },
    [dispatch]
  );

  const requestPasswordResetHandler = useCallback(
    async (resetData: PasswordResetRequestData) => {
      return await dispatch(requestPasswordReset(resetData)).unwrap();
    },
    [dispatch]
  );

  const resetPasswordHandler = useCallback(
    async (resetData: PasswordResetData) => {
      return await dispatch(resetPassword(resetData)).unwrap();
    },
    [dispatch]
  );

  const updateProfileHandler = useCallback(
    async (payload: { name?: string; avatar?: File | null }) => {
      return await dispatch(updateProfile(payload)).unwrap();
    },
    [dispatch]
  );

  const updateProfileSecureHandler = useCallback(
    async (payload: { name?: string; avatar?: File | null; currentPassword?: string }) => {
      return await dispatch(updateProfileSecure(payload as any)).unwrap();
    },
    [dispatch]
  );

  const changePasswordHandler = useCallback(
    async (payload: { currentPassword: string; newPassword: string }) => {
      return await dispatch(changePassword(payload)).unwrap();
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
    deleteAccount: deleteAccountHandler,
    clearAuthError,
    clearError: clearAuthError,
    updateUser: updateUserData,
    loginWithOAuth,
    signupWithOAuth,
    handleOAuthCallback,
    verifyEmail: verifyUserEmail,
    // Alias used by some components
    verifyEmailCode: verifyUserEmail,
    resendVerification: resendVerificationCodeEmail,
    requestPasswordReset: requestPasswordResetHandler,
    resetPassword: resetPasswordHandler,
    testConnection: testConnectionHandler,
    refreshToken: refreshTokenHandler,
    updateProfile: updateProfileHandler,
    updateProfileSecure: updateProfileSecureHandler,
    changePassword: changePasswordHandler,
  };
};

// Export standalone OAuth hooks for components that only need OAuth functionality
export const useOAuth = (): UseOAuthReturn => {
  const { loginWithOAuth, signupWithOAuth } = useAuth();
  return { loginWithOAuth, signupWithOAuth };
};

export const useOAuthCallback = (): UseOAuthCallbackReturn => {
  const { handleOAuthCallback } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCallback = useCallback(
    async (provider: 'google' | 'github', code: string, state?: string) => {
      try {
        setIsProcessing(true);
        setError(null);
        return await handleOAuthCallback(provider, code, state);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'OAuth callback failed');
        throw err;
      } finally {
        setIsProcessing(false);
      }
    },
    [handleOAuthCallback]
  );

  return {
    handleOAuthCallback: handleCallback,
    isProcessing,
    error,
    clearError: () => setError(null),
  };
};