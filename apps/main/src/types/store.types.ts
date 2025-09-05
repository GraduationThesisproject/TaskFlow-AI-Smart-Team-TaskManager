// Store Types - Organized interfaces from store slices

// NOTIFICATION TYPES
export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'workspace_invitation' | 'space_invitation' | 'invitation_accepted';
  recipientId: string;
  relatedEntity?: {
    type: string;
    id: string;
    name?: string;
  };
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  clientOnly?: boolean;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: {
    info: number;
    success: number;
    warning: number;
    error: number;
    workspace_invitation: number;
    space_invitation: number;
    invitation_accepted: number;
  };
}

export interface NotificationSliceState {
  notifications: Notification[];
  stats: NotificationStats | null;
  loading: boolean;
  error: string | null;
}

// ACTIVITY TYPES
export interface ActivityUser {
  _id: string;
  name: string;
  email?: string;
  avatar?: string;
}

export interface ActivityItem {
  _id: string;
  user: ActivityUser | string;
  action: string;
  description: string;
  entity: {
    type: string;
    id: string;
    name?: string;
  };
  relatedEntities?: Array<{
    type: string;
    id: string;
    name?: string;
  }>;
  metadata?: Record<string, any>;
  workspace?: string;
  project?: string;
  space?: string;
  board?: string;
  severity?: 'info' | 'low' | 'medium' | 'high' | 'critical';
  isSuccessful?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ActivitySliceState {
  activities: ActivityItem[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  count: number;
  total: number;
}

export interface FetchActivitiesParams {
  limit?: number;
  page?: number;
  workspaceId?: string;
  projectId?: string;
  spaceId?: string;
  boardId?: string;
  userId?: string;
}

// PERMISSION TYPES
export interface PermissionState {
  currentUserRole: any | null;
  workspacePermissions: Record<string, any>;
  isLoading: boolean;
  error: string | null;
}

// APP TYPES
export interface AppSliceState {
  isLoading: boolean;
  error: string | null;
}

// WORKSPACE TYPES (Store-specific)
export interface WorkspaceSliceState {
  workspaces: any[]; // Will be imported from workspace.types
  spaces: any[]; // Will be imported from space.types
  selectedSpace: any | null; // Will be imported from space.types
  members: any[]; // Will be imported from workspace.types
  rules: any | null; // Will be imported from workspaceRules.types
  loading: boolean;
  isLoading: boolean;
  rulesLoading: boolean; // Separate loading state for rules
  error: string | null;
  currentWorkspace: any | null; // Will be imported from workspace.types
}
