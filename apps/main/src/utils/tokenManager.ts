class TokenManager {
  getAccessToken(): string | null {
    try {
      return localStorage.getItem('accessToken');
    } catch {
      return null;
    }
  }

  getRefreshToken(): string | null {
    try {
      return localStorage.getItem('refreshToken');
    } catch {
      return null;
    }
  }

  setTokens(accessToken: string, refreshToken?: string) {
    try {
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    } catch {
      // ignore storage errors
    }
  }

  clearTokens() {
    try {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } catch {
      // ignore
    }
  }

  async refreshAccessToken(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return null;

    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      const newToken = data?.token || data?.accessToken;
      if (newToken) {
        this.setTokens(newToken, data?.refreshToken);
        return newToken as string;
      }
      return null;
    } catch {
      return null;
    }
  }
}

export default new TokenManager();


