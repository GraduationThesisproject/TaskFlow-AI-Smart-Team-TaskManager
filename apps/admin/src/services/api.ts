const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class ApiService {
  private baseURL: string;
  private token: string | null;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('adminToken');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Handle empty responses
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  // Auth endpoints
  async login(credentials: { email: string; password: string }) {
    return this.request('/api/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    return this.request('/api/admin/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentAdmin() {
    return this.request('/api/admin/auth/me');
  }

  // User management endpoints
  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.role) queryParams.append('role', params.role);
    if (params?.status) queryParams.append('status', params.status);

    const queryString = queryParams.toString();
    const endpoint = `/api/admin/users${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint);
  }

  async createUser(userData: any) {
    return this.request('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(userId: string, userData: any) {
    return this.request(`/api/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(userId: string) {
    return this.request(`/api/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async banUser(userId: string, reason?: string) {
    return this.request(`/api/admin/users/${userId}/ban`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async activateUser(userId: string) {
    return this.request(`/api/admin/users/${userId}/activate`, {
      method: 'POST',
    });
  }

  async resetUserPassword(email: string) {
    return this.request('/api/admin/users/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // Analytics endpoints
  async getAnalytics(timeRange: string) {
    return this.request(`/api/admin/analytics?timeRange=${timeRange}`);
  }

  async getSystemHealth() {
    return this.request('/api/admin/system/health');
  }

  async exportAnalytics(timeRange: string, format: string) {
    return this.request(`/api/admin/analytics/export?timeRange=${timeRange}&format=${format}`, {
      method: 'GET',
    });
  }

  // Templates endpoints
  async getProjectTemplates() {
    return this.request('/api/admin/templates/projects');
  }

  async getTaskTemplates() {
    return this.request('/api/admin/templates/tasks');
  }

  async getAIPrompts() {
    return this.request('/api/admin/templates/ai-prompts');
  }

  async getBrandingAssets() {
    return this.request('/api/admin/templates/branding');
  }

  async createProjectTemplate(templateData: any) {
    return this.request('/api/admin/templates/projects', {
      method: 'POST',
      body: JSON.stringify(templateData),
    });
  }

  async updateProjectTemplate(templateId: string, templateData: any) {
    return this.request(`/api/admin/templates/projects/${templateId}`, {
      method: 'PUT',
      body: JSON.stringify(templateData),
    });
  }

  async deleteProjectTemplate(templateId: string) {
    return this.request(`/api/admin/templates/projects/${templateId}`, {
      method: 'DELETE',
    });
  }

  // Utility methods
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('adminToken', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('adminToken');
  }

  getToken() {
    return this.token;
  }
}

export const apiService = new ApiService();
export default apiService;
