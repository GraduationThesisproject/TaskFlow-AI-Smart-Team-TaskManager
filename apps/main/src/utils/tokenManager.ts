// Simple token manager for handling authentication tokens
class TokenManager {
    private accessTokenKey = 'accessToken';
    private refreshTokenKey = 'refreshToken';

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
    }

    // Check if user is authenticated
    isAuthenticated(): boolean {
        return !!this.getAccessToken();
    }

    // Refresh access token (placeholder for future implementation)
    async refreshAccessToken(): Promise<string | null> {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) return null;

        try {
            // This is a placeholder - implement actual refresh logic
            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refreshToken }),
            });

            if (response.ok) {
                const data = await response.json();
                this.setAccessToken(data.accessToken);
                return data.accessToken;
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
}

export default new TokenManager();
