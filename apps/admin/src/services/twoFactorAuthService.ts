import { env } from '../config/env';

export interface TwoFactorAuthSetup {
  qrCode: string;
  otpauthUrl: string;
  secret: string;
  backupCodes: string[];
  message: string;
}

export interface TwoFactorAuthStatus {
  isEnabled: boolean;
  enabledAt?: string;
  lastUsed?: string;
  remainingBackupCodes: number;
  totalBackupCodes: number;
  needsNewBackupCodes: boolean;
}

export interface BackupCodesResponse {
  backupCodes: string[];
  message: string;
}

export interface RecoveryTokenResponse {
  recoveryToken: string;
  expiresAt: string;
  message: string;
}

class TwoFactorAuthService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('adminToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  /**
   * Enable 2FA for the current user
   */
  async enable2FA(): Promise<TwoFactorAuthSetup> {
    const response = await fetch(`${env.API_BASE_URL}/2fa/enable`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to enable 2FA');
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Verify 2FA setup with a token
   */
  async verify2FASetup(token: string): Promise<{ message: string }> {
    const response = await fetch(`${env.API_BASE_URL}/2fa/verify-setup`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to verify 2FA setup');
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Disable 2FA for the current user
   */
  async disable2FA(token: string, recoveryToken?: string): Promise<{ message: string }> {
    const body: any = { token };
    if (recoveryToken) {
      body.recoveryToken = recoveryToken;
    }

    const response = await fetch(`${env.API_BASE_URL}/2fa/disable`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to disable 2FA');
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Generate new backup codes
   */
  async generateBackupCodes(): Promise<BackupCodesResponse> {
    const response = await fetch(`${env.API_BASE_URL}/2fa/backup-codes`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to generate backup codes');
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Get 2FA status for the current user
   */
  async get2FAStatus(): Promise<TwoFactorAuthStatus> {
    const response = await fetch(`${env.API_BASE_URL}/2fa/status`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get 2FA status');
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Generate a recovery token
   */
  async generateRecoveryToken(): Promise<RecoveryTokenResponse> {
    const response = await fetch(`${env.API_BASE_URL}/2fa/recovery-token`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to generate recovery token');
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Verify 2FA token during login
   */
  async verify2FA(token: string, userId: string, rememberDevice: boolean = false): Promise<any> {
    const response = await fetch(`${env.API_BASE_URL}/2fa/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, userId, rememberDevice }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to verify 2FA');
    }

    const data = await response.json();
    return data.data;
  }
}

export default new TwoFactorAuthService();
