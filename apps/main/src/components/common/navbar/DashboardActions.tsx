import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@taskflow/ui';
import { Zap, Users, BarChart3, MessageCircle } from 'lucide-react';

interface DashboardActionsProps {
  className?: string;
  onChatClick?: () => void;
}

export const DashboardActions: React.FC<DashboardActionsProps> = ({ 
  className = '', 
  onChatClick 
}) => {
  const navigate = useNavigate();

  const handleChatClick = () => {
    if (onChatClick) {
      onChatClick(); // For floating chat widget
    } else {
      navigate('/chat'); // Navigate to dedicated chat page
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2 hover:bg-secondary/60 transition-colors"
      >
        <Zap className="w-4 h-4" />
        <span className="text-sm hidden sm:inline">Upgrade</span>
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2 hover:bg-secondary/60 transition-colors"
      >
        <Users className="w-4 h-4" />
        <span className="text-sm hidden sm:inline">Invite</span>
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2 hover:bg-secondary/60 transition-colors"
      >
        <BarChart3 className="w-4 h-4" />
        <span className="text-sm hidden sm:inline">Reports</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleChatClick}
        className="flex items-center gap-2 hover:bg-secondary/60 transition-colors text-blue-500 hover:text-blue-600"
        title="Customer Support Chat"
      >
        <MessageCircle className="w-4 h-4" />
        <span className="text-sm hidden sm:inline">Support</span>
      </Button>
    </div>
  );
};
