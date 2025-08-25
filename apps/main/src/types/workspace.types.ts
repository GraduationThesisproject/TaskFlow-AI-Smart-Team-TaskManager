import type { UserBasic } from './auth.types';
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
  // Identifier fields
  id: string;            // member id (typically the user id)
  userId: string;        // explicit user id

  // Optional embedded user info (lightweight)
  user?: UserBasic;

  // Membership info
  role: 'owner' | 'admin' | 'member';
  status?: 'active' | 'pending' | 'disabled';
  lastActive?: string | Date;
  joinedAt: Date;
  addedBy?: string;
  permissions?: string[];
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

export interface UpcomingDeadlinesProps {
  upcomingDeadlines: Array<{ _id: string; title: string; dueDate: Date; priority: string }>;
}