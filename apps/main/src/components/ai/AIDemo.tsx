import React, { useState } from 'react';
import { useAI } from '../../hooks/useAI';
import { AIChat } from './AIChat';
import { Button, Card, Badge } from '@taskflow/ui';
import { 
  Sparkles, 
  Wand2, 
  Lightbulb, 
  Zap, 
  MessageCircle,
  Bot,
  CheckCircle
} from 'lucide-react';

export const AIDemo: React.FC = () => {
  const { isAvailable, isLoading } = useAI();
  const [showChat, setShowChat] = useState(false);
  const [generatedBoards, setGeneratedBoards] = useState<any[]>([]);

  const handleBoardGenerated = (boardData: any) => {
    setGeneratedBoards(prev => [...prev, boardData]);
  };

  const examplePrompts = [
    "Create a marketing campaign board",
    "Generate a software development workflow",
    "Make a content creation pipeline",
    "Build a project planning board",
    "Create a customer support board",
    "Generate a sales funnel board"
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          AI-Powered Board Generation
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Create intelligent project boards with the power of AI. Simply describe what you need, and our AI will generate a complete board structure for you.
        </p>
        
        <div className="flex items-center justify-center space-x-4 mb-6">
          <Badge 
            variant={isAvailable ? "default" : "destructive"}
            className="text-sm"
          >
            <Bot className="h-3 w-3 mr-1" />
            {isAvailable ? 'AI Online' : 'AI Offline'}
          </Badge>
          {isLoading && (
            <Badge variant="secondary" className="text-sm">
              <Sparkles className="h-3 w-3 mr-1 animate-spin" />
              Generating...
            </Badge>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <Wand2 className="h-5 w-5 mr-2 text-purple-600" />
            How it works
          </h3>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              Describe your project or workflow
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              AI generates columns, tasks, and tags
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              Review and customize as needed
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              Start working immediately
            </li>
          </ul>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <Lightbulb className="h-5 w-5 mr-2 text-yellow-600" />
            Example prompts
          </h3>
          <div className="space-y-2">
            {examplePrompts.map((prompt, index) => (
              <div
                key={index}
                className="p-2 bg-gray-50 rounded-lg text-sm text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setShowChat(true)}
              >
                "{prompt}"
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="text-center">
        <Button
          onClick={() => setShowChat(true)}
          size="lg"
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          disabled={!isAvailable}
        >
          <MessageCircle className="h-5 w-5 mr-2" />
          Start AI Chat
        </Button>
      </div>

      {generatedBoards.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Recently Generated Boards</h3>
          <div className="grid gap-4">
            {generatedBoards.map((board, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{board.board.name}</h4>
                    <p className="text-sm text-gray-600">{board.board.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>{board.columns.length} columns</span>
                      <span>{board.tasks.length} tasks</span>
                      <span>{board.tags.length} tags</span>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {board.board.type}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {showChat && (
        <AIChat
          onBoardGenerated={handleBoardGenerated}
          className="fixed inset-0 z-50"
        />
      )}
    </div>
  );
};
