import { getTestWorkspaceId } from '../config/env';

/**
 * Utility functions for working with the test workspace
 * This makes it easy to test spaces, boards, and tasks within the test workspace
 */

export const TEST_WORKSPACE = {
  ID: getTestWorkspaceId(),
  SHORT_ID: getTestWorkspaceId().slice(-8), // Last 8 characters for display
  NAME: 'Test Workspace'
};

/**
 * Get the test workspace ID
 */
export function getTestWorkspaceIdUtil(): string {
  return TEST_WORKSPACE.ID;
}

/**
 * Get a shortened version of the test workspace ID for display
 */
export function getTestWorkspaceShortId(): string {
  return TEST_WORKSPACE.SHORT_ID;
}

/**
 * Check if a given workspace ID is the test workspace
 */
export function isTestWorkspace(workspaceId: string): boolean {
  return workspaceId === TEST_WORKSPACE.ID;
}

/**
 * Get test workspace info object
 */
export function getTestWorkspaceInfo() {
  return {
    ...TEST_WORKSPACE,
    isTest: true
  };
}

/**
 * Common API endpoints for the test workspace
 */
export const TEST_WORKSPACE_ENDPOINTS = {
  WORKSPACE: `/api/workspaces/${TEST_WORKSPACE.ID}`,
  SPACES: `/api/spaces?workspace=${TEST_WORKSPACE.ID}`,
  // These will be populated when you have space and board IDs
  SPACE: (spaceId: string) => `/api/spaces/${spaceId}`,
  BOARDS: (spaceId: string) => `/api/boards?space=${spaceId}`,
  BOARD: (boardId: string) => `/api/boards/${boardId}`,
  TASKS: (boardId: string) => `/api/tasks?boardId=${boardId}`,
  TASK: (taskId: string) => `/api/tasks/${taskId}`
};
