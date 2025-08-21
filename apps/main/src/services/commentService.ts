import type { 
  Comment, 
  CommentReaction,
  ApiResponse 
} from '../types/task.types';
import { env } from '../config/env';

// API base URL from environment configuration
const API_BASE_URL = env.API_URL;

// Helper function to simulate API delay
const simulateApiDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to create API response
const createApiResponse = <T>(data: T, message: string = 'Success'): ApiResponse<T> => ({
  success: true,
  message,
  data,
  timestamp: new Date().toISOString()
});

// Mock comments data for development
const mockComments: Comment[] = [
  {
    _id: '1',
    content: 'Updated the wireframes based on client feedback. Ready for review.',
    author: 'user_1',
    taskId: 'task_1',
    mentions: ['user_2'],
    attachments: [],
    reactions: [
      { user: 'user_2', emoji: '👍', createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
      { user: 'user_3', emoji: '❤️', createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString() }
    ],
    isPinned: true,
    isResolved: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '2',
    content: 'Looks great! Just need to adjust the spacing on mobile.',
    author: 'user_2',
    taskId: 'task_1',
    mentions: [],
    attachments: [],
    reactions: [
      { user: 'user_1', emoji: '👍', createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString() }
    ],
    isPinned: false,
    isResolved: false,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '3',
    content: 'I agree with the mobile spacing comment. Should we create a separate mobile mockup?',
    author: 'user_3',
    taskId: 'task_1',
    mentions: ['user_1', 'user_2'],
    attachments: [],
    reactions: [],
    isPinned: false,
    isResolved: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export class CommentService {
  // Get comments for a task
  static async getTaskComments(taskId: string): Promise<ApiResponse<Comment[]>> {
    await simulateApiDelay();
    
    const comments = mockComments.filter(comment => comment.taskId === taskId);
    return createApiResponse(comments);
  }

  // Add a new comment
  static async addComment(taskId: string, commentData: {
    content: string;
    mentions?: string[];
    parentCommentId?: string;
  }): Promise<ApiResponse<Comment>> {
    await simulateApiDelay(800);
    
    const newComment: Comment = {
      _id: `comment_${Date.now()}`,
      content: commentData.content,
      author: 'user_1', // Current user
      taskId,
      mentions: commentData.mentions || [],
      attachments: [],
      reactions: [],
      isPinned: false,
      isResolved: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Add to mock data
    mockComments.unshift(newComment);
    
    return createApiResponse(newComment, 'Comment added successfully');
  }

  // Update a comment
  static async updateComment(commentId: string, content: string): Promise<ApiResponse<Comment>> {
    await simulateApiDelay(600);
    
    const commentIndex = mockComments.findIndex(c => c._id === commentId);
    if (commentIndex === -1) {
      throw new Error('Comment not found');
    }
    
    const updatedComment: Comment = {
      ...mockComments[commentIndex],
      content,
      updatedAt: new Date().toISOString(),
    };
    
    mockComments[commentIndex] = updatedComment;
    
    return createApiResponse(updatedComment, 'Comment updated successfully');
  }

  // Delete a comment
  static async deleteComment(commentId: string): Promise<ApiResponse<{ deleted: boolean }>> {
    await simulateApiDelay(500);
    
    const commentIndex = mockComments.findIndex(c => c._id === commentId);
    if (commentIndex === -1) {
      throw new Error('Comment not found');
    }
    
    mockComments.splice(commentIndex, 1);
    
    return createApiResponse({ deleted: true }, 'Comment deleted successfully');
  }

  // Add reaction to comment
  static async addReaction(commentId: string, emoji: string): Promise<ApiResponse<CommentReaction[]>> {
    await simulateApiDelay(300);
    
    const comment = mockComments.find(c => c._id === commentId);
    if (!comment) {
      throw new Error('Comment not found');
    }
    
    const existingReaction = comment.reactions.find(
      r => r.user === 'user_1' && r.emoji === emoji
    );
    
    if (!existingReaction) {
      const newReaction: CommentReaction = {
        user: 'user_1',
        emoji,
        createdAt: new Date().toISOString(),
      };
      
      comment.reactions.push(newReaction);
    }
    
    return createApiResponse(comment.reactions, 'Reaction added successfully');
  }

  // Remove reaction from comment
  static async removeReaction(commentId: string, emoji: string): Promise<ApiResponse<CommentReaction[]>> {
    await simulateApiDelay(300);
    
    const comment = mockComments.find(c => c._id === commentId);
    if (!comment) {
      throw new Error('Comment not found');
    }
    
    comment.reactions = comment.reactions.filter(
      r => !(r.user === 'user_1' && r.emoji === emoji)
    );
    
    return createApiResponse(comment.reactions, 'Reaction removed successfully');
  }

  // Toggle comment pin
  static async togglePin(commentId: string): Promise<ApiResponse<{ isPinned: boolean }>> {
    await simulateApiDelay(400);
    
    const comment = mockComments.find(c => c._id === commentId);
    if (!comment) {
      throw new Error('Comment not found');
    }
    
    comment.isPinned = !comment.isPinned;
    
    return createApiResponse(
      { isPinned: comment.isPinned },
      comment.isPinned ? 'Comment pinned successfully' : 'Comment unpinned successfully'
    );
  }

  // Toggle comment resolve
  static async toggleResolve(commentId: string): Promise<ApiResponse<{ isResolved: boolean }>> {
    await simulateApiDelay(400);
    
    const comment = mockComments.find(c => c._id === commentId);
    if (!comment) {
      throw new Error('Comment not found');
    }
    
    comment.isResolved = !comment.isResolved;
    
    return createApiResponse(
      { isResolved: comment.isResolved },
      comment.isResolved ? 'Comment resolved successfully' : 'Comment unresolved successfully'
    );
  }

  // Get comment replies
  static async getReplies(commentId: string): Promise<ApiResponse<Comment[]>> {
    await simulateApiDelay();
    
    const replies = mockComments.filter(comment => 
      comment.parentCommentId === commentId
    );
    
    return createApiResponse(replies);
  }

  // Add reply to comment
  static async addReply(parentCommentId: string, content: string): Promise<ApiResponse<Comment>> {
    await simulateApiDelay(800);
    
    const newReply: Comment = {
      _id: `comment_${Date.now()}`,
      content,
      author: 'user_1', // Current user
      taskId: mockComments.find(c => c._id === parentCommentId)?.taskId || '',
      mentions: [],
      attachments: [],
      reactions: [],
      isPinned: false,
      isResolved: false,
      parentCommentId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockComments.push(newReply);
    
    return createApiResponse(newReply, 'Reply added successfully');
  }
}

export default CommentService;
