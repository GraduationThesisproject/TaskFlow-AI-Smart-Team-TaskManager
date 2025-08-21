import { useState, useEffect } from 'react';
import { TEST_WORKSPACE, TEST_WORKSPACE_ENDPOINTS } from '../utils/testWorkspace';
import { WorkspaceService, SpaceService, BoardService, TaskService } from '../services';

/**
 * Custom hook for working with the test workspace
 * Provides easy access to workspace, spaces, boards, and tasks
 */
export const useTestWorkspace = () => {
  const [workspace, setWorkspace] = useState<any>(null);
  const [spaces, setSpaces] = useState<any[]>([]);
  const [boards, setBoards] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load workspace data
  const loadWorkspace = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await WorkspaceService.getWorkspace(TEST_WORKSPACE.ID);
      setWorkspace(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workspace');
    } finally {
      setLoading(false);
    }
  };

  // Load spaces within the workspace
  const loadSpaces = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await SpaceService.getSpacesByWorkspace(TEST_WORKSPACE.ID);
      setSpaces(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load spaces');
    } finally {
      setLoading(false);
    }
  };

  // Load boards within a space
  const loadBoards = async (spaceId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await BoardService.getBoardsBySpace(spaceId);
      setBoards(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load boards');
    } finally {
      setLoading(false);
    }
  };

  // Load tasks within a board
  const loadTasks = async (boardId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await TaskService.getTasks({ boardId });
      setTasks(response.data?.items || response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  // Load complete hierarchy
  const loadCompleteHierarchy = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load workspace
      await loadWorkspace();
      
      // Load spaces
      await loadSpaces();
      
      // Load boards for first space if available
      if (spaces.length > 0) {
        await loadBoards(spaces[0]._id);
        
        // Load tasks for first board if available
        if (boards.length > 0) {
          await loadTasks(boards[0]._id);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load complete hierarchy');
    } finally {
      setLoading(false);
    }
  };

  // Clear all data
  const clearData = () => {
    setWorkspace(null);
    setSpaces([]);
    setBoards([]);
    setTasks([]);
    setError(null);
  };

  return {
    // Data
    workspace,
    spaces,
    boards,
    tasks,
    loading,
    error,
    
    // Actions
    loadWorkspace,
    loadSpaces,
    loadBoards,
    loadTasks,
    loadCompleteHierarchy,
    clearData,
    
    // Constants
    TEST_WORKSPACE,
    TEST_WORKSPACE_ENDPOINTS
  };
};
