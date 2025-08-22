import React from 'react';
import { Button } from '@taskflow/ui';
import { Menu, X } from 'lucide-react';

interface MenuButtonProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}

export const MenuButton: React.FC<MenuButtonProps> = ({ 
  isOpen, 
  onClick, 
  className = '' 
}) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={`flex items-center justify-center hover:bg-secondary/60 transition-colors ${className}`}
    >
      {isOpen ? (
        <X className="w-5 h-5" />
      ) : (
        <Menu className="w-5 h-5" />
      )}
    </Button>
  );
};
