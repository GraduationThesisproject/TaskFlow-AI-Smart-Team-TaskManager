import React from 'react';
import { Button } from '@taskflow/ui';
import { Zap, Users, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardActionsProps {
  className?: string;
}

export const DashboardActions: React.FC<DashboardActionsProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2 hover:bg-secondary/60 transition-colors"
        onClick={() => navigate('/workspace/upgrade')}
      >
        <Zap className="w-4 h-4" />
        <span className="text-sm hidden sm:inline">Upgrade</span>
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2 hover:bg-secondary/60 transition-colors"
      >
        <Users className="w-4 h-4" />
        <span className="text-sm hidden sm:inline">Invite</span>
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2 hover:bg-secondary/60 transition-colors"
        onClick={() => navigate('/workspace/reports')}
      >
        <BarChart3 className="w-4 h-4" />
        <span className="text-sm hidden sm:inline">Reports</span>
      </Button>
    </div>
  );
};
