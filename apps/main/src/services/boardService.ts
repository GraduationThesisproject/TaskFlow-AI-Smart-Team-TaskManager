import axiosInstance from '../config/axios';
import type { Board, Column, ApiResponse, PaginatedResponse } from '../types/task.types';

export interface CreateBoardData {
  name: string;
  description?: string;
  type: 'kanban' | 'list' | 'table';
  visibility: 'public' | 'private';
  spaceId: string;
  settings?: any;
}

export interface UpdateBoardData {
  name?: string;
  description?: string;
  settings?: any;
}

export interface CreateColumnData {
  name: string;
  boardId: string;
  position: number;
  settings?: any;
}

export interface UpdateColumnData {
  name?: string;
  position?: number;
  settings?: any;
}

export class BoardService {
  // Get boards by space
  static async getBoardsBySpace(spaceId: string): Promise<ApiResponse<Board[]>> {
    try {
      const response = await axiosInstance.get(`/boards?space=${spaceId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching boards:', error);
      throw error;
    }
  }

  // Get board by ID
  static async getBoard(id: string): Promise<ApiResponse<Board>> {
    try {
      const response = await axiosInstance.get(`/boards/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching board:', error);
      throw error;
    }
  }

  // Create new board
  static async createBoard(data: CreateBoardData): Promise<ApiResponse<Board>> {
    try {
      const response = await axiosInstance.post('/boards', data);
      return response.data;
    } catch (error) {
      console.error('Error creating board:', error);
      throw error;
    }
  }

  // Update board
  static async updateBoard(id: string, data: UpdateBoardData): Promise<ApiResponse<Board>> {
    try {
      const response = await axiosInstance.put(`/boards/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating board:', error);
      throw error;
    }
  }

  // Delete board
  static async deleteBoard(id: string): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.delete(`/boards/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting board:', error);
      throw error;
    }
  }

  // Get columns by board
  static async getColumnsByBoard(boardId: string): Promise<ApiResponse<Column[]>> {
    try {
      const response = await axiosInstance.get(`/boards/${boardId}/columns`);
      return response.data;
    } catch (error) {
      console.error('Error fetching columns:', error);
      throw error;
    }
  }

  // Create new column
  static async createColumn(data: CreateColumnData): Promise<ApiResponse<Column>> {
    try {
      const response = await axiosInstance.post('/boards/columns', data);
      return response.data;
    } catch (error) {
      console.error('Error creating column:', error);
      throw error;
    }
  }

  // Update column
  static async updateColumn(id: string, data: UpdateColumnData): Promise<ApiResponse<Column>> {
    try {
      const response = await axiosInstance.put(`/boards/columns/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating column:', error);
      throw error;
    }
  }

  // Delete column
  static async deleteColumn(id: string): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.delete(`/boards/columns/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting column:', error);
      throw error;
    }
  }

  // Reorder columns
  static async reorderColumns(boardId: string, columnIds: string[]): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.patch(`/boards/${boardId}/columns/reorder`, { columnIds });
      return response.data;
    } catch (error) {
      console.error('Error reordering columns:', error);
      throw error;
    }
  }
}
