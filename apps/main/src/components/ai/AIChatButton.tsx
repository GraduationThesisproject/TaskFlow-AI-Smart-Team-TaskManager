import React from 'react';
import { Button } from '@taskflow/ui';
import { MessageCircle, Bot } from 'lucide-react';

interface AIChatButtonProps {
  onClick: () => void;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  isOnline?: boolean;
}

export const AIChatButton: React.FC<AIChatButtonProps> = ({
  onClick,
  className = '',
  variant = 'default',
  size = 'md',
  showLabel = false,
  isOnline = true
}) => {
  return (
    <Button
      onClick={onClick}
      variant={variant}
      size={size}
      className={`relative ${className}`}
    >
      <div className="flex items-center space-x-2">
        <div className="relative">
          <MessageCircle className="h-4 w-4" />
          {!isOnline && (
            <div className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
          )}
        </div>
        {showLabel && (
          <span>AI Assistant</span>
        )}
      </div>
    </Button>
  );
};
