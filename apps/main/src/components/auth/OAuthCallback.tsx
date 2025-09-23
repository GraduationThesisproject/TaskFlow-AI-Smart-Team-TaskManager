import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthCard, Typography, Button } from '@taskflow/ui';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/slices/authSlice';
import { env } from '../../config/env';

const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔄 OAuthCallback Component Mounted');
    console.log('🔄 Current URL:', window.location.href);
    console.log('🔄 Search Params:', Object.fromEntries(searchParams.entries()));
    
    const token = searchParams.get('token');
    const provider = searchParams.get('provider') as 'google' | 'github' | null;

    console.log('🔄 Extracted Parameters:', {
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
      localStorage.setItem('token', token);
      console.log('✅ Token stored in localStorage');
      
      // Fetch user data using the token
      fetchUserData(token);
    } else {
      console.log('❌ Missing token or provider for OAuth callback');
      console.log('❌ Token:', token);
      console.log('❌ Provider:', provider);
      setError('Authentication failed. Missing required parameters.');
    }
  }, [searchParams]);

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

      if (data.success && data.data) {
        const userData = data.data;
        console.log('✅ User data fetched successfully:', {
          user: userData.user,
          preferences: userData.preferences,
          security: userData.security,
          roles: userData.roles
        });

        // Transform backend response to match frontend User type
        const user: any = {
          user: userData.user,
          preferences: userData.preferences || {
            theme: { mode: 'system' },
            notifications: { email: true, push: true, marketing: false },
            language: 'en',
            timezone: 'UTC',
            dateFormat: 'MM/DD/YYYY',
            timeFormat: '12h'
          },
          security: userData.security || {
            twoFactorEnabled: false,
            loginAttempts: 0
          },
          roles: userData.roles || {
            global: [],
            workspaces: {},
            permissions: []
          }
        };

        // Update Redux state with user data
        dispatch(setCredentials({ 
          user,
          token
        }));
        console.log('✅ Redux state updated with user data');

        // Navigate to dashboard immediately
        console.log('🔄 Navigating to dashboard immediately...');
        navigate('/dashboard');
      } else {
        throw new Error('Invalid user data response');
      }
    } catch (error) {
      console.error('❌ Error fetching user data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch user data');
    }
  };

  console.log('🔄 OAuthCallback Render');

  if (!error) {
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

  if (error) {
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
              onClick={() => navigate('/')}
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

  // No success page needed - redirect immediately

  return null;
};

export default OAuthCallback;
