import type { 
  Task, 
  Column, 
  Board, 
  Space, 
  CreateTaskForm, 
  UpdateTaskForm, 
  MoveTaskForm,
  ApiResponse,
  PaginatedResponse 
} from '../types/task.types';
import axiosInstance from '../config/axios';

// Task API Service
export class TaskService {
  // Get tasks with optional filtering
  static async getTasks(params: {
    boardId?: string;
    spaceId?: string;
    columnId?: string;
    status?: string[];
    priority?: string[];
    assignee?: string[];
    tags?: string[];
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<PaginatedResponse<Task>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.boardId) queryParams.append('boardId', params.boardId);
      if (params.spaceId) queryParams.append('spaceId', params.spaceId);
      if (params.columnId) queryParams.append('columnId', params.columnId);
      if (params.status?.length) queryParams.append('status', params.status.join(','));
      if (params.priority?.length) queryParams.append('priority', params.priority.join(','));
      if (params.assignee?.length) queryParams.append('assignee', params.assignee.join(','));
      if (params.tags?.length) queryParams.append('tags', params.tags.join(','));
      if (params.search) queryParams.append('search', params.search);
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const response = await axiosInstance.get(`/tasks?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  }

  // Get task by ID
  static async getTask(id: string): Promise<ApiResponse<Task>> {
    try {
      const response = await axiosInstance.get(`/tasks/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching task:', error);
      throw error;
    }
  }

  // Create new task
  static async createTask(data: CreateTaskForm): Promise<ApiResponse<Task>> {
    try {
      const response = await axiosInstance.post('/tasks', data);
      return response.data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  // Update task
  static async updateTask(id: string, data: UpdateTaskForm): Promise<ApiResponse<Task>> {
    try {
      const response = await axiosInstance.put(`/tasks/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  // Delete task
  static async deleteTask(id: string): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.delete(`/tasks/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  // Move task to different column/position
  static async moveTask(id: string, data: MoveTaskForm): Promise<ApiResponse<Task>> {
    try {
      const response = await axiosInstance.patch(`/tasks/${id}/move`, data);
      return response.data;
    } catch (error) {
      console.error('Error moving task:', error);
      throw error;
    }
  }

  // Get overdue tasks
  static async getOverdueTasks(): Promise<ApiResponse<Task[]>> {
    try {
      const response = await axiosInstance.get('/tasks/overdue');
      return response.data;
    } catch (error) {
      console.error('Error fetching overdue tasks:', error);
      throw error;
    }
  }

  // Get task recommendations
  static async getTaskRecommendations(): Promise<ApiResponse<Task[]>> {
    try {
      const response = await axiosInstance.get('/tasks/recommendations');
      return response.data;
    } catch (error) {
      console.error('Error fetching task recommendations:', error);
      throw error;
    }
  }

  // Bulk update tasks
  static async bulkUpdateTasks(taskIds: string[], updates: Partial<UpdateTaskForm>): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.patch('/tasks/bulk-update', { taskIds, updates });
      return response.data;
    } catch (error) {
      console.error('Error bulk updating tasks:', error);
      throw error;
    }
  }

  // Duplicate task
  static async duplicateTask(id: string): Promise<ApiResponse<Task>> {
    try {
      const response = await axiosInstance.post(`/tasks/${id}/duplicate`);
      return response.data;
    } catch (error) {
      console.error('Error duplicating task:', error);
      throw error;
    }
  }

  // Start time tracking
  static async startTimeTracking(id: string, description?: string): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.post(`/tasks/${id}/time-tracking`, { description });
      return response.data;
    } catch (error) {
      console.error('Error starting time tracking:', error);
      throw error;
    }
  }

  // Stop time tracking
  static async stopTimeTracking(id: string): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.post(`/tasks/${id}/time-tracking/stop`);
      return response.data;
    } catch (error) {
      console.error('Error stopping time tracking:', error);
      throw error;
    }
  }
}
