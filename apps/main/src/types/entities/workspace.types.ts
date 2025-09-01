// Workspace-related types for core entities

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
  isPublic?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMember {
  id: string;
  userId: string;
  user?: any;
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

export interface WorkspaceStats {
  totalMembers: number;
  totalSpaces: number;
  totalBoards: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  lastActivity: string;
  storageUsed: number;
  storageLimit: number;
}

export interface WorkspaceInvitation {
  id: string;
  workspaceId: string;
  email: string;
  role: 'member' | 'admin';
  invitedBy: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  expiresAt: string;
  createdAt: string;
  acceptedAt?: string;
  metadata?: Record<string, any>;
}

export interface WorkspacePlan {
  id: string;
  name: 'free' | 'basic' | 'premium' | 'enterprise';
  displayName: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  limits: {
    members: number;
    spaces: number;
    boards: number;
    tasks: number;
    storage: number;
    integrations: number;
  };
  metadata?: Record<string, any>;
}

export interface WorkspaceBilling {
  id: string;
  workspaceId: string;
  plan: string;
  status: 'active' | 'past_due' | 'cancelled' | 'unpaid';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  nextBillingDate: string;
  amount: number;
  currency: string;
  paymentMethod?: string;
  lastPaymentDate?: string;
  metadata?: Record<string, any>;
}

export interface WorkspaceIntegration {
  id: string;
  workspaceId: string;
  provider: string;
  name: string;
  description: string;
  isActive: boolean;
  config: Record<string, any>;
  lastSync?: string;
  syncStatus: 'success' | 'failed' | 'pending';
  metadata?: Record<string, any>;
}

export interface WorkspaceAudit {
  id: string;
  workspaceId: string;
  action: string;
  resource: string;
  resourceId?: string;
  performedBy: string;
  performedAt: string;
  ipAddress: string;
  userAgent: string;
  changes?: Record<string, { from: any; to: any }>;
  metadata?: Record<string, any>;
}

// Workspace constants
export const WORKSPACE_PLANS = {
  FREE: 'free',
  BASIC: 'basic',
  PREMIUM: 'premium',
  ENTERPRISE: 'enterprise',
} as const;

export type WorkspacePlanType = typeof WORKSPACE_PLANS[keyof typeof WORKSPACE_PLANS];

export const WORKSPACE_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
} as const;

export type WorkspaceRole = typeof WORKSPACE_ROLES[keyof typeof WORKSPACE_ROLES];

export const WORKSPACE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  ARCHIVED: 'archived',
} as const;

export type WorkspaceStatus = typeof WORKSPACE_STATUS[keyof typeof WORKSPACE_STATUS];

export const WORKSPACE_VIEWS = {
  LIST: 'list',
  BOARD: 'board',
  CALENDAR: 'calendar',
} as const;

export type WorkspaceView = typeof WORKSPACE_VIEWS[keyof typeof WORKSPACE_VIEWS];

// Workspace validation
export interface WorkspaceValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

// Workspace search and filter
export interface WorkspaceSearchFilters {
  query?: string;
  plan?: WorkspacePlanType[];
  status?: WorkspaceStatus[];
  owner?: string;
  isPublic?: boolean;
  hasActiveMembers?: boolean;
  createdAtAfter?: string;
  createdAtBefore?: string;
  lastActivityAfter?: string;
  lastActivityBefore?: string;
}

// Workspace import/export
export interface WorkspaceImportData {
  name: string;
  description?: string;
  plan?: WorkspacePlanType;
  isPublic?: boolean;
  settings?: Partial<WorkspaceSettings>;
  members?: Array<{
    email: string;
    role: WorkspaceRole;
  }>;
  metadata?: Record<string, any>;
}

export interface WorkspaceExportData {
  workspace: Workspace;
  spaces: any[];
  boards: any[];
  tasks: any[];
  members: any[];
  exportedAt: string;
  format: 'csv' | 'json' | 'xlsx';
  metadata?: Record<string, any>;
}

// Workspace bulk operations
export interface WorkspaceBulkOperation {
  operation: 'activate' | 'deactivate' | 'suspend' | 'archive' | 'changePlan' | 'delete';
  workspaceIds: string[];
  data?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface WorkspaceBulkOperationResult {
  operation: string;
  totalWorkspaces: number;
  successful: number;
  failed: number;
  errors: Array<{ workspaceId: string; error: string }>;
  metadata?: Record<string, any>;
}
