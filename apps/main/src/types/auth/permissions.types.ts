// Permission-related types for authentication and authorization

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  conditions?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface PermissionGroup {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  metadata?: Record<string, any>;
}

export interface UserPermissions {
  userId: string;
  permissions: Permission[];
  inheritedFrom: string[];
  metadata?: Record<string, any>;
}

export interface WorkspacePermissions {
  workspaceId: string;
  permissions: Permission[];
  inheritedFrom: string[];
  metadata?: Record<string, any>;
}

export interface SpacePermissions {
  spaceId: string;
  permissions: Permission[];
  inheritedFrom: string[];
  metadata?: Record<string, any>;
}

export interface BoardPermissions {
  boardId: string;
  permissions: Permission[];
  inheritedFrom: string[];
  metadata?: Record<string, any>;
}

export interface PermissionCheck {
  userId: string;
  resource: string;
  action: string;
  context?: Record<string, any>;
  result: boolean;
  reason?: string;
  metadata?: Record<string, any>;
}

export interface PermissionMatrix {
  [resource: string]: {
    [action: string]: {
      roles: string[];
      conditions?: Record<string, any>;
    };
  };
}

export interface PermissionRequest {
  userId: string;
  resource: string;
  action: string;
  context?: Record<string, any>;
  requestedAt: Date;
  status: 'pending' | 'approved' | 'denied';
  approvedBy?: string;
  approvedAt?: Date;
  reason?: string;
  metadata?: Record<string, any>;
}

export interface PermissionAudit {
  id: string;
  userId: string;
  action: 'granted' | 'revoked' | 'modified';
  resource: string;
  permission: string;
  grantedBy: string;
  grantedAt: Date;
  reason?: string;
  metadata?: Record<string, any>;
}

// Permission constants
export const PERMISSIONS = {
  // User permissions
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  
  // Workspace permissions
  WORKSPACE_READ: 'workspace:read',
  WORKSPACE_CREATE: 'workspace:create',
  WORKSPACE_UPDATE: 'workspace:update',
  WORKSPACE_DELETE: 'workspace:delete',
  WORKSPACE_MANAGE_MEMBERS: 'workspace:manage_members',
  WORKSPACE_MANAGE_SETTINGS: 'workspace:manage_settings',
  
  // Space permissions
  SPACE_READ: 'space:read',
  SPACE_CREATE: 'space:create',
  SPACE_UPDATE: 'space:update',
  SPACE_DELETE: 'space:delete',
  SPACE_MANAGE_MEMBERS: 'space:manage_members',
  SPACE_MANAGE_SETTINGS: 'space:manage_settings',
  
  // Board permissions
  BOARD_READ: 'board:read',
  BOARD_CREATE: 'board:create',
  BOARD_UPDATE: 'board:update',
  BOARD_DELETE: 'board:delete',
  BOARD_MANAGE_COLUMNS: 'board:manage_columns',
  BOARD_MANAGE_SETTINGS: 'board:manage_settings',
  
  // Task permissions
  TASK_READ: 'task:read',
  TASK_CREATE: 'task:create',
  TASK_UPDATE: 'task:update',
  TASK_DELETE: 'task:delete',
  TASK_ASSIGN: 'task:assign',
  TASK_MOVE: 'task:move',
  
  // Comment permissions
  COMMENT_READ: 'comment:read',
  COMMENT_CREATE: 'comment:create',
  COMMENT_UPDATE: 'comment:update',
  COMMENT_DELETE: 'comment:delete',
  
  // File permissions
  FILE_READ: 'file:read',
  FILE_UPLOAD: 'file:upload',
  FILE_DELETE: 'file:delete',
  
  // Template permissions
  TEMPLATE_READ: 'template:read',
  TEMPLATE_CREATE: 'template:create',
  TEMPLATE_UPDATE: 'template:update',
  TEMPLATE_DELETE: 'template:delete',
  TEMPLATE_PUBLISH: 'template:publish',
  
  // System permissions
  SYSTEM_READ: 'system:read',
  SYSTEM_UPDATE: 'system:update',
  SYSTEM_MANAGE_USERS: 'system:manage_users',
  SYSTEM_MANAGE_SETTINGS: 'system:manage_settings',
} as const;

export type PermissionType = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Permission scopes
export const PERMISSION_SCOPES = {
  GLOBAL: 'global',
  WORKSPACE: 'workspace',
  SPACE: 'space',
  BOARD: 'board',
  TASK: 'task',
  USER: 'user',
} as const;

export type PermissionScope = typeof PERMISSION_SCOPES[keyof typeof PERMISSION_SCOPES];

// Permission actions
export const PERMISSION_ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  MANAGE: 'manage',
  ASSIGN: 'assign',
  PUBLISH: 'publish',
  APPROVE: 'approve',
  REJECT: 'reject',
} as const;

export type PermissionAction = typeof PERMISSION_ACTIONS[keyof typeof PERMISSION_ACTIONS];
