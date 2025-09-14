import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert, useWindowDimensions, View as RNView, Modal, Pressable, TextInput, Switch, ActivityIndicator, Image, Animated } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { View, Text, Card } from '@/components/Themed';
import BoardCard from '@/components/common/BoardCard';
import { useThemeColors } from '@/components/ThemeProvider';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchMembers } from '@/store/slices/workspaceSlice';
import { TextStyles } from '@/constants/Fonts';
import { BoardService } from '@/services/boardService';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { useSpaces as useSpacesHook } from '@/hooks/useSpaces';
import SpaceHeader from '@/components/space/SpaceHeader';
import SpaceRightSidebar from '@/components/space/SpaceRightSidebar';
import Sidebar from '@/components/navigation/Sidebar';
import { MobileAlertProvider, useMobileAlert } from '@/components/common/MobileAlertProvider';
import { BannerProvider, useBanner } from '@/components/common/BannerProvider';
import CreateSpaceModal from '@/components/common/CreateSpaceModal';
import CreateBoardModal from '@/components/common/CreateBoardModal';

function SpaceBoardsScreenContent() {
  const colors = useThemeColors();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const dispatch = useAppDispatch();
  const { width } = useWindowDimensions();
  const isWide = width >= 768; // show right sidebar on tablets/landscape
  const { showSuccess, showError, showWarning, showInfo, showConfirm } = useMobileAlert();
  const { showSuccess: showBannerSuccess, showError: showBannerError, showWarning: showBannerWarning, showInfo: showBannerInfo } = useBanner();

  const { selectedSpace, members: workspaceMembers, currentWorkspace } = useAppSelector((s: any) => s.workspace);
  const { user: authUser } = useAppSelector((s: any) => s.auth);
  const { workspaces: wsList } = useAppSelector((s: any) => s.workspace);
  const currentUserId = useMemo(() => {
    // console.log('=== AUTH DEBUG ===');
    // console.log('Raw authUser:', JSON.stringify(authUser, null, 2));
    // console.log('authUser?.user:', authUser?.user);
    // console.log('authUser?._id:', authUser?._id);
    // console.log('authUser?.id:', authUser?.id);
    
    const userId = authUser?.user?._id || authUser?.user?.id || authUser?._id || authUser?.id;
    // console.log('Final userId:', userId);
    return String(userId || '');
  }, [authUser]);
  
  // FIXED: Use currentSpace from spaceSlice instead of selectedSpace from workspaceSlice
  // This ensures UI and member operations use the same space data
  const { loadSpaceMembers, addMember, removeMember, currentSpace, loadSpace } = useSpacesHook();
  const space = currentSpace; // Use currentSpace instead of selectedSpace
  
  const { loadSpaces } = useWorkspaces({ autoFetch: false });

  // Include all members (including owner). We'll prevent adding yourself via UI guards.
  const displayMembers = useMemo(() => {
    const members = Array.isArray(workspaceMembers) ? workspaceMembers : [];
    // console.log('Workspace members from Redux:', members.map(m => ({
    //   id: String(m?.user?._id || m?.user?.id || m?._id || m?.id || ''),
    //   role: m?.role,
    //   name: m?.user?.name || m?.name,
    //   email: m?.user?.email || m?.email
    // })));
    return members;
  }, [workspaceMembers]);

  // Precompute owner IDs for disable logic - use same logic as workspace index
  const ownerIds = useMemo(() => {
    const ids = new Set<string>();
    // console.log('Computing ownerIds from workspace data...');
    
    // console.log('Redux currentWorkspace:', currentWorkspace);
    // console.log('Redux workspaces list:', wsList);
    
    // Find current workspace
    const currentWs = currentWorkspace || (Array.isArray(wsList) ? wsList.find((ws: any) => {
      const wsId = String(ws?._id || ws?.id || '');
      const currentWsId = String(selectedSpace?.workspaceId || selectedSpace?.workspace?._id || selectedSpace?.workspace?.id || '');
      return wsId === currentWsId;
    }) : null);
    
    // console.log('Current workspace found:', currentWs);
    
    // Method 1: Check workspace owner field (same as workspace index)
    const ownerId = (currentWs?.owner?._id || currentWs?.owner?.id || currentWs?.ownerId);
    if (ownerId) {
      const ownerIdStr = String(ownerId);
      ids.add(ownerIdStr);
      // console.log('Added workspace owner ID:', ownerIdStr);
    }
    
    // Method 2: Check members list for owner role (same as workspace index)
    const memberList: any[] = Array.isArray(displayMembers) ? displayMembers : [];
    memberList.forEach((m: any) => {
      const mid = m?.user?._id || m?.user?.id || m?.userId || m?._id || m?.id;
      const role = String(m?.role || '').toLowerCase();
      if (mid && role === 'owner') {
        const memberIdStr = String(mid);
        ids.add(memberIdStr);
        // console.log('Added member owner ID:', memberIdStr, 'for member:', m?.user?.name || m?.name);
      }
    });
    
    // console.log('Final ownerIds:', Array.from(ids));
    return ids;
  }, [displayMembers, selectedSpace?.workspaceId, selectedSpace?.workspace?._id, selectedSpace?.workspace?.id, currentWorkspace?.owner?._id, currentWorkspace?.owner?.id, currentWorkspace?.ownerId, wsList]);

  // Set of already-added member IDs (space members)
  const addedMemberIdSet = useMemo(() => {
    const set = new Set<string>();
    const members = (currentSpace as any)?.members || [];
    (Array.isArray(members) ? members : []).forEach((m: any) => {
      const id = String(m?.user?._id || m?.user?.id || m?._id || m?.id || '');
      if (id) set.add(id);
    });
    return set;
  }, [currentSpace]);

  // Optimistic: track IDs just added so they disappear immediately from addable list
  const [tempAddedIds, setTempAddedIds] = useState<Set<string>>(new Set());

  // Merge server-known added members with optimistic temporary IDs
  const effectiveAddedMemberIdSet = useMemo(() => {
    const merged = new Set<string>(addedMemberIdSet);
    tempAddedIds.forEach((id) => merged.add(id));
    return merged;
  }, [addedMemberIdSet, tempAddedIds]);

  // Actual members already added to the current space (for the "Added Members" list)
  // Show all valid space members (owner + any members in the space)
  const spaceMembers = useMemo(() => {
    if (!currentSpace) return [];
    const members = (currentSpace as any)?.members;
    const spaceMembersList = Array.isArray(members) ? members : [];
    
    // Filter to show all valid space members
    const filteredSpaceMembers = spaceMembersList.filter(spaceMember => {
      const hasValidUser = spaceMember?.user && (spaceMember.user._id || spaceMember.user.id);
      const hasValidName = spaceMember?.user?.name || spaceMember?.user?.email || spaceMember?.name || spaceMember?.email;
      const hasValidEmail = spaceMember?.user?.email || spaceMember?.email;
      
      // Only include members that have valid user data
      if (!hasValidUser || !hasValidName || !hasValidEmail) {
        // Silently filter out invalid members (no need to log every time)
        return false;
      }
      
      // Include all valid space members (owner or added)
      return true;
    });
    
    // Return space members with their original roles (no workspace role merging to avoid circular dependency)
    const enrichedSpaceMembers = filteredSpaceMembers.map(spaceMember => {
      return {
        ...spaceMember,
        // Keep the original space role
        role: spaceMember?.role || 'member',
        // Also update the nested user object if it exists
        user: spaceMember?.user ? {
          ...spaceMember.user,
          role: spaceMember?.role || 'member'
        } : spaceMember?.user
      };
    });
    
    // Debug logging (commented out for performance)
    // console.log('=== SPACE MEMBERS FILTERING DEBUG ===');
    // console.log('Original space members count:', spaceMembersList.length);
    // console.log('Filtered space members count (owner + explicitly added):', filteredSpaceMembers.length);
    // console.log('Final enriched space members count:', enrichedSpaceMembers.length);
    // console.log('=== END FILTERING DEBUG ===');
    
    return enrichedSpaceMembers;
  }, [currentSpace?.members]);

  // Members that can be added to THIS SPECIFIC SPACE (exclude workspace owners and already added members)
  const addableMembers = useMemo(() => {
    const list = Array.isArray(displayMembers) ? displayMembers : [];
    const spaceMembersList = Array.isArray(currentSpace?.members) ? currentSpace.members : [];
    
    const filtered = list.filter((m: any) => {
      const memberId = String(m?.user?._id || m?.user?.id || m?._id || m?.id || '');
      const isSelf = currentUserId && memberId === currentUserId;
      const isOwner = ownerIds.has(memberId);
      
      // Check if member is already in THIS SPECIFIC SPACE
      const isAlreadyInSpace = spaceMembersList.some((spaceMember: any) => {
        const spaceMemberId = String(spaceMember?.user?._id || spaceMember?.user?.id || spaceMember?._id || spaceMember?.id || '');
        return spaceMemberId === memberId;
      });
      
      if (isSelf) {
        return false;
      }
      
      if (isOwner) {
        return false;
      }
      
      if (isAlreadyInSpace) {
        return false;
      }
      
      return true;
    });
    
    return filtered;
  }, [displayMembers, ownerIds, currentSpace?.members, currentUserId]);

  // Check if current user is admin or owner (can manage members) - use same logic as workspace index
  const canManageMembers = useMemo(() => {
    // Debug logging (commented out for performance)
    // console.log('=== Permission Check ===');
    // console.log('currentUserId:', currentUserId);
    // console.log('ownerIds:', Array.from(ownerIds));
    
    // Temporary: If currentUserId is empty, try to find the user from the raw space members
    let effectiveUserId = currentUserId;
    if (!effectiveUserId) {
      // Look for the current user in the space members (they should be there as owner)
      const spaceMembersList = Array.isArray(currentSpace?.members) ? currentSpace.members : [];
      const currentUserInSpace = spaceMembersList.find((m: any) => {
        const memberId = String(m?.user?._id || m?.user?.id || m?._id || m?.id || '');
        return memberId && ownerIds.has(memberId);
      });
      
      if (currentUserInSpace) {
        effectiveUserId = String((currentUserInSpace as any)?.user?._id || (currentUserInSpace as any)?.user?.id || (currentUserInSpace as any)?._id || (currentUserInSpace as any)?.id || '');
        // console.log('Found current user in space members, using ID:', effectiveUserId);
      }
    }
    
    if (!effectiveUserId) {
      // console.log('No effectiveUserId - returning false');
      return false;
    }
    
    // Method 1: Check if user is in ownerIds (workspace owner)
    const isWorkspaceOwner = ownerIds.has(effectiveUserId);
    // console.log('isWorkspaceOwner:', isWorkspaceOwner);
    if (isWorkspaceOwner) {
      // console.log('User is workspace owner - returning true');
      return true;
    }
    
    // Method 2: Check if user is workspace admin (same logic as workspace index)
    const userMember = displayMembers.find((m: any) => {
      const memberId = String(m?.user?._id || m?.user?.id || m?._id || m?.id || '');
      return memberId === effectiveUserId;
    });
    
    // console.log('userMember found:', userMember);
    const isAdmin = userMember?.role === 'admin';
    // console.log('isAdmin:', isAdmin, 'userMember.role:', userMember?.role);
    // console.log('Final canManageMembers result:', isAdmin);
    // console.log('=== End Permission Check ===');
    
    return isAdmin;
  }, [currentUserId, ownerIds, displayMembers, currentSpace?.members]);

  const [refreshing, setRefreshing] = useState(false);
  const lastLoadedSpaceId = useRef<string | null>(null);
  const [boards, setBoards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<'viewer' | 'editor' | 'admin'>('viewer');
  const [sidebarVisible, setSidebarVisible] = useState(false);
  
  // Legacy banner function - keeping for backward compatibility
  const showBanner = useCallback((type: 'success' | 'error', message: string) => {
    if (type === 'success') {
      showBannerSuccess(message);
    } else {
      showBannerError(message);
    }
  }, [showBannerSuccess, showBannerError]);

  // Grid sizing for 3 columns
  const [gridWidth, setGridWidth] = useState(0);
  const COLUMNS = 3;
  const GRID_GAP = 12; // must match styles.boardGrid gap
  
  const itemWidth = useMemo(() => {
    // Fallback estimate uses screen width minus content padding (16 * 2)
    const estimatedContainer = Math.max(0, width - 32);
    const containerW = gridWidth > 0 ? gridWidth : estimatedContainer;
    return containerW > 0
      ? Math.floor((containerW - GRID_GAP * (COLUMNS - 1)) / COLUMNS)
      : undefined;
  }, [gridWidth, width]);

  // Only show first 12 boards here; show full list in allboards screen
  const VISIBLE_MAX = 12;
  const visibleBoards = useMemo(() => {
    return Array.isArray(boards) ? boards.slice(0, VISIBLE_MAX) : [];
  }, [boards]);

  // Create Board modal state
  const [createVisible, setCreateVisible] = useState(false);
  const [creating, setCreating] = useState(false);

  // Create Space modal state
  const [createSpaceVisible, setCreateSpaceVisible] = useState(false);
  const [creatingSpace, setCreatingSpace] = useState(false);


  // If navigated directly with an id param and no selectedSpace in store, fetch it.

  const loadBoards = useCallback(async (force = false) => {
    const spaceId = space?._id;
    if (!spaceId) return;
    if (!force && lastLoadedSpaceId.current === String(spaceId)) return;
    lastLoadedSpaceId.current = String(spaceId);
    setLoading(true);
    setError(null);
    try {
      const resp = await BoardService.getBoardsBySpace(spaceId);
      const payload: any = resp;
      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data?.boards)
        ? payload.data.boards
        : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.boards)
        ? payload.boards
        : [];
      setBoards(list || []);
      // Also refresh spaces in workspace via hook so counts stay in sync when navigating back
      const wsId = String(space?.workspace || '').trim();
      if (wsId) {
        loadSpaces(wsId);
      }
    } catch (e: any) {
      console.warn('Failed to load boards', e);
      setError(e?.message || 'Failed to load boards');
    } finally {
      setLoading(false);
    }
  }, [space?._id, loadSpaces]);

  useEffect(() => {
    loadBoards(false);
  }, [space?._id]); // Only depend on space ID, not the entire loadBoards function

  useEffect(() => {
    const spaceId = String(space?._id || '');
    if (spaceId && spaceId !== lastLoadedSpaceId.current) {
      loadSpaceMembers(spaceId);
    }
  }, [space?._id]); // Remove loadSpaceMembers from dependencies

  // Also ensure workspace members are loaded when space changes
  useEffect(() => {
    const workspaceId = String(space?.workspace || '');
    if (workspaceId) {
      // Dispatch fetchMembers to ensure workspace members are loaded
      dispatch(fetchMembers({ id: workspaceId }));
    }
  }, [space?.workspace]); // Remove dispatch from dependencies

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadBoards(true);
      const spaceId = String(space?._id || '');
      if (spaceId) await loadSpaceMembers(spaceId);
    } finally {
      setRefreshing(false);
    }
  }, [space?._id, loadBoards, loadSpaceMembers]);

  const openCreateBoard = useCallback(() => {
    console.log('🎯 openCreateBoard called');
    setCreateVisible(true);
  }, []);
  
  const resetCreateState = useCallback(() => {
    // Reset handled by modal component
  }, []);

  // Create Space handlers
  const openCreateSpace = useCallback(() => setCreateSpaceVisible(true), []);
  const handleCreateSpace = useCallback(async ({ name, description, visibility }: { name: string; description?: string; visibility: 'private' | 'public' }) => {
    if (!space?.workspace) return;
    
    try {
      setCreatingSpace(true);
      const workspaceId = space.workspace;
      
      // Import SpaceService dynamically to avoid circular dependency
      const { SpaceService } = await import('@/services/spaceService');
      
      await SpaceService.createSpace({
        name,
        description,
        workspaceId,
        settings: { isPrivate: visibility === 'private' },
      });
      
      // Refresh spaces in workspace
      if (workspaceId) {
        await loadSpaces(workspaceId);
      }
      
      setCreateSpaceVisible(false);
      showBannerSuccess('Space created successfully!');
    } catch (e: any) {
      console.warn('Failed to create space', e);
      showBannerError(e?.message || 'Failed to create space');
    } finally {
      setCreatingSpace(false);
    }
  }, [space?.workspace, loadSpaces, showBannerSuccess, showBannerError]);
  const submitCreateBoard = useCallback(async ({ name, description, type, visibility }: { 
    name: string; 
    description?: string; 
    type: 'kanban' | 'list' | 'calendar' | 'timeline'; 
    visibility: 'private' | 'public' 
  }) => {
    if (!space?._id) return;
    
    try {
      setCreating(true);
      const spaceId = space._id;
      const createResp = await BoardService.createBoard({
        name: name.trim(),
        description: description?.trim() || undefined,
        type,
        visibility,
        spaceId,
      });
      // Try to extract the created board for an optimistic UI update
      const payload: any = createResp;
      const createdBoard = (payload && payload.data && (payload.data.board || payload.data)) || payload.board || payload;
      if (createdBoard && (createdBoard._id || createdBoard.id)) {
        setBoards((prev) => [createdBoard, ...(Array.isArray(prev) ? prev : [])]);
      }
      setCreateVisible(false);
      resetCreateState();
      // Force reload to ensure we bypass the lastLoadedSpaceId guard and get server truth
      await loadBoards(true);
      // Refresh spaces via hook so Workspace list immediately reflects the new count
      const wsId = String(space?.workspace || '').trim();
      if (wsId) {
        loadSpaces(wsId);
      }
      showBannerSuccess('Board created successfully!');
    } catch (e: any) {
      console.warn('Failed to create board:', e?.response?.data || e);
      // Non-intrusive error banner
      showBannerError(e?.response?.data?.message || e?.message || 'Failed to create board');
    } finally {
      setCreating(false);
    }
  }, [space?._id, space?.workspace, loadBoards, loadSpaces, resetCreateState, showBannerSuccess, showBannerError]);

  // Simple handlers used by SpaceHeader/Sidebar
  const goMembers = useCallback(() => {
    console.log('🎯 goMembers called');
    // Toggle the space members sidebar
    setSidebarVisible(!sidebarVisible);
  }, [sidebarVisible]);
  
  const goSettings = useCallback(() => {
    console.log('🎯 goSettings called');
    router.push('/workspace/space/settings');
  }, [router]);

  // Member management functions - adds member to THIS SPECIFIC SPACE only
  const handleAddMember = useCallback(async (memberId: string, role: string = 'member') => {
    if (!space?._id) return;
    
    // Check if the user ID is valid
    if (!memberId || memberId === 'undefined' || memberId === 'null') {
      console.error('Invalid memberId:', memberId);
      return;
    }
    
    try {
      const spaceId = space._id;
      const spaceName = space.name;
      
      // Add member to THIS SPECIFIC SPACE only
      await addMember(spaceId, memberId, role);
      
      // Small delay to ensure backend processing
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Refresh space members for THIS SPACE
      await loadSpaceMembers(spaceId);
      
      // FIXED: Also refresh the spaces list to update member counts in workspace
      if (space?.workspace) {
        await loadSpaces(space.workspace);
      }
      
      // Show success message with space name for clarity
      showSuccess(`Member added to "${spaceName}" successfully`);
    } catch (error: any) {
      console.error('❌ Failed to add member:', error);
      showError(error?.message || 'Failed to add member');
    }
  }, [space?._id, space?.name, space?.workspace, addMember, loadSpaceMembers, loadSpaces, showSuccess, showError]);

  const handleRemoveMember = useCallback(async (memberId: string) => {
    if (!space?._id) return;
    
    try {
      const spaceId = space._id;
      console.log('=== REMOVE MEMBER DEBUG (Frontend) ===');
      console.log('spaceId:', spaceId);
      console.log('memberId (user ID):', memberId);
      console.log('API endpoint will be:', `/spaces/${spaceId}/members/${memberId}`);
      
      await removeMember(spaceId, memberId);
      
      // Refresh space members
      await loadSpaceMembers(spaceId);
      
      // FIXED: Also refresh the spaces list to update member counts in workspace
      if (space?.workspace) {
        await loadSpaces(space.workspace);
      }
      
      showSuccess('Member removed successfully');
    } catch (error: any) {
      console.error('Failed to remove member:', error);
      console.error('Error details:', {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        message: error?.message
      });
      
      // If it's a 404 error, the member doesn't exist on the backend
      if (error?.response?.status === 404) {
        console.log('Member not found on backend (404), refreshing data to sync with server');
        showSuccess('Member was already removed from the server');
        
        // Force refresh to get the latest state from backend
        const spaceId = space._id;
        await loadSpaceMembers(spaceId);
        await loadSpace(spaceId);
      } else {
        console.error('Unexpected error removing member:', error);
        showError(error?.message || 'Failed to remove member');
      }
    }
  }, [space?._id, space?.workspace, removeMember, loadSpaceMembers, loadSpaces, loadSpace, showSuccess, showError]);

  // Clean up invalid members (those with null user data or not in workspace)
  const cleanupInvalidMembers = useCallback(async () => {
    if (!space?._id) return;
    
    try {
      const spaceId = space._id;
      const members = (currentSpace as any)?.members || [];
      
      // Find invalid members (those with null user data or not in workspace)
      const invalidMembers = members.filter((spaceMember: any) => {
        const hasValidUser = spaceMember?.user && (spaceMember.user._id || spaceMember.user.id);
        const hasValidName = spaceMember?.user?.name || spaceMember?.user?.email || spaceMember?.name || spaceMember?.email;
        const hasValidEmail = spaceMember?.user?.email || spaceMember?.email;
        
        // Check if member exists in workspace
        const memberId = String(spaceMember?.user?._id || spaceMember?.user?.id || spaceMember?._id || spaceMember?.id || '');
        const existsInWorkspace = displayMembers.some(wsMember => {
          const wsMemberId = String(wsMember?.user?._id || wsMember?.user?.id || wsMember?._id || wsMember?.id || '');
          return wsMemberId === memberId;
        });
        
        return !hasValidUser || !hasValidName || !hasValidEmail || !existsInWorkspace;
      });
      
      if (invalidMembers.length === 0) {
        showBannerSuccess('No invalid members found');
        return;
      }
      
      // console.log('Found invalid members to clean up:', invalidMembers);
      
      let successCount = 0;
      let errorCount = 0;
      
      // Remove each invalid member
      for (const invalidMember of invalidMembers) {
        const memberId = String(invalidMember?._id || invalidMember?.id || '');
        if (memberId) {
          // console.log('Attempting to remove invalid member:', memberId);
          try {
            await removeMember(spaceId, memberId);
            successCount++;
          } catch (error: any) {
            console.warn(`Failed to remove member ${memberId} via API:`, error?.message);
            errorCount++;
            
            // If API fails with 404, try to remove from local state
            if (error?.response?.status === 404) {
              // console.log(`Member ${memberId} not found on backend, removing from local state`);
              // This will be handled by refreshing the space members
            }
          }
        }
      }
      
      // Refresh space members to get clean state from backend
      await loadSpaceMembers(spaceId);
      
      // Also refresh the space data to ensure we have the latest state
      if (errorCount > 0) {
        // console.log('Refreshing space data due to API errors');
        // Force refresh the space data
        await loadSpace(spaceId);
      }
      
      // Additional cleanup: Force refresh to sync with backend
      // console.log('Performing final refresh to sync with backend...');
      await loadSpaceMembers(spaceId);
      await loadSpace(spaceId);
      
      if (errorCount > 0) {
        showBannerSuccess(`Cleaned up ${successCount} member(s). ${errorCount} member(s) were already removed from backend.`);
      } else {
        showBannerSuccess(`Cleaned up ${successCount} invalid member(s)`);
      }
    } catch (error: any) {
      console.error('Failed to cleanup invalid members:', error);
      showBannerError(error?.message || 'Failed to cleanup invalid members');
    }
  }, [space?._id, currentSpace, displayMembers, removeMember, loadSpaceMembers, loadSpace, showBannerSuccess, showBannerError]);

  const onAddMembersToBoard = useCallback(async (ids: string[], role?: string) => {
    // Using Space-level membership via useSpaces hook as requested
    const spaceId = String(space?._id || '');
    if (!spaceId) return;
    try {
      // Add each selected member to the space with the specified role (default to 'viewer')
      const memberRole = role || 'viewer';
      await Promise.all(ids.map((uid) => addMember(spaceId, uid, memberRole as any)));
      // Optimistically mark them as added so they disappear immediately
      setTempAddedIds((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.add(id));
        return next;
      });
      // Refresh members from server
      await loadSpaceMembers(spaceId);
      
      // FIXED: Also refresh the spaces list to update member counts in workspace
      if (space?.workspace) {
        await loadSpaces(space.workspace);
      }
      
      // After server state is in, clear temporary IDs
      setTempAddedIds(new Set());
      // Member added successfully - no notification needed
    } catch (e: any) {
      showBannerError(e?.response?.data?.message || e?.message || 'Failed to add members');
    }
  }, [space?._id, space?.workspace, addMember, loadSpaceMembers, loadSpaces, showBannerError]);

  const onRemoveMemberFromSpace = useCallback(async (memberId: string) => {
    const spaceId = String(space?._id || '');
    if (!spaceId || !memberId) return;
    // Prevent removing owners or yourself via UI guards, but double-check here too
    if (ownerIds.has(memberId) || (currentUserId && memberId === currentUserId)) return;
    
    // Find the member to get their display name
    const member = spaceMembers.find((m: any) => {
      const id = String(m?.user?._id || m?.user?.id || m?._id || m?.id || '');
      return id === memberId;
    });
    
    const displayName = member?.user?.name || member?.name || member?.user?.email || member?.email || 'this member';
    
    showConfirm(
      'Remove Member',
      `Are you sure you want to remove ${displayName} from the space?`,
      async () => {
        try {
          await removeMember(spaceId, memberId);
          await loadSpaceMembers(spaceId);
          showBannerSuccess(`Member removed successfully from space`);
        } catch (e: any) {
          showBannerError(e?.response?.data?.message || e?.message || 'Failed to remove member');
        }
      }
    );
  }, [space?._id, ownerIds, currentUserId, spaceMembers, showConfirm, removeMember, loadSpaceMembers, showBannerSuccess, showBannerError]);

  const toggleMemberSelection = useCallback((id: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const onRefreshMembers = useCallback(async () => {
    const spaceId = String(space?._id || '');
    if (!spaceId) return;
    setRefreshing(true);
    try {
      await loadSpaceMembers(spaceId);
    } finally {
      setRefreshing(false);
    }
  }, [space?._id, loadSpaceMembers]);


  if (!space) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>Space</Text>
        </View>
        <View style={styles.centerBox}>
          <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'] }]}>Loading space…</Text>
        </View>
      </View>
    );
  }

  // Two-column layout on wide screens
  if (isWide) {
    return (
      <RNView style={{ flex: 1, flexDirection: 'row', backgroundColor: colors.background }}>
        <View style={{ flex: 1 }}>
          <SpaceHeader
            space={{
              ...space,
              members: spaceMembers,
              totalBoards: Array.isArray(boards) ? boards.length : (space?.stats?.totalBoards || 0),
              stats: { ...(space?.stats || {}), totalBoards: Array.isArray(boards) ? boards.length : (space?.stats?.totalBoards || 0) },
            }}
            onCreateBoard={openCreateBoard}
            onMembers={goMembers}
            onSettings={goSettings}
            onBackToWorkspace={() => router.push('/(tabs)/workspace')}
          />
          <ScrollView
            style={styles.content}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            {!!error && (
              <Card style={[styles.errorCard, { backgroundColor: colors.destructive }]}> 
                <Text style={[TextStyles.body.medium, { color: colors['destructive-foreground'] }]}>{error}</Text>
              </Card>
            )}
            {loading && !refreshing ? (
              <View style={styles.centerBox}>
                <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'] }]}>Loading boards…</Text>
              </View>
            ) : null}
            {!loading && (!boards || boards.length === 0) ? (
              <Card style={[styles.emptyCard, { backgroundColor: colors.card }]}> 
                <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'], marginBottom: 12 }]}>No boards yet. Here is a preview of how your board will look.</Text>
                {/* Preview board UI */}
                <RNView style={[styles.previewBoard, { borderColor: colors.border, backgroundColor: colors.background }]}> 
                  {/* Columns */}
                  {['To do', 'In progress', 'Done'].map((col) => (
                    <RNView key={col} style={styles.previewColumn}> 
                      <Text style={[TextStyles.caption.small, { color: colors.foreground, marginBottom: 6 }]} numberOfLines={1}>{col}</Text>
                      {/* Cards */}
                      <RNView style={[styles.previewCard, { backgroundColor: colors.card, borderColor: colors.border }]} />
                      <RNView style={[styles.previewCard, { backgroundColor: colors.card, borderColor: colors.border }]} />
                    </RNView>
                  ))}
                </RNView>
                <TouchableOpacity onPress={openCreateBoard} style={[styles.primaryBtn, { backgroundColor: colors.primary, marginTop: 16 }]}> 
                  <Text style={{ color: colors['primary-foreground'], fontWeight: '600' }}>Create your first board</Text>
                </TouchableOpacity>
              </Card>
            ) : (
              <View
                style={styles.boardGrid}
                onLayout={(e) => setGridWidth(e.nativeEvent.layout.width)}
              >
                {visibleBoards.map((b: any) => (
                  <BoardCard
                    key={b._id || b.id}
                    board={b}
                    style={[styles.gridItem, itemWidth ? { width: itemWidth } : null]}
                    onPress={() => router.push(`/(tabs)/board?boardId=${b._id || b.id}&boardName=${encodeURIComponent(b.name || 'Board')}`)}
                  />
                ))}
              </View>
            )}
            {/* View more button */}
            {!loading && Array.isArray(boards) && boards.length > VISIBLE_MAX && (
              <TouchableOpacity onPress={() => router.push('/(tabs)/workspace/space/allboards')} style={[styles.viewMoreBtn, { borderColor: colors.border }]}> 
                <Text style={[TextStyles.body.medium, { color: colors.primary }]}>View more</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
        <View style={{ width: 320, padding: 16 }}>
          {/* Sidebar: Available Members */}
          <Card style={[styles.sidebarCard, { backgroundColor: colors.card }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>Available Members</Text>
              <TouchableOpacity onPress={onRefreshMembers} style={[styles.ghostBtn, { borderColor: colors.border }]}> 
                <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>Refresh</Text>
              </TouchableOpacity>
            </View>
            {Array.isArray(addableMembers) && addableMembers.length > 0 ? (
              <RNView style={{ gap: 8 }}>
                {addableMembers.map((m: any) => {
                  const displayName = m?.user?.name || m?.name || m?.user?.email || m?.email || 'Member';
                  const email = m?.user?.email || m?.email || '';
                  const avatarUrl = m?.user?.avatar || m?.avatar || m?.profile?.avatar;
                  const memberId = String(m?.user?._id || m?.user?.id || m?._id || m?.id || '');
                  const isSelf = currentUserId && memberId === currentUserId;
                  const isOwner = ownerIds.has(memberId);
                  const isAlreadyAdded = effectiveAddedMemberIdSet.has(memberId);
                  const letter = String(displayName).charAt(0).toUpperCase();
                  return (
                    <View
                      key={memberId}
                      style={[
                        styles.memberItem,
                        { backgroundColor: colors.background, borderColor: colors.border },
                        (isSelf || isOwner || isAlreadyAdded) ? { opacity: 0.6 } : null,
                      ]}
                    >
                      {avatarUrl ? (
                        <Image source={{ uri: avatarUrl }} style={styles.memberAvatar} />
                      ) : (
                        <View style={[styles.memberAvatar, styles.memberAvatarPlaceholder, { backgroundColor: colors.muted }]}>
                          <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>{letter}</Text>
                        </View>
                      )}
                      <View style={{ flex: 1 }}>
                        <Text style={[TextStyles.body.medium, { color: colors.foreground }]} numberOfLines={1}>{displayName}</Text>
                        {!!email && (
                          <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]} numberOfLines={1}>{email}</Text>
                        )}
                        <Text style={[TextStyles.caption.small, { color: colors.primary }]}>{m.role || 'member'}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleAddMember(memberId, 'viewer')}
                        disabled={isSelf || isOwner || isAlreadyAdded}
                        style={[
                          styles.addButton,
                          { 
                            backgroundColor: colors.primary,
                            opacity: (isSelf || isOwner || isAlreadyAdded) ? 0.6 : 1
                          }
                        ]}
                      >
                        <Text style={[TextStyles.caption.small, { color: colors['primary-foreground'] }]}>+ Add to Space</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </RNView>
            ) : (
              <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'] }]}>No workspace members available.</Text>
            )}
          </Card>
          {/* Sidebar: Added Members (wide) */}
          {Array.isArray(spaceMembers) && spaceMembers.length > 0 && (
            <Card style={[styles.sidebarCard, { backgroundColor: colors.card, marginTop: 12 }] }>
              <Text style={[TextStyles.heading.h2, { color: colors.foreground, marginBottom: 12 }]}>Added Members ({spaceMembers.length})</Text>
              <RNView style={{ gap: 8 }}>
                {spaceMembers.map((m: any) => {
                  const displayName = m?.user?.name || m?.name || m?.user?.email || m?.email || 'Member';
                  const email = m?.user?.email || m?.email || '';
                  const avatarUrl = m?.user?.avatar || m?.avatar || m?.profile?.avatar;
                  const memberId = String(m?.user?._id || m?.user?.id || m?._id || m?.id || '');
                  const isSelf = currentUserId && memberId === currentUserId;
                  const isOwner = ownerIds.has(memberId);
                  const letter = String(displayName).charAt(0).toUpperCase();
                  return (
                    <View key={(memberId || email || displayName) + '-added'} style={[styles.memberItem, { backgroundColor: colors.background, borderColor: colors.border }]}> 
                      {avatarUrl ? (
                        <Image source={{ uri: avatarUrl }} style={styles.memberAvatar} />
                      ) : (
                        <View style={[styles.memberAvatar, styles.memberAvatarPlaceholder, { backgroundColor: colors.muted }]}>
                          <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>{letter}</Text>
                        </View>
                      )}
                      <View style={{ flex: 1 }}>
                        <Text style={[TextStyles.body.medium, { color: colors.foreground }]} numberOfLines={1}>{displayName}</Text>
                        {!!email && (
                          <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]} numberOfLines={1}>{email}</Text>
                        )}
                      </View>
                      <TouchableOpacity
                        onPress={() => onRemoveMemberFromSpace(memberId)}
                        disabled={!memberId || isSelf || isOwner}
                        style={[styles.ghostBtn, { borderColor: colors.border, opacity: (!memberId || isSelf || isOwner) ? 0.6 : 1 }]}
                      >
                        <Text style={[TextStyles.body.small, { color: colors.destructive }]}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </RNView>
            </Card>
          )}
        </View>
        
        {/* Create Space Modal */}
        <CreateSpaceModal
          visible={createSpaceVisible}
          onClose={() => setCreateSpaceVisible(false)}
          onSubmit={handleCreateSpace}
          submitting={creatingSpace}
        />
        
        {/* Create Board Modal */}
        <CreateBoardModal
          visible={createVisible}
          onClose={() => setCreateVisible(false)}
          onSubmit={submitCreateBoard}
          submitting={creating}
        />
      </RNView>
    );
  }

  // Stacked layout on phones
  return (
    <RNView style={{ flex: 1, flexDirection: 'row', backgroundColor: colors.background }}>
      <View style={{ flex: 1 }}>
        {/* MobileAlert notifications are handled by the provider */}
        <SpaceHeader
          space={{
            ...space,
            members: spaceMembers,
            totalBoards: Array.isArray(boards) ? boards.length : (space?.stats?.totalBoards || 0),
            stats: { ...(space?.stats || {}), totalBoards: Array.isArray(boards) ? boards.length : (space?.stats?.totalBoards || 0) },
          }}
          onCreateBoard={openCreateBoard}
          onMembers={goMembers}
          onSettings={goSettings}
          onBackToWorkspace={() => router.push('/(tabs)/workspace')}
        />
        <ScrollView
          style={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
        {!!error && (
          <Card style={[styles.errorCard, { backgroundColor: colors.destructive }]}> 
            <Text style={[TextStyles.body.medium, { color: colors['destructive-foreground'] }]}>{error}</Text>
          </Card>
        )}
        {loading && !refreshing ? (
          <View style={styles.centerBox}>
            <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'] }]}>Loading boards…</Text>
          </View>
        ) : null}
        {!loading && (!boards || boards.length === 0) ? (
          <Card style={[styles.emptyCard, { backgroundColor: colors.card }]}> 
            <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'], marginBottom: 12 }]}>No boards yet. Here is a preview of how your board will look.</Text>
            {/* Preview board UI */}
            <RNView style={[styles.previewBoard, { borderColor: colors.border, backgroundColor: colors.background }]}> 
              {/* Columns */}
              {['To do', 'In progress', 'Done'].map((col) => (
                <RNView key={col} style={styles.previewColumn}> 
                  <Text style={[TextStyles.caption.small, { color: colors.foreground, marginBottom: 6 }]} numberOfLines={1}>{col}</Text>
                  {/* Cards */}
                  <RNView style={[styles.previewCard, { backgroundColor: colors.card, borderColor: colors.border }]} />
                  <RNView style={[styles.previewCard, { backgroundColor: colors.card, borderColor: colors.border }]} />
                </RNView>
              ))}
            </RNView>
            <TouchableOpacity onPress={openCreateBoard} style={[styles.primaryBtn, { backgroundColor: colors.primary, marginTop: 16 }]}> 
              <Text style={{ color: colors['primary-foreground'], fontWeight: '600' }}>Create your first board</Text>
            </TouchableOpacity>
          </Card>
        ) : (
          <View
            style={styles.boardGrid}
            onLayout={(e) => setGridWidth(e.nativeEvent.layout.width)}
          >
            {visibleBoards.map((b: any) => (
              <BoardCard
                key={b._id || b.id}
                board={b}
                style={[styles.gridItem, itemWidth ? { width: itemWidth } : null]}
                onPress={() => router.push(`/(tabs)/board?boardId=${b._id || b.id}&boardName=${encodeURIComponent(b.name || 'Board')}`)}
              />
            ))}
          </View>
        )}
        {/* View more button (phone) */}
        {!loading && Array.isArray(boards) && boards.length > VISIBLE_MAX && (
          <TouchableOpacity onPress={() => router.push('/(tabs)/workspace/space/allboards')} style={[styles.viewMoreBtn, { borderColor: colors.border, alignSelf: 'center', marginTop: 12 }]}> 
            <Text style={[TextStyles.body.medium, { color: colors.primary }]}>View more</Text>
          </TouchableOpacity>
        )}
        </ScrollView>
      </View>
      
      {/* Right Sidebar */}
      <SpaceRightSidebar
        space={space}
        availableMembers={displayMembers}
        spaceMembers={spaceMembers}
        ownerIds={ownerIds}
        currentUserId={currentUserId}
        onInvite={onAddMembersToBoard}
        onAddMember={handleAddMember}
        onRemoveMember={handleRemoveMember}
        onCleanupInvalidMembers={cleanupInvalidMembers}
        onClose={() => setSidebarVisible(false)}
        isVisible={sidebarVisible}
        animationDuration={250}
        width={320}
        canManageMembers={canManageMembers}
        loading={loading}
      />

      {/* Create Space Modal */}
      <CreateSpaceModal
        visible={createSpaceVisible}
        onClose={() => setCreateSpaceVisible(false)}
        onSubmit={handleCreateSpace}
        submitting={creatingSpace}
      />

      {/* Create Board Modal */}
      <CreateBoardModal
        visible={createVisible}
        onClose={() => setCreateVisible(false)}
        onSubmit={submitCreateBoard}
        submitting={creating}
      />

    </RNView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderBottomWidth: 1 },
  content: { flex: 1, padding: 16 },
  centerBox: { padding: 24, alignItems: 'center', justifyContent: 'center' },
  errorCard: { padding: 16, margin: 16, borderRadius: 12 },
  emptyCard: { padding: 16, borderRadius: 12 },
  primaryBtn: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10 },
  boardGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridItem: { marginBottom: 12 },
  boardItem: { padding: 16, borderRadius: 12 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#00000088' },
  modalPanel: { position: 'absolute', top: 0, right: 0, bottom: 0, width: 320, borderLeftWidth: StyleSheet.hairlineWidth, padding: 16 },
  createModalCard: { position: 'absolute', left: 16, right: 16, top: '20%', borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, padding: 16 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginTop: 6 },
  textarea: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginTop: 6, textAlignVertical: 'top' },
  pill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  ghostBtn: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  previewBoard: { flexDirection: 'row', gap: 8, padding: 8, borderWidth: StyleSheet.hairlineWidth, borderRadius: 10 },
  previewColumn: { flex: 1 },
  previewCard: { height: 36, borderRadius: 8, borderWidth: StyleSheet.hairlineWidth, marginBottom: 6 },
  viewMoreBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth, marginTop: 8 },
  backBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: StyleSheet.hairlineWidth },
  sidebarCard: { padding: 12, borderRadius: 12 },
  memberItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: 10, borderWidth: 1 },
  memberAvatar: { width: 32, height: 32, borderRadius: 16 },
  memberAvatarPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: StyleSheet.hairlineWidth },
  addButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  removeButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  emptyState: { padding: 16, borderRadius: 8, alignItems: 'center' },
});

// Wrapper component with MobileAlertProvider
export default function SpaceBoardsScreen() {
  return (
    <BannerProvider>
      <MobileAlertProvider>
        <SpaceBoardsScreenContent />
      </MobileAlertProvider>
    </BannerProvider>
  );
}
