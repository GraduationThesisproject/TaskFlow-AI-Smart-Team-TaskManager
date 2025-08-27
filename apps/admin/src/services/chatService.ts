import { env } from '../config/env';
import { 
  Chat, 
  ChatMessage, 
  ChatStats, 
  SendMessageRequest, 
  UpdateChatStatusRequest, 
  AssignChatRequest,
  ChatSearchRequest
} from '../types/chat.types';

class ChatService {
  private baseUrl = `${env.API_BASE_URL}/chat`;

  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('adminToken');
    
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  /**
   * Get active chat sessions for admin
   */
  async getActiveChats(): Promise<Chat[]> {
    try {
      // console.log('ChatService: getActiveChats called');
      
      const response = await fetch(`${this.baseUrl}/admin/active`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch active chats');
      }

      const data = await response.json();
      return data.data?.chats || [];
    } catch (error) {
      console.error('ChatService: Error fetching active chats:', error);
      throw error;
    }
  }

  /**
   * Accept a chat request
   */
  async acceptChat(chatId: string): Promise<Chat> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/${chatId}/accept`, {
        method: 'POST',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to accept chat');
      }

      const data = await response.json();
      return data.data?.chat;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Send message via REST API (fallback when socket fails)
   */
  async sendMessage(chatId: string, messageData: SendMessageRequest): Promise<{ chat: Chat; message: ChatMessage }> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/${chatId}/messages`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(messageData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send message');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update chat status
   */
  async updateChatStatus(chatId: string, statusData: UpdateChatStatusRequest): Promise<Chat> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/${chatId}/status`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(statusData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update chat status');
      }

      const data = await response.json();
      return data.data?.chat;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get chat history
   */
  async getChatHistory(chatId: string, limit: number = 50): Promise<ChatMessage[]> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/${chatId}/history?limit=${limit}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch chat history');
      }

      const data = await response.json();
      return data.data?.messages || [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(chatId: string, messageIds: string[]): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/${chatId}/read`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ messageIds }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to mark messages as read');
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get chat statistics
   */
  async getChatStats(): Promise<ChatStats> {
    try {
      // console.log('ChatService: getChatStats called');
      
      const response = await fetch(`${this.baseUrl}/admin/stats`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch chat stats');
      }

      const data = await response.json();
      return data.data?.stats || {
        totalChats: 0,
        activeChats: 0,
        pendingChats: 0,
        resolvedChats: 0,
        totalMessages: 0,
        averageResponseTime: 0
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Close a chat
   */
  async closeChat(chatId: string, reason?: string): Promise<Chat> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/${chatId}/close`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to close chat');
      }

      const data = await response.json();
      return data.data?.chat;
    } catch (error) {
      throw error;
    }
  }
}

export default new ChatService();
