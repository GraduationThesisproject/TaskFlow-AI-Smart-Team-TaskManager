// Role-related types for authentication and authorization

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  scope: 'global' | 'workspace' | 'space' | 'board';
  isSystem: boolean;
  isDefault: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface UserRoleAssignment {
  userId: string;
  roleId: string;
  scope: 'global' | 'workspace' | 'space' | 'board';
  scopeId?: string; // workspaceId, spaceId, or boardId
  grantedBy: string;
  grantedAt: string;
  expiresAt?: string;
  metadata?: Record<string, any>;
}

export interface RoleAssignment {
  id: string;
  userId: string;
  roleId: string;
  scope: 'global' | 'workspace' | 'space' | 'board';
  scopeId?: string;
  grantedBy: string;
  grantedAt: string;
  expiresAt?: string;
  status: 'active' | 'expired' | 'revoked';
  revokedBy?: string;
  revokedAt?: string;
  reason?: string;
  metadata?: Record<string, any>;
}

export interface RoleTemplate {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  scope: 'global' | 'workspace' | 'space' | 'board';
  isCustomizable: boolean;
  metadata?: Record<string, any>;
}

export interface RoleHierarchy {
  id: string;
  parentRoleId: string;
  childRoleId: string;
  scope: 'global' | 'workspace' | 'space' | 'board';
  scopeId?: string;
  metadata?: Record<string, any>;
}

// Role constants
export const ROLES = {
  // Global roles
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  USER: 'user',
  
  // Workspace roles
  WORKSPACE_OWNER: 'workspace_owner',
  WORKSPACE_ADMIN: 'workspace_admin',
  WORKSPACE_MEMBER: 'workspace_member',
  WORKSPACE_GUEST: 'workspace_guest',
  
  // Space roles
  SPACE_OWNER: 'space_owner',
  SPACE_ADMIN: 'space_admin',
  SPACE_CONTRIBUTOR: 'space_contributor',
  SPACE_MEMBER: 'space_member',
  SPACE_VIEWER: 'space_viewer',
  
  // Board roles
  BOARD_OWNER: 'board_owner',
  BOARD_ADMIN: 'board_admin',
  BOARD_EDITOR: 'board_editor',
  BOARD_VIEWER: 'board_viewer',
  
  // Task roles
  TASK_ASSIGNEE: 'task_assignee',
  TASK_REPORTER: 'task_reporter',
  TASK_WATCHER: 'task_watcher',
} as const;

export type RoleType = typeof ROLES[keyof typeof ROLES];

// Role scopes
export const ROLE_SCOPES = {
  GLOBAL: 'global',
  WORKSPACE: 'workspace',
  SPACE: 'space',
  BOARD: 'board',
} as const;

export type RoleScope = typeof ROLE_SCOPES[keyof typeof ROLE_SCOPES];

// Role levels (for hierarchy)
export const ROLE_LEVELS = {
  OWNER: 1,
  ADMIN: 2,
  EDITOR: 3,
  CONTRIBUTOR: 4,
  MEMBER: 5,
  VIEWER: 6,
  GUEST: 7,
} as const;

export type RoleLevel = typeof ROLE_LEVELS[keyof typeof ROLE_LEVELS];

// Role metadata
export interface RoleMetadata {
  level: RoleLevel;
  color?: string;
  icon?: string;
  badge?: string;
  description?: string;
  permissions?: string[];
  restrictions?: string[];
  customFields?: Record<string, any>;
}

// Role assignment request
export interface RoleAssignmentRequest {
  id: string;
  userId: string;
  requestedRoleId: string;
  scope: RoleScope;
  scopeId?: string;
  requestedBy: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'denied';
  approvedBy?: string;
  approvedAt?: string;
  deniedBy?: string;
  deniedAt?: string;
  reason?: string;
  metadata?: Record<string, any>;
}

// Role audit log
export interface RoleAuditLog {
  id: string;
  action: 'assigned' | 'revoked' | 'modified' | 'requested' | 'approved' | 'denied';
  userId: string;
  roleId: string;
  scope: RoleScope;
  scopeId?: string;
  performedBy: string;
  performedAt: string;
  reason?: string;
  metadata?: Record<string, any>;
}

// Role validation
export interface RoleValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

// Role comparison
export interface RoleComparison {
  role1: Role;
  role2: Role;
  differences: {
    permissions: {
      added: string[];
      removed: string[];
      unchanged: string[];
    };
    metadata: {
      added: Record<string, any>;
      removed: Record<string, any>;
      changed: Record<string, { from: any; to: any }>;
    };
  };
}

// Role statistics
export interface RoleStatistics {
  totalRoles: number;
  totalAssignments: number;
  rolesByScope: Record<RoleScope, number>;
  assignmentsByRole: Record<string, number>;
  mostUsedRoles: Array<{ roleId: string; count: number }>;
  leastUsedRoles: Array<{ roleId: string; count: number }>;
}
