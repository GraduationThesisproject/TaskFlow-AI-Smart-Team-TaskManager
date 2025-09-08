import type { 
  Comment, 
  CommentReaction,
  ApiResponse 
} from '../types/task.types';
import { env } from '../config/env';
import axiosInstance from '../config/axios';

// API base URL from environment configuration
const API_BASE_URL = env.API_URL;

// Helper function to create API response
const createApiResponse = <T>(data: T, message: string = 'Success'): ApiResponse<T> => ({
  success: true,
  message,
  data,
  timestamp: new Date().toISOString()
});

export class CommentService {
  // Get comments for a task
  static async getComments(taskId: string): Promise<ApiResponse<Comment[]>> {
    try {
      const response = await axiosInstance.get(`/tasks/${taskId}/comments`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  }

  // Create a new comment
  static async createComment(commentData: {
    content: string;
    taskId: string;
    mentions?: string[];
    attachments?: string[];
    parentCommentId?: string;
  }): Promise<ApiResponse<Comment>> {
    try {
      const response = await axiosInstance.post('/comments', commentData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating comment:', error);
      throw error;
    }
  }

  // Update a comment
  static async updateComment(commentId: string, updates: {
    content?: string;
    mentions?: string[];
    attachments?: string[];
  }): Promise<ApiResponse<Comment>> {
    try {
      const response = await axiosInstance.put(`/comments/${commentId}`, updates);
      return response.data;
    } catch (error: any) {
      console.error('Error updating comment:', error);
      throw error;
    }
  }

  // Delete a comment
  static async deleteComment(commentId: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await axiosInstance.delete(`/comments/${commentId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }

  // Get a specific comment
  static async getComment(commentId: string): Promise<ApiResponse<Comment>> {
    try {
      const response = await axiosInstance.get(`/comments/${commentId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching comment:', error);
      throw error;
    }
  }

  // Add reaction to a comment
  static async addReaction(commentId: string, reaction: CommentReaction): Promise<ApiResponse<Comment>> {
    try {
      const response = await axiosInstance.post(`/comments/${commentId}/reactions`, reaction);
      return response.data;
    } catch (error: any) {
      console.error('Error adding reaction:', error);
      throw error;
    }
  }

  // Remove reaction from a comment
  static async removeReaction(commentId: string, userId: string, reactionType: string): Promise<ApiResponse<Comment>> {
    try {
      const response = await axiosInstance.delete(`/comments/${commentId}/reactions`, {
        data: { userId, reactionType }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error removing reaction:', error);
      throw error;
    }
  }

  // Get comment replies
  static async getReplies(parentCommentId: string): Promise<ApiResponse<Comment[]>> {
    try {
      const response = await axiosInstance.get(`/comments/${parentCommentId}/replies`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching replies:', error);
      throw error;
    }
  }

  // Create a reply to a comment
  static async createReply(parentCommentId: string, replyData: {
    content: string;
    mentions?: string[];
    attachments?: string[];
  }): Promise<ApiResponse<Comment>> {
    try {
      const response = await axiosInstance.post(`/comments/${parentCommentId}/replies`, replyData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating reply:', error);
      throw error;
    }
  }

  // Get comment mentions
  static async getMentions(commentId: string): Promise<ApiResponse<string[]>> {
    try {
      const response = await axiosInstance.get(`/comments/${commentId}/mentions`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching mentions:', error);
      throw error;
    }
  }

  // Get comment attachments
  static async getAttachments(commentId: string): Promise<ApiResponse<string[]>> {
    try {
      const response = await axiosInstance.get(`/comments/${commentId}/attachments`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching attachments:', error);
      throw error;
    }
  }
}

// Export individual functions for backward compatibility
export const getComments = CommentService.getComments;
export const createComment = CommentService.createComment;
export const updateComment = CommentService.updateComment;
export const deleteComment = CommentService.deleteComment;
export const getComment = CommentService.getComment;
export const addReaction = CommentService.addReaction;
export const removeReaction = CommentService.removeReaction;
export const getReplies = CommentService.getReplies;
export const createReply = CommentService.createReply;
export const getMentions = CommentService.getMentions;
export const getAttachments = CommentService.getAttachments;