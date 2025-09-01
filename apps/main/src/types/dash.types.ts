import { LucideIcon } from 'lucide-react';
import type { Task } from './task.types';
import type { ReactNode } from 'react';

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
export interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (workspaceData: {
    name: string;
    description?: string;
    visibility: 'private' | 'public';
  }) => Promise<void>;
}
export interface DeleteWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspace?: { id: string; name: string } | null;
  onConfirm: (workspaceId: string) => Promise<void> | void;
  isLoading?: boolean;
}

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
  sender?: { name: string; avatar?: string };
  // Optional delivery channels as sent by backend
  deliveryMethods?: {
    inApp?: boolean;
    email?: boolean;
    push?: boolean;
  };
  // Client-only notifications (not persisted in backend)
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
  };
}

export interface NotificationState {
  notifications: Notification[];
  stats: NotificationStats | null;
  loading: boolean;
  error: string | null;
}

export interface UseNotificationsReturn {
  notifications: Notification[];
  stats: NotificationStats | null;
  loading: boolean;
  error: string | null;
  fetchNotifications: (params?: any) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  clearReadNotifications: () => void;
  clearError: () => void;
}

export interface DashboardShellProps {
  children: ReactNode;
  title?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}
export interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  author: {
    name: string;
    avatar?: string;
  };
  views: number;
  likes: number;
  downloads?: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
export interface TemplateCardItem {
  id: string;
  title: string;
  description: string;
  type?: TemplateType;
  category: string;
  author: { name: string; avatar?: string };
  views: number;
  likes: number;
  downloads?: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  userLiked?: boolean;
  // Populated from backend: arrays of users who liked/viewed (names populated)
  likedBy?: Array<{ _id: string; name?: string; displayName?: string }>;
  viewedBy?: Array<{ _id: string; name?: string; displayName?: string }>;
}

export interface TemplateCardProps {
  template: TemplateCardItem;
  onClick: (template: TemplateCardItem) => void;
  onLike?: (template: TemplateCardItem) => void;
}

// Types
export type TemplateType = 'task' | 'board' | 'space' | 'workflow' | 'checklist';
export type TemplateStatus = 'draft' | 'active' | 'archived' | 'deprecated';

export interface TemplateItem {
  _id: string;
  name: string;
  description?: string;
  type: TemplateType;
  content: Record<string, any>;
  category?: string;
  tags?: string[];
  isPublic?: boolean;
  status?: TemplateStatus;
  accessControl?: {
    allowedUsers?: string[];
    allowedWorkspaces?: string[];
    allowedRoles?: string[];
  };
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  views?: number;
  likedBy?: string[];
}

export interface TemplatesFilters {
  workspaceId?: string;
  type?: TemplateType;
  category?: string;
  q?: string;
  isPublic?: boolean;
  status?: TemplateStatus;
  limit?: number;
  all?: boolean;
  // Admin-only: request all templates regardless of access control
  scope?: 'all';
}

export interface TemplatesState {
  items: TemplateItem[];
  selected: TemplateItem | null;
  loading: boolean;
  error: string | null;
  filters: TemplatesFilters;
}

export interface UseTemplatesReturn {
  items: TemplateItem[];
  selected: TemplateItem | null;
  loading: boolean;
  error: string | null;
  filters: TemplatesFilters;

  // Actions
  load: (filters?: TemplatesFilters) => void;
  // Admin-only: fetch all templates (requires backend support for scope=all)
  loadAll: (filters?: TemplatesFilters) => void;
  fetchOne: (id: string) => void;
  create: (payload: Partial<TemplateItem>) => Promise<void>;
  update: (id: string, updates: Partial<TemplateItem>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  updateFilters: (patch: Partial<TemplatesFilters>) => void;
  clearSelection: () => void;
  incrementViews: (id: string) => void;
  toggleLike: (id: string) => void;
}


export type CategoryKey = 'Marketing' | 'Development' | 'Design' | 'Sales' | 'Support' | 'Operations' | 'HR' | 'Finance' | 'General' | 'Custom';

export interface Category {
  key: CategoryKey;
  label: string;
  icon: ReactNode;
  count: number;
}

export interface CreateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TYPE_OPTIONS: { value: TemplateType; label: string }[] = [
  { value: 'task', label: 'Task' },
  { value: 'board', label: 'Board' },
  { value: 'space', label: 'Space' },
  { value: 'workflow', label: 'Workflow' },
  { value: 'checklist', label: 'Checklist' },
];

export const CATEGORY_OPTIONS = [
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Development', label: 'Development' },
  { value: 'Design', label: 'Design' },
  { value: 'Sales', label: 'Sales' },
  { value: 'Support', label: 'Support' },
  { value: 'Operations', label: 'Operations' },
  { value: 'HR', label: 'HR' },
  { value: 'Finance', label: 'Finance' },
  { value: 'General', label: 'General' },
  { value: 'Custom', label: 'Custom' },
]


export type NavItem = { icon: LucideIcon; label: string; href: string };

export type UniversalSidebarProps = {
  locationPath: string;
  locationHash?: string;
  // desktop
  sidebarCollapsed?: boolean;
  setSidebarCollapsed?: (v: boolean) => void;
  // mobile
  mobile?: boolean;
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (v: boolean) => void;
};

export interface NotificationSettingsState {
  emailNotifications: boolean;
  pushNotifications: boolean;
  realTimeNotifications: boolean;
  weeklySummary: boolean;
  marketingEmails: boolean;
}
export interface ActivityPoint { date: string; value: number }
