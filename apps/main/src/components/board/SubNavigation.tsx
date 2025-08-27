import React from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Button, Typography } from '@taskflow/ui';

interface SubNavigationProps {
  className?: string;
}

export const SubNavigation: React.FC<SubNavigationProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { boardId } = useParams<{ boardId: string }>();

  const isActive = (path: string) => {
    if (path === '/board' || path === '/board/') {
      return location.pathname === `/board/${boardId}` || location.pathname === `/board/${boardId}/`;
    }
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { path: `/board/${boardId}`, label: 'Kanban', icon: '📊' },
    { path: `/board/${boardId}/list`, label: 'List', icon: '📋' },
    { path: `/board/${boardId}/timeline`, label: 'Timeline', icon: '📅' },
  ];

  return (
    <div className={`flex items-center gap-1 bg-muted/20 rounded-2xl p-2 ${className}`}>
      {navItems.map((item) => (
        <Button
          key={item.path}
          variant="ghost"
          onClick={() => navigate(item.path)}
          title={item.label}
          aria-label={item.label}
          className={`rounded-xl px-5 py-3 transition-all duration-300 ${
            isActive(item.path)
              ? 'bg-background shadow-lg border border-border/30 text-foreground font-bold'
              : 'hover:bg-background/60 text-muted-foreground hover:text-foreground hover:shadow-md'
          }`}
        >
          <span className="mr-2">{item.icon}</span>
          <Typography variant="body-medium" className="font-medium">
            {item.label}
          </Typography>
        </Button>
      ))}
    </div>
  );
};