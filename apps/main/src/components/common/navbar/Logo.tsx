import React from 'react';
import { Link } from 'react-router-dom';
import { Typography } from '@taskflow/ui';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = '' }) => {
  return (
    <Link to="/" className={`flex items-center gap-3 hover:opacity-80 transition-opacity ${className}`}>
      <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
        <span className="text-white font-bold text-sm">T</span>
      </div>
      <Typography variant="heading-large" className="font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
        TaskFlow AI
      </Typography>
    </Link>
  );
};
