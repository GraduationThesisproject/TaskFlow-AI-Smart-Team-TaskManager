import type { Task as BackendTask, TaskPriority as BackendPriority, TaskStatus as BackendStatus } from '../types/task.types';
import type { Task } from '../types/task.types';

const statusMapBackendToUI: Record<BackendStatus, Task['status']> = {
  'todo': 'To Do',
  'in_progress': 'In Progress',
  'review': 'In Review',
  'done': 'Completed',
};

const statusMapUIToBackend: Record<Task['status'], BackendStatus> = {
  'To Do': 'todo',
  'In Progress': 'in_progress',
  'In Review': 'review',
  'Completed': 'done',
};

const priorityMapBackendToUI = (p: BackendPriority | 'critical'): Task['priority'] => {
  const value = String(p);
  switch (value) {
    case 'low': return 'Low';
    case 'medium': return 'Medium';
    case 'high': return 'High';
    case 'urgent':
    case 'critical':
      return 'Very High';
    default:
      return 'Medium';
  }
};

const priorityMapUIToBackend = (p: Task['priority']): BackendPriority => {
  switch (p) {
    case 'Low': return 'low';
    case 'Medium': return 'medium';
    case 'High': return 'high';
    case 'Very High': return 'urgent';
    default: return 'medium';
  }
};

const formatDate = (d?: Date) => (d ? new Date(d).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);

const getInitials = (first?: string, last?: string) => {
  const f = (first || '').trim()[0] || '';
  const l = (last || '').trim()[0] || '';
  return `${f}${l}`.toUpperCase() || 'NA';
};

export function backendTaskToUI(task: BackendTask): Task {
  const assigneeInitials = task.assignee ? [getInitials((task.assignee as any).firstName, (task.assignee as any).lastName)] : [];

  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: statusMapBackendToUI[task.status],
    priority: priorityMapBackendToUI(task.priority as any),
    progress: 0,
    category: 'General',
    categoryColor: 'gray',
    assignees: assigneeInitials,
    dueDate: formatDate(task.dueDate as any),
    startDate: undefined,
    endDate: undefined,
    comments: task.comments?.length || 0,
    attachments: task.attachments?.length || 0,
    estimatedTime: '1 day',
    labels: task.tags || [],
    dependencies: [],
    subtasks: [] as Subtask[],
    createdAt: new Date(task.createdAt as any).toISOString(),
    updatedAt: new Date(task.updatedAt as any).toISOString(),
  };
}

export function uiTaskToBackend(ui: Partial<Task>): Partial<BackendTask> {
  return {
    id: ui.id,
    title: ui.title!,
    description: ui.description,
    status: ui.status ? statusMapUIToBackend[ui.status] : undefined,
    priority: ui.priority ? (priorityMapUIToBackend(ui.priority) as any) : undefined,
    dueDate: ui.dueDate ? new Date(ui.dueDate) : undefined,
    tags: ui.labels,
  } as Partial<BackendTask>;
}


