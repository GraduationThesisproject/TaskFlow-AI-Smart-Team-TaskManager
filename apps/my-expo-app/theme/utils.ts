import { Theme } from './types';

// Utility functions for working with themes
export const createThemedStyles = <T extends Record<string, any>>(
  styleFactory: (theme: Theme) => T
) => styleFactory;

// Helper function to get priority color
export const getPriorityColor = (priority: string, theme: Theme): string => {
  switch (priority.toLowerCase()) {
    case 'very high':
      return theme.colors.priorityVeryHigh;
    case 'high':
      return theme.colors.priorityHigh;
    case 'medium':
      return theme.colors.priorityMedium;
    case 'low':
      return theme.colors.priorityLow;
    default:
      return theme.colors.priorityLow;
  }
};

// Helper function to get status color
export const getStatusColor = (status: string, theme: Theme): string => {
  switch (status.toLowerCase()) {
    case 'success':
    case 'completed':
    case 'done':
      return theme.colors.success;
    case 'warning':
    case 'in progress':
      return theme.colors.warning;
    case 'error':
    case 'failed':
      return theme.colors.error;
    case 'info':
    case 'pending':
      return theme.colors.info;
    default:
      return theme.colors.textMuted;
  }
};
