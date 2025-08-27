import { useEffect, useRef, useCallback, useState } from 'react';
import { useSocket } from './socket/useSocket';
import { env } from '../config/env';
import { 
  Chat, 
  ChatMessage, 
  TypingIndicator, 
  ChatStatusUpdate, 
  NewChatRequest,
  SocketMessage 
} from '../types/chat.types';

interface UseChatSocketProps {
  onNewChatRequest?: (chatRequest: NewChatRequest) => void;
  onNewMessage?: (message: ChatMessage) => void;
  onTypingIndicator?: (typing: TypingIndicator) => void;
  onStatusUpdate?: (update: ChatStatusUpdate) => void;
  onChatAccepted?: (chatId: string, adminId: string) => void;
  onChatClosed?: (chatId: string, reason?: string) => void;
  onUserOnline?: (userId: string, isOnline: boolean) => void;
}

export const useChatSocket = (props: UseChatSocketProps = {}) => {
  const {
    onNewChatRequest,
    onNewMessage,
    onTypingIndicator,
    onStatusUpdate,
    onChatAccepted,
    onChatClosed,
    onUserOnline
  } = props;

  const [isConnected, setIsConnected] = useState(false);
  const [activeChats, setActiveChats] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Map<string, Set<string>>>(new Map());
  
  const { socket, emit, on, off } = useSocket({
    url: env.SOCKET_URL || 'ws://localhost:3001',
    autoConnect: false,
    auth: {
      token: localStorage.getItem('adminToken') || ''
    }
  });

  const socketRef = useRef(socket);
  socketRef.current = socket;

  // Connect to socket when component mounts
  useEffect(() => {
    if (socket && !isConnected) {
      socket.connect();
      setIsConnected(true);
    }

    return () => {
      if (socket) {
        socket.disconnect();
        setIsConnected(false);
      }
    };
  }, [socket]);

  // Join admin chat room
  const joinAdminRoom = useCallback(() => {
    if (socket && isConnected) {
      emit('admin:join', {});
    }
  }, [socket, isConnected, emit]);

  // Join specific chat room
  const joinChatRoom = useCallback((chatId: string) => {
    if (socket && isConnected) {
      emit('chat:join', { chatId });
      setActiveChats(prev => new Set(prev).add(chatId));
    }
  }, [socket, isConnected, emit]);

  // Leave specific chat room
  const leaveChatRoom = useCallback((chatId: string) => {
    if (socket && isConnected) {
      emit('chat:leave', { chatId });
      setActiveChats(prev => {
        const newSet = new Set(prev);
        newSet.delete(chatId);
        return newSet;
      });
    }
  }, [socket, isConnected, emit]);

  // Send message via socket
  const sendMessage = useCallback((chatId: string, message: Omit<ChatMessage, '_id' | 'createdAt' | 'updatedAt'>) => {
    if (socket && isConnected) {
      emit('chat:message', {
        chatId,
        message: {
          ...message,
          timestamp: new Date()
        }
      });
    }
  }, [socket, isConnected, emit]);

  // Send typing indicator
  const sendTypingIndicator = useCallback((chatId: string, isTyping: boolean) => {
    if (socket && isConnected) {
      emit('chat:typing', { chatId, isTyping });
    }
  }, [socket, isConnected, emit]);

  // Accept chat request
  const acceptChat = useCallback((chatId: string) => {
    if (socket && isConnected) {
      emit('admin:accept-chat', { chatId });
    }
  }, [socket, isConnected, emit]);

  // Update chat status
  const updateChatStatus = useCallback((chatId: string, status: string, reason?: string) => {
    if (socket && isConnected) {
      emit('admin:update-status', { chatId, status, reason });
    }
  }, [socket, isConnected, emit]);

  // Close chat
  const closeChat = useCallback((chatId: string, reason?: string) => {
    if (socket && isConnected) {
      emit('admin:close-chat', { chatId, reason });
    }
  }, [socket, isConnected, emit]);

  // Mark messages as read
  const markMessagesAsRead = useCallback((chatId: string, messageIds: string[]) => {
    if (socket && isConnected) {
      emit('admin:mark-read', { chatId, messageIds });
    }
  }, [socket, isConnected, emit]);

  // Setup socket event listeners
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Admin-specific events
    on('admin:new-chat-request', (data: NewChatRequest) => {
      onNewChatRequest?.(data);
    });

    on('admin:chat-accepted', (data: { chatId: string; adminId: string }) => {
      onChatAccepted?.(data.chatId, data.adminId);
    });

    // Chat events
    on('chat:message', (data: { chatId: string; message: ChatMessage }) => {
      onNewMessage?.(data.message);
    });

    on('chat:typing', (data: TypingIndicator) => {
      setTypingUsers(prev => {
        const newMap = new Map(prev);
        if (data.isTyping) {
          const users = newMap.get(data.chatId) || new Set();
          users.add(data.user.id);
          newMap.set(data.chatId, users);
        } else {
          const users = newMap.get(data.chatId);
          if (users) {
            users.delete(data.user.id);
            if (users.size === 0) {
              newMap.delete(data.chatId);
            }
          }
        }
        return newMap;
      });
      onTypingIndicator?.(data);
    });

    on('chat:status-updated', (data: ChatStatusUpdate) => {
      onStatusUpdate?.(data);
    });

    on('chat:closed', (data: { chatId: string; reason?: string }) => {
      onChatClosed?.(data.chatId, data.reason);
      setActiveChats(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.chatId);
        return newSet;
      });
    });

    // User presence events
    on('user:online', (data: { userId: string; isOnline: boolean }) => {
      onUserOnline?.(data.userId, data.isOnline);
    });

    // Connection events
    on('connect', () => {
      setIsConnected(true);
      joinAdminRoom();
    });

    on('disconnect', () => {
      setIsConnected(false);
    });

    on('connect_error', (error: any) => {
      setIsConnected(false);
    });

    return () => {
      off('admin:new-chat-request');
      off('admin:chat-accepted');
      off('chat:message');
      off('chat:typing');
      off('chat:status-updated');
      off('chat:closed');
      off('user:online');
      off('connect');
      off('disconnect');
      off('connect_error');
    };
  }, [socket, isConnected, on, off, joinAdminRoom]);

  return {
    // Connection state
    isConnected,
    
    // Active chats
    activeChats: Array.from(activeChats),
    typingUsers,
    
    // Socket methods
    socket,
    emit,
    
    // Chat methods
    joinChatRoom,
    leaveChatRoom,
    sendMessage,
    sendTypingIndicator,
    acceptChat,
    updateChatStatus,
    closeChat,
    markMessagesAsRead,
    
    // Utility methods
    isUserTyping: (chatId: string, userId: string) => {
      return typingUsers.get(chatId)?.has(userId) || false;
    }
  };
};
