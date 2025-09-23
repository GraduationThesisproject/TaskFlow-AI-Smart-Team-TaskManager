import React, { useState, useRef, useEffect } from 'react';
import { useAI } from '../../hooks/useAI';
import { useToast } from '../../hooks/useToast';
import { Button, Input, Card, Badge } from '@taskflow/ui';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  X, 
  Minimize2, 
  Maximize2,
  Loader2,
  Wand2,
  Lightbulb,
  Zap
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  isGenerating?: boolean;
}

interface AIChatProps {
  onBoardGenerated?: (boardData: any) => void;
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
  context?: 'board-generation' | 'board-modification';
  currentBoard?: any;
}

export const AIChat: React.FC<AIChatProps> = ({ 
  onBoardGenerated, 
  className = '', 
  isOpen: externalIsOpen,
  onClose,
  context = 'board-generation',
  currentBoard
}) => {
  const { generateBoard, autoComplete, getSuggestions, getTemplates, isLoading, isAvailable } = useAI();
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(externalIsOpen || false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  // Listen for toggle event from header button
  useEffect(() => {
    const handleToggleAIChat = () => {
      setIsOpen(prev => !prev);
    };

    window.addEventListener('toggleAIChat', handleToggleAIChat);
    return () => {
      window.removeEventListener('toggleAIChat', handleToggleAIChat);
    };
  }, []);

  // Initialize with welcome message based on context
  useEffect(() => {
    if (messages.length === 0) {
      let welcomeMessage = "";
      
      if (!isAvailable) {
        welcomeMessage = "AI assistant is currently offline. Please check your connection and try again later.";
      } else if (context === 'board-generation') {
        welcomeMessage = "Hi! I'm your AI assistant. I can help you create new boards with tasks, columns, and tags. What kind of board would you like to create today?";
      } else if (context === 'board-modification') {
        const boardName = currentBoard?.name || 'this board';
        welcomeMessage = `Hi! I'm your AI assistant. I can help you modify "${boardName}" by adding tasks, columns, tags, or suggesting improvements. What would you like to do?`;
      } else {
        welcomeMessage = "Hi! I'm your AI assistant. I can help you with your project management needs. What would you like to do today?";
      }
      
      setMessages([{
        id: '1',
        type: 'ai',
        content: welcomeMessage,
        timestamp: new Date(),
        suggestions: isAvailable ? getContextSuggestions() : []
      }]);
    }
  }, [messages.length, isAvailable, context, currentBoard]);

  const getContextSuggestions = () => {
    if (context === 'board-generation') {
      return [
        "Create a marketing campaign board",
        "Generate a software development workflow", 
        "Make a content creation pipeline",
        "Build a project planning board"
      ];
    } else if (context === 'board-modification') {
      return [
        "Add more tasks to this board",
        "Create new columns",
        "Add tags to organize tasks",
        "Suggest improvements for this board"
      ];
    }
    return [];
  };

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const simulateTyping = async (callback: () => Promise<void>) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    await callback();
    setIsTyping(false);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !isAvailable) {
      if (!isAvailable) {
        toast.error('AI assistant is currently offline. Please try again later.', 'Connection Error');
      }
      return;
    }

    const userMessage = inputValue.trim();
    setInputValue('');
    addMessage({ type: 'user', content: userMessage });

    // Check if user wants to generate a board (only for board-generation context)
    const isBoardRequest = context === 'board-generation' && (
      userMessage.toLowerCase().includes('create') || 
      userMessage.toLowerCase().includes('generate') || 
      userMessage.toLowerCase().includes('make') || 
      userMessage.toLowerCase().includes('build') ||
      userMessage.toLowerCase().includes('board')
    );

    if (isBoardRequest) {
      await simulateTyping(async () => {
        try {
          const boardData = await generateBoard(userMessage);
          
          addMessage({
            type: 'ai',
            content: `Great! I've generated a board called "${boardData.board.name}" with ${boardData.columns.length} columns and ${boardData.tasks.length} tasks. The board includes ${boardData.tags.length} tags and is ready to use!`,
            suggestions: [
              "Add more tasks to a specific column",
              "Modify the board structure",
              "Create another board",
              "Get improvement suggestions"
            ]
          });

          // Call the callback to handle board generation
          if (onBoardGenerated) {
            onBoardGenerated(boardData);
          }
        } catch (error) {
          addMessage({
            type: 'ai',
            content: "I apologize, but I couldn't generate the board right now. Please try again or rephrase your request.",
            suggestions: [
              "Try a simpler board description",
              "Check your connection",
              "Ask for help with board creation"
            ]
          });
        }
      });
    } else if (context === 'board-modification') {
      // Handle board modification requests
      await simulateTyping(async () => {
        try {
          // For now, provide helpful suggestions for board modifications
          addMessage({
            type: 'ai',
            content: `I can help you modify "${currentBoard?.name || 'this board'}" in several ways:\n\n• Add new tasks to specific columns\n• Create new columns for better organization\n• Add tags to categorize tasks\n• Suggest improvements based on your current setup\n\nWhat specific changes would you like to make?`,
            suggestions: [
              "Add 5 new tasks to the 'To Do' column",
              "Create a 'Review' column",
              "Add priority tags to existing tasks",
              "Suggest workflow improvements"
            ]
          });
        } catch (error) {
          addMessage({
            type: 'ai',
            content: "I apologize, but I couldn't process your request right now. Please try again or be more specific about what you'd like to modify.",
            suggestions: [
              "Add tasks to a specific column",
              "Create new columns",
              "Add tags to tasks",
              "Get improvement suggestions"
            ]
          });
        }
      });
    } else {
      // Handle other types of requests
      await simulateTyping(async () => {
        try {
          // Try to get suggestions for the input
          const suggestions = await getSuggestions(userMessage);
          
          let response = "I understand you're looking for help with: " + userMessage + "\n\n";
          
          if (suggestions.templates && suggestions.templates.length > 0) {
            response += "Here are some relevant templates I found:\n";
            suggestions.templates.slice(0, 3).forEach((template, index) => {
              response += `${index + 1}. ${template.name} - ${template.description}\n`;
            });
          }
          
          if (suggestions.boardTypes && suggestions.boardTypes.length > 0) {
            response += "\nRecommended board types:\n";
            suggestions.boardTypes.slice(0, 2).forEach((type, index) => {
              response += `${index + 1}. ${type.name} - ${type.description}\n`;
            });
          }

          addMessage({
            type: 'ai',
            content: response,
            suggestions: [
              "Create a board based on this",
              "Get more specific suggestions",
              "Ask about board features",
              "See available templates"
            ]
          });
        } catch (error) {
          addMessage({
            type: 'ai',
            content: "I'm here to help! I can assist you with creating boards, suggesting improvements, or answering questions about project management. What would you like to do?",
            suggestions: [
              "Create a new board",
              "Get board templates",
              "Ask for help",
              "See examples"
            ]
          });
        }
      });
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      id: '1',
      type: 'ai',
      content: "Hi! I'm your AI assistant. I can help you create boards, suggest improvements, or answer questions about your project management. What would you like to create today?",
      timestamp: new Date(),
      suggestions: [
        "Create a marketing campaign board",
        "Generate a software development workflow",
        "Make a content creation pipeline",
        "Build a project planning board"
      ]
    }]);
  };

  if (!isOpen) {
    return (
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
          size="lg"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
        {!isAvailable && (
          <div className="absolute -top-2 -right-2">
            <Badge variant="destructive" className="text-xs">
              Offline
            </Badge>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <Card className={`bg-white/95 backdrop-blur-sm border border-gray-200 shadow-2xl transition-all duration-300 ${
        isMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">AI Assistant</h3>
              <div className="flex items-center space-x-1">
                <div className={`h-2 w-2 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-xs text-gray-500">
                  {isAvailable ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChat}
              className="h-8 w-8 p-0"
            >
              <Sparkles className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-8 w-8 p-0"
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onClose ? onClose() : setIsOpen(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-80">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex space-x-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      message.type === 'user' 
                        ? 'bg-blue-600' 
                        : 'bg-gradient-to-r from-purple-600 to-blue-600'
                    }`}>
                      {message.type === 'user' ? (
                        <User className="h-4 w-4 text-white" />
                      ) : (
                        <Bot className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div className={`rounded-lg p-3 ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      {message.suggestions && message.suggestions.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {message.suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="block w-full text-left text-xs px-2 py-1 rounded bg-white/20 hover:bg-white/30 transition-colors"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex space-x-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-gray-100 rounded-lg p-3">
                      <div className="flex space-x-1">
                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me to create a board or ask a question..."
                  disabled={!isAvailable || isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || !isAvailable || isLoading}
                  className="px-4"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {/* Quick Actions */}
              <div className="mt-2 flex flex-wrap gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestionClick("Create a project management board")}
                  className="text-xs"
                >
                  <Wand2 className="h-3 w-3 mr-1" />
                  Project Board
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestionClick("Generate a marketing workflow")}
                  className="text-xs"
                >
                  <Lightbulb className="h-3 w-3 mr-1" />
                  Marketing
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestionClick("Create a development sprint board")}
                  className="text-xs"
                >
                  <Zap className="h-3 w-3 mr-1" />
                  Sprint
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};
