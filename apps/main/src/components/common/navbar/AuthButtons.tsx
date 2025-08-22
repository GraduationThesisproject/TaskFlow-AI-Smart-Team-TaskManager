import React from 'react';
import { Button } from '@taskflow/ui';
import { Link } from 'react-router-dom';

interface AuthButtonsProps {
  className?: string;
}

export const AuthButtons: React.FC<AuthButtonsProps> = ({ className = '' }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Link to="/signin">
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
          Sign In
        </Button>
      </Link>
      <Link to="/signup">
        <Button size="sm" className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
          Get Started
        </Button>
      </Link>
    </div>
  );
};
