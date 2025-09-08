import axiosInstance from '../config/axios';
import type { ApiResponse } from '../types/task.types';

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  emailVerified: boolean;
  isActive: boolean;
  isLocked: boolean;
  preferences?: any;
}

export class UserService {
  // Get all users
  static async getUsers(): Promise<ApiResponse<User[]>> {
    try {
      const response = await axiosInstance.get('/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // Get user by ID
  static async getUser(id: string): Promise<ApiResponse<User>> {
    try {
      const response = await axiosInstance.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  // Get current user profile
  static async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const response = await axiosInstance.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  }

  // Update user profile
  static async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const response = await axiosInstance.put('/auth/me', data);
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }
}
