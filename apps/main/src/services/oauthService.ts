import { env } from '../config/env';

export type OAuthProvider = 'google' | 'github';
type OAuthAction = 'login' | 'signup';

interface OAuthConfig {
  clientId: string;
  scope: string;
  authUrl: string;
}

interface OAuthResponse {
  code: string;
  provider: OAuthProvider;
  redirectUri: string;
  action?: OAuthAction;
}

class OAuthService {
  private static instance: OAuthService;
  private readonly baseURL: string;
  private readonly storageKey = 'taskflow_oauth';
  private readonly config: Record<OAuthProvider, OAuthConfig>;

  private constructor() {
    this.baseURL = env.API_URL || 'http://localhost:3001/api';
    this.config = {
      google: {
        clientId: env.GOOGLE_CLIENT_ID || '',
        scope: 'email profile',
        authUrl: `${this.baseURL}/auth/google`
      },
      github: {
        clientId: env.GITHUB_CLIENT_ID || '',
        scope: 'user:email',
        authUrl: `${this.baseURL}/auth/github`
      }
    };
  }

  static getInstance(): OAuthService {
    if (!OAuthService.instance) {
      OAuthService.instance = new OAuthService();
    }
    return OAuthService.instance;
  }

  /**
   * Get OAuth URL for the specified provider
   */
  public getOAuthUrl(provider: OAuthProvider, action: OAuthAction): string {
    const config = this.config[provider];
    if (!config.clientId) {
      throw new Error(`${provider} OAuth is not properly configured. Please set VITE_${provider.toUpperCase()}_CLIENT_ID in your environment variables.`);
    }

    const state = this.generateState();
    // Use the backend callback URL directly since the backend handles the OAuth flow
    const redirectUri = `${this.baseURL}/auth/${provider}/callback`;
    
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: redirectUri,
      scope: config.scope,
      state,
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent'
    });

    this.saveOAuthState(state, { provider, action });
    return `${config.authUrl}?${params.toString()}`;
  }

  /**
   * Generate a cryptographically secure random state string
   */
  private generateState(): string {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Save OAuth state and action to session storage
   */
  private saveOAuthState(state: string, data: { provider: OAuthProvider; action: OAuthAction }): void {
    sessionStorage.setItem(
      this.storageKey,
      JSON.stringify({
        state,
        ...data,
        timestamp: Date.now()
      })
    );
  }

  /**
   * Get and clear stored OAuth state
   */
  private getAndClearOAuthState(): { state: string; provider: OAuthProvider; action: OAuthAction } | null {
    const data = sessionStorage.getItem(this.storageKey);
    sessionStorage.removeItem(this.storageKey);
    
    if (!data) return null;
    
    try {
      const parsed = JSON.parse(data);
      // Clear state if it's older than 10 minutes
      if (Date.now() - parsed.timestamp > 600000) {
        return null;
      }
      return parsed;
    } catch (e) {
      return null;
    }
  }

  /**
   * Verify the OAuth state parameter
   */
  public verifyOAuthState(state: string): { provider: OAuthProvider; action: OAuthAction } | null {
    const stored = this.getAndClearOAuthState();
    if (!stored || stored.state !== state) {
      return null;
    }
    return { provider: stored.provider, action: stored.action };
  }

  /**
   * Initiate OAuth login flow
   */
  public async initiateLogin(provider: OAuthProvider): Promise<void> {
    window.location.href = this.getOAuthUrl(provider, 'login');
  }

  /**
   * Initiate OAuth signup flow
   */
  public async initiateSignup(provider: OAuthProvider): Promise<void> {
    window.location.href = this.getOAuthUrl(provider, 'signup');
  }

  /**
   * Handle OAuth callback and return OAuth response
   */
  public async handleCallback(url: string): Promise<OAuthResponse> {
    const urlObj = new URL(url);
    const code = urlObj.searchParams.get('code');
    const state = urlObj.searchParams.get('state');
    const error = urlObj.searchParams.get('error');

    if (error) {
      throw new Error(`OAuth error: ${error}`);
    }

    if (!code || !state) {
      throw new Error('Missing required OAuth parameters');
    }

    const verified = this.verifyOAuthState(state);
    if (!verified) {
      throw new Error('Invalid or expired OAuth state');
    }

    return {
      code,
      provider: verified.provider,
      redirectUri: `${this.baseURL}/auth/${verified.provider}/callback`,
      action: verified.action
    };
  }

  /**
   * Clear all OAuth related data
   */
  public clearOAuthSession(): void {
    sessionStorage.removeItem(this.storageKey);
  }
}

export const oauthService = OAuthService.getInstance();
export default oauthService;
