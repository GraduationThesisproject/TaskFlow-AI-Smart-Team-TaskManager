import { Admin, AdminLoginCredentials, AdminResponse } from '../types/admin.types';
import { env } from '../config/env';

const API_BASE = `${env.API_BASE_URL}/admin`;

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  status: string;
  lastLoginAt: string;
  createdAt: string;
  avatar?: string;
}

export interface AnalyticsData {
  totalUsers: number;
  activeUsers: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  activeProjects: number;
  completionRate: number;
  projectCreationTrends: Array<{ month: string; projects: number }>;
  taskCompletionData: {
    pending: number;
    inProgress: number;
    completed: number;
  };
  userGrowthData: Array<{ month: string; signups: number }>;
  topTeams: Array<{
    id: string;
    name: string;
    members: number;
    projects: number;
    activityScore: number;
  }>;
  systemPerformance: {
    serverUptime: number;
    apiResponseTime: number;
    databaseHealth: number;
  };
}

export interface SystemHealth {
  systemPerformance: {
    serverUptime: number;
    apiResponseTime: number;
    databaseHealth: number;
  };
  database: {
    connection: string;
    size: string;
    performance: string;
  };
  queue: {
    emailQueue: number;
    backgroundJobs: number;
    failedJobs: number;
  };
  security: {
    sslCertificate: string;
    firewall: string;
    lastScan: string;
  };
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  isActive: boolean;
  createdAt: string;
  usageCount: number;
}

export interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  estimatedHours: number;
  isActive: boolean;
  createdAt: string;
  usageCount: number;
}

export interface AIPrompt {
  id: string;
  name: string;
  prompt: string;
  category: string;
  isActive: boolean;
  createdAt: string;
  usageCount: number;
}

// Utility function to get avatar URL
export const getAvatarUrl = (avatarPath: string): string => {
  if (!avatarPath) return '';
  
  // If it's already a full URL, return as is
  if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
    return avatarPath;
  }
  
  // If it's a relative path, construct the full URL
  if (avatarPath.startsWith('/')) {
    return `${env.API_BASE_URL}${avatarPath}`;
  }
  
  // If it's just a filename, construct the full URL
  return `${env.API_BASE_URL}/uploads/avatars/${avatarPath}`;
};

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface BrandingAsset {
  id: string;
  name: string;
  type: 'logo' | 'icon' | 'color' | 'font';
  value: string;
  isActive: boolean;
  createdAt: string;
}

export interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

class AdminService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('adminToken');
    
    if (!token) {
      throw new Error('No admin token found. Please log in again.');
    }
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
    
    return headers;
  }

  // Authentication
  async login(credentials: AdminLoginCredentials): Promise<AdminResponse> {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    return response.json();
  }

  async logout(): Promise<void> {
    const response = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Logout failed');
    }
  }

  async getCurrentAdmin(): Promise<AdminResponse> {
    const response = await fetch(`${API_BASE}/auth/me`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get admin info');
    }

    return response.json();
  }

  // User Management
  async getUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
  } = {}): Promise<UsersResponse> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.search) searchParams.append('search', params.search);
    if (params.role) searchParams.append('role', params.role);
    if (params.status) searchParams.append('status', params.status);

    const response = await fetch(`${API_BASE}/users?${searchParams}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get users');
    }

    const data = await response.json();
    return data.data;
  }

  async createUser(userData: { username: string; email: string; role: string }): Promise<{ user: { id: string; email: string } }> {
    const response = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create user');
    }

    const data = await response.json();
    return data.data;
  }

  async updateUser(userId: string, userData: Partial<User>): Promise<void> {
    // Map frontend fields to backend fields
    const backendData: any = {};
    
    if (userData.username !== undefined) {
      backendData.name = userData.username;
    }
    
    if (userData.email !== undefined) {
      backendData.email = userData.email;
    }
    
    if (userData.status !== undefined) {
      // Map status to isActive
      backendData.isActive = userData.status === 'Active';
    }

    const response = await fetch(`${API_BASE}/users/${userId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(backendData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update user');
    }
  }

  async updateUserRole(userId: string, newRole: string): Promise<void> {
    const response = await fetch(`${API_BASE}/users/${userId}/role`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ newRole }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update user role');
    }
  }



  async deactivateUser(userId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/users/${userId}/ban`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to deactivate user');
    }
  }

  // Keep the old name for backward compatibility
  async banUser(userId: string): Promise<void> {
    return this.deactivateUser(userId);
  }

  async activateUser(userId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/users/${userId}/activate`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to activate user');
    }
  }

  // Analytics
  async getAnalytics(timeRange: string = '6-months'): Promise<AnalyticsData> {
    
    const headers = this.getAuthHeaders();
    
    const response = await fetch(`${API_BASE}/analytics?timeRange=${timeRange}`, {
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
      throw new Error(errorData.message || 'Failed to get analytics');
    }

    const data = await response.json();
    return data.data;
  }

  async exportAnalytics(): Promise<void> {
    const response = await fetch(`${API_BASE}/analytics/export`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to export analytics');
    }
  }

  // System Health
  async getSystemHealth(): Promise<SystemHealth> {
    const response = await fetch(`${API_BASE}/system/health`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get system health');
    }

    const data = await response.json();
    return data.data;
  }

  // Templates
  async getProjectTemplates(): Promise<ProjectTemplate[]> {
    const response = await fetch(`${API_BASE}/templates/projects`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get project templates');
    }

    const data = await response.json();
    return data.data || [];
  }

  async getTaskTemplates(): Promise<TaskTemplate[]> {
    const response = await fetch(`${API_BASE}/templates/tasks`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get task templates');
    }

    const data = await response.json();
    return data.data || [];
  }

  async getAIPrompts(): Promise<AIPrompt[]> {
    const response = await fetch(`${API_BASE}/templates/ai-prompts`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get AI prompts');
    }

    const data = await response.json();
    return data.data || [];
  }

  async getBrandingAssets(): Promise<BrandingAsset[]> {
    const response = await fetch(`${API_BASE}/templates/branding`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get branding assets');
    }

    const data = await response.json();
    return data.data || [];
  }

  // Profile Management
  async updateProfile(profileData: Partial<Admin>): Promise<Admin> {
    const response = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update profile');
    }

    const data = await response.json();
    return data.data?.admin || data.data;
  }

  async uploadAvatar(file: File): Promise<{ avatar: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/auth/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        // Don't set Content-Type for FormData
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to upload avatar');
    }

    const data = await response.json();
    return data.data;
  }

  // Password Management
  async changePassword(credentials: ChangePasswordRequest): Promise<void> {
    const response = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to change password');
    }
  }
}

export const adminService = new AdminService();
export default adminService;
