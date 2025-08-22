import React, { useState } from 'react';
import { Button, Avatar, AvatarImage, AvatarFallback } from '@taskflow/ui';
import { LogOut, Settings, User } from 'lucide-react';
import type { User as UserType } from '../../../types/navbar';

interface UserProfileProps {
  user?: UserType;
  onLogout?: () => void;
  className?: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({ 
  user, 
  onLogout, 
  className = '' 
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 hover:bg-secondary/60 transition-colors"
      >
        <Avatar size="sm">
          {user?.user?.avatar && (
            <AvatarImage src={user.user.avatar} alt={user.user.name || 'User'} />
          )}
          <AvatarFallback variant="primary">
            {user?.user?.name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        <span className="hidden sm:inline font-medium">
          {user?.user?.name || 'User'}
        </span>
      </Button>

      {isDropdownOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
          <div className="p-2 space-y-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2"
            >
              <User className="w-4 h-4" />
              Profile
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Button>
            
            <div className="border-t border-border my-1" />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="w-4 h-4" />
              Log out
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
