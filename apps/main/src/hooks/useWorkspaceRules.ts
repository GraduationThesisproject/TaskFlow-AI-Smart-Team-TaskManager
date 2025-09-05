import React, { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { 
  fetchWorkspaceRules, 
  updateWorkspaceRules, 
  deleteWorkspaceRules 
} from '../store/slices/workspaceSlice';
import { workspaceRulesService } from '../services/workspaceRulesService';
import type { UpdateWorkspaceRulesData } from '../types/workspaceRules.types';

interface UseWorkspaceRulesOptions {
  autoFetch?: boolean;
  workspaceId?: string;
}

export const useWorkspaceRules = (options: UseWorkspaceRulesOptions = {}) => {
  const { autoFetch = false, workspaceId } = options;
  
  const dispatch = useAppDispatch();
  const rules = useAppSelector((state) => state.workspace.rules);
  const loading = useAppSelector((state) => state.workspace.rulesLoading);
  const error = useAppSelector((state) => state.workspace.error);

  // Fetch workspace rules
  const loadWorkspaceRules = useCallback(async (id?: string) => {
    const targetWorkspaceId = id || workspaceId;
    if (!targetWorkspaceId) {
      throw new Error('Workspace ID is required');
    }
    
    try {
      await dispatch(fetchWorkspaceRules(targetWorkspaceId)).unwrap();
    } catch (error) {
      console.error('Failed to load workspace rules:', error);
      throw error;
    }
  }, [dispatch, workspaceId]);

  // Update workspace rules
  const updateRules = useCallback(async (data: UpdateWorkspaceRulesData, id?: string) => {
    const targetWorkspaceId = id || workspaceId;
    if (!targetWorkspaceId) {
      throw new Error('Workspace ID is required');
    }
    
    try {
      const updatedRules = await dispatch(updateWorkspaceRules({ 
        workspaceId: targetWorkspaceId, 
        data 
      })).unwrap();
      return updatedRules;
    } catch (error) {
      console.error('Failed to update workspace rules:', error);
      throw error;
    }
  }, [dispatch, workspaceId]);

  // Upload workspace rules as PDF file
  const uploadRules = useCallback(async (file: File, id?: string) => {
    const targetWorkspaceId = id || workspaceId;
    if (!targetWorkspaceId) {
      throw new Error('Workspace ID is required');
    }
    
    try {
      const uploadedRules = await workspaceRulesService.uploadWorkspaceRules(targetWorkspaceId, file);
      // Update the Redux state with the new rules
      dispatch({ type: 'workspace/fetchWorkspaceRules/fulfilled', payload: uploadedRules });
      return uploadedRules;
    } catch (error) {
      console.error('Failed to upload workspace rules:', error);
      throw error;
    }
  }, [dispatch, workspaceId]);

  // Delete workspace rules (reset to default)
  const deleteRules = useCallback(async (id?: string) => {
    const targetWorkspaceId = id || workspaceId;
    if (!targetWorkspaceId) {
      throw new Error('Workspace ID is required');
    }
    
    try {
      await dispatch(deleteWorkspaceRules(targetWorkspaceId)).unwrap();
    } catch (error) {
      console.error('Failed to delete workspace rules:', error);
      throw error;
    }
  }, [dispatch, workspaceId]);

  // Auto-fetch rules when workspaceId changes
  React.useEffect(() => {
    if (autoFetch && workspaceId && !loading && !rules) {
      loadWorkspaceRules();
    }
  }, [autoFetch, workspaceId, loading, rules]); // Add loading and rules checks to prevent infinite loop

  return {
    rules,
    loading,
    error,
    loadWorkspaceRules,
    updateRules,
    uploadRules,
    deleteRules,
  };
};

export default useWorkspaceRules;
