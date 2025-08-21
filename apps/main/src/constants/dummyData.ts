// Backend-shaped dummy data for local development
// Uses types defined in apps/main/src/types to mirror the backend model

import type {
  Task as BackendTask,
} from '../types/task.types';
import type { TaskPriority, TaskStatus } from '../types/task.types';

export type { BackendTask };

export interface WorkspaceDummy {
  id: string;
  name: string;
  description?: string;
  plan?: 'free' | 'basic' | 'premium' | 'enterprise';
  owner: string; // userId
}

export interface SpaceDummy {
  id: string;
  name: string;
  description?: string;
  workspace: string; // workspaceId
}

export interface BoardDummy {
  id: string;
  name: string;
  description?: string;
  type: 'kanban' | 'list' | 'calendar' | 'timeline';
  space: string; // spaceId
}

export interface ColumnDummy {
  id: string;
  name: string;
  color?: string;
  order: number;
  boardId: string;
}

export interface UserDummy {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}

// Minimal dummy sets for sprint testing
export const dummyWorkspaces: WorkspaceDummy[] = [
  {
    id: 'ws_1',
    name: 'Product Development',
    description: 'Core product team',
    plan: 'free',
    owner: 'user_1',
  },
];

export const dummySpaces: SpaceDummy[] = [
  {
    id: 'sp_1',
    name: 'Finance Dashboard',
    description: 'Build dashboard across Q1',
    workspace: 'ws_1',
  },
];

export const dummyBoards: BoardDummy[] = [
  {
    id: 'brd_1',
    name: 'Q1 Delivery',
    description: 'Main sprint board',
    type: 'kanban',
    space: 'sp_1',
  },
];

export const dummyColumns: ColumnDummy[] = [
  { id: 'col_todo', name: 'To Do', color: '#64748b', order: 1, boardId: 'brd_1' },
  { id: 'col_inprogress', name: 'In Progress', color: '#3b82f6', order: 2, boardId: 'brd_1' },
  { id: 'col_review', name: 'Review', color: '#10b981', order: 3, boardId: 'brd_1' },
  { id: 'col_done', name: 'Done', color: '#a3e635', order: 4, boardId: 'brd_1' },
];

// Current user for dummy sessions (used in Home greeting, etc.)
export const dummyCurrentUser: UserDummy = {
  id: 'user_1',
  email: 'charfed@gmail.com',
  firstName: 'Med.Charfeddine',
  lastName: 'Chaibi',
  avatar: undefined,
};

// Backend Task dummy data matching README fields
export const dummyTasksBackend: BackendTask[] = [
  {
    id: 'tsk_1',
    title: 'Set up database schema',
    description: 'Create initial schema with indexes',
    status: 'todo' as TaskStatus,
    priority: 'high' as TaskPriority,
    assigneeId: 'user_2',
    assignee: {
      id: 'user_2',
      email: 'dev@company.com',
      firstName: 'Dev',
      lastName: 'One',
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any,
    dueDate: new Date('2024-01-18'),
    tags: ['database', 'backend'],
    attachments: [],
    comments: [],
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-05T00:00:00Z'),
    workspaceId: 'ws_1',
    boardId: 'brd_1',
    columnId: 'col_todo',
  },
  {
    id: 'tsk_2',
    title: 'Implement auth flow',
    description: 'JWT + sessions + middleware',
    status: 'in_progress' as TaskStatus,
    priority: 'critical' as TaskPriority,
    assigneeId: 'user_3',
    assignee: {
      id: 'user_3',
      email: 'dev2@company.com',
      firstName: 'Dev',
      lastName: 'Two',
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any,
    dueDate: new Date('2024-01-22'),
    tags: ['auth', 'backend'],
    attachments: [],
    comments: [],
    createdAt: new Date('2024-01-03T00:00:00Z'),
    updatedAt: new Date('2024-01-12T00:00:00Z'),
    workspaceId: 'ws_1',
    boardId: 'brd_1',
    columnId: 'col_inprogress',
  },
  {
    id: 'tsk_3',
    title: 'Design wireframes',
    description: 'Mobile-first wireframes',
    status: 'review' as TaskStatus,
    priority: 'medium' as TaskPriority,
    assigneeId: 'user_4',
    assignee: {
      id: 'user_4',
      email: 'designer@company.com',
      firstName: 'Alex',
      lastName: 'Design',
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any,
    dueDate: new Date('2024-01-20'),
    tags: ['design', 'ux'],
    attachments: [],
    comments: [],
    createdAt: new Date('2024-01-04T00:00:00Z'),
    updatedAt: new Date('2024-01-12T00:00:00Z'),
    workspaceId: 'ws_1',
    boardId: 'brd_1',
    columnId: 'col_review',
  },
  {
    id: 'tsk_4',
    title: 'CI/CD pipeline',
    description: 'Set up Github Actions',
    status: 'done' as TaskStatus,
    priority: 'low' as TaskPriority,
    assigneeId: 'user_2',
    assignee: {
      id: 'user_2',
      email: 'dev@company.com',
      firstName: 'Dev',
      lastName: 'One',
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any,
    dueDate: new Date('2024-01-12'),
    tags: ['devops'],
    attachments: [],
    comments: [],
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-12T00:00:00Z'),
    workspaceId: 'ws_1',
    boardId: 'brd_1',
    columnId: 'col_done',
  },
];

export interface TemplateDummy {
  id: string;
  title: string;
  desc: string;
  views: number;
  likes: number;
  image?: string;
  category: string;
}

export const dummyTemplates: TemplateDummy[] = [
  {
    id: 'tpl_1',
    title: 'Product Roadmap',
    desc: 'Plan and track your product development',
    views: 1245,
    likes: 89,
    category: 'Product',
    image: '/images/templates/product-roadmap.png'
  },
  {
    id: 'tpl_2',
    title: 'Sprint Planning',
    desc: 'Organize your agile sprints',
    views: 987,
    likes: 67,
    category: 'Development',
    image: '/images/templates/sprint-planning.png'
  },
  {
    id: 'tpl_3',
    title: 'Content Calendar',
    desc: 'Plan and schedule your content',
    views: 765,
    likes: 45,
    category: 'Marketing',
    image: '/images/templates/content-calendar.png'
  },
  {
    id: 'tpl_4',
    title: 'Bug Tracker',
    desc: 'Track and manage software issues',
    views: 543,
    likes: 32,
    category: 'Development',
    image: '/images/templates/bug-tracker.png'
  },
  {
    id: 'tpl_5',
    title: 'Employee Onboarding',
    desc: 'Streamline new hire processes',
    views: 432,
    likes: 28,
    category: 'HR',
    image: '/images/templates/onboarding.png'
  },
  {
    id: 'tpl_6',
    title: 'Meeting Notes',
    desc: 'Organize and share meeting outcomes',
    views: 321,
    likes: 21,
    category: 'General',
    image: '/images/templates/meeting-notes.png'
  }
];

// Group templates by category
export const getTemplatesByCategory = () => {
  const categories = [...new Set(dummyTemplates.map(t => t.category))];
  return categories.map(category => ({
    title: `${category} Templates`,
    templates: dummyTemplates.filter(t => t.category === category)
  }));
};
