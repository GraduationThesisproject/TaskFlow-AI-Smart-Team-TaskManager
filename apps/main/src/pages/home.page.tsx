import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchWorkspace, fetchSpacesByWorkspace, setSelectedSpace } from '../store/slices/workspaceSlice';
import { Button, Typography, Flex, Card, Loading } from '@taskflow/ui';

import type { Workspace, Space } from '../types/task.types';

// Demo data for when API is not accessible
const demoWorkspace: Workspace = {
  _id: 'demo-workspace',
  name: 'Studio Jaskolski and Sons Workspace',
  description: 'Collaborative environment for cross-functional teams.',
  plan: 'free',
  owner: '68a63ed8d82887a5431451ed',
  members: [],
  settings: {
    color: '#3B82F6',
    icon: '🏢',
    theme: 'light',
    features: {}
  },
  isActive: true,
  createdAt: '2025-08-05T01:59:56.311Z',
  updatedAt: '2025-08-05T01:59:56.311Z'
};

const demoSpaces: Space[] = [
  {
    _id: 'demo-space-1',
    name: 'Product Development',
    description: 'Core product development and feature planning',
    workspace: 'demo-workspace',
    members: [],
    settings: {
      color: '#10B981',
      icon: '🚀',
      isPrivate: false,
      allowGuestAccess: false,
      autoArchiveCompletedTasks: true,
      archiveAfterDays: 30,
      features: {
        timeTracking: true,
        aiSuggestions: true,
        customFields: true,
        fileAttachments: true,
        voting: false,
        dependencies: true
      },
      notifications: {
        newTaskNotifications: true,
        taskUpdatesNotifications: true,
        taskCompletedNotifications: true,
        dueDateReminders: true,
        memberJoinedNotifications: false
      }
    },
    stats: {
      totalBoards: 3,
      totalTasks: 24,
      completedTasks: 18,
      overdueTasks: 2,
      activeMembersCount: 6,
      lastActivityAt: '2025-08-20T15:30:00.000Z'
    },
    isActive: true,
    isArchived: false,
    createdAt: '2025-08-10T10:00:00.000Z',
    updatedAt: '2025-08-20T15:30:00.000Z'
  },
  {
    _id: 'demo-space-2',
    name: 'Marketing & Sales',
    description: 'Marketing campaigns and sales pipeline management',
    workspace: 'demo-workspace',
    members: [],
    settings: {
      color: '#F59E0B',
      icon: '📈',
      isPrivate: false,
      allowGuestAccess: false,
      autoArchiveCompletedTasks: true,
      archiveAfterDays: 60,
      features: {
        timeTracking: true,
        aiSuggestions: true,
        customFields: true,
        fileAttachments: true,
        voting: true,
        dependencies: false
      },
      notifications: {
        newTaskNotifications: true,
        taskUpdatesNotifications: true,
        taskCompletedNotifications: true,
        dueDateReminders: true,
        memberJoinedNotifications: true
      }
    },
    stats: {
      totalBoards: 2,
      totalTasks: 15,
      completedTasks: 12,
      overdueTasks: 1,
      activeMembersCount: 4,
      lastActivityAt: '2025-08-19T14:20:00.000Z'
    },
    isActive: true,
    isArchived: false,
    createdAt: '2025-08-12T14:00:00.000Z',
    updatedAt: '2025-08-19T14:20:00.000Z'
  },
  {
    _id: 'demo-space-3',
    name: 'Customer Support',
    description: 'Customer service and support ticket management',
    workspace: 'demo-workspace',
    members: [],
    settings: {
      color: '#8B5CF6',
      icon: '🎧',
      isPrivate: false,
      allowGuestAccess: false,
      autoArchiveCompletedTasks: true,
      archiveAfterDays: 90,
      features: {
        timeTracking: true,
        aiSuggestions: false,
        customFields: true,
        fileAttachments: true,
        voting: false,
        dependencies: true
      },
      notifications: {
        newTaskNotifications: true,
        taskUpdatesNotifications: true,
        taskCompletedNotifications: true,
        dueDateReminders: true,
        memberJoinedNotifications: false
      }
    },
    stats: {
      totalBoards: 1,
      totalTasks: 8,
      completedTasks: 6,
      overdueTasks: 0,
      activeMembersCount: 3,
      lastActivityAt: '2025-08-18T11:45:00.000Z'
    },
    isActive: true,
    isArchived: false,
    createdAt: '2025-08-15T09:00:00.000Z',
    updatedAt: '2025-08-18T11:45:00.000Z'
  }
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentWorkspace, spaces, loading, error } = useAppSelector(state => state.workspace);
  const { isAuthenticated } = useAppSelector(state => state.auth);
  const [useDemoData, setUseDemoData] = useState(false);

  // Use workspace ID from environment or default
  const workspaceId = process.env.REACT_APP_DEFAULT_WORKSPACE_ID || 'demo-workspace';

  useEffect(() => {
    if (isAuthenticated && workspaceId) {
      // Try to fetch real data first
      dispatch(fetchWorkspace(workspaceId));
      dispatch(fetchSpacesByWorkspace(workspaceId));
    }
  }, [dispatch, isAuthenticated, workspaceId]);

  // Switch to demo data if API calls fail
  useEffect(() => {
    if (error && !currentWorkspace && !spaces.length) {
      setUseDemoData(true);
    }
  }, [error, currentWorkspace, spaces]);

  const handleSpaceClick = (space: Space) => {
    dispatch(setSelectedSpace(space));
    navigate(`/space/${space._id}`);
  };

  // Use demo data if API failed or fallback to real data
  const displayWorkspace = useDemoData ? demoWorkspace : currentWorkspace;
  const displaySpaces = useDemoData ? demoSpaces : spaces;
  const isLoading = loading && !useDemoData;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="large" />
      </div>
    );
  }

  if (error && !useDemoData && !displayWorkspace) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Typography variant="heading-large" className="text-destructive mb-4">
            Error Loading Workspace
          </Typography>
          <Typography variant="body-medium" className="text-muted-foreground mb-4">
            {error}
          </Typography>
          <div className="space-y-3">
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
            >
              Retry
            </Button>
            <Button 
              onClick={() => setUseDemoData(true)} 
              variant="default"
              className="ml-3"
            >
              Use Demo Data
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background">
      <div className="container mx-auto px-6 py-8">
        {/* Demo Data Notice */}
        {useDemoData && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <Typography variant="body-medium" className="text-blue-800 dark:text-blue-200">
              🎭 Showing demo data - Backend API is not accessible. This is a preview of the workspace functionality.
            </Typography>
          </div>
        )}

        {/* Workspace Header */}
        {displayWorkspace && (
          <div className="mb-8">
            <Typography variant="heading-large" className="mb-2">
              {displayWorkspace.name}
            </Typography>
            {displayWorkspace.description && (
              <Typography variant="body-medium" className="text-muted-foreground">
                {displayWorkspace.description}
              </Typography>
            )}
            <div className="mt-4 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Plan:</span>
                <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-sm font-medium">
                  {displayWorkspace.plan}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Members:</span>
                <span className="px-2 py-1 bg-muted text-foreground rounded-md text-sm">
                  {displayWorkspace.members.length + 1}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Spaces Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Typography variant="heading-medium">
              Spaces ({displaySpaces.length})
            </Typography>
            <Button variant="outline" size="sm">
              + New Space
            </Button>
          </div>

          {displaySpaces.length === 0 ? (
            <Card className="p-8 text-center">
              <Typography variant="body-large" className="text-muted-foreground mb-4">
                No spaces found in this workspace
              </Typography>
              <Button variant="outline">
                Create Your First Space
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displaySpaces.map((space) => (
                <Card 
                  key={space._id} 
                  className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-[1.02]"
                  onClick={() => handleSpaceClick(space)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {space.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        space.isArchived 
                          ? 'bg-muted text-muted-foreground' 
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {space.isArchived ? 'Archived' : 'Active'}
                      </span>
                    </div>
                  </div>

                  <Typography variant="heading-small" className="mb-2">
                    {space.name}
                  </Typography>
                  
                  {space.description && (
                    <Typography variant="body-small" className="text-muted-foreground mb-4 line-clamp-2">
                      {space.description}
                    </Typography>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Boards:</span>
                      <span className="font-medium">{space.stats.totalBoards}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Tasks:</span>
                      <span className="font-medium">{space.stats.totalTasks}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Members:</span>
                      <span className="font-medium">{space.stats.activeMembersCount}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border/30">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Completion Rate:</span>
                      <span className="font-medium text-primary">
                        {space.stats.totalTasks > 0 
                          ? Math.round((space.stats.completedTasks / space.stats.totalTasks) * 100)
                          : 0}%
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-card/50 rounded-lg p-6 border border-border/30">
          <Typography variant="heading-small" className="mb-4">
            Quick Actions
          </Typography>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm">
              📊 View Analytics
            </Button>
            <Button variant="outline" size="sm">
              👥 Manage Members
            </Button>
            <Button variant="outline" size="sm">
              ⚙️ Workspace Settings
            </Button>
            <Button variant="outline" size="sm">
              📋 View All Tasks
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
