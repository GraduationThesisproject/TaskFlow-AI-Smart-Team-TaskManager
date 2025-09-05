import AsyncStorage from '@react-native-async-storage/async-storage';

// Enhanced token manager for handling authentication tokens
class TokenManager {
    private accessTokenKey = 'accessToken';
    private refreshTokenKey = 'refreshToken';
    private tokenExpiryKey = 'tokenExpiry';

    // Get access token from AsyncStorage
    async getAccessToken(): Promise<string | null> {
        try {
            // Support both legacy 'accessToken' and axios-used 'token' keys
            const accessToken = await AsyncStorage.getItem(this.accessTokenKey);
            const token = await AsyncStorage.getItem('token');
            return accessToken || token || null;
        } catch (error) {
            console.error('Error getting access token:', error);
            return null;
        }
    }

    // Set access token in AsyncStorage
    async setAccessToken(token: string): Promise<void> {
        try {
            // Write to both keys to keep axios and fetch clients in sync
            await AsyncStorage.setItem(this.accessTokenKey, token);
            await AsyncStorage.setItem('token', token);
        } catch (error) {
            console.error('Error setting access token:', error);
        }
    }

    // Get refresh token from AsyncStorage
    async getRefreshToken(): Promise<string | null> {
        try {
            return await AsyncStorage.getItem(this.refreshTokenKey);
        } catch (error) {
            console.error('Error getting refresh token:', error);
            return null;
        }
    }

    // Set refresh token in AsyncStorage
    async setRefreshToken(token: string): Promise<void> {
        try {
            await AsyncStorage.setItem(this.refreshTokenKey, token);
        } catch (error) {
            console.error('Error setting refresh token:', error);
        }
    }

    // Clear all tokens
    async clearTokens(): Promise<void> {
        try {
            await AsyncStorage.removeItem(this.accessTokenKey);
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem(this.refreshTokenKey);
            await AsyncStorage.removeItem(this.tokenExpiryKey);
        } catch (error) {
            console.error('Error clearing tokens:', error);
        }
    }

    // Check if user is authenticated
    async isAuthenticated(): Promise<boolean> {
        const token = await this.getAccessToken();
        if (!token) return false;
        
        // Check if token is expired
        return !(await this.isTokenExpired());
    }

    // Check if token is expired
    async isTokenExpired(): Promise<boolean> {
        try {
            const expiryTime = await AsyncStorage.getItem(this.tokenExpiryKey);
            if (!expiryTime) return false; // No expiry set, assume valid
            
            return Date.now() > parseInt(expiryTime);
        } catch (error) {
            console.error('Error checking token expiry:', error);
            return true; // Assume expired if error
        }
    }

    // Get token expiry time
    async getTokenExpiry(): Promise<Date | null> {
        try {
            const expiryTime = await AsyncStorage.getItem(this.tokenExpiryKey);
            if (!expiryTime) return null;
            
            return new Date(parseInt(expiryTime));
        } catch (error) {
            console.error('Error getting token expiry:', error);
            return null;
        }
    }

    // Check if token needs refresh (expires within 5 minutes)
    async needsRefresh(): Promise<boolean> {
        try {
            const expiryTime = await AsyncStorage.getItem(this.tokenExpiryKey);
            if (!expiryTime) return false;
            
            const fiveMinutesFromNow = Date.now() + (5 * 60 * 1000);
            return parseInt(expiryTime) < fiveMinutesFromNow;
        } catch (error) {
            console.error('Error checking if token needs refresh:', error);
            return false;
        }
    }

    // Refresh access token using the AuthService
    async refreshAccessToken(): Promise<string | null> {
        const refreshToken = await this.getRefreshToken();
        if (!refreshToken) return null;

        try {
            // Import AuthService dynamically to avoid circular dependencies
            const { AuthService } = await import('../services/authService');
            
            const response = await AuthService.refreshToken(refreshToken);
            
            if (response.success && response.data?.token) {
                await this.setAccessToken(response.data.token);
                if (response.data.refreshToken) {
                    await this.setRefreshToken(response.data.refreshToken);
                }
                return response.data.token;
            }
        } catch (error) {
            console.error('Failed to refresh token:', error);
        }

        // If refresh fails, clear tokens
        await this.clearTokens();
        return null;
    }

    // Initialize tokens from Redux state (for integration)
    async initializeFromRedux(token: string | null, refreshToken?: string): Promise<void> {
        if (token) {
            await this.setAccessToken(token);
        }
        if (refreshToken) {
            await this.setRefreshToken(refreshToken);
        }
    }

    // Get all token data for Redux integration
    async getTokenData(): Promise<{ accessToken: string | null; refreshToken: string | null; isExpired: boolean }> {
        return {
            accessToken: await this.getAccessToken(),
            refreshToken: await this.getRefreshToken(),
            isExpired: await this.isTokenExpired()
        };
    }
}

export default new TokenManager();
