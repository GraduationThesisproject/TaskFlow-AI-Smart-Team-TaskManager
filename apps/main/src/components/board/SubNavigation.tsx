import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Typography } from '@taskflow/ui';
import { useBoard } from '../../hooks/useBoard';
import type { SubNavigationProps } from '../../types/interfaces/ui';

export const SubNavigation: React.FC<SubNavigationProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentBoard } = useBoard();
  const [activeIndex, setActiveIndex] = useState(0);
  
  const boardId = currentBoard?._id;

  const navItems = [
    { 
      path: '/board', 
      label: 'Kanban', 
      icon: '📊',
      description: 'Visual board with columns',
      color: 'from-blue-500 to-blue-600'
    },
    { 
      path: '/board/list', 
      label: 'List', 
      icon: '📋',
      description: 'Detailed task list',
      color: 'from-green-500 to-green-600'
    },
    { 
      path: '/board/timeline', 
      label: 'Timeline', 
      icon: '📅',
      description: 'Project timeline view',
      color: 'from-purple-500 to-purple-600'
    },
  ];

  const isActive = (path: string) => {
    if (path === '/board' || path === '/board/') {
      return location.pathname === '/board' || location.pathname === '/board/';
    }
    return location.pathname.startsWith(path);
  };

  // Update active index when location changes
  useEffect(() => {
    const currentIndex = navItems.findIndex(item => isActive(item.path));
    if (currentIndex !== -1) {
      setActiveIndex(currentIndex);
    }
  }, [location.pathname]);

  const handleNavigation = (path: string, index: number) => {
    console.log('Navigation clicked:', path, index);
    setActiveIndex(index);
    navigate(path);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Debug info */}
      <div className="absolute -top-8 left-0 text-xs text-muted-foreground">
        Active: {activeIndex} | Path: {location.pathname}
      </div>
      
      {/* Background Container */}
      <div className="relative bg-gradient-to-r from-muted/30 via-muted/20 to-muted/30 backdrop-blur-sm rounded-3xl p-2 border border-border/20 shadow-lg">
        {/* Animated Background Pill */}
        <div 
          className={`absolute top-2 bottom-2 bg-gradient-to-r ${navItems[activeIndex]?.color} rounded-2xl shadow-lg transition-all duration-500 ease-out`}
          style={{
            width: `${100 / navItems.length}%`,
            left: `${(activeIndex * 100) / navItems.length}%`,
            transform: 'translateX(0)',
          }}
        />
        
        {/* Navigation Items */}
        <div className="relative flex items-center">
          {navItems.map((item, index) => {
            const isItemActive = isActive(item.path);
            console.log(`Item ${index}: ${item.path} - Active: ${isItemActive}`);
            
            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path, index)}
                className={`relative flex-1 flex flex-col items-center justify-center px-6 py-4 rounded-2xl transition-all duration-300 ease-out group cursor-pointer hover:scale-105 ${
                  isItemActive 
                    ? 'text-white' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/10'
                }`}
                title={item.description}
                aria-label={item.label}
              >
                {/* Icon with animation */}
                <div className={`text-2xl mb-1 transition-all duration-300 ${
                  isItemActive 
                    ? 'scale-110 drop-shadow-lg' 
                    : 'group-hover:scale-105'
                }`}>
                  {item.icon}
                </div>
                
                {/* Label */}
                <Typography 
                  variant="body-small" 
                  className={`font-semibold transition-all duration-300 ${
                    isItemActive 
                      ? 'text-white drop-shadow-sm' 
                      : 'group-hover:text-foreground'
                  }`}
                >
                  {item.label}
                </Typography>
                
                {/* Active indicator dot */}
                {isItemActive && (
                  <div className="absolute -bottom-1 w-1 h-1 bg-white rounded-full animate-pulse" />
                )}
                
                {/* Hover effect */}
                <div className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
                  isItemActive 
                    ? 'bg-white/20' 
                    : 'bg-transparent group-hover:bg-white/5'
                }`} />
              </button>
            );
          })}
        </div>
        
        {/* Subtle glow effect */}
        <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${navItems[activeIndex]?.color} opacity-10 blur-xl transition-all duration-500`} />
      </div>
      
      {/* Floating description tooltip */}
      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="bg-foreground/90 text-background px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap">
          {navItems[activeIndex]?.description}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-foreground/90" />
        </div>
      </div>
    </div>
  );
};