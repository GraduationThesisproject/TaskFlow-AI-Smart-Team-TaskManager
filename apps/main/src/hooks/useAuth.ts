import { useCallback, useState } from 'react';
import { useAppDispatch, useAppSelector, type AppDispatch } from '../store';
import { useNavigate } from 'react-router-dom';

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
import { 
  loginUser, 
  registerUser, 
  logoutUser, 
  clearError,
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
import { useDispatch } from 'react-redux';

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




 const useOAuth = (): UseOAuthReturn => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear OAuth error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Google OAuth login
  const loginWithGoogle = useCallback(async () => {
    try {
      setIsProcessing(true);
      setError(null);
      
      console.log('🔄 Initiating Google OAuth login...');
      const oauthUrl = authService.getOAuthUrl('google');
      console.log('🔄 Google OAuth URL:', oauthUrl);
      
      // Open OAuth URL in the same window to allow backend redirect
      window.location.href = oauthUrl;
    } catch (error) {
      console.error('❌ Google OAuth error:', error);
      setError(error instanceof Error ? error.message : 'Failed to initiate Google login');
      setIsProcessing(false);
    }
  }, []);

  // GitHub OAuth login
  const loginWithGithub = useCallback(async () => {
    try {
      setIsProcessing(true);
      setError(null);
      
      console.log('🔄 Initiating GitHub OAuth login...');
      const oauthUrl = authService.getOAuthUrl('github');
      console.log('🔄 GitHub OAuth URL:', oauthUrl);
      
      // Open OAuth URL in the same window to allow backend redirect
      window.location.href = oauthUrl;
    } catch (error) {
      console.error('❌ GitHub OAuth error:', error);
      setError(error instanceof Error ? error.message : 'Failed to initiate GitHub login');
      setIsProcessing(false);
    }
  }, []);

  return {
    loginWithGoogle,
    loginWithGithub,
    isProcessing,
    error,
    clearError,
  };
};

// Hook for handling OAuth callbacks
 const useOAuthCallback = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOAuthCallback = useCallback(async (provider: 'google' | 'github', code: string, state?: string) => {
    console.log('🔄 useOAuthCallback - handleOAuthCallback called');
    console.log('🔄 Provider:', provider);
    console.log('🔄 Code length:', code.length);
    console.log('🔄 State:', state);
    
    try {
      setIsProcessing(true);
      setError(null);
      console.log('🔄 Setting processing state to true');

      // Verify OAuth state
      console.log('🔄 Verifying OAuth state...');
      if (!authService.verifyOAuthState(state || '')) {
        console.log('❌ OAuth state verification failed');
        throw new Error('Invalid OAuth state. Please try again.');
      }
      console.log('✅ OAuth state verification passed');

      // Handle the OAuth callback
      console.log('🔄 Calling authService.handleOAuthCallback...');
      const response = await authService.handleOAuthCallback(provider, code, state);
      console.log('✅ authService.handleOAuthCallback completed');
      console.log('✅ Response:', response);
      
      // Update Redux state
      console.log('🔄 Updating Redux state...');
      dispatch(setUser(response.user));
      dispatch(setTokens({ 
        token: response.token, 
        refreshToken: response.refreshToken 
      }));
      console.log('✅ Redux state updated');

      // Navigate to dashboard
      console.log('🔄 Navigating to dashboard...');
      navigate('/dashboard');
      
      return response;
    } catch (error) {
      console.log('❌ Error in handleOAuthCallback:', error);
      const errorMessage = error instanceof Error ? error.message : 'OAuth authentication failed';
      setError(errorMessage);
      throw error;
    } finally {
      console.log('🔄 Setting processing state to false');
      setIsProcessing(false);
    }
  }, [dispatch, navigate]);

  const clearError = useCallback(() => {
    console.log('🔄 Clearing OAuth error');
    setError(null);
  }, []);

  return {
    handleOAuthCallback,
    isProcessing,
    error,
    clearError,
  };
};

// Hook for OAuth status
 const useOAuthStatus = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isProcessing,
    error,
    clearError,
  };
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
    clearError: clearAuthError,
    updateUser: updateUserData,
    loginWithOAuth,
    signupWithOAuth,
    handleOAuthCallback,
    verifyEmail: verifyUserEmail,
    resendVerification: resendVerificationCode,
    requestPasswordReset: requestPasswordResetHandler,
    resetPassword: resetPasswordHandler,
    testConnection: testConnectionHandler,
    refreshToken: refreshTokenHandler,
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