import { useSelector, useDispatch } from 'react-redux';
import type { Space } from '../types/space.types';
import type { RootState } from '../store';
import {
  fetchSpace,
  fetchSpacesByWorkspace,
  createSpace,
  updateSpace,
  deleteSpace,
  getSpaceMembers,
  addSpaceMember,
  removeSpaceMember,
  archiveSpace as archiveSpaceThunk,
  unarchiveSpace as unarchiveSpaceThunk,
  setCurrentSpace
} from '../store/slices/spaceSlice';

export const useSpaces = () => {
  const dispatch = useDispatch();
  
  // Select state from Redux store
  const {
    spaces,
    currentSpace,
    loading,
    error
  } = useSelector((state: RootState) => state.spaces);

  // API actions
  const loadSpace = (spaceId: string) => {
    dispatch(fetchSpace(spaceId) as any);
  };

  const loadSpacesByWorkspace = (workspaceId: string) => {
    dispatch(fetchSpacesByWorkspace(workspaceId) as any);
  };

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

  const archiveSpace = async (spaceId: string) => {
    try {
      await dispatch(archiveSpaceThunk(spaceId) as any).unwrap();
    } catch (error) {
      console.error('Failed to archive space:', error);
      throw error;
    }
  };

  const unarchiveSpace = async (spaceId: string) => {
    try {
      await dispatch(unarchiveSpaceThunk(spaceId) as any).unwrap();
    } catch (error) {
      console.error('Failed to unarchive space:', error);
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

  const selectSpace = (space: Space | null) => {
    dispatch(setCurrentSpace(space));
  };

  // Computed values
  const activeSpaces = spaces.filter(space => space.isActive && !space.isArchived);
  const archivedSpaces = spaces.filter(space => space.isArchived);

  const getSpacesByWorkspace = (workspaceId: string) => {
    return spaces.filter(space => space.workspace === workspaceId);
  };

  const getActiveSpacesByWorkspace = (workspaceId: string) => {
    return getSpacesByWorkspace(workspaceId).filter(space => space.isActive && !space.isArchived);
  };

  return {
    // State
    spaces,
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
    archiveSpace,
    unarchiveSpace,
    loadSpaceMembers,
    addMember,
    removeMember,
    selectSpace,

    // Computed selectors
    getSpacesByWorkspace,
    getActiveSpacesByWorkspace,
  };
};
