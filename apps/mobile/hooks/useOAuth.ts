import { useState, useEffect } from 'react';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { AuthService } from '../services/authService';
import { env } from '../config/env';
import { useAppDispatch } from '../store';
import { setCredentials } from '../store/slices/authSlice';

// Configure WebBrowser for OAuth
WebBrowser.maybeCompleteAuthSession();

export const useOAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();

  // Generate redirect URI for Expo Go
  // Use makeRedirectUri() to automatically generate correct proxy URL for development
  const redirectUri = __DEV__ 
    ? AuthSession.makeRedirectUri()
    : AuthSession.makeRedirectUri({ scheme: 'taskflow' });
  
  console.log('Google OAuth Redirect URI:', redirectUri);
  console.log('Environment:', { isDev: __DEV__, clientId: env.GOOGLE_CLIENT_ID });

  // Google OAuth configuration for Expo Go
  const [googleRequest, googleResponse, googlePromptAsync] = Google.useAuthRequest({
    clientId: env.GOOGLE_CLIENT_ID, // Web client ID
    redirectUri: redirectUri,
    scopes: ['openid', 'profile', 'email'],
    responseType: AuthSession.ResponseType.Code, // Use code for better compatibility
    extraParams: {
      access_type: 'offline',
    },
  });

  // GitHub OAuth configuration
  const githubConfig = {
    clientId: env.GITHUB_CLIENT_ID,
    redirectUri: AuthSession.makeRedirectUri({
      scheme: 'taskflow',
      path: 'auth/github/callback'
    }),
    scopes: ['user:email'],
  };

  const clearError = () => setError(null);

  // Handle Google OAuth response
  useEffect(() => {
    if (googleResponse?.type === 'success') {
      handleGoogleSuccess(googleResponse);
    } else if (googleResponse?.type === 'error') {
      setError(googleResponse.error?.message || 'Google authentication failed');
      setIsLoading(false);
    } else if (googleResponse?.type === 'cancel') {
      setError('Google authentication was cancelled');
      setIsLoading(false);
    }
  }, [googleResponse]);

  const handleGoogleSuccess = async (response: any) => {
    try {
      setIsLoading(true);
      clearError();

      // Extract authorization code or access token
      const { authentication, params } = response;
      
      if (authentication?.accessToken) {
        // Handle access token (if using ResponseType.Token)
        const authResponse = await AuthService.googleLoginMobile(authentication.accessToken);
        
        if (authResponse.success && authResponse.data?.token) {
          // Store the token and update auth state
          dispatch(setCredentials({ user: authResponse.data.user, token: authResponse.data.token }));
          console.log('Google OAuth login successful');
        } else {
          throw new Error(authResponse.message || 'Failed to authenticate with backend');
        }
      } else if (params?.code) {
        // Handle authorization code (if using ResponseType.Code)
        const authResponse = await AuthService.googleLoginMobile(params.code);
        
        if (authResponse.success && authResponse.data?.token) {
          dispatch(setCredentials({ user: authResponse.data.user, token: authResponse.data.token }));
          console.log('Google OAuth login successful');
        } else {
          throw new Error(authResponse.message || 'Failed to authenticate with backend');
        }
      } else {
        throw new Error('No authentication data received from Google');
      }
    } catch (err: any) {
      console.error('Google OAuth error:', err);
      setError(err.message || 'Failed to authenticate with Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      clearError();

      // Check if the request is ready
      if (!googleRequest) {
        throw new Error('Google OAuth is not ready. Please try again.');
      }

      // Prompt for Google authentication
      const result = await googlePromptAsync();
      
      // The response will be handled by the useEffect above
      if (result.type === 'dismiss') {
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error('Google OAuth prompt error:', err);
      setError(err.message || 'Failed to start Google authentication');
      setIsLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    try {
      setIsLoading(true);
      clearError();

      const authUrl = `https://github.com/login/oauth/authorize?` +
        `client_id=${githubConfig.clientId}&` +
        `redirect_uri=${encodeURIComponent(githubConfig.redirectUri)}&` +
        `scope=${githubConfig.scopes.join(' ')}&` +
        `state=${Math.random().toString(36).substring(7)}`;

      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        githubConfig.redirectUri
      );

      if (result.type === 'success' && result.url) {
        const url = new URL(result.url);
        const code = url.searchParams.get('code');
        
        if (code) {
          const response = await AuthService.githubLoginMobile(code);
          
          if (response.success && response.data?.token) {
            // OAuth login successful - token is already stored by AuthService
            // No need to call authLogin as the user is already authenticated
          }
        }
      } else {
        throw new Error('GitHub authentication was cancelled');
      }
    } catch (err: any) {
      console.error('GitHub OAuth error:', err);
      setError(err.message || 'Failed to authenticate with GitHub');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleGoogleLogin,
    handleGitHubLogin,
    isLoading,
    error,
    clearError,
  };
};
