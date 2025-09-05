import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Typography, AvatarWithFallback, Badge } from '@taskflow/ui';
import { 
  MessageCircle, 
  Send, 
  Phone, 
  Mail, 
  Clock, 
  User,
  ArrowLeft,
  Settings,
  MoreVertical
} from 'lucide-react';
import chatService, { ChatMessage, Chat, ChatRequest, SendMessageRequest } from '../services/chatService';

const ChatPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingAdmin, setTypingAdmin] = useState<string | null>(null);
  const [chatStatus, setChatStatus] = useState<'pending' | 'active' | 'resolved' | 'closed'>('pending');
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat when component mounts
  useEffect(() => {
    if (isAuthenticated && user && !chat) {
      initializeChat();
    }
  }, [isAuthenticated, user, chat]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      chatService.disconnect();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeChat = async () => {
    if (!user) return;
    
    setIsConnecting(true);
    setConnectionStatus('connecting');
    
    try {
      // Create a new chat
      const chatRequest: ChatRequest = {
        name: user.user?.name || 'User',
        email: user.user?.email || '',
        message: 'Hello! I need help with TaskFlow.',
        category: 'general',
        priority: 'medium'
      };

      const newChat = await chatService.startChat(chatRequest);
      setChat(newChat);
      setMessages(newChat.messages || []);
      setChatStatus(newChat.status);
      
      // Initialize WebSocket connection
      await initializeWebSocket(newChat._id);
      
    } catch (error) {
      console.error('Error initializing chat:', error);
      // Create mock chat for demo purposes
      createMockChat();
    } finally {
      setIsConnecting(false);
    }
  };

  const createMockChat = () => {
    const mockChat: Chat = {
      _id: `chat_${Date.now()}`,
      status: 'pending',
      priority: 'medium',
      category: 'general',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastMessage: {
        content: 'Hello! I need help with TaskFlow.',
        timestamp: new Date(),
        sender: {
          id: `user_${Date.now()}`,
          name: user?.user?.name || 'User'
        }
      }
    };

    const mockMessage: ChatMessage = {
      _id: `msg_${Date.now()}`,
      content: 'Hello! I need help with TaskFlow.',
      messageType: 'text',
      sender: {
        _id: `user_${Date.now()}`,
        name: user?.user?.name || 'User',
        email: user?.user?.email || '',
        model: 'User'
      },
      isRead: false,
      createdAt: new Date()
    };

    setChat(mockChat);
    setMessages([mockMessage]);
    setConnectionStatus('disconnected');
  };

  const initializeWebSocket = async (chatId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setConnectionStatus('disconnected');
      return;
    }

    try {
      // Set up event handlers
      chatService.onMessage((message: ChatMessage) => {
        setMessages(prev => [...prev, message]);
      });

      chatService.onTyping((sender: string, isTyping: boolean) => {
        if (isTyping) {
          setTypingAdmin(sender);
          // Clear typing indicator after 3 seconds
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
          typingTimeoutRef.current = setTimeout(() => {
            setTypingAdmin(null);
          }, 3000);
        } else {
          setTypingAdmin(null);
        }
      });

      chatService.onStatusUpdate((status: string) => {
        setChatStatus(status as any);
      });

      chatService.onConnect(() => {
        setConnectionStatus('connected');
        console.log('Chat WebSocket connected successfully');
      });

      chatService.onDisconnect(() => {
        setConnectionStatus('disconnected');
        console.log('Chat WebSocket disconnected');
      });

      // Connect to WebSocket
      await chatService.connect(token, chatId);
      
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      setConnectionStatus('disconnected');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !chat) return;

    const messageData: SendMessageRequest = {
      content: newMessage.trim(),
      messageType: 'text'
    };

    try {
      // Add message to local state immediately for better UX
      const userMessage: ChatMessage = {
        _id: `msg_${Date.now()}`,
        content: newMessage.trim(),
        messageType: 'text',
        sender: {
          _id: user?.user?._id || `user_${Date.now()}`,
          name: user?.user?.name || 'User',
          email: user?.user?.email || '',
          model: 'User'
        },
        isRead: false,
        createdAt: new Date()
      };

      setMessages(prev => [...prev, userMessage]);
      setNewMessage('');
      
      // Send via WebSocket if available
      if (chatService.isConnected()) {
        chatService.sendMessage(chat._id, messageData);
      } else {
        // Fallback to REST API
        await chatService.sendMessageViaAPI(chat._id, messageData);
      }
      
      // Focus back to input
      messageInputRef.current?.focus();
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove the message from local state if it failed to send
      setMessages(prev => prev.filter(msg => msg._id !== `msg_${Date.now()}`));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'active': return 'bg-green-500';
      case 'resolved': return 'bg-blue-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Waiting for support';
      case 'active': return 'In progress';
      case 'resolved': return 'Resolved';
      case 'closed': return 'Closed';
      default: return 'Unknown';
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      case 'disconnected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      case 'disconnected': return 'Disconnected';
      default: return 'Unknown';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-background flex items-center justify-center">
        <div className="text-center">
          <Typography variant="heading-large" className="mb-4">
            Please sign in to access chat support
          </Typography>
          <Button onClick={() => navigate('/signin')}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <Typography variant="heading-medium" className="flex items-center gap-2">
                  <MessageCircle className="w-6 h-6 text-blue-500" />
                  Customer Support Chat
                </Typography>
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    variant="secondary" 
                    className={`${getStatusColor(chatStatus)} text-white`}
                  >
                    {getStatusText(chatStatus)}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={`${getConnectionStatusColor()} text-white`}
                  >
                    {getConnectionStatusText()}
                  </Badge>
                  {chat && (
                    <Typography variant="small" textColor="muted">
                      Chat #{chat._id.slice(-8)}
                    </Typography>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="p-2">
                <Settings className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="bg-card border border-border rounded-lg shadow-lg h-[600px] flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {isConnecting ? (
              <div className="text-center text-muted-foreground py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <Typography variant="body-medium">Connecting to support...</Typography>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message._id}
                    className={`flex ${message.sender.model === 'User' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md ${message.sender.model === 'User' ? 'order-2' : 'order-1'}`}>
                      {message.sender.model === 'Admin' && (
                        <div className="flex items-center gap-2 mb-1">
                          <AvatarWithFallback
                            size="sm"
                            src={message.sender.avatar}
                            alt={message.sender.name}
                          />
                          <Typography variant="small" className="font-medium">
                            {message.sender.name}
                          </Typography>
                        </div>
                      )}
                      <div
                        className={`p-3 rounded-lg ${
                          message.sender.model === 'User'
                            ? 'bg-blue-500 text-white'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        <Typography variant="body-medium">
                          {message.content}
                        </Typography>
                      </div>
                      <Typography variant="small" textColor="muted" className="mt-1 text-right">
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </Typography>
                    </div>
                  </div>
                ))}
                
                {typingAdmin && (
                  <div className="flex justify-start">
                    <div className="bg-muted p-3 rounded-lg">
                      <Typography variant="body-medium" textColor="muted">
                        {typingAdmin} is typing...
                      </Typography>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-border p-4">
            <div className="flex space-x-2">
              <Input
                ref={messageInputRef}
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
                disabled={isConnecting || chatStatus === 'closed' || connectionStatus === 'disconnected'}
              />
              <Button
                onClick={sendMessage}
                disabled={!newMessage.trim() || isConnecting || chatStatus === 'closed' || connectionStatus === 'disconnected'}
                className="px-6"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            
            {chatStatus === 'closed' && (
              <Typography variant="small" textColor="muted" className="mt-2 text-center">
                This chat has been closed. Start a new chat if you need further assistance.
              </Typography>
            )}
            
            {connectionStatus === 'disconnected' && (
              <Typography variant="small" textColor="muted" className="mt-2 text-center">
                Connection lost. Trying to reconnect...
              </Typography>
            )}
          </div>
        </div>

        {/* Chat Info */}
        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <div className="bg-card p-4 rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Phone className="w-4 h-4 text-blue-500" />
              <Typography variant="body-medium" className="font-medium">
                Phone Support
              </Typography>
            </div>
            <Typography variant="small" textColor="muted">
              +1 (555) 123-4567
            </Typography>
          </div>
          
          <div className="bg-card p-4 rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4 text-green-500" />
              <Typography variant="body-medium" className="font-medium">
                Email Support
              </Typography>
            </div>
            <Typography variant="small" textColor="muted">
              support@taskflow.com
            </Typography>
          </div>
          
          <div className="bg-card p-4 rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <Typography variant="body-medium" className="font-medium">
                Response Time
              </Typography>
            </div>
            <Typography variant="small" textColor="muted">
              Usually within 5 minutes
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
