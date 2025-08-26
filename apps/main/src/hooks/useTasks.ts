import { useSelector, useDispatch } from 'react-redux';
import type { Task } from '../types/task.types';
import type { RootState } from '../store';
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  moveTask,
  fetchTasksByColumn,
  fetchTasksBySpace,
  setCurrentTask,
  updateFilters,
  updateSort,
  updateSearchQuery,
  clearFilters
} from '../store/slices/taskSlice';

export const useTasks = () => {
  const dispatch = useDispatch();
  
  // Select state from Redux store
  const {
    tasks,
    currentTask,
    loading,
    error,
    filters,
    sortBy,
    searchQuery
  } = useSelector((state: RootState) => state.tasks);

  // Compute derived state
  const tasksByStatus = {
    'col1': tasks.filter(t => t.status === 'todo'),
    'col2': tasks.filter(t => t.status === 'in_progress'),
    'col3': tasks.filter(t => t.status === 'review'),
    'col4': tasks.filter(t => t.status === 'done'),
  };

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'done').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    inReview: tasks.filter(t => t.status === 'review').length,
    toDo: tasks.filter(t => t.status === 'todo').length,
    completionRate: tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100) : 0,
  };

  const uniqueCategories = Array.from(new Set(tasks.flatMap(t => t.tags || [])));
  const uniqueAssignees = Array.from(new Set(tasks.flatMap(t => t.assignees || [])));
  const uniquePriorities = Array.from(new Set(tasks.map(t => t.priority)));
  const timelineTasks = tasks.filter(t => t.dueDate);
  const highPriorityTasks = tasks.filter(t => t.priority === 'high' || t.priority === 'critical');
  const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date());

  // API actions
  const loadTasks = (boardId: string) => {
    dispatch(fetchTasks(boardId) as any);
  };

  const loadTaskById = (taskId: string) => {
    // Find task in current tasks array
    const task = tasks.find(t => t._id === taskId);
    if (task) {
      dispatch(setCurrentTask(task));
    }
  };

  const addTask = async (taskData: Partial<Task>) => {
    try {
      await dispatch(createTask(taskData as any) as any).unwrap();
    } catch (error) {
      console.error('Failed to create task:', error);
      throw error;
    }
  };

  const editTask = async (taskId: string, taskData: Partial<Task>) => {
    try {
      await dispatch(updateTask({ id: taskId, taskData: taskData as any }) as any).unwrap();
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    }
  };

  const removeTask = async (taskId: string) => {
    try {
      await dispatch(deleteTask(taskId) as any).unwrap();
    } catch (error) {
      console.error('Failed to delete task:', error);
      throw error;
    }
  };

  const selectTask = (task: Task | null) => {
    dispatch(setCurrentTask(task));
  };

  const updateFiltersLocal = (newFilters: Partial<typeof filters>) => {
    dispatch(updateFilters(newFilters));
  };

  const updateSortBy = (field: keyof Task, direction: 'asc' | 'desc') => {
    dispatch(updateSort({ field, direction }));
  };

  const updateSearchQueryLocal = (query: string) => {
    dispatch(updateSearchQuery(query));
  };

  const resetFiltersLocal = () => {
    dispatch(clearFilters());
  };

  // Additional API actions
  const loadTasksByColumn = (columnId: string) => {
    dispatch(fetchTasksByColumn(columnId) as any);
  };

  const loadTasksBySpace = (spaceId: string) => {
    dispatch(fetchTasksBySpace(spaceId) as any);
  };

  return {
    // State
    tasks,
    currentTask,
    loading,
    error,
    filters,
    sortBy,
    searchQuery,
    tasksByStatus,
    taskStats,
    uniqueCategories,
    uniqueAssignees,
    uniquePriorities,
    timelineTasks,
    highPriorityTasks,
    overdueTasks,

    // Actions
    loadTasks,
    loadTaskById,
    loadTasksByColumn,
    loadTasksBySpace,
    addTask,
    editTask,
    removeTask,
    selectTask,
    updateFilters: updateFiltersLocal,
    updateSortBy,
    updateSearchQuery: updateSearchQueryLocal,
    resetFilters: resetFiltersLocal,
  };
};
