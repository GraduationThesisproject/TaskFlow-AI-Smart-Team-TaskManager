// Simple token manager for access tokens with refresh support
class TokenManager {
  private accessTokenKey = 'access_token';

  getAccessToken(): string | null {
    try {
      return (
        sessionStorage.getItem(this.accessTokenKey) ||
        localStorage.getItem(this.accessTokenKey)
      );
    } catch {
      return null;
    }
  }

  setAccessToken(token: string | null) {
    try {
      if (token) {
        sessionStorage.setItem(this.accessTokenKey, token);
        localStorage.setItem(this.accessTokenKey, token);
      } else {
        sessionStorage.removeItem(this.accessTokenKey);
        localStorage.removeItem(this.accessTokenKey);
      }
    } catch {
      // ignore storage errors
    }
  }

  async refreshAccessToken(): Promise<string | null> {
    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) return null;
      const data = await res.json().catch(() => ({} as any));
      const token: string | null =
        data?.data?.accessToken ?? data?.accessToken ?? data?.token ?? null;
      if (token) this.setAccessToken(token);
      return token;
    } catch {
      return null;
    }
  }

  logout() {
    this.setAccessToken(null);
  }
}

export default new TokenManager();
