import axiosInstance from '@/config/axios';

// Simple API service for testing
export class ApiService {
  // Test GET request to fetch user profile
  static async getUserProfile() {
    try {
      const response = await axiosInstance.get('/auth/profile');
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

  // Test GET request with mock data for development
  static async getMockData() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      data: {
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          avatar: 'https://via.placeholder.com/150',
        },
        workspaces: [
          {
            id: '1',
            name: 'Personal Workspace',
            description: 'My personal workspace',
            members: 1,
          },
          {
            id: '2',
            name: 'Team Workspace',
            description: 'Team collaboration space',
            members: 5,
          },
        ],
        tasks: [
          {
            id: '1',
            title: 'Complete mobile app',
            description: 'Finish the React Native app',
            status: 'in-progress',
            priority: 'high',
          },
          {
            id: '2',
            title: 'Test API integration',
            description: 'Test all API endpoints',
            status: 'todo',
            priority: 'medium',
          },
        ],
        timestamp: new Date().toISOString(),
      },
    };
  }
}
