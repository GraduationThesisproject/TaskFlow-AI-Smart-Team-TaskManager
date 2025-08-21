// Enhanced token manager for handling authentication tokens
class TokenManager {
    private accessTokenKey = 'accessToken';
    private refreshTokenKey = 'refreshToken';
    private tokenExpiryKey = 'tokenExpiry';

    // Get access token from localStorage
    getAccessToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(this.accessTokenKey);
    }

    // Set access token in localStorage
    setAccessToken(token: string): void {
        if (typeof window === 'undefined') return;
        localStorage.setItem(this.accessTokenKey, token);
    }

    // Get refresh token from localStorage
    getRefreshToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(this.refreshTokenKey);
    }

    // Set refresh token in localStorage
    setRefreshToken(token: string): void {
        if (typeof window === 'undefined') return;
        localStorage.setItem(this.refreshTokenKey, token);
    }

    // Clear all tokens
    clearTokens(): void {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(this.accessTokenKey);
        localStorage.removeItem(this.refreshTokenKey);
        localStorage.removeItem(this.tokenExpiryKey);
    }

    // Check if user is authenticated
    isAuthenticated(): boolean {
        const token = this.getAccessToken();
        if (!token) return false;
        
        // Check if token is expired
        return !this.isTokenExpired();
    }

    // Check if token is expired
    isTokenExpired(): boolean {
        if (typeof window === 'undefined') return true;
        
        const expiryTime = localStorage.getItem(this.tokenExpiryKey);
        if (!expiryTime) return false; // No expiry set, assume valid
        
        return Date.now() > parseInt(expiryTime);
    }

    // Get token expiry time
    getTokenExpiry(): Date | null {
        if (typeof window === 'undefined') return null;
        
        const expiryTime = localStorage.getItem(this.tokenExpiryKey);
        if (!expiryTime) return null;
        
        return new Date(parseInt(expiryTime));
    }

    // Check if token needs refresh (expires within 5 minutes)
    needsRefresh(): boolean {
        if (typeof window === 'undefined') return false;
        
        const expiryTime = localStorage.getItem(this.tokenExpiryKey);
        if (!expiryTime) return false;
        
        const fiveMinutesFromNow = Date.now() + (5 * 60 * 1000);
        return parseInt(expiryTime) < fiveMinutesFromNow;
    }

    // Refresh access token using the AuthService
    async refreshAccessToken(): Promise<string | null> {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) return null;

        try {
            // Import AuthService dynamically to avoid circular dependencies
            const { AuthService } = await import('../services/authService');
            
            const response = await AuthService.refreshToken(refreshToken);
            
            if (response.success && response.data?.token) {
                this.setAccessToken(response.data.token);
                if (response.data.refreshToken) {
                    this.setRefreshToken(response.data.refreshToken);
                }
                return response.data.token;
            }
        } catch (error) {
            console.error('Failed to refresh token:', error);
        }

        // If refresh fails, clear tokens and redirect to login
        this.clearTokens();
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
        return null;
    }

    // Initialize tokens from Redux state (for integration)
    initializeFromRedux(token: string | null, refreshToken?: string): void {
        if (token) {
            this.setAccessToken(token);
        }
        if (refreshToken) {
            this.setRefreshToken(refreshToken);
        }
    }

    // Get all token data for Redux integration
    getTokenData(): { accessToken: string | null; refreshToken: string | null; isExpired: boolean } {
        return {
            accessToken: this.getAccessToken(),
            refreshToken: this.getRefreshToken(),
            isExpired: this.isTokenExpired()
        };
    }
}

export default new TokenManager();
