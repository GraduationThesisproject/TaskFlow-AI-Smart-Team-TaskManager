import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store';
import { Typography, Avatar, Badge, Button, Input, Select, SelectItem } from '@taskflow/ui';
import { 
  ChatBubbleLeftIcon, 
  PaperAirplaneIcon, 
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  ArrowPathIcon,
  UserPlusIcon,
  CheckIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { useChatSocket } from '../hooks/useChatSocket';
import chatService from '../services/chatService';
import { Chat, ChatMessage, ChatStats, NewChatRequest } from '../types/chat.types';

const ChatLayout: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, currentAdmin } = useAppSelector(state => state.admin);
  
  // Chat state
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ChatStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Chat socket hook
  const {
    isConnected,
    activeChats,
    typingUsers,
    joinChatRoom,
    leaveChatRoom,
    sendMessage,
    sendTypingIndicator,
    acceptChat,
    updateChatStatus,
    closeChat,
    markMessagesAsRead,
    isUserTyping
  } = useChatSocket({
    onNewChatRequest: handleNewChatRequest,
    onNewMessage: handleNewMessage,
    onTypingIndicator: handleTypingIndicator,
    onStatusUpdate: handleStatusUpdate,
    onChatAccepted: handleChatAccepted,
    onChatClosed: handleChatClosed,
    onUserOnline: handleUserOnline
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated || !currentAdmin) {
      console.log('ChatLayout: Not authenticated, redirecting to login');
      navigate('/login');
      return;
    }
  }, [isAuthenticated, currentAdmin, navigate]);

  // Load initial data
  useEffect(() => {
    if (isAuthenticated && currentAdmin) {
      loadActiveChats();
      loadChatStats();
    }
  }, [isAuthenticated, currentAdmin]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && messagesEndRef.current) {
      scrollToBottom();
    }
  }, [messages]);

  // Socket event handlers
  function handleNewChatRequest(chatRequest: NewChatRequest) {
    console.log('ChatLayout: New chat request received:', chatRequest);
    
    // Create a new chat object from the request
    const newChat: Chat = {
      _id: chatRequest.chatId,
      chatId: chatRequest.chatId,
      participants: [chatRequest.user],
      messages: [],
      status: 'pending',
      priority: chatRequest.priority as any,
      category: chatRequest.category as any,
      createdAt: chatRequest.timestamp,
      updatedAt: chatRequest.timestamp,
      lastMessage: {
        content: chatRequest.message,
        timestamp: chatRequest.timestamp,
        sender: {
          id: chatRequest.user._id,
          name: chatRequest.user.name
        }
      }
    };

    setChats(prev => [newChat, ...prev]);
    
    // Show notification
    setError(`New chat request from ${chatRequest.user.name}`);
    setTimeout(() => setError(null), 5000);
  }

  function handleNewMessage(message: ChatMessage) {
    console.log('ChatLayout: New message received:', message);
    
    // Add message to the selected chat if it's the current one
    if (selectedChat && selectedChat._id === message.chatId) {
      setMessages(prev => [...prev, message]);
    }
    
    // Update chat list with new message
    setChats(prev => prev.map(chat => {
      if (chat._id === message.chatId) {
        return {
          ...chat,
          lastMessage: {
            content: message.content,
            timestamp: message.createdAt,
            sender: {
              id: message.sender._id,
              name: message.sender.name
            }
          },
          updatedAt: message.createdAt
        };
      }
      return chat;
    }));
  }

  function handleTypingIndicator(typing: any) {
    console.log('ChatLayout: Typing indicator:', typing);
    // Typing indicators are handled by the hook
  }

  function handleStatusUpdate(update: any) {
    console.log('ChatLayout: Status update:', update);
    
    setChats(prev => prev.map(chat => {
      if (chat._id === update.chatId) {
        return { ...chat, status: update.status as any };
      }
      return chat;
    }));
  }

  function handleChatAccepted(chatId: string, adminId: string) {
    console.log('ChatLayout: Chat accepted:', chatId, adminId);
    
    setChats(prev => prev.map(chat => {
      if (chat._id === chatId) {
        return { ...chat, status: 'active' };
      }
      return chat;
    }));
  }

  function handleChatClosed(chatId: string, reason?: string) {
    console.log('ChatLayout: Chat closed:', chatId, reason);
    
    setChats(prev => prev.map(chat => {
      if (chat._id === chatId) {
        return { ...chat, status: 'closed' };
      }
      return chat;
    }));
    
    if (selectedChat?._id === chatId) {
      setSelectedChat(null);
      setMessages([]);
    }
  }

  function handleUserOnline(userId: string, isOnline: boolean) {
    console.log('ChatLayout: User online status:', userId, isOnline);
    
    setChats(prev => prev.map(chat => ({
      ...chat,
      participants: chat.participants.map(participant => {
        if (participant._id === userId) {
          return { ...participant, isOnline };
        }
        return participant;
      })
    })));
  }

  // API functions
  const loadActiveChats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const activeChats = await chatService.getActiveChats();
      setChats(activeChats);
      
      // Join chat rooms for active chats
      activeChats.forEach(chat => {
        if (chat.status === 'active') {
          joinChatRoom(chat._id);
        }
      });
    } catch (error: any) {
      console.error('ChatLayout: Error loading active chats:', error);
      setError(`Failed to load chats: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadChatStats = async () => {
    try {
      const chatStats = await chatService.getChatStats();
      setStats(chatStats);
    } catch (error: any) {
      console.error('ChatLayout: Error loading chat stats:', error);
    }
  };

  const loadChatHistory = async (chatId: string) => {
    try {
      const chatHistory = await chatService.getChatHistory(chatId);
      setMessages(chatHistory);
      
      // Mark messages as read
      const unreadMessageIds = chatHistory
        .filter(msg => !msg.isRead && msg.sender.model === 'User')
        .map(msg => msg._id);
      
      if (unreadMessageIds.length > 0) {
        markMessagesAsRead(chatId, unreadMessageIds);
      }
    } catch (error: any) {
      console.error('ChatLayout: Error loading chat history:', error);
      setError(`Failed to load chat history: ${error.message}`);
    }
  };

  // Chat actions
  const handleAcceptChat = async (chatId: string) => {
    try {
      const acceptedChat = await chatService.acceptChat(chatId);
      
      // Update chat status
      setChats(prev => prev.map(chat => {
        if (chat._id === chatId) {
          return { ...chat, status: 'active' };
        }
        return chat;
      }));
      
      // Join the chat room
      joinChatRoom(chatId);
      
      // Load chat history
      await loadChatHistory(chatId);
      
      // Select the chat
      const chat = chats.find(c => c._id === chatId);
      if (chat) {
        setSelectedChat(chat);
      }
    } catch (error: any) {
      console.error('ChatLayout: Error accepting chat:', error);
      setError(`Failed to accept chat: ${error.message}`);
    }
  };

  const handleSelectChat = async (chat: Chat) => {
    setSelectedChat(chat);
    
    // Join chat room if not already joined
    if (!activeChats.includes(chat._id)) {
      joinChatRoom(chat._id);
    }
    
    // Load chat history
    await loadChatHistory(chat._id);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const messageData = {
        content: newMessage.trim(),
        messageType: 'text' as const,
        sender: {
          _id: currentAdmin?.id || '',
          name: currentAdmin?.name || 'Admin',
          email: currentAdmin?.email || '',
          model: 'Admin' as const
        },
        chatId: selectedChat._id,
        isRead: false
      };

      // Send via socket first
      sendMessage(selectedChat._id, messageData);
      
      // Clear input
      setNewMessage('');
      
      // Stop typing indicator
      sendTypingIndicator(selectedChat._id, false);
      setIsTyping(false);
      
      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    } catch (error) {
      console.error('ChatLayout: Error sending message:', error);
      setError('Failed to send message');
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    if (!isTyping) {
      setIsTyping(true);
      sendTypingIndicator(selectedChat?._id || '', true);
    }
    
    // Debounce typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTypingIndicator(selectedChat?._id || '', false);
    }, 1000);
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedChat) return;

    try {
      await chatService.updateChatStatus(selectedChat._id, { status: status as any });
      
      setChats(prev => prev.map(chat => {
        if (chat._id === selectedChat._id) {
          return { ...chat, status: status as any };
        }
        return chat;
      }));
      
      setSelectedChat(prev => prev ? { ...prev, status: status as any } : null);
    } catch (error: any) {
      console.error('ChatLayout: Error updating chat status:', error);
      setError(`Failed to update status: ${error.message}`);
    }
  };

  const handleCloseChat = async (reason?: string) => {
    if (!selectedChat) return;

    try {
      await chatService.closeChat(selectedChat._id, reason);
      
      // Leave chat room
      leaveChatRoom(selectedChat._id);
      
      // Update chat status
      setChats(prev => prev.map(chat => {
        if (chat._id === selectedChat._id) {
          return { ...chat, status: 'closed' };
        }
        return chat;
      }));
      
      // Clear selected chat
      setSelectedChat(null);
      setMessages([]);
    } catch (error: any) {
      console.error('ChatLayout: Error closing chat:', error);
      setError(`Failed to close chat: ${error.message}`);
    }
  };

  // Utility functions
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'resolved': return <CheckCircleIcon className="w-4 h-4 text-blue-500" />;
      case 'pending': return <ClockIcon className="w-4 h-4 text-yellow-500" />;
      case 'closed': return <XCircleIcon className="w-4 h-4 text-gray-500" />;
      default: return <ClockIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredChats = chats.filter(chat => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        chat.participants.some(p => p.name.toLowerCase().includes(query)) ||
        chat.lastMessage?.content.toLowerCase().includes(query) ||
        chat.chatId.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Show loading state when not authenticated
  if (!isAuthenticated || !currentAdmin) {
    return (
      <div className="flex h-full bg-background items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-muted-foreground">Loading chat system...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-background">
      {/* Chat List Sidebar */}
      <div className="w-80 border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          {/* Connection Status */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <Typography variant="body-small" className="text-muted-foreground">
                {isConnected ? 'Connected' : 'Disconnected'}
              </Typography>
            </div>
            <Badge variant="secondary" className="bg-primary text-primary-foreground">
              {stats?.pendingChats || 0} pending
            </Badge>
          </div>
          
          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
                <Typography variant="body-small" className="text-red-700">
                  {error}
                </Typography>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setError(null)}
                  className="ml-auto text-red-500 hover:text-red-700"
                >
                  ×
                </Button>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between mb-4">
            <Typography variant="heading-large" className="text-foreground">
              Customer Support
            </Typography>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={loadActiveChats}
                disabled={loading}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative mb-4">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="p-4 text-center">
              <ChatBubbleLeftIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <Typography variant="body-small" className="text-muted-foreground">
                No active chats
              </Typography>
            </div>
          ) : (
            filteredChats.map((chat) => {
              const user = chat.participants.find(p => p.model === 'User');
              const unreadCount = chat.messages.filter(m => !m.isRead && m.sender.model === 'User').length;
              
              return (
                <div
                  key={chat._id}
                  onClick={() => handleSelectChat(chat)}
                  className={`p-4 border-b border-border cursor-pointer hover:bg-muted transition-colors ${
                    selectedChat?._id === chat._id ? 'bg-muted' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <Avatar size="sm" className="bg-primary text-primary-foreground">
                      <span className="text-sm font-medium">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <Typography variant="body-medium" className="font-medium text-foreground truncate">
                          {user?.name || 'Unknown User'}
                        </Typography>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(chat.status)}
                          <div className={`w-2 h-2 rounded-full ${getPriorityColor(chat.priority)}`} />
                        </div>
                      </div>
                      
                      <Typography variant="body-small" className="text-muted-foreground truncate">
                        {chat.lastMessage?.content || 'No messages yet'}
                      </Typography>
                      
                      <div className="flex items-center justify-between mt-1">
                        <Typography variant="body-small" className="text-muted-foreground">
                          {chat.lastMessage?.timestamp 
                            ? new Date(chat.lastMessage.timestamp).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })
                            : 'New'
                          }
                        </Typography>
                        
                        {unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Action buttons for pending chats */}
                  {chat.status === 'pending' && (
                    <div className="flex items-center space-x-2 mt-3">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAcceptChat(chat._id);
                        }}
                        className="flex-1"
                      >
                        <CheckIcon className="w-4 h-4 mr-1" />
                        Accept
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar size="sm" className="bg-primary text-primary-foreground">
                    <span className="text-sm font-medium">
                      {selectedChat.participants.find(p => p.model === 'User')?.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </Avatar>
                  
                  <div>
                    <Typography variant="body-medium" className="font-medium text-foreground">
                      {selectedChat.participants.find(p => p.model === 'User')?.name || 'Unknown User'}
                    </Typography>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(selectedChat.status)}
                      <Typography variant="body-small" className="text-muted-foreground">
                        {selectedChat.status}
                      </Typography>
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(selectedChat.priority)}`} />
                      <Typography variant="body-small" className="text-muted-foreground">
                        {selectedChat.priority}
                      </Typography>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Select
                    value={selectedChat.status}
                    onValueChange={handleUpdateStatus}
                    className="w-32"
                  >
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </Select>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleCloseChat('Admin closed chat')}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground">
                  <ChatBubbleLeftIcon className="w-8 h-8 mx-auto mb-2" />
                  <Typography variant="body-small">No messages yet</Typography>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message._id}
                    className={`flex ${message.sender.model === 'Admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md ${message.sender.model === 'Admin' ? 'order-2' : 'order-1'}`}>
                      {message.sender.model === 'User' && (
                        <Typography variant="body-small" className="text-muted-foreground mb-1">
                          {message.sender.name}
                        </Typography>
                      )}
                      
                      <div className={`p-3 rounded-lg ${
                        message.sender.model === 'Admin' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-foreground'
                      }`}>
                        <Typography variant="body-medium">
                          {message.content}
                        </Typography>
                      </div>
                      
                      <Typography variant="body-small" className="text-muted-foreground mt-1 text-right">
                        {new Date(message.createdAt).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </Typography>
                    </div>
                  </div>
                ))
              )}
              
              {/* Typing indicator */}
              {isUserTyping(selectedChat._id, selectedChat.participants.find(p => p.model === 'User')?._id || '') && (
                <div className="flex justify-start">
                  <div className="bg-muted p-3 rounded-lg">
                    <Typography variant="body-small" className="text-muted-foreground">
                      {selectedChat.participants.find(p => p.model === 'User')?.name} is typing...
                    </Typography>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-border">
              <div className="flex space-x-2">
                <Input
                  ref={messageInputRef}
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={handleTyping}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                  disabled={selectedChat.status === 'closed'}
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!newMessage.trim() || selectedChat.status === 'closed'}
                >
                  <PaperAirplaneIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <ChatBubbleLeftIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <Typography variant="heading-large" className="text-muted-foreground mb-2">
                No chat selected
              </Typography>
              <Typography variant="body-medium" className="text-muted-foreground">
                Select a chat from the list to start messaging
              </Typography>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatLayout;
