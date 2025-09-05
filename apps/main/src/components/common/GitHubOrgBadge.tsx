import React from 'react';
import { Badge } from '@taskflow/ui';
import { Github, ExternalLink } from 'lucide-react';
import type { Workspace } from '../../types/workspace.types';

interface GitHubOrgBadgeProps {
  workspace: Workspace;
  className?: string;
}

export const GitHubOrgBadge: React.FC<GitHubOrgBadgeProps> = ({ workspace, className = '' }) => {
  if (!workspace.githubOrg) {
    return (
      <Badge 
        variant="outline" 
        className={`flex items-center gap-2 px-3 py-1 text-xs font-medium text-muted-foreground border-muted-foreground/20 hover:bg-muted/50 transition-colors ${className}`}
      >
        <Github className="h-3 w-3" />
        <span>Not linked to GitHub</span>
      </Badge>
    );
  }

  return (
    <Badge 
      variant="secondary" 
      className={`flex items-center gap-2 px-3 py-1 text-xs font-medium bg-green-50 text-green-700 border-green-200 hover:bg-green-100 transition-colors ${className}`}
    >
      <Github className="h-3 w-3" />
      <span>Linked to {workspace.githubOrg.name || workspace.githubOrg.login}</span>
      <button
        onClick={() => window.open(workspace.githubOrg?.url, '_blank')}
        className="ml-1 hover:bg-green-200 rounded-full p-0.5 transition-colors"
        title="View on GitHub"
      >
        <ExternalLink className="h-3 w-3" />
      </button>
    </Badge>
  );
};
