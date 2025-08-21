import { AuthService } from '../services/authService';

// Default test credentials (based on seeded data)
const DEFAULT_CREDENTIALS = {
  email: 'admin.test@gmail.com',
  password: '12345678A!'
};

export class TokenHelper {
  // Get a valid token by logging in
  static async getValidToken(credentials = DEFAULT_CREDENTIALS): Promise<string | null> {
    try {
      console.log('Attempting to get valid token...');
      const response = await AuthService.login(credentials);
      
      if (response.success && response.data?.token) {
        console.log('✅ Successfully obtained valid token');
        return response.data.token;
      } else {
        console.error('❌ Login failed - no token in response');
        return null;
      }
    } catch (error) {
      console.error('❌ Failed to get valid token:', error);
      return null;
    }
  }

  // Test if current token is valid
  static async testCurrentToken(): Promise<boolean> {
    try {
      const response = await AuthService.getProfile();
      return response.success;
    } catch (error) {
      return false;
    }
  }

  // Get test credentials from your seeded data
  static getTestCredentials() {
    return [
      { email: 'superadmin.test@gmail.com', password: '12345678A!' },
      { email: 'admin.test@gmail.com', password: '12345678A!' },
      { email: 'user.test@gmail.com', password: '12345678A!' },
      { email: 'manager.test@gmail.com', password: '12345678A!' },
    ];
  }

  // Try multiple credentials to get a valid token
  static async getTokenWithFallback(): Promise<string | null> {
    const credentials = this.getTestCredentials();
    
    for (const cred of credentials) {
      console.log(`Trying credentials: ${cred.email}`);
      const token = await this.getValidToken(cred);
      if (token) {
        return token;
      }
    }
    
    console.error('❌ Could not get valid token with any test credentials');
    return null;
  }
}
