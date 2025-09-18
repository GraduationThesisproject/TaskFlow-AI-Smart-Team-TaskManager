import axiosInstance from '../config/axios';

export interface AiToken {
  id: string;
  name: string;
  description?: string;
  provider: string;
  maskedToken: string;
  status: 'active' | 'inactive' | 'archived' | 'invalid';
  isActive: boolean;
  isValid: boolean;
  lastUsedAt?: string;
  usageCount: number;
  config: {
    model: string;
    maxTokens: number;
    temperature: number;
    timeout: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateAiTokenData {
  name: string;
  description?: string;
  token: string;
  provider: string;
  config?: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
    timeout?: number;
  };
}

export interface AiTokenResponse {
  success: boolean;
  message?: string;
  tokens?: AiToken[];
  token?: AiToken;
}

export interface AiTokenStats {
  _id: string;
  total: number;
  active: number;
  archived: number;
  invalid: number;
  totalUsage: number;
}

class AiTokenService {
  private baseUrl = '/admin/ai-tokens';

  /**
   * Get all AI tokens
   */
  async getTokens(filters?: {
    provider?: string;
    status?: string;
    includeArchived?: boolean;
  }): Promise<AiTokenResponse> {
    try {
      const params = new URLSearchParams();
      if (filters?.provider) params.append('provider', filters.provider);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.includeArchived) params.append('includeArchived', 'true');

      const url = `${this.baseUrl}?${params.toString()}`;
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching AI tokens:', error);
      throw error;
    }
  }

  /**
   * Get active token for provider
   */
  async getActiveToken(provider: string = 'google'): Promise<AiTokenResponse> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/active/${provider}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching active token:', error);
      throw error;
    }
  }

  /**
   * Create new AI token
   */
  async createToken(tokenData: CreateAiTokenData): Promise<AiTokenResponse> {
    try {
      const response = await axiosInstance.post(this.baseUrl, tokenData);
      return response.data;
    } catch (error) {
      console.error('Error creating AI token:', error);
      throw error;
    }
  }

  /**
   * Update AI token
   */
  async updateToken(tokenId: string, updateData: Partial<CreateAiTokenData>): Promise<AiTokenResponse> {
    try {
      const response = await axiosInstance.put(`${this.baseUrl}/${tokenId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating AI token:', error);
      throw error;
    }
  }

  /**
   * Activate AI token (will archive others)
   */
  async activateToken(tokenId: string): Promise<AiTokenResponse> {
    try {
      const response = await axiosInstance.post(`${this.baseUrl}/${tokenId}/activate`);
      return response.data;
    } catch (error) {
      console.error('Error activating AI token:', error);
      throw error;
    }
  }

  /**
   * Archive AI token
   */
  async archiveToken(tokenId: string): Promise<AiTokenResponse> {
    try {
      const response = await axiosInstance.post(`${this.baseUrl}/${tokenId}/archive`);
      return response.data;
    } catch (error) {
      console.error('Error archiving AI token:', error);
      throw error;
    }
  }

  /**
   * Delete AI token permanently
   */
  async deleteToken(tokenId: string): Promise<AiTokenResponse> {
    try {
      const response = await axiosInstance.delete(`${this.baseUrl}/${tokenId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting AI token:', error);
      throw error;
    }
  }

  /**
   * Test AI token
   */
  async testToken(tokenId: string): Promise<AiTokenResponse> {
    try {
      const response = await axiosInstance.post(`${this.baseUrl}/${tokenId}/test`);
      return response.data;
    } catch (error) {
      console.error('Error testing AI token:', error);
      throw error;
    }
  }

  /**
   * Get token usage statistics
   */
  async getTokenStats(provider?: string): Promise<{ success: boolean; stats: AiTokenStats[] }> {
    try {
      const params = provider ? `?provider=${provider}` : '';
      const response = await axiosInstance.get(`${this.baseUrl}/stats${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching token stats:', error);
      throw error;
    }
  }

  /**
   * Get status badge variant for UI
   */
  getStatusBadgeVariant(status: string): 'success' | 'warning' | 'error' | 'secondary' {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'archived':
        return 'secondary';
      case 'invalid':
        return 'error';
      default:
        return 'secondary';
    }
  }

  /**
   * Get provider badge variant for UI
   */
  getProviderBadgeVariant(provider: string): 'success' | 'warning' | 'error' | 'secondary' | 'outline' {
    switch (provider) {
      case 'google':
        return 'success';
      case 'openai':
        return 'warning';
      case 'anthropic':
        return 'error';
      case 'azure':
        return 'secondary';
      default:
        return 'outline';
    }
  }

  /**
   * Validate token form data
   */
  validateTokenForm(data: CreateAiTokenData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.name?.trim()) {
      errors.push('Token name is required');
    }

    if (!data.token?.trim()) {
      errors.push('API token is required');
    }

    if (!data.provider) {
      errors.push('Provider is required');
    }

    if (data.config?.maxTokens && (data.config.maxTokens < 1 || data.config.maxTokens > 10000)) {
      errors.push('Max tokens must be between 1 and 10000');
    }

    if (data.config?.temperature && (data.config.temperature < 0 || data.config.temperature > 2)) {
      errors.push('Temperature must be between 0 and 2');
    }

    if (data.config?.timeout && (data.config.timeout < 1000 || data.config.timeout > 300000)) {
      errors.push('Timeout must be between 1000ms and 300000ms');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Create singleton instance
const aiTokenService = new AiTokenService();

export default aiTokenService;
