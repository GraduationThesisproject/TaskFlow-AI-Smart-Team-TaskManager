import type { Task, Subtask } from '../store/slices/taskSlice';
import { dummyTasksBackend } from '../constants/dummyData';
import { backendTaskToUI, uiTaskToBackend } from '../utils/taskAdapter';

// Adapted in-memory mock derived from backend-shaped data
const mockTasks: Task[] = dummyTasksBackend.map(backendTaskToUI);

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class TaskService {
  static async getTasks(): Promise<Task[]> {
    await delay(500); // Simulate network delay
    return [...mockTasks];
  }

  static async getTaskById(id: string): Promise<Task | null> {
    await delay(300);
    const task = mockTasks.find(t => t.id === id);
    return task || null;
  }

  static async createTask(taskData: Partial<Task>): Promise<Task> {
    await delay(400);
    const backendPayload = uiTaskToBackend(taskData);
    const newBackend = {
      id: Date.now().toString(),
      title: backendPayload.title || 'New Task',
      description: backendPayload.description || '',
      status: backendPayload.status || 'todo',
      priority: (backendPayload.priority as any) || 'medium',
      assigneeId: undefined,
      assignee: undefined as any,
      dueDate: backendPayload.dueDate || new Date(),
      tags: backendPayload.tags || [],
      attachments: [],
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      workspaceId: 'ws_1',
      boardId: 'brd_1',
      columnId: 'col_todo',
    } as any;

    const uiTask = backendTaskToUI(newBackend);
    mockTasks.unshift(uiTask);
    return uiTask;
  }

  static async updateTask(id: string, taskData: Partial<Task>): Promise<Task> {
    await delay(400);
    const taskIndex = mockTasks.findIndex(t => t.id === id);
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }

    const updatedTask = {
      ...mockTasks[taskIndex],
      ...taskData,
      updatedAt: new Date().toISOString(),
    };

    mockTasks[taskIndex] = updatedTask;
    return updatedTask;
  }

  static async deleteTask(id: string): Promise<void> {
    await delay(300);
    const taskIndex = mockTasks.findIndex(t => t.id === id);
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }

    mockTasks.splice(taskIndex, 1);
  }

  static async updateSubtask(taskId: string, subtaskId: string, updates: Partial<Subtask>): Promise<Task> {
    await delay(300);
    const task = mockTasks.find(t => t.id === taskId);
    if (!task || !task.subtasks) {
      throw new Error('Task or subtasks not found');
    }

    const subtaskIndex = task.subtasks.findIndex(st => st.id === subtaskId);
    if (subtaskIndex === -1) {
      throw new Error('Subtask not found');
    }

    task.subtasks[subtaskIndex] = {
      ...task.subtasks[subtaskIndex],
      ...updates,
    };

    task.updatedAt = new Date().toISOString();
    return task;
  }
}
