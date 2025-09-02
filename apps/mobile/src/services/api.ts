import { ApiResponse, PaginationParams, User } from '../types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: { name: string; email: string; password: string }): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async refreshToken() {
    return this.request('/auth/refresh', {
      method: 'POST',
    });
  }

  // User endpoints
  async getProfile() {
    return this.request('/users/profile');
  }

  async updateProfile(userData: Partial<{ name: string; email: string; avatar: string }>): Promise<ApiResponse<User>> {
    return this.request<User>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Board endpoints
  async getBoards(params?: PaginationParams) {
    const queryParams = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.request(`/boards${queryParams}`);
  }

  async getBoard(id: string) {
    return this.request(`/boards/${id}`);
  }

  async createBoard(boardData: { name: string; description?: string; isPublic?: boolean }) {
    return this.request('/boards', {
      method: 'POST',
      body: JSON.stringify(boardData),
    });
  }

  async updateBoard(id: string, boardData: Partial<{ name: string; description: string; isPublic: boolean }>) {
    return this.request(`/boards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(boardData),
    });
  }

  async deleteBoard(id: string) {
    return this.request(`/boards/${id}`, {
      method: 'DELETE',
    });
  }

  // Task endpoints
  async getTasks(boardId: string, params?: PaginationParams) {
    const queryParams = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.request(`/boards/${boardId}/tasks${queryParams}`);
  }

  async getTask(boardId: string, taskId: string) {
    return this.request(`/boards/${boardId}/tasks/${taskId}`);
  }

  async createTask(boardId: string, taskData: {
    title: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    assigneeId?: string;
    dueDate?: string;
  }) {
    return this.request(`/boards/${boardId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async updateTask(boardId: string, taskId: string, taskData: Partial<{
    title: string;
    description: string;
    status: 'todo' | 'in-progress' | 'done' | 'archived';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    assigneeId: string;
    dueDate: string;
  }>) {
    return this.request(`/boards/${boardId}/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  }

  async deleteTask(boardId: string, taskId: string) {
    return this.request(`/boards/${boardId}/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService(API_BASE_URL);
