import axiosInstance from '@/config/axios';

// Simple API service for testing
export class ApiService {
  // Test GET request to fetch user profile
  static async getUserProfile() {
    try {
      const response = await axiosInstance.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  // Test GET request to fetch workspaces
  static async getWorkspaces() {
    try {
      const response = await axiosInstance.get('/workspaces');
      return response.data;
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      throw error;
    }
  }

  // Test GET request to fetch tasks
  static async getTasks(workspaceId?: string) {
    try {
      const url = workspaceId ? `/workspaces/${workspaceId}/tasks` : '/tasks';
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  }

  // Test GET request to fetch app status
  static async getAppStatus() {
    try {
      const response = await axiosInstance.get('/health');
      return response.data;
    } catch (error) {
      console.error('Error fetching app status:', error);
      throw error;
    }
  }

  // Get real data from API endpoints
  static async getRealData() {
    try {
      // Fetch user profile, workspaces, and tasks from real API
      const [userResponse, workspacesResponse, tasksResponse] = await Promise.allSettled([
        this.getUserProfile(),
        this.getWorkspaces(),
        this.getTasks()
      ]);

      return {
        success: true,
        data: {
          user: userResponse.status === 'fulfilled' ? userResponse.value : null,
          workspaces: workspacesResponse.status === 'fulfilled' ? workspacesResponse.value : [],
          tasks: tasksResponse.status === 'fulfilled' ? tasksResponse.value : [],
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('Error fetching real data:', error);
      throw error;
    }
  }
}
