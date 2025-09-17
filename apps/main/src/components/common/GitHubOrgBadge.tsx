import React from 'react';
import { Badge } from '@taskflow/ui';
import { Github, ExternalLink } from 'lucide-react';
import type { Workspace } from '../../types/workspace.types';

interface GitHubOrgBadgeProps {
  workspace: Workspace;
  className?: string;
}

export const GitHubOrgBadge: React.FC<GitHubOrgBadgeProps> = ({ workspace, className = '' }) => {
  // Only show the badge if the workspace is actually linked to a GitHub organization
  // Check if githubOrg exists and has valid data (not just null values)
  if (!workspace.githubOrg || 
      !workspace.githubOrg.id || 
      !workspace.githubOrg.login || 
      !workspace.githubOrg.name) {
    return null;
  }

  // Construct the proper GitHub organization page URL
  const githubOrgUrl = `https://github.com/${workspace.githubOrg.login}`;

  return (
    <Badge 
      variant="secondary" 
      className={`flex items-center gap-2 px-3 py-1 text-xs font-medium bg-green-50 text-green-700 border-green-200 hover:bg-green-100 transition-colors ${className}`}
    >
      <Github className="h-3 w-3" />
      <span>Linked to {workspace.githubOrg.name || workspace.githubOrg.login}</span>
      <button
        onClick={() => window.open(githubOrgUrl, '_blank')}
        className="ml-1 hover:bg-green-200 rounded-full p-0.5 transition-colors"
        title="View on GitHub"
      >
        <ExternalLink className="h-3 w-3" />
      </button>
    </Badge>
  );
};
