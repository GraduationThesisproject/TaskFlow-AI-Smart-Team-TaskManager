import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { Task } from '../slices/taskSlice';

// Base selectors
export const selectTasks = (state: RootState) => state.tasks.tasks;
export const selectCurrentTask = (state: RootState) => state.tasks.currentTask;
export const selectTaskLoading = (state: RootState) => state.tasks.loading;
export const selectTaskError = (state: RootState) => state.tasks.error;
export const selectTaskFilters = (state: RootState) => state.tasks.filters;
export const selectTaskSortBy = (state: RootState) => state.tasks.sortBy;
export const selectTaskSearchQuery = (state: RootState) => state.tasks.searchQuery;

// Filtered and sorted tasks
export const selectFilteredTasks = createSelector(
  [selectTasks, selectTaskFilters, selectTaskSortBy, selectTaskSearchQuery],
  (tasks, filters, sortBy, searchQuery) => {
    let filteredTasks = [...tasks];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredTasks = filteredTasks.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.category.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (filters.status.length > 0) {
      filteredTasks = filteredTasks.filter(task => filters.status.includes(task.status));
    }

    // Apply priority filter
    if (filters.priority.length > 0) {
      filteredTasks = filteredTasks.filter(task => filters.priority.includes(task.priority));
    }

    // Apply assignee filter
    if (filters.assignee.length > 0) {
      filteredTasks = filteredTasks.filter(task =>
        task.assignees.some(assignee => filters.assignee.includes(assignee))
      );
    }

    // Apply category filter
    if (filters.category.length > 0) {
      filteredTasks = filteredTasks.filter(task => filters.category.includes(task.category));
    }

    // Apply sorting
    filteredTasks.sort((a, b) => {
      const aValue = a[sortBy.field];
      const bValue = b[sortBy.field];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortBy.direction === 'asc' ? comparison : -comparison;
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        const comparison = aValue - bValue;
        return sortBy.direction === 'asc' ? comparison : -comparison;
      }

      return 0;
    });

    return filteredTasks;
  }
);

// Tasks grouped by status for Kanban view
export const selectTasksByStatus = createSelector(
  [selectFilteredTasks],
  (tasks) => {
    const grouped = {
      'To Do': [] as Task[],
      'In Progress': [] as Task[],
      'In Review': [] as Task[],
      'Completed': [] as Task[],
    };

    tasks.forEach(task => {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      }
    });

    return grouped;
  }
);

// Task statistics
export const selectTaskStats = createSelector(
  [selectTasks],
  (tasks) => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.status === 'Completed').length;
    const inProgress = tasks.filter(task => task.status === 'In Progress').length;
    const inReview = tasks.filter(task => task.status === 'In Review').length;
    const toDo = tasks.filter(task => task.status === 'To Do').length;

    return {
      total,
      completed,
      inProgress,
      inReview,
      toDo,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
    };
  }
);

// Unique values for filters
export const selectUniqueCategories = createSelector(
  [selectTasks],
  (tasks) => [...new Set(tasks.map(task => task.category))]
);

export const selectUniqueAssignees = createSelector(
  [selectTasks],
  (tasks) => [...new Set(tasks.flatMap(task => task.assignees))]
);

export const selectUniquePriorities = createSelector(
  [selectTasks],
  (tasks) => [...new Set(tasks.map(task => task.priority))]
);

// Tasks for timeline view (with start and end dates)
export const selectTimelineTasks = createSelector(
  [selectFilteredTasks],
  (tasks) => tasks.filter(task => task.startDate && task.endDate)
);

// High priority tasks
export const selectHighPriorityTasks = createSelector(
  [selectFilteredTasks],
  (tasks) => tasks.filter(task => task.priority === 'High' || task.priority === 'Very High')
);

// Overdue tasks
export const selectOverdueTasks = createSelector(
  [selectFilteredTasks],
  (tasks) => {
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(task => 
      task.dueDate < today && task.status !== 'Completed'
    );
  }
);
