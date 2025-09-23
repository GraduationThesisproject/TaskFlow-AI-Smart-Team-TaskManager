import React from 'react';
import { Typography } from '@taskflow/ui';
import { ArrowLeft } from 'lucide-react';
import { GitHubOrgBadge } from '../../components/common/GitHubOrgBadge';
import { useNavigate } from 'react-router-dom';

interface WorkspaceHeaderProps {
  workspace: any;
}

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({ workspace }) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between p-4 border-b border-border">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard/workspaces')}
          className="p-2 hover:bg-muted rounded-md transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <Typography variant="h1" className="text-2xl font-bold">
            {workspace.name}
          </Typography>
          <Typography variant="body-small" className="text-muted-foreground">
            {workspace.description || 'No description'}
          </Typography>
          {workspace.githubOrg && (
            <div className="mt-2">
              <GitHubOrgBadge workspace={workspace} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
