import { useAppSelector, useAppDispatch } from '../store';
import { useCallback, useRef } from 'react';
import type { Space } from '../types/space.types';
import {
  fetchSpace,
  fetchSpacesByWorkspace,
  createSpace,
  updateSpace,
  deleteSpace,
  getSpaceMembers,
  addSpaceMember,
  removeSpaceMember,
  setCurrentSpace,
  archiveSpace,
  unarchiveSpace,
  permanentDeleteSpace,
  clearLoading,
  clearSpaces
} from '../store/slices/spaceSlice';

export const useSpaces = () => {
  const dispatch = useAppDispatch();
  const loadingRef = useRef<Set<string>>(new Set());
  
  // Select state from Redux store
  const {
    spaces,
    currentSpace,
    currentWorkspaceId,
    loading,
    error
  } = useAppSelector((state) => state.spaces);

  // Ensure spaces is always an array
  const safeSpaces = Array.isArray(spaces) ? spaces : [];

  // API actions
  const loadSpace = useCallback((spaceId: string) => {
    dispatch(fetchSpace(spaceId) as any);
  }, [dispatch]);

  const loadSpacesByWorkspace = useCallback((workspaceId: string) => {
    // Prevent multiple simultaneous calls for the same workspace
    if (loadingRef.current.has(workspaceId)) {
      console.log(`Already loading spaces for workspace ${workspaceId}, skipping...`);
      return;
    }
    
    // If we already have spaces for this workspace, don't reload
    if (currentWorkspaceId === workspaceId && safeSpaces.length > 0) {
      console.log(`Spaces already loaded for workspace ${workspaceId}, skipping...`);
      return;
    }
    
    console.log(`Loading spaces for workspace ${workspaceId}...`);
    loadingRef.current.add(workspaceId);
    
    // Clear any previous errors
    dispatch(clearLoading());
    
    // Add timeout to prevent stuck loading states
    const timeoutId = setTimeout(() => {
      console.warn(`Timeout loading spaces for workspace ${workspaceId}`);
      loadingRef.current.delete(workspaceId);
      dispatch(clearLoading());
    }, 10000); // 10 second timeout
    
    dispatch(fetchSpacesByWorkspace(workspaceId) as any)
      .finally(() => {
        clearTimeout(timeoutId);
        loadingRef.current.delete(workspaceId);
        console.log(`Finished loading spaces for workspace ${workspaceId}`);
      });
  }, [dispatch, currentWorkspaceId, safeSpaces.length]);

  const addSpace = async (spaceData: any) => {
    try {
      await dispatch(createSpace(spaceData) as any).unwrap();
    } catch (error) {
      console.error('Failed to create space:', error);
      throw error;
    }
  };

  const editSpace = async (spaceId: string, spaceData: any) => {
    try {
      await dispatch(updateSpace({ id: spaceId, spaceData }) as any).unwrap();
    } catch (error) {
      console.error('Failed to update space:', error);
      throw error;
    }
  };

  const removeSpace = async (spaceId: string) => {
    try {
      await dispatch(deleteSpace(spaceId) as any).unwrap();
    } catch (error) {
      console.error('Failed to delete space:', error);
      throw error;
    }
  };

  const loadSpaceMembers = async (spaceId: string) => {
    try {
      await dispatch(getSpaceMembers(spaceId) as any).unwrap();
    } catch (error) {
      console.error('Failed to load space members:', error);
      throw error;
    }
  };

  const addMember = async (spaceId: string, userId: string, role: string) => {
    try {
      await dispatch(addSpaceMember({ spaceId, userId, role }) as any).unwrap();
    } catch (error) {
      console.error('Failed to add space member:', error);
      throw error;
    }
  };

  const removeMember = async (spaceId: string, memberId: string) => {
    try {
      await dispatch(removeSpaceMember({ spaceId, memberId }) as any).unwrap();
    } catch (error) {
      console.error('Failed to remove space member:', error);
      throw error;
    }
  };

  const selectSpace = useCallback((space: Space | null) => {
    dispatch(setCurrentSpace(space));
  }, [dispatch]);

  const clearSpacesData = useCallback(() => {
    dispatch(clearSpaces());
    loadingRef.current.clear();
  }, [dispatch]);

  const retryLoadSpaces = useCallback((workspaceId: string) => {
    console.log(`Retrying load spaces for workspace ${workspaceId}...`);
    // Clear any existing data and retry
    dispatch(clearSpaces());
    loadingRef.current.clear();
    loadSpacesByWorkspace(workspaceId);
  }, [dispatch, loadSpacesByWorkspace]);

  const archiveSpaceById = async (spaceId: string) => {
    try {
      await dispatch(archiveSpace(spaceId) as any).unwrap();
    } catch (error) {
      console.error('Failed to archive space:', error);
      throw error;
    }
  };

  const unarchiveSpaceById = async (spaceId: string) => {
    try {
      await dispatch(unarchiveSpace(spaceId) as any).unwrap();
    } catch (error) {
      console.error('Failed to unarchive space:', error);
      throw error;
    }
  };

  const permanentDeleteSpaceById = async (spaceId: string) => {
    try {
      await dispatch(permanentDeleteSpace(spaceId) as any).unwrap();
    } catch (error) {
      console.error('Failed to permanently delete space:', error);
      throw error;
    }
  };

  // Computed values
  const activeSpaces = safeSpaces.filter(space => space.isActive && !space.isArchived);
  const archivedSpaces = safeSpaces.filter(space => space.isArchived);

  const getSpacesByWorkspace = useCallback((workspaceId: string) => {
    return safeSpaces.filter(space => space.workspace === workspaceId);
  }, [safeSpaces]);

  const getActiveSpacesByWorkspace = useCallback((workspaceId: string) => {
    return getSpacesByWorkspace(workspaceId).filter(space => space.isActive && !space.isArchived);
  }, [getSpacesByWorkspace]);

  const getArchivedSpacesByWorkspace = useCallback((workspaceId: string) => {
    return getSpacesByWorkspace(workspaceId).filter(space => space.isArchived);
  }, [getSpacesByWorkspace]);

  return {
    // State
    spaces: safeSpaces,
    currentSpace,
    loading,
    error,
    activeSpaces,
    archivedSpaces,

    // Actions
    loadSpace,
    loadSpacesByWorkspace,
    addSpace,
    editSpace,
    removeSpace,
    loadSpaceMembers,
    addMember,
    removeMember,
    selectSpace,
    archiveSpaceById,
    unarchiveSpaceById,
    permanentDeleteSpaceById,
    clearSpacesData,
    retryLoadSpaces,

    // Computed selectors
    getSpacesByWorkspace,
    getActiveSpacesByWorkspace,
    getArchivedSpacesByWorkspace,
  };
};
