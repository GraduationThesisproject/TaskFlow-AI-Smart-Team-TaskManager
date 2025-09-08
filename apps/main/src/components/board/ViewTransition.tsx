import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface ViewTransitionProps {
  children: React.ReactNode;
}

export const ViewTransition: React.FC<ViewTransitionProps> = ({ children }) => {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);

  useEffect(() => {
    setIsTransitioning(true);
    
    const timer = setTimeout(() => {
      setDisplayChildren(children);
      setIsTransitioning(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [location.pathname, children]);

  return (
    <div className="relative w-full h-full">
      {/* Transition overlay */}
      <div 
        className={`absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 transition-all duration-300 z-10 ${
          isTransitioning 
            ? 'opacity-100 scale-105' 
            : 'opacity-0 scale-100'
        }`}
      />
      
      {/* Content */}
      <div 
        className={`relative w-full h-full transition-all duration-300 ${
          isTransitioning 
            ? 'opacity-0 translate-y-4' 
            : 'opacity-100 translate-y-0'
        }`}
      >
        {displayChildren}
      </div>
    </div>
  );
};
