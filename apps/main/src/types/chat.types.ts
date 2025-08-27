export interface ChatMessage {
  _id: string;
  sender: {
    id: string;
    model: 'User' | 'Admin';
    name: string;
    avatar?: string;
  };
  content: string;
  messageType: 'text' | 'file' | 'image' | 'system';
  attachments?: ChatAttachment[];
  isRead: boolean;
  readAt?: Date;
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatAttachment {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
}

export interface ChatParticipant {
  id: string;
  model: 'User' | 'Admin';
  name: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
}

export interface Chat {
  _id: string;
  chatId: string;
  participants: ChatParticipant[];
  messages: ChatMessage[];
  status: 'active' | 'resolved' | 'closed' | 'pending';
  category: 'general' | 'technical' | 'billing' | 'feature_request' | 'bug_report' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: {
    _id: string;
    name: string;
    avatar?: string;
  };
  tags: string[];
  lastMessage: {
    content: string;
    timestamp: Date;
    sender: {
      id: string;
      name: string;
    };
  };
  metrics: {
    totalMessages: number;
    responseTime: {
      firstResponse?: number;
      averageResponse?: number;
    };
    satisfaction?: {
      rating?: number;
      feedback?: string;
      timestamp?: Date;
    };
  };
  settings: {
    autoAssign: boolean;
    notifications: {
      email: boolean;
      push: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface SendMessageRequest {
  content: string;
  messageType?: 'text' | 'file' | 'image' | 'system';
  attachments?: ChatAttachment[];
}

export interface CreateChatRequest {
  adminId: string;
  category?: string;
  priority?: string;
  initialMessage: string;
}
