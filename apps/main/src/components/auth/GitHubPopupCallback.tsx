import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AuthCard, Typography, Button } from '@taskflow/ui';
import { env } from '../../config/env';

const GitHubPopupCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    console.log('🔄 GitHubPopupCallback Component Mounted');
    console.log('🔄 Current URL:', window.location.href);
    console.log('🔄 Search Params:', Object.fromEntries(searchParams.entries()));
    
    const token = searchParams.get('token');
    const provider = searchParams.get('provider');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    console.log('🔄 Extracted Parameters:', {
      provider,
      token,
      hasToken: !!token,
      error,
      errorDescription
    });

    // Check for OAuth errors
    if (error) {
      console.error('❌ OAuth error:', error, errorDescription);
      setStatus('error');
      setMessage(errorDescription || error || 'OAuth authentication failed');
      
      // Notify parent window of error
      if (window.opener) {
        window.opener.postMessage({
          type: 'GITHUB_OAUTH_ERROR',
          error: errorDescription || error
        }, window.location.origin);
      }
      return;
    }

    // Check if we have a token from backend redirect
    if (token && provider === 'github') {
      console.log('✅ GitHub OAuth token received!');
      console.log('✅ Token (first 20 chars):', token.substring(0, 20) + '...');
      
      // Store the token
      localStorage.setItem('token', token);
      console.log('✅ Token stored in localStorage');
      
      setStatus('success');
      setMessage('GitHub account connected successfully!');
      
      // Notify parent window of success
      if (window.opener) {
        window.opener.postMessage({
          type: 'GITHUB_OAUTH_SUCCESS',
          token: token,
          provider: 'github'
        }, window.location.origin);
      }
      
      // Close popup after a short delay
      setTimeout(() => {
        window.close();
      }, 2000);
    } else {
      console.log('❌ Missing token or provider for GitHub OAuth callback');
      setStatus('error');
      setMessage('Authentication failed. Missing required parameters.');
      
      // Notify parent window of error
      if (window.opener) {
        window.opener.postMessage({
          type: 'GITHUB_OAUTH_ERROR',
          error: 'Missing token or provider'
        }, window.location.origin);
      }
    }
  }, [searchParams]);

  if (status === 'loading') {
    return (
      <AuthCard
        title="GitHub OAuth"
        subtitle="Connecting to GitHub"
        description="Please wait while we complete the authentication..."
      >
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <Typography variant="body-medium" className="text-muted-foreground">
            Completing GitHub authentication...
          </Typography>
        </div>
      </AuthCard>
    );
  }

  if (status === 'success') {
    return (
      <AuthCard
        title="GitHub OAuth"
        subtitle="Success!"
        description="Your GitHub account has been connected successfully"
      >
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <Typography variant="body-medium" className="text-green-700">
            {message}
          </Typography>
          <Typography variant="body-small" className="text-muted-foreground">
            This window will close automatically...
          </Typography>
        </div>
      </AuthCard>
    );
  }

  if (status === 'error') {
    return (
      <AuthCard
        title="GitHub OAuth"
        subtitle="Authentication Failed"
        description="There was an error connecting your GitHub account"
      >
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <Typography variant="body-medium" className="text-red-700">
              {message}
            </Typography>
          </div>
          
          <div className="space-y-2">
            <Button
              onClick={() => window.close()}
              className="w-full"
            >
              Close Window
            </Button>
          </div>
        </div>
      </AuthCard>
    );
  }

  return null;
};

export default GitHubPopupCallback;
