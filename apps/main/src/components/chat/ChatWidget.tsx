import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { env } from '../../config/env';
import { Chat, ChatMessage, SendMessageRequest, CreateChatRequest } from '../../types/chat.types';
import type { ChatWidgetProps } from '../../types/interfaces/ui';

const ChatWidget: React.FC<ChatWidgetProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [typingAdmin, setTypingAdmin] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat when widget opens
  useEffect(() => {
    if (isOpen && user && !chat) {
      initializeChat();
    }
  }, [isOpen, user, chat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeChat = async () => {
    if (!user) return;

    try {
      setIsConnecting(true);
      


      // For now, we'll simulate creating a chat
      // In a real implementation, you'd make an API call here
      const mockChat: Chat = {
        _id: `chat_${Date.now()}`,
        chatId: `chat_${Date.now()}`,
        participants: [
          {
            id: user.id,
            model: 'User',
            name: user.name || 'User',
            avatar: user.avatar,
            isOnline: true,
            lastSeen: new Date()
          },
          {
            id: 'default-admin-id',
            model: 'Admin',
            name: 'Support Team',
            avatar: '',
            isOnline: true,
            lastSeen: new Date()
          }
        ],
        messages: [
          {
            _id: `msg_${Date.now()}`,
            sender: {
              id: 'default-admin-id',
              model: 'Admin',
              name: 'Support Team'
            },
            content: 'Hello! Welcome to TaskFlow support. How can I help you today?',
            messageType: 'text',
            isRead: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        status: 'active',
        category: 'general',
        priority: 'medium',
        tags: [],
        lastMessage: {
          content: 'Hello! Welcome to TaskFlow support. How can I help you today?',
          timestamp: new Date(),
          sender: {
            id: 'default-admin-id',
            name: 'Support Team'
          }
        },
        metrics: {
          totalMessages: 1,
          responseTime: {}
        },
        settings: {
          autoAssign: true,
          notifications: {
            email: true,
            push: true
          }
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setChat(mockChat);
      setMessages(mockChat.messages);

      // Initialize WebSocket connection
      initializeWebSocket(mockChat._id);
      
    } catch (error) {
      console.error('Error initializing chat:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const initializeWebSocket = (chatId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const wsUrl = env.SOCKET_URL?.replace('ws://', 'ws://').replace('https://', 'wss://') || 'ws://localhost:3001';
    const ws = new WebSocket(`${wsUrl}?token=${token}`);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      // Join chat room
      ws.send(JSON.stringify({
        event: 'chat:join',
        data: { chatId }
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    wsRef.current = ws;
  };

  const handleWebSocketMessage = (data: any) => {
    switch (data.event) {
      case 'chat:message':
        if (data.data.message) {
          setMessages(prev => [...prev, data.data.message]);
        }
        break;
      case 'chat:user-typing':
        if (data.data.isTyping) {
          setTypingAdmin(data.data.user.name);
        } else {
          setTypingAdmin(null);
        }
        break;
      case 'chat:status-updated':
        // Handle status updates
        break;
      default:
        console.log('Unknown WebSocket event:', data.event);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !chat) return;

    const messageData: SendMessageRequest = {
      content: newMessage.trim(),
      messageType: 'text'
    };

    // Add message to local state immediately for instant feedback
    const newMsg: ChatMessage = {
      _id: `msg_${Date.now()}`,
      sender: {
        id: user!.id,
        model: 'User',
        name: user!.name || 'User',
        avatar: user!.avatar
      },
      content: newMessage.trim(),
      messageType: 'text',
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setMessages(prev => [...prev, newMsg]);
    setNewMessage('');

    // Send via WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        event: 'chat:message',
        data: {
          chatId: chat._id,
          message: messageData
        }
      }));
    }

    // In a real implementation, you'd also make an HTTP API call here
    // await chatService.sendMessage(chat._id, messageData);
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    // Send typing indicator
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && chat) {
      wsRef.current.send(JSON.stringify({
        event: 'chat:typing',
        data: {
          chatId: chat._id,
          isTyping: true
        }
      }));
    }
    
    // Debounce typing indicator
    clearTimeout((window as any).typingTimeout);
    (window as any).typingTimeout = setTimeout(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && chat) {
        wsRef.current.send(JSON.stringify({
          event: 'chat:typing',
          data: {
            chatId: chat._id,
            isTyping: false
          }
        }));
      }
    }, 1000);
  };

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 h-96 bg-white border border-gray-200 rounded-lg shadow-lg flex flex-col z-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
          <span className="font-medium">Customer Support</span>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isConnecting ? (
          <div className="text-center text-gray-500">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
            Connecting to support...
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message._id}
                className={`flex ${message.sender.model === 'User' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs p-3 rounded-lg ${
                  message.sender.model === 'User' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <div className="text-sm">{message.content}</div>
                  <div className={`text-xs mt-1 ${
                    message.sender.model === 'User' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {new Date(message.createdAt).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing indicator */}
            {typingAdmin && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">
                    {typingAdmin} is typing...
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            onChange={handleTyping}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isConnecting}
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || isConnecting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWidget;
