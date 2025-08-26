import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useOAuthCallback } from '../../hooks/useAuth';
import { AuthCard, Typography, Button } from '@taskflow/ui';
import { useDispatch } from 'react-redux';
import { setUser, setTokens } from '../../store/slices/authSlice';
import { env } from '../../config/env';

const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { handleOAuthCallback, isProcessing, error } = useOAuthCallback();
  
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');

  useEffect(() => {
    console.log('🔄 OAuthCallback Component Mounted');
    console.log('🔄 Current URL:', window.location.href);
    console.log('🔄 Search Params:', Object.fromEntries(searchParams.entries()));
    
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const provider = searchParams.get('provider') as 'google' | 'github' | null;
    const token = searchParams.get('token');

    console.log('🔄 Extracted Parameters:', {
      code,
      state,
      provider,
      token,
      hasToken: !!token
    });

    // Check if we have a token from backend redirect
    if (token && provider) {
      console.log('✅ Token received from backend redirect!');
      console.log('✅ Provider:', provider);
      console.log('✅ Token (first 20 chars):', token.substring(0, 20) + '...');
      
      // Store the token directly
      localStorage.setItem('auth_token', token);
      console.log('✅ Token stored in localStorage');
      
      // Fetch user data using the token
      fetchUserData(token);
      return;
    }

    // Handle traditional OAuth callback with code
    if (!code || !provider) {
      console.log('❌ Missing code or provider for OAuth callback');
      console.log('❌ Code:', code);
      console.log('❌ Provider:', provider);
      setStatus('error');
      return;
    }

    console.log('🔄 Processing OAuth callback with code and provider');
    console.log('🔄 Code length:', code.length);
    console.log('🔄 Provider:', provider);

    const processCallback = async () => {
      try {
        console.log('🔄 Calling handleOAuthCallback...');
        // Provider is guaranteed to be non-null here due to the check above
        await handleOAuthCallback(provider as 'google' | 'github', code, state || undefined);
        console.log('✅ handleOAuthCallback completed successfully');
        setStatus('success');
        // Navigation will be handled by the hook
      } catch (error) {
        console.error('❌ OAuth callback failed:', error);
        setStatus('error');
      }
    };

    processCallback();
  }, [searchParams, handleOAuthCallback, navigate]);

  // Function to fetch user data using the token
  const fetchUserData = async (token: string) => {
    try {
      console.log('🔄 Fetching user data from /api/auth/me...');
      
      const apiUrl = env.API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${apiUrl}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('🔄 /api/auth/me response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('🔄 User data received:', data);

      if (data.success && data.data && data.data.user) {
        const user = data.data.user;
        console.log('✅ User data fetched successfully:', {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          oauthProviders: user.oauthProviders
        });

        // Update Redux state with user data
        dispatch(setUser(user));
        dispatch(setTokens({ 
          token
          // OAuth flow doesn't provide refresh token
        }));
        console.log('✅ Redux state updated with user data');

        // Set success status
        setStatus('success');

        // Navigate to dashboard after a short delay
        setTimeout(() => {
          console.log('🔄 Navigating to dashboard...');
          navigate('/dashboard');
        }, 2000);
      } else {
        throw new Error('Invalid user data response');
      }
    } catch (error) {
      console.error('❌ Error fetching user data:', error);
      setStatus('error');
    }
  };

  console.log('🔄 OAuthCallback Render - Status:', status, 'isProcessing:', isProcessing);

  if (status === 'processing' || isProcessing) {
    return (
      <AuthCard
        title="TaskFlow"
        subtitle="Processing Authentication"
        description="Please wait while we complete your sign-in..."
      >
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <Typography variant="body-medium" className="text-muted-foreground">
            Completing authentication...
          </Typography>
        </div>
      </AuthCard>
    );
  }

  if (status === 'error') {
    return (
      <AuthCard
        title="TaskFlow"
        subtitle="Authentication Failed"
        description="There was an error completing your sign-in"
      >
        <div className="text-center space-y-4">
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <Typography variant="body-medium" className="text-destructive">
              {error || 'Authentication failed. Please try again.'}
            </Typography>
          </div>
          
          <div className="space-y-2">
            <Button
              onClick={() => navigate('/signin')}
              className="w-full"
            >
              Back to Sign In
            </Button>
            
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </AuthCard>
    );
  }

  if (status === 'success') {
    return (
      <AuthCard
        title="TaskFlow"
        subtitle="Authentication Successful"
        description="Redirecting to dashboard..."
      >
        <div className="text-center space-y-4">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <Typography variant="body-medium" className="text-green-800 dark:text-green-200">
              Sign-in successful!
            </Typography>
          </div>
          
          <Typography variant="body-small" className="text-muted-foreground">
            You will be redirected to the dashboard shortly.
          </Typography>

          <Button
            onClick={() => navigate('/dashboard')}
            className="w-full"
          >
            Go to Dashboard
          </Button>
        </div>
      </AuthCard>
    );
  }

  return null;
};

export default OAuthCallback;
