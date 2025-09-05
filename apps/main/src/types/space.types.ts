// Space-related types extracted from task.types.ts
export interface Space {
  _id: string;
  name: string;
  description?: string;
  workspace: string;
  members: SpaceMember[];
  settings: SpaceSettings;
  stats: SpaceStats;
  isActive: boolean;
  isArchived: boolean;
  archiveExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SpaceMember {
  user: string;
  role: 'owner' | 'admin' | 'contributor' | 'member' | 'viewer';
  joinedAt: string;
  addedBy?: string;
  permissions: SpacePermissions;
}

export interface SpacePermissions {
  canViewBoards: boolean;
  canCreateBoards: boolean;
  canEditBoards: boolean;
  canDeleteBoards: boolean;
  canCreateTasks: boolean;
  canEditTasks: boolean;
  canDeleteTasks: boolean;
  canManageMembers: boolean;
  canEditSettings: boolean;
}

export interface SpaceSettings {
  color: string;
  icon: string;
  isPrivate: boolean;
  allowGuestAccess: boolean;
  autoArchiveCompletedTasks: boolean;
  archiveAfterDays: number;
  defaultBoardTemplate?: string;
  features: {
    timeTracking: boolean;
    aiSuggestions: boolean;
    customFields: boolean;
    fileAttachments: boolean;
    voting: boolean;
    dependencies: boolean;
  };
  notifications: {
    newTaskNotifications: boolean;
    taskUpdatesNotifications: boolean;
    taskCompletedNotifications: boolean;
    dueDateReminders: boolean;
    memberJoinedNotifications: boolean;
  };
}

export interface SpaceStats {
  totalBoards: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  activeMembersCount: number;
  lastActivityAt: string;
}

// Space state management types
export interface SpaceState {
  spaces: Space[];
  currentSpace: Space | null;
  currentWorkspaceId: string | null;
  loading: boolean;
  error: string | null;
  socketConnected: boolean;
}

// Space form types
export interface CreateSpaceForm {
  name: string;
  description?: string;
  workspace: string;
  settings?: Partial<SpaceSettings>;
}

export interface UpdateSpaceForm {
  name?: string;
  description?: string;
  settings?: Partial<SpaceSettings>;
  isActive?: boolean;
  isArchived?: boolean;
}

export interface AddSpaceMemberForm {
  userId: string;
  role: 'owner' | 'admin' | 'contributor' | 'member' | 'viewer';
  permissions?: Partial<SpacePermissions>;
}

// Space API response types
export interface SpaceApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface SpacePaginatedResponse<T> {
  success: boolean;
  message: string;
  data: {
    items: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  timestamp: string;
}

// Space socket event types
export interface SpaceSocketEvent {
  type: string;
  data: any;
  timestamp: string;
}

export interface SpaceSocketMessage {
  event: string;
  data: any;
  timestamp: string;
}
