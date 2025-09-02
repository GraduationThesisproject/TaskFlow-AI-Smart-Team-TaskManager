import React from 'react';
import { Button } from '@taskflow/ui';
import { Bell } from 'lucide-react';
import type { NotificationButtonProps } from '../../../types/interfaces/ui';

export const NotificationButton: React.FC<NotificationButtonProps> = ({ 
  count = 0, 
  className = '' 
}) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={`relative flex items-center justify-center hover:bg-secondary/60 transition-colors ${className}`}
    >
      <Bell className="w-5 h-5" />
      {count > 0 && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center">
          <span className="text-xs text-white font-medium">
            {count > 9 ? '9+' : count}
          </span>
        </div>
      )}
    </Button>
  );
};
