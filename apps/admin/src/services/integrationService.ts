import apiClient from '../config/axios';

export interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'communication' | 'storage' | 'analytics' | 'development' | 'marketing';
  status: 'active' | 'inactive' | 'error' | 'pending';
  lastSync: string;
  syncStatus: 'success' | 'warning' | 'error';
  isEnabled: boolean;
  errorMessage?: string;
  retryCount?: number;
  maxRetries?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateIntegrationData {
  name: string;
  description: string;
  category: 'communication' | 'storage' | 'analytics' | 'development' | 'marketing';
  apiKey?: string;
  config?: Record<string, any>;
  isEnabled?: boolean;
}

export interface UpdateIntegrationData {
  name?: string;
  description?: string;
  category?: 'communication' | 'storage' | 'analytics' | 'development' | 'marketing';
  apiKey?: string;
  config?: Record<string, any>;
  isEnabled?: boolean;
}

export interface IntegrationStats {
  total: number;
  active: number;
  inactive: number;
  error: number;
  pending: number;
  enabled: number;
  disabled: number;
  categories: Array<{
    _id: string;
    count: number;
    active: number;
    enabled: number;
  }>;
}

export interface TestConnectionResult {
  success: boolean;
  message: string;
  status?: string;
  syncStatus?: string;
}

export interface SyncResult {
  success: boolean;
  message: string;
  data?: any;
  lastSync?: string;
}

class IntegrationService {
  private baseUrl = '/integrations';

  /**
   * Get all integrations with optional filtering
   */
  async getIntegrations(params?: {
    category?: string;
    status?: string;
    search?: string;
  }): Promise<{ integrations: Integration[]; total: number }> {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);

    const url = `${this.baseUrl}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get(url);
    return response.data;
  }

  /**
   * Get a single integration by ID
   */
  async getIntegration(id: string): Promise<{ integration: Integration }> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  /**
   * Create a new integration
   */
  async createIntegration(data: CreateIntegrationData): Promise<{ integration: Integration }> {
    const response = await apiClient.post(this.baseUrl, data);
    return response.data;
  }

  /**
   * Update an existing integration
   */
  async updateIntegration(id: string, data: UpdateIntegrationData): Promise<{ integration: Integration }> {
    const response = await apiClient.put(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  /**
   * Delete an integration
   */
  async deleteIntegration(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Test integration connection
   */
  async testConnection(id: string): Promise<TestConnectionResult> {
    const response = await apiClient.post(`${this.baseUrl}/${id}/test`);
    return response.data;
  }

  /**
   * Sync integration data
   */
  async syncIntegration(id: string): Promise<SyncResult> {
    const response = await apiClient.post(`${this.baseUrl}/${id}/sync`);
    return response.data;
  }

  /**
   * Get integration health status
   */
  async getIntegrationHealth(id: string): Promise<{ health: any }> {
    const response = await apiClient.get(`${this.baseUrl}/${id}/health`);
    return response.data;
  }

  /**
   * Toggle integration enabled/disabled status
   */
  async toggleIntegration(id: string): Promise<{ integration: Integration }> {
    const response = await apiClient.patch(`${this.baseUrl}/${id}/toggle`);
    return response.data;
  }

  /**
   * Get integration statistics
   */
  async getIntegrationStats(): Promise<{ stats: IntegrationStats; categories: any[] }> {
    const response = await apiClient.get(`${this.baseUrl}/stats`);
    return response.data;
  }

  /**
   * Get available integration categories
   */
  getCategories(): Array<{ value: string; label: string }> {
    return [
      { value: 'communication', label: 'Communication' },
      { value: 'storage', label: 'Storage' },
      { value: 'analytics', label: 'Analytics' },
      { value: 'development', label: 'Development' },
      { value: 'marketing', label: 'Marketing' }
    ];
  }

  /**
   * Get available integration statuses
   */
  getStatuses(): Array<{ value: string; label: string }> {
    return [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'error', label: 'Error' },
      { value: 'pending', label: 'Pending' }
    ];
  }

  /**
   * Get status badge variant based on status
   */
  getStatusBadgeVariant(status: string): 'success' | 'secondary' | 'error' | 'warning' {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'secondary';
      case 'error':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'secondary';
    }
  }

  /**
   * Get category badge variant based on category
   */
  getCategoryBadgeVariant(category: string): 'default' | 'secondary' | 'success' | 'warning' | 'error' {
    switch (category) {
      case 'communication':
        return 'default';
      case 'storage':
        return 'secondary';
      case 'analytics':
        return 'success';
      case 'development':
        return 'warning';
      case 'marketing':
        return 'error';
      default:
        return 'secondary';
    }
  }

  /**
   * Get sync status icon based on sync status
   */
  getSyncStatusIcon(syncStatus: string): 'success' | 'warning' | 'error' | 'clock' {
    switch (syncStatus) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'clock';
    }
  }

  /**
   * Format last sync time for display
   */
  formatLastSync(lastSync: string): string {
    if (!lastSync || lastSync === 'Never') {
      return 'Never';
    }
    return lastSync;
  }

  /**
   * Validate integration data
   */
  validateIntegrationData(data: CreateIntegrationData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.name?.trim()) {
      errors.push('Name is required');
    }

    if (!data.description?.trim()) {
      errors.push('Description is required');
    }

    if (!data.category) {
      errors.push('Category is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const integrationService = new IntegrationService();
export default integrationService;
