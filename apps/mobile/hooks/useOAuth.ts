import { useState } from 'react';
import * as AuthSession from 'expo-auth-session';
import { AuthRequest } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { AuthService } from '../services/authService';
import { env } from '../config/env';
import { useAuth } from './useAuth';

// Configure WebBrowser for OAuth
WebBrowser.maybeCompleteAuthSession();

export const useOAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login: authLogin } = useAuth();

  // Generate redirect URI for Google OAuth
  // The proxy is automatically used in Expo Go when needed
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'taskflow',
    path: 'auth/google/callback'
  });
  
  console.log('Google OAuth Redirect URI:', redirectUri);

  // Google OAuth configuration
  const [googleRequest, googleResponse, googlePromptAsync] = Google.useAuthRequest({
    clientId: env.GOOGLE_CLIENT_ID,
    redirectUri: redirectUri,
    scopes: ['openid', 'profile', 'email'],
    responseType: AuthSession.ResponseType.Token,
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

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      clearError();

      const result = await googlePromptAsync();

      if (result.type === 'success' && result.authentication?.accessToken) {
        const response = await AuthService.googleLoginMobile(result.authentication.accessToken);
        
        if (response.success && response.data?.token) {
          // OAuth login successful - token is already stored by AuthService
          // No need to call authLogin as the user is already authenticated
        }
      } else if (result.type === 'error') {
        throw new Error(result.error?.message || 'Google authentication failed');
      } else {
        throw new Error('Google authentication was cancelled');
      }
    } catch (err: any) {
      console.error('Google OAuth error:', err);
      setError(err.message || 'Failed to authenticate with Google');
    } finally {
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
