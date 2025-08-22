import React from 'react';
import { Button } from '@taskflow/ui';
import { Home, Plus } from 'lucide-react';

interface NavigationActionsProps {
  className?: string;
}

export const NavigationActions: React.FC<NavigationActionsProps> = ({ className = '' }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2 hover:bg-secondary/60 transition-colors"
      >
        <Home className="w-4 h-4" />
        <span className="text-sm">Home</span>
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2 hover:bg-secondary/60 transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span className="text-sm">Create</span>
      </Button>
    </div>
  );
};
