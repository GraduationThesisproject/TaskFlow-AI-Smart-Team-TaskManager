import { env } from '../config/env';

export interface ChatMessage {
  _id: string;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'system';
  sender: {
    _id: string;
    name: string;
    email: string;
    model: 'User' | 'Admin';
    avatar?: string;
  };
  isRead: boolean;
  createdAt: Date;
}

export interface Chat {
  _id: string;
  status: 'pending' | 'active' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'general' | 'technical' | 'billing' | 'feature_request' | 'bug_report' | 'other';
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
  lastMessage?: {
    content: string;
    timestamp: Date;
    sender: {
      id: string;
      name: string;
    };
  };
}

export interface ChatRequest {
  name: string;
  email: string;
  message: string;
  category?: string;
  priority?: string;
}

export interface SendMessageRequest {
  content: string;
  messageType: 'text' | 'image' | 'file' | 'system';
}

class ChatService {
  private baseUrl = `${env.API_BASE_URL}/chat`;
  private wsUrl = env.SOCKET_URL?.replace('http://', 'ws://').replace('https://', 'wss://') || 'ws://localhost:3001';
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageHandlers: Map<string, (data: any) => void> = new Map();
  private isConnecting = false;

  // Event handlers
  private onMessageHandler?: (message: ChatMessage) => void;
  private onTypingHandler?: (sender: string, isTyping: boolean) => void;
  private onStatusUpdateHandler?: (status: string) => void;
  private onConnectHandler?: () => void;
  private onDisconnectHandler?: () => void;

  /**
   * Initialize WebSocket connection
   */
  connect(token: string, chatId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting) {
        reject(new Error('Connection already in progress'));
        return;
      }

      this.isConnecting = true;
      
      try {
        this.ws = new WebSocket(`${this.wsUrl}?token=${token}`);
        
        this.ws.onopen = () => {
          console.log('Chat WebSocket connected');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          
          // Join chat room
          this.send({
            event: 'chat:join',
            data: { chatId }
          });
          
          this.onConnectHandler?.();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleWebSocketMessage(data);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('Chat WebSocket error:', error);
          this.isConnecting = false;
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('Chat WebSocket disconnected');
          this.isConnecting = false;
          this.onDisconnectHandler?.();
          
          // Attempt to reconnect
          this.attemptReconnect(token, chatId);
        };

        // Set connection timeout
        setTimeout(() => {
          if (this.isConnecting) {
            this.isConnecting = false;
            this.ws?.close();
            reject(new Error('Connection timeout'));
          }
        }, 10000);

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect(token: string, chatId: string) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
    
    setTimeout(() => {
      this.connect(token, chatId).catch(error => {
        console.error('Reconnection failed:', error);
      });
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  /**
   * Send message via WebSocket
   */
  send(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket not connected, message not sent:', data);
    }
  }

  /**
   * Send chat message
   */
  sendMessage(chatId: string, message: SendMessageRequest): void {
    this.send({
      event: 'chat:message',
      data: {
        chatId,
        message
      }
    });
  }

  /**
   * Send typing indicator
   */
  sendTypingIndicator(chatId: string, isTyping: boolean): void {
    this.send({
      event: 'chat:typing',
      data: {
        chatId,
        isTyping
      }
    });
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleWebSocketMessage(data: any): void {
    switch (data.event) {
      case 'chat:message':
        if (this.onMessageHandler && data.message) {
          this.onMessageHandler(data.message);
        }
        break;
      
      case 'chat:typing':
        if (this.onTypingHandler && data.sender) {
          this.onTypingHandler(data.sender.name, data.isTyping);
        }
        break;
      
      case 'chat:status_update':
        if (this.onStatusUpdateHandler) {
          this.onStatusUpdateHandler(data.status);
        }
        break;
      
      default:
        console.log('Unknown WebSocket event:', data);
    }
  }

  /**
   * Start a new chat
   */
  async startChat(chatRequest: ChatRequest): Promise<Chat> {
    try {
      const response = await fetch(`${this.baseUrl}/widget/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chatRequest),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to start chat');
      }

      const data = await response.json();
      return data.data.chat;
    } catch (error) {
      console.error('Error starting chat:', error);
      throw error;
    }
  }

  /**
   * Send message via REST API (fallback)
   */
  async sendMessageViaAPI(chatId: string, message: SendMessageRequest): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/widget/${chatId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message via API:', error);
      throw error;
    }
  }

  /**
   * Get chat history
   */
  async getChatHistory(chatId: string): Promise<ChatMessage[]> {
    try {
      const response = await fetch(`${this.baseUrl}/widget/${chatId}/history`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get chat history');
      }

      const data = await response.json();
      return data.data.messages || [];
    } catch (error) {
      console.error('Error getting chat history:', error);
      throw error;
    }
  }

  /**
   * Disconnect WebSocket
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnecting = false;
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Set message handler
   */
  onMessage(handler: (message: ChatMessage) => void): void {
    this.onMessageHandler = handler;
  }

  /**
   * Set typing handler
   */
  onTyping(handler: (sender: string, isTyping: boolean) => void): void {
    this.onTypingHandler = handler;
  }

  /**
   * Set status update handler
   */
  onStatusUpdate(handler: (status: string) => void): void {
    this.onStatusUpdateHandler = handler;
  }

  /**
   * Set connect handler
   */
  onConnect(handler: () => void): void {
    this.onConnectHandler = handler;
  }

  /**
   * Set disconnect handler
   */
  onDisconnect(handler: () => void): void {
    this.onDisconnectHandler = handler;
  }
}

export default new ChatService();
