import { Task, Subtask } from '../store/slices/taskSlice';

// Mock data
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Set up database schema',
    description: 'Create the initial database structure for the application with proper relationships and indexes.',
    status: 'To Do',
    priority: 'Very High',
    progress: 70,
    category: 'Medium SaaS',
    categoryColor: 'green',
    assignees: ['MK', 'LR'],
    dueDate: '2024-01-15',
    comments: 18,
    attachments: 18,
    estimatedTime: '4 days',
    labels: ['Database', 'Backend', 'Infrastructure'],
    dependencies: ['User Research Analysis'],
    subtasks: [
      { id: '1-1', title: 'Design ERD', completed: true, dueDate: '2024-01-10', assignee: 'MK' },
      { id: '1-2', title: 'Create tables', completed: false, dueDate: '2024-01-12', assignee: 'LR' },
      { id: '1-3', title: 'Add indexes', completed: false, dueDate: '2024-01-14', assignee: 'MK' },
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-05T00:00:00Z',
  },
  {
    id: '2',
    title: 'Launch new email campaign',
    description: 'Successfully launched the new email marketing campaign with A/B testing and analytics tracking.',
    status: 'Completed',
    priority: 'Low',
    progress: 100,
    category: 'Low Marketing',
    categoryColor: 'green',
    assignees: ['KW', 'RL'],
    dueDate: '2024-01-12',
    comments: 20,
    attachments: 20,
    estimatedTime: '3 days',
    labels: ['Marketing', 'Email', 'Campaign'],
    dependencies: [],
    subtasks: [
      { id: '2-1', title: 'Design email template', completed: true, dueDate: '2024-01-08', assignee: 'KW' },
      { id: '2-2', title: 'Set up A/B testing', completed: true, dueDate: '2024-01-10', assignee: 'RL' },
      { id: '2-3', title: 'Launch campaign', completed: true, dueDate: '2024-01-12', assignee: 'KW' },
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-12T00:00:00Z',
  },
  {
    id: '3',
    title: 'Implement user feedback from surveys',
    description: 'Apply user feedback to improve the application based on survey results and usability testing.',
    status: 'In Progress',
    priority: 'High',
    progress: 67,
    category: 'High Web Development',
    categoryColor: 'orange',
    assignees: ['TR', 'NK', 'PL'],
    dueDate: '2024-01-25',
    startDate: '2024-01-10',
    endDate: '2024-01-25',
    comments: 12,
    attachments: 12,
    estimatedTime: '2 weeks',
    labels: ['Frontend', 'UX', 'User Feedback'],
    dependencies: ['User Research Analysis'],
    subtasks: [
      { id: '3-1', title: 'Analyze survey data', completed: true, dueDate: '2024-01-12', assignee: 'TR' },
      { id: '3-2', title: 'Create improvement plan', completed: true, dueDate: '2024-01-15', assignee: 'NK' },
      { id: '3-3', title: 'Implement changes', completed: false, dueDate: '2024-01-22', assignee: 'PL' },
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    id: '4',
    title: 'Define KPI list for Q2',
    description: 'Establish key performance indicators for the second quarter with measurable targets and tracking methods.',
    status: 'To Do',
    priority: 'Very High',
    progress: 0,
    category: 'Medium SaaS',
    categoryColor: 'blue',
    assignees: ['JD', 'AS'],
    dueDate: '2024-01-18',
    comments: 18,
    attachments: 18,
    estimatedTime: '4 days',
    labels: ['Strategy', 'KPI', 'Planning'],
    dependencies: ['Q1 Review'],
    subtasks: [
      { id: '4-1', title: 'Review Q1 performance', completed: false, dueDate: '2024-01-15', assignee: 'JD' },
      { id: '4-2', title: 'Define Q2 goals', completed: false, dueDate: '2024-01-17', assignee: 'AS' },
      { id: '4-3', title: 'Set up tracking', completed: false, dueDate: '2024-01-18', assignee: 'JD' },
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '5',
    title: 'Create wireframes for mobile app',
    description: 'Design wireframes for the mobile application with responsive design and user experience considerations.',
    status: 'In Review',
    priority: 'Medium',
    progress: 28,
    category: 'Medium Product Design',
    categoryColor: 'red',
    assignees: ['SM', 'DJ'],
    dueDate: '2024-01-20',
    startDate: '2024-01-05',
    endDate: '2024-01-20',
    comments: 15,
    attachments: 15,
    estimatedTime: '1 week',
    labels: ['Design', 'Mobile', 'Wireframes'],
    dependencies: ['Brand Guidelines Update'],
    subtasks: [
      { id: '5-1', title: 'Research mobile patterns', completed: true, dueDate: '2024-01-08', assignee: 'SM' },
      { id: '5-2', title: 'Create low-fidelity wireframes', completed: true, dueDate: '2024-01-12', assignee: 'DJ' },
      { id: '5-3', title: 'Design high-fidelity wireframes', completed: false, dueDate: '2024-01-18', assignee: 'SM' },
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-12T00:00:00Z',
  },
];

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
    const newTask: Task = {
      id: Date.now().toString(),
      title: taskData.title || 'New Task',
      description: taskData.description || '',
      status: taskData.status || 'To Do',
      priority: taskData.priority || 'Medium',
      progress: taskData.progress || 0,
      category: taskData.category || 'General',
      categoryColor: taskData.categoryColor || 'gray',
      assignees: taskData.assignees || [],
      dueDate: taskData.dueDate || new Date().toISOString().split('T')[0],
      comments: taskData.comments || 0,
      attachments: taskData.attachments || 0,
      estimatedTime: taskData.estimatedTime || '1 day',
      labels: taskData.labels || [],
      dependencies: taskData.dependencies || [],
      subtasks: taskData.subtasks || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockTasks.unshift(newTask);
    return newTask;
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
