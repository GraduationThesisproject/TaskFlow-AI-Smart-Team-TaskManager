import { useEffect, useCallback, useState } from 'react';
import { useChatSocket } from '../../contexts/SocketContext';

interface ChatMessage {
  id: string;
  chatId: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  timestamp: string;
  type: 'text' | 'file' | 'image' | 'system';
  metadata?: Record<string, any>;
}

interface ChatRoom {
  id: string;
  chatId: string;
  participants: Array<{
    id: string;
    name: string;
    avatar?: string;
    isOnline: boolean;
    lastSeen?: string;
  }>;
  lastMessage?: ChatMessage;
  unreadCount: number;
}

export const useChatSocketOperations = () => {
  const [activeChats, setActiveChats] = useState<ChatRoom[]>([]);
  const [currentChat, setCurrentChat] = useState<ChatRoom | null>(null);
  const [isTyping, setIsTyping] = useState<Record<string, boolean>>({});
  
  const chatSocket = useChatSocket();
  const socket = chatSocket;
  const isConnected = socket?.connected || false;
  const emit = (event: string, data?: any) => socket?.emit(event, data);
  const on = (event: string, callback: (data?: any) => void) => socket?.on(event, callback);
  const off = (event: string) => socket?.off(event);

  // Join chat rooms
  const joinChatRooms = useCallback(() => {
    if (isConnected) {
      emit('chat:join-rooms', {});
    }
  }, [isConnected, emit]);

  // Join specific chat room
  const joinChatRoom = useCallback((chatId: string) => {
    if (isConnected) {
      emit('chat:join', { chatId });
    }
  }, [isConnected, emit]);

  // Leave chat room
  const leaveChatRoom = useCallback((chatId: string) => {
    if (isConnected) {
      emit('chat:leave', { chatId });
    }
  }, [isConnected, emit]);

  // Send message
  const sendMessage = useCallback((chatId: string, content: string, type: 'text' | 'file' | 'image' = 'text', metadata?: Record<string, any>) => {
    if (isConnected) {
      emit('chat:message', {
        chatId,
        content,
        type,
        metadata,
        timestamp: new Date().toISOString()
      });
    }
  }, [isConnected, emit]);

  // Start typing indicator
  const startTyping = useCallback((chatId: string) => {
    if (isConnected) {
      emit('chat:typing-start', { chatId });
    }
  }, [isConnected, emit]);

  // Stop typing indicator
  const stopTyping = useCallback((chatId: string) => {
    if (isConnected) {
      emit('chat:typing-stop', { chatId });
    }
  }, [isConnected, emit]);

  // Mark message as read
  const markAsRead = useCallback((chatId: string, messageId: string) => {
    if (isConnected) {
      emit('chat:mark-read', { chatId, messageId });
    }
  }, [isConnected, emit]);

  // Get chat history
  const getChatHistory = useCallback((chatId: string, limit: number = 50, before?: string) => {
    if (isConnected) {
      emit('chat:get-history', { chatId, limit, before });
    }
  }, [isConnected, emit]);

  // Set up event listeners
  useEffect(() => {
    if (!socket) return;

    const handleRoomsJoined = (data: { count: number; chats: Array<{ id: string; chatId: string }> }) => {
      console.log(`Joined ${data.count} chat rooms`);
    };

    const handleChatJoined = (data: { chatId: string; participants: any[] }) => {
      console.log(`Joined chat: ${data.chatId}`);
    };

    const handleNewMessage = (data: { message: ChatMessage }) => {
      // Update active chats with new message
      setActiveChats(prev => prev.map(chat => 
        chat.chatId === data.message.chatId 
          ? { ...chat, lastMessage: data.message, unreadCount: chat.unreadCount + 1 }
          : chat
      ));

      // Update current chat if it's the active one
      if (currentChat?.chatId === data.message.chatId) {
        setCurrentChat(prev => prev ? { ...prev, lastMessage: data.message } : null);
      }
    };

    const handleTypingStart = (data: { chatId: string; user: { id: string; name: string } }) => {
      setIsTyping(prev => ({ ...prev, [data.chatId]: true }));
    };

    const handleTypingStop = (data: { chatId: string; user: { id: string; name: string } }) => {
      setIsTyping(prev => ({ ...prev, [data.chatId]: false }));
    };

    const handleMessageRead = (data: { chatId: string; messageId: string; readBy: string }) => {
      // Update unread count
      setActiveChats(prev => prev.map(chat => 
        chat.chatId === data.chatId 
          ? { ...chat, unreadCount: Math.max(0, chat.unreadCount - 1) }
          : chat
      ));
    };

    // Register event listeners
    on('chat:rooms-joined', handleRoomsJoined);
    on('chat:joined', handleChatJoined);
    on('chat:new-message', handleNewMessage);
    on('chat:typing-start', handleTypingStart);
    on('chat:typing-stop', handleTypingStop);
    on('chat:message-read', handleMessageRead);

    // Cleanup
    return () => {
      off('chat:rooms-joined');
      off('chat:joined');
      off('chat:new-message');
      off('chat:typing-start');
      off('chat:typing-stop');
      off('chat:message-read');
    };
  }, [socket, on, off, currentChat]);

  // Auto-join chat rooms when connected
  useEffect(() => {
    if (isConnected) {
      joinChatRooms();
    }
  }, [isConnected, joinChatRooms]);

  return {
    // Connection status
    isConnected,
    
    // State
    activeChats,
    currentChat,
    isTyping,
    
    // Actions
    joinChatRooms,
    joinChatRoom,
    leaveChatRoom,
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead,
    getChatHistory,
    
    // Setters
    setCurrentChat,
  };
};
