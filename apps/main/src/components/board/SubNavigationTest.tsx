import React from 'react';

type ViewType = 'kanban' | 'list' | 'timeline' | 'task';

interface SubNavigationProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  isTransitioning?: boolean;
}

export const SubNavigationTest: React.FC<SubNavigationProps> = ({ 
  currentView, 
  onViewChange,
  isTransitioning = false
}) => {
  const navItems = [
    { 
      view: 'kanban' as ViewType, 
      label: 'Kanban', 
      icon: '📊',
      color: 'bg-blue-500',
      glowColor: 'shadow-blue-500/50'
    },
    { 
      view: 'list' as ViewType, 
      label: 'List', 
      icon: '📋',
      color: 'bg-emerald-500',
      glowColor: 'shadow-emerald-500/50'
    },
    { 
      view: 'timeline' as ViewType, 
      label: 'Timeline', 
      icon: '📅',
      color: 'bg-violet-500',
      glowColor: 'shadow-violet-500/50'
    },
  ];

  const handleViewChange = (view: ViewType) => {
    onViewChange(view);
  };

  return (
    <div className="relative">
      {/* Sleek modern navigation */}
      <div className="flex items-center gap-1 p-1 bg-gradient-to-r from-gray-900/90 to-gray-800/90 backdrop-blur-2xl border border-gray-700/30 rounded-2xl shadow-2xl">
        {navItems.map((item) => {
          const isItemActive = currentView === item.view;
          
          return (
            <button
              key={item.view}
              onClick={() => handleViewChange(item.view)}
              disabled={isTransitioning}
              className={`relative px-4 py-2 rounded-xl transition-all duration-300 ease-out group overflow-hidden ${
                isTransitioning
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer'
              }`}
            >
              {/* Active state - sliding background */}
              {isItemActive && (
                <div className={`absolute inset-0 ${item.color} rounded-xl shadow-lg ${item.glowColor} shadow-xl`} />
              )}
              
              {/* Hover state - subtle background */}
              {!isTransitioning && !isItemActive && (
                <div className="absolute inset-0 bg-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              )}
              
              {/* Content */}
              <div className="relative flex items-center gap-2 z-10">
                <span className={`text-sm transition-all duration-300 ${
                  isItemActive 
                    ? 'text-white transform scale-105' 
                    : 'text-gray-400 group-hover:text-gray-200'
                }`}>
                  {item.icon}
                </span>
                <span className={`text-xs font-medium transition-all duration-300 ${
                  isItemActive 
                    ? 'text-white' 
                    : 'text-gray-400 group-hover:text-gray-200'
                }`}>
                  {item.label}
                </span>
              </div>
              
              {/* Shimmer effect on active */}
              {isItemActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-pulse" />
              )}
              
              {/* Ripple effect */}
              {!isTransitioning && (
                <div className="absolute inset-0 rounded-xl overflow-hidden">
                  <div className="absolute inset-0 bg-white/10 scale-0 group-active:scale-100 transition-transform duration-150 ease-out" />
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Subtle outer glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-emerald-500/10 to-violet-500/10 rounded-2xl blur-xl -z-10" />
    </div>
  );
};
