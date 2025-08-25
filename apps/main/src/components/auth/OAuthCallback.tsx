import { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const OAuthCallback = () => {
  const navigate = useNavigate();
  const { provider } = useParams<{ provider: 'google' | 'github' }>();
  const [searchParams] = useSearchParams();
  const { handleOAuthCallback, error } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const errorParam = searchParams.get('error');

      // Handle OAuth errors
      if (errorParam) {
        console.error('OAuth error:', errorParam);
        navigate('/signin?error=oauth_cancelled');
        return;
      }

      // Validate required parameters
      if (!code || !provider) {
        console.error('Missing OAuth parameters');
        navigate('/signin?error=oauth_invalid');
        return;
      }

      try {
        const result = await handleOAuthCallback(code, provider);
        
        if (result.meta.requestStatus === 'fulfilled') {
          // Redirect to dashboard on success
          navigate('/dashboard');
        } else {
          // Handle OAuth failure
          navigate('/signin?error=oauth_failed');
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        navigate('/signin?error=oauth_failed');
      }
    };

    handleCallback();
  }, [searchParams, provider, handleOAuthCallback, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-destructive mb-2">
            Authentication Failed
          </h2>
          <p className="text-muted-foreground mb-4">
            {error}
          </p>
          <button
            onClick={() => navigate('/signin')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold mt-4 mb-2">
          Completing Authentication
        </h2>
        <p className="text-muted-foreground">
          Please wait while we sign you in with {provider}...
        </p>
      </div>
    </div>
  );
};

export default OAuthCallback;
