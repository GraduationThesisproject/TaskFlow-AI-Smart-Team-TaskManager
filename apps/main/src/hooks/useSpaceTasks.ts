import { useEffect, useCallback, useMemo, useState } from 'react';
import type { Task, Column, Board } from '../store/slices/taskSlice';
import { useSocket } from './socket/useSocket';

// Mock data for UI testing
const mockTasks: Task[] = [
  // To Do Column Tasks
  {
    _id: '1',
    title: 'Design User Interface',
    description: 'Create wireframes and mockups for the new dashboard',
    status: 'todo',
    priority: 'high',
    board: 'board1',
    space: 'space1',
    column: 'col1',
    assignees: ['user1'],
    reporter: 'user1',
    watchers: [],
    tags: ['design', 'frontend'],
    dueDate: '2024-01-15',
    startDate: '2024-01-01',
    estimatedHours: 8,
    actualHours: 0,
    position: 0,
    attachments: [],
    comments: [],
    dependencies: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    _id: '2',
    title: 'Set up Database Schema',
    description: 'Design and implement the database structure',
    status: 'todo',
    priority: 'medium',
    board: 'board1',
    space: 'space1',
    column: 'col1',
    assignees: ['user2'],
    reporter: 'user1',
    watchers: ['user1'],
    tags: ['backend', 'database'],
    dueDate: '2024-01-18',
    startDate: '2024-01-02',
    estimatedHours: 6,
    actualHours: 0,
    position: 1,
    attachments: [],
    comments: [],
    dependencies: [],
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
  {
    _id: '3',
    title: 'Write API Documentation',
    description: 'Create comprehensive API documentation',
    status: 'todo',
    priority: 'low',
    board: 'board1',
    space: 'space1',
    column: 'col1',
    assignees: ['user3'],
    reporter: 'user1',
    watchers: [],
    tags: ['documentation'],
    dueDate: '2024-01-25',
    startDate: '2024-01-03',
    estimatedHours: 4,
    actualHours: 0,
    position: 2,
    attachments: [],
    comments: [],
    dependencies: [],
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z',
  },
  
  // In Progress Column Tasks
  {
    _id: '4',
    title: 'Implement Authentication',
    description: 'Build user authentication system with JWT',
    status: 'in_progress',
    priority: 'high',
    board: 'board1',
    space: 'space1',
    column: 'col2',
    assignees: ['user2'],
    reporter: 'user1',
    watchers: ['user1', 'user3'],
    tags: ['backend', 'security'],
    dueDate: '2024-01-20',
    startDate: '2024-01-05',
    estimatedHours: 12,
    actualHours: 6,
    position: 0,
    attachments: [],
    comments: [],
    dependencies: [],
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-05T00:00:00Z',
  },
  {
    _id: '5',
    title: 'Create React Components',
    description: 'Build reusable UI components',
    status: 'in_progress',
    priority: 'medium',
    board: 'board1',
    space: 'space1',
    column: 'col2',
    assignees: ['user1'],
    reporter: 'user1',
    watchers: ['user2'],
    tags: ['frontend', 'react'],
    dueDate: '2024-01-22',
    startDate: '2024-01-06',
    estimatedHours: 10,
    actualHours: 4,
    position: 1,
    attachments: [],
    comments: [],
    dependencies: [],
    createdAt: '2024-01-06T00:00:00Z',
    updatedAt: '2024-01-06T00:00:00Z',
  },
  
  // Done Column Tasks
  {
    _id: '6',
    title: 'Project Setup',
    description: 'Initialize project structure and dependencies',
    status: 'done',
    priority: 'medium',
    board: 'board1',
    space: 'space1',
    column: 'col3',
    assignees: ['user1'],
    reporter: 'user1',
    watchers: [],
    tags: ['setup'],
    dueDate: '2024-01-10',
    startDate: '2024-01-01',
    estimatedHours: 2,
    actualHours: 2,
    position: 0,
    attachments: [],
    comments: [],
    dependencies: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z',
  },
  {
    _id: '7',
    title: 'Requirements Gathering',
    description: 'Collect and document project requirements',
    status: 'done',
    priority: 'high',
    board: 'board1',
    space: 'space1',
    column: 'col3',
    assignees: ['user3'],
    reporter: 'user1',
    watchers: ['user1', 'user2'],
    tags: ['planning'],
    dueDate: '2024-01-08',
    startDate: '2024-01-01',
    estimatedHours: 6,
    actualHours: 5,
    position: 1,
    attachments: [],
    comments: [],
    dependencies: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-08T00:00:00Z',
  },
];

const mockColumns: Column[] = [
  {
    _id: 'col1',
    name: 'To Do',
    board: 'board1',
    position: 0,
    color: '#e2e8f0',
    isDefault: true,
    settings: {
      automation: {
        autoUpdateStatus: false,
        statusMapping: {},
      },
    },
  },
  {
    _id: 'col2',
    name: 'In Progress',
    board: 'board1',
    position: 1,
    color: '#fef3c7',
    isDefault: false,
    settings: {
      automation: {
        autoUpdateStatus: false,
        statusMapping: {},
      },
    },
  },
  {
    _id: 'col3',
    name: 'Done',
    board: 'board1',
    position: 2,
    color: '#d1fae5',
    isDefault: false,
    settings: {
      automation: {
        autoUpdateStatus: false,
        statusMapping: {},
      },
    },
  },
];

// Mock users for assignees
const mockUsers = {
  user1: 'John Doe',
  user2: 'Jane Smith',
  user3: 'Mike Johnson',
};

const mockBoard: Board = {
  _id: 'board1',
  name: 'Sample Board',
  description: 'A sample board for UI testing',
  type: 'kanban',
  space: 'space1',
  columns: mockColumns,
  settings: {
    allowTaskCreation: true,
    allowColumnCreation: true,
    allowTaskMovement: true,
  },
  isTemplate: false,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

interface UseSpaceTasksOptions {
  spaceId?: string;
  boardId?: string;
  autoConnect?: boolean;
  authToken?: string;
}

export const useSpaceTasks = (options: UseSpaceTasksOptions) => {
  // Mock state for UI testing
  const [localTasks, setLocalTasks] = useState(mockTasks);
  const [localColumns, setLocalColumns] = useState(mockColumns);
  const tasks = localTasks;
  const columns = localColumns;
  const boards = [mockBoard];
  const currentTask = null;
  const currentBoard = mockBoard;
  const loading = false;
  const error = null;
  const filters = {
    status: [] as Task['status'][],
    priority: [] as Task['priority'][],
    assignee: [] as string[],
    tags: [] as string[],
  };
  const sortBy = {
    field: 'createdAt' as keyof Task,
    direction: 'desc' as 'asc' | 'desc',
  };
  const searchQuery = '' as string;
  const dragState = {
    isDragging: false,
    draggedTask: null,
    draggedColumn: null,
    sourceColumn: null,
    targetColumn: null,
  };

  // Computed values
  const tasksByColumn = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    columns.forEach(column => {
      const columnTasks = tasks.filter(task => task.column === column._id);
      grouped[column._id] = columnTasks.sort((a, b) => a.position - b.position);
    });
    return grouped;
  }, [tasks, columns]);

  const taskStats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.status === 'done').length;
    const inProgress = tasks.filter(task => task.status === 'in_progress').length;
    const todo = tasks.filter(task => task.status === 'todo').length;
    const overdue = tasks.filter(task => {
      if (!task.dueDate) return false;
      return new Date(task.dueDate) < new Date() && task.status !== 'done';
    }).length;

    return {
      total,
      completed,
      inProgress,
      todo,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(task => filters.status.includes(task.status));
    }

    // Apply priority filter
    if (filters.priority.length > 0) {
      filtered = filtered.filter(task => filters.priority.includes(task.priority));
    }

    // Apply assignee filter
    if (filters.assignee.length > 0) {
      filtered = filtered.filter(task =>
        task.assignees.some(assignee => filters.assignee.includes(assignee))
      );
    }

    // Apply tags filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(task =>
        task.tags.some(tag => filters.tags.includes(tag))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortBy.field];
      const bValue = b[sortBy.field];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortBy.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortBy.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortBy.direction === 'asc' 
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }
      
      return 0;
    });

    return filtered;
  }, [tasks, searchQuery, filters, sortBy]);

  // Utility functions for drag and drop
  const reorderTasks = useCallback((taskList: Task[], startIndex: number, endIndex: number): Task[] => {
    const result = Array.from(taskList);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    
    // Update positions
    return result.map((task, index) => ({
      ...task,
      position: index,
    }));
  }, []);

  const moveTaskBetweenColumns = useCallback((
    taskList: Task[],
    sourceColumnId: string,
    destinationColumnId: string,
    sourceIndex: number,
    destinationIndex: number
  ): Task[] => {
    const sourceTasks = taskList.filter(task => task.column === sourceColumnId);
    const destinationTasks = taskList.filter(task => task.column === destinationColumnId);
    
    const [movedTask] = sourceTasks.splice(sourceIndex, 1);
    const updatedTask = {
      ...movedTask,
      column: destinationColumnId,
      position: destinationIndex,
    };
    
    destinationTasks.splice(destinationIndex, 0, updatedTask);
    
    // Update positions for both columns
    const updatedSourceTasks = sourceTasks.map((task, index) => ({
      ...task,
      position: index,
    }));
    
    const updatedDestinationTasks = destinationTasks.map((task, index) => ({
      ...task,
      position: index,
    }));
    
    // Combine all tasks
    const otherTasks = taskList.filter(
      task => task.column !== sourceColumnId && task.column !== destinationColumnId
    );
    
    return [...otherTasks, ...updatedSourceTasks, ...updatedDestinationTasks];
  }, []);

  const reorderColumns = useCallback((columnList: Column[], startIndex: number, endIndex: number): Column[] => {
    const result = Array.from(columnList);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    
    // Update positions
    return result.map((column, index) => ({
      ...column,
      position: index,
    }));
  }, []);

  // Mock actions for UI testing
  const loadSpaceTasks = useCallback(() => {
    console.log('Mock: Loading space tasks for spaceId:', options.spaceId);
  }, [options.spaceId]);

  const loadBoardTasks = useCallback(() => {
    console.log('Mock: Loading board tasks for boardId:', options.boardId);
  }, [options.boardId]);

  const addTask = useCallback(async (taskData: Partial<Task>) => {
    console.log('Mock: Adding task', taskData);
    const newTask = { 
      ...taskData, 
      _id: Date.now().toString(),
      position: taskData.position || 0,
    } as Task;
    
    setLocalTasks(prev => [...prev, newTask]);
    return newTask;
  }, []);

  const editTask = useCallback(async (taskId: string, taskData: Partial<Task>) => {
    console.log('Mock: Editing task', taskId, taskData);
    setLocalTasks(prev => 
      prev.map(task => 
        task._id === taskId ? { ...task, ...taskData } : task
      )
    );
    return { ...taskData, _id: taskId } as Task;
  }, []);

  const moveTaskToColumn = useCallback(async (taskId: string, columnId: string, position: number) => {
    console.log('Mock: Moving task', taskId, 'to column', columnId, 'at position', position);
    
    let sourceColumnId: string;
    
    setLocalTasks(prev => {
      const taskIndex = prev.findIndex(task => task._id === taskId);
      if (taskIndex === -1) return prev;
      
      const task = prev[taskIndex];
      sourceColumnId = task.column;
      
      if (sourceColumnId === columnId) {
        // Same column, just reorder
        const columnTasks = prev.filter(t => t.column === columnId);
        const reorderedTasks = reorderTasks(columnTasks, task.position, position);
        
        return prev.map(t => {
          const updatedTask = reorderedTasks.find(rt => rt._id === t._id);
          return updatedTask || t;
        });
      } else {
        // Different column, move between columns
        return moveTaskBetweenColumns(prev, sourceColumnId, columnId, task.position, position);
      }
    });
    
    // TODO: Emit socket event for real-time updates
    // This should be implemented using the existing socket connection
    // from the parent component or a global socket context
    
    return { _id: taskId, column: columnId, position } as Task;
  }, [reorderTasks, moveTaskBetweenColumns]);

  const removeTask = useCallback(async (taskId: string) => {
    console.log('Mock: Removing task', taskId);
    setLocalTasks(prev => prev.filter(task => task._id !== taskId));
  }, []);

  const addColumn = useCallback(async (columnData: Partial<Column>) => {
    console.log('Mock: Adding column', columnData);
    const newColumn = { 
      ...columnData, 
      _id: Date.now().toString(),
      position: columnData.position || columns.length,
    } as Column;
    
    setLocalColumns(prev => [...prev, newColumn]);
    return newColumn;
  }, [columns.length]);

  const editColumn = useCallback(async (columnId: string, columnData: Partial<Column>) => {
    console.log('Mock: Editing column', columnId, columnData);
    setLocalColumns(prev => 
      prev.map(column => 
        column._id === columnId ? { ...column, ...columnData } : column
      )
    );
    return { ...columnData, _id: columnId } as Column;
  }, []);

  const removeColumn = useCallback(async (columnId: string) => {
    console.log('Mock: Removing column', columnId);
    setLocalColumns(prev => prev.filter(column => column._id !== columnId));
    // Also remove tasks in this column
    setLocalTasks(prev => prev.filter(task => task.column !== columnId));
  }, []);

  const reorderColumnsAction = useCallback(async (startIndex: number, endIndex: number) => {
    console.log('Mock: Reordering columns', startIndex, endIndex);
    setLocalColumns(prev => reorderColumns(prev, startIndex, endIndex));
  }, [reorderColumns]);

  const selectTask = useCallback((task: Task | null) => {
    console.log('Mock: Selecting task', task);
  }, []);

  const selectBoard = useCallback((board: Board | null) => {
    console.log('Mock: Selecting board', board);
  }, []);

  const updateFilters = useCallback((newFilters: Partial<typeof filters>) => {
    console.log('Mock: Updating filters', newFilters);
  }, []);

  const updateSortBy = useCallback((field: keyof Task, direction: 'asc' | 'desc') => {
    console.log('Mock: Updating sort by', field, direction);
  }, []);

  const updateSearchQuery = useCallback((query: string) => {
    console.log('Mock: Updating search query', query);
  }, []);

  const resetFilters = useCallback(() => {
    console.log('Mock: Resetting filters');
  }, []);

  // Mock drag and drop actions
  const startDraggingTask = useCallback((task: Task, sourceColumn: string) => {
    console.log('Mock: Starting drag task', task, sourceColumn);
  }, []);

  const startDraggingColumn = useCallback((column: Column) => {
    console.log('Mock: Starting drag column', column);
  }, []);

  const setDragTargetColumn = useCallback((columnId: string | null) => {
    console.log('Mock: Setting drag target column', columnId);
  }, []);

  const endDragging = useCallback(() => {
    console.log('Mock: Ending drag');
  }, []);

  // Mock socket actions
  const socketConnected = false;
  const socketConnect = useCallback(() => {
    console.log('Mock: Connecting socket');
  }, []);
  const socketDisconnect = useCallback(() => {
    console.log('Mock: Disconnecting socket');
  }, []);
  const updatePresence = useCallback(() => {
    console.log('Mock: Updating presence');
  }, []);
  const startTyping = useCallback(() => {
    console.log('Mock: Starting typing');
  }, []);
  const stopTyping = useCallback(() => {
    console.log('Mock: Stopping typing');
  }, []);

  // Load data on mount
  useEffect(() => {
    if (options.spaceId) {
      loadSpaceTasks();
    }
  }, [loadSpaceTasks]);

  useEffect(() => {
    if (options.boardId) {
      loadBoardTasks();
    }
  }, [loadBoardTasks]);

  return {
    // State
    tasks,
    columns,
    boards,
    currentTask,
    currentBoard,
    loading,
    error,
    filters,
    sortBy,
    searchQuery,
    dragState,
    
    // Computed values
    tasksByColumn,
    filteredTasks,
    taskStats,
    
    // Actions
    loadSpaceTasks,
    loadBoardTasks,
    addTask,
    editTask,
    moveTaskToColumn,
    removeTask,
    addColumn,
    editColumn,
    removeColumn,
    reorderColumnsAction,
    selectTask,
    selectBoard,
    updateFilters,
    updateSortBy,
    updateSearchQuery,
    resetFilters,
    
    // Drag and drop
    startDraggingTask,
    startDraggingColumn,
    setDragTargetColumn,
    endDragging,
    
    // Utility functions
    reorderTasks,
    moveTaskBetweenColumns,
    reorderColumns,
    
    // Socket state
    socketConnected,
    socketConnect,
    socketDisconnect,
    
    // User presence
    updatePresence,
    startTyping,
    stopTyping,
  };
};
