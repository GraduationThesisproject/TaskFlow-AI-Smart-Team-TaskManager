import type { User } from './auth.types';
import type { Task } from './task.types';

export interface Workspace {
  _id: string;
  name: string;
  description?: string;
  owner: string;
  members: WorkspaceMember[];
  spaces: string[];
  settings: WorkspaceSettings;
  plan: 'free' | 'basic' | 'premium' | 'enterprise';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMember {
  user: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
  addedBy?: string;
  permissions: string[];
}

export interface WorkspaceSettings {
  theme?: string;
  timezone?: string;
  dateFormat?: string;
  timeFormat?: string;
  defaultView?: 'list' | 'board' | 'calendar';
  notifications: {
    email: boolean;
    push: boolean;
    desktop: boolean;
  };
  features: {
    timeTracking: boolean;
    fileAttachments: boolean;
    customFields: boolean;
  };
}

export interface CreateWorkspaceData {
  name: string;
  description?: string;
  plan?: 'free' | 'basic' | 'premium' | 'enterprise';
}

export interface UpdateWorkspaceData {
  name?: string;
  description?: string;
  settings?: WorkspaceSettings;
}

export interface InviteMemberData {
  email: string;
  role?: 'member' | 'admin';
  message?: string;
}

export interface Board {
  id: string;
  name: string;
  description?: string;
  columns: Column[];
  tasks: Task[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Column {
  id: string;
  name: string;
  order: number;
  tasks: Task[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceState {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  isLoading: boolean;
  error: string | null;
}

export interface WorkspacesSectionProps {
  workspaces: Workspace[];
  openCreateModal: () => void;
}

export interface WelcomeHeaderProps {
  displayName: string;
}

export interface StatsCardsProps {
  taskStats: {
    total: number;
    completed: number;
    inProgress: number;
    overdue: number;
    highPriority: number;
    completionRate: number;
  };
}

export interface RecentActivityProps {
  recentActivity: Array<{ user: { name: string; avatar?: string }; action: string; timestamp: string }>;
}

export interface UpcomingDeadlinesProps {
  upcomingDeadlines: Task[];
}
