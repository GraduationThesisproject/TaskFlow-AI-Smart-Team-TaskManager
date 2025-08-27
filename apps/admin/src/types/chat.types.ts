export interface ChatParticipant {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  model: 'User' | 'Admin';
  isOnline?: boolean;
  lastSeen?: Date;
}

export interface ChatMessage {
  _id: string;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'system';
  sender: ChatParticipant;
  chatId: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    fileType?: string;
  };
}

export interface Chat {
  _id: string;
  chatId: string;
  participants: ChatParticipant[];
  messages: ChatMessage[];
  status: 'pending' | 'active' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'general' | 'technical' | 'billing' | 'feature_request' | 'bug_report' | 'other';
  assignedTo?: ChatParticipant;
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
  userAgent?: string;
  ipAddress?: string;
  tags?: string[];
  notes?: string;
}

export interface ChatStats {
  totalChats: number;
  activeChats: number;
  pendingChats: number;
  resolvedChats: number;
  totalMessages: number;
  averageResponseTime: number; // in minutes
  totalUnread: number;
  chatsByCategory: Record<string, number>;
  chatsByPriority: Record<string, number>;
}

export interface SendMessageRequest {
  content: string;
  messageType: 'text' | 'image' | 'file' | 'system';
  metadata?: {
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    fileType?: string;
  };
}

export interface UpdateChatStatusRequest {
  status: 'pending' | 'active' | 'resolved' | 'closed';
  reason?: string;
}

export interface AssignChatRequest {
  assignedTo: string; // admin ID
  note?: string;
}

export interface ChatSearchRequest {
  query?: string;
  status?: string;
  priority?: string;
  category?: string;
  assignedTo?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface ChatListResponse {
  chats: Chat[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Socket event types
export interface SocketMessage {
  type: 'message' | 'typing' | 'status_update' | 'chat_request' | 'chat_accepted' | 'chat_closed';
  data: any;
  timestamp: Date;
}

export interface TypingIndicator {
  chatId: string;
  user: {
    id: string;
    name: string;
  };
  isTyping: boolean;
}

export interface ChatStatusUpdate {
  chatId: string;
  status: string;
  updatedBy: string;
  timestamp: Date;
}

export interface NewChatRequest {
  chatId: string;
  user: ChatParticipant;
  message: string;
  category: string;
  priority: string;
  timestamp: Date;
}
