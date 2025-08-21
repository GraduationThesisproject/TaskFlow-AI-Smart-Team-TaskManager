import type { User } from './auth.types';
import type { Task } from './task.types';

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  ownerId: string;
  owner?: User;
  members: WorkspaceMember[];
  settings: WorkspaceSettings;
  plan: WorkspacePlan;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceMember {
  id: string;
  userId: string;
  user?: User;
  role: WorkspaceRole;
  status?: 'active' | 'pending' | 'disabled';
  lastActive?: string | Date;
  joinedAt: Date;
}

// Use a string literal union instead of an enum to avoid runtime TS emit.
export type WorkspaceRole = 'owner' | 'admin' | 'member';

// Optional: enum-like constants for convenient value access in code.
export const WorkspaceRoleConst = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
} as const;

export type WorkspacePlan = 'free' | 'basic' | 'premium' | 'enterprise';

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

export interface WorkspaceSettings {
  allowGuestAccess: boolean;
  requireApproval: boolean;
  maxFileSize: number;
  allowedFileTypes: string[];
}

export interface WorkspaceState {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  isLoading: boolean;
  error: string | null;
}
