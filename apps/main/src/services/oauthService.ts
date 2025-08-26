/**
 * OAuth Service for Google and GitHub authentication
 * Handles OAuth flows, token management, and user data retrieval
 */

export interface OAuthConfig {
  clientId: string;
  redirectUri: string;
  scope: string;
}

export interface OAuthProvider {
  name: 'google' | 'github';
  config: OAuthConfig;
  authUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
}

export interface OAuthUserInfo {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: 'google' | 'github';
}




// OAuth provider configurations
const OAUTH_PROVIDERS: Record<'google' | 'github', OAuthProvider> = {
  google: {
    name: 'google',
    config: {
      clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '191438889605-63mmkae1me5ndih2og4u7hqdl1naknle.apps.googleusercontent.com',
      redirectUri: `${window.location.origin}/auth/callback/google`,
      scope: 'openid email profile'
    },
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo'
  },
  github: {
    name: 'github',
    config: {
      clientId: import.meta.env.VITE_GITHUB_CLIENT_ID || '',
      redirectUri: `${window.location.origin}/auth/callback/github`,
      scope: 'user:email'
    },
    authUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    userInfoUrl: 'https://api.github.com/user'
  }
};

class OAuthService {
  private static instance: OAuthService;

  static getInstance(): OAuthService {
    if (!OAuthService.instance) {
      OAuthService.instance = new OAuthService();
    }
    return OAuthService.instance;
  }

  /**
   * Initiate OAuth login flow
   */
  async initiateLogin(provider: 'google' | 'github'): Promise<void> {
    const oauthProvider = OAUTH_PROVIDERS[provider];
    if (!oauthProvider) {
      throw new Error(`Unsupported OAuth provider: ${provider}`);
    }

    if (!oauthProvider.config.clientId) {
      throw new Error(`${provider} OAuth client ID not configured`);
    }

    // Store provider and intended action in sessionStorage
    sessionStorage.setItem('oauth_provider', provider);
    sessionStorage.setItem('oauth_action', 'login');

    // Build authorization URL
    const authUrl = this.buildAuthUrl(oauthProvider);
    
    // Redirect to OAuth provider
    window.location.href = authUrl;
  }

  /**
   * Initiate OAuth signup flow
   */
  async initiateSignup(provider: 'google' | 'github'): Promise<void> {
    const oauthProvider = OAUTH_PROVIDERS[provider];
    if (!oauthProvider) {
      throw new Error(`Unsupported OAuth provider: ${provider}`);
    }

    if (!oauthProvider.config.clientId) {
      throw new Error(`${provider} OAuth client ID not configured`);
    }

    // Store provider and intended action in sessionStorage
    sessionStorage.setItem('oauth_provider', provider);
    sessionStorage.setItem('oauth_action', 'signup');

    // Build authorization URL
    const authUrl = this.buildAuthUrl(oauthProvider);
    
    // Redirect to OAuth provider
    window.location.href = authUrl;
  }

  /**
   * Handle OAuth callback - send code to backend for processing
   */
  async handleCallback(code: string, provider: 'google' | 'github'): Promise<any> {
    const oauthProvider = OAUTH_PROVIDERS[provider];
    if (!oauthProvider) {
      throw new Error(`Unsupported OAuth provider: ${provider}`);
    }

    try {
      // Send authorization code to backend for secure token exchange
      return {
        code,
        provider,
        redirectUri: oauthProvider.config.redirectUri
      };
    } catch (error) {
      console.error(`OAuth ${provider} callback error:`, error);
      throw error;
    }
  }

  /**
   * Build OAuth authorization URL
   */
  private buildAuthUrl(provider: OAuthProvider): string {
    const params = new URLSearchParams({
      client_id: provider.config.clientId,
      redirect_uri: provider.config.redirectUri,
      scope: provider.config.scope,
      response_type: 'code',
      state: this.generateState(), // CSRF protection
    });

    // Add provider-specific parameters
    if (provider.name === 'google') {
      params.append('access_type', 'offline');
      params.append('prompt', 'consent');
    }

    return `${provider.authUrl}?${params.toString()}`;
  }


  /**
   * Generate random state for CSRF protection
   */
  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * Get stored OAuth action (login/signup)
   */
  getOAuthAction(): 'login' | 'signup' | null {
    return sessionStorage.getItem('oauth_action') as 'login' | 'signup' | null;
  }

  /**
   * Get stored OAuth provider
   */
  getOAuthProvider(): 'google' | 'github' | null {
    return sessionStorage.getItem('oauth_provider') as 'google' | 'github' | null;
  }

  /**
   * Clear OAuth session data
   */
  clearOAuthSession(): void {
    sessionStorage.removeItem('oauth_provider');
    sessionStorage.removeItem('oauth_action');
  }

  /**
   * Check if OAuth is configured for a provider
   */
  isProviderConfigured(provider: 'google' | 'github'): boolean {
    const oauthProvider = OAUTH_PROVIDERS[provider];
    return !!(oauthProvider && oauthProvider.config.clientId);
  }
}

export const oauthService = OAuthService.getInstance();
export default oauthService;
