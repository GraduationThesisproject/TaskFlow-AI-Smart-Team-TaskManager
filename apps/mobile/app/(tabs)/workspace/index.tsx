import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, RefreshControl, TextInput, Image, Alert, useWindowDimensions, Modal, Pressable, Animated } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { Text, View, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { useAppDispatch, useAppSelector } from '@/store';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { setCurrentWorkspaceId, setSelectedSpace, fetchMembers, removeMember, clearWorkspaceData } from '@/store/slices/workspaceSlice';
import { archiveSpace, unarchiveSpace, setCurrentSpace } from '@/store/slices/spaceSlice';
import { SpaceService } from '@/services/spaceService';
import CreateSpaceModal from '@/components/common/CreateSpaceModal';
import { MobileAlertProvider, useMobileAlert } from '@/components/common/MobileAlertProvider';
import SpaceCard from '@/components/common/SpaceCard';
import PremiumSpaceCard from '@/components/common/PremiumSpaceCard';
import PremiumSpaceLimitModal from '@/components/common/PremiumSpaceLimitModal';
import Sidebar from '@/components/navigation/Sidebar';
import { BannerProvider, useBanner } from '@/components/common/BannerProvider';



function WorkspaceScreenContent() {
  const colors = useThemeColors();
  
  
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; workspaceId?: string }>();
  const dispatch = useAppDispatch();
  const { showSuccess, showError, showWarning, showInfo } = useBanner();
  const { showModal, showBanner: showMobileBanner, showConfirm } = useMobileAlert();
  const [refreshing, setRefreshing] = useState(false);
  const [spaceSearch, setSpaceSearch] = useState('');
  const [showCreateSpace, setShowCreateSpace] = useState(false);
  const [creatingSpace, setCreatingSpace] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'member' | 'admin'>('member');
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [showPremiumSpaceModal, setShowPremiumSpaceModal] = useState(false);

  const { currentWorkspaceId, workspaces } = useAppSelector((s: any) => s.workspace);
  const { members, isLoading: membersLoading, error: membersError, currentWorkspace } = useAppSelector((s: any) => s.workspace);
  const { user: authUser } = useAppSelector((s: any) => s.auth);
  const selectedWorkspaceId = (params.workspaceId as string) || (params.id as string) || currentWorkspaceId || null;

  const { workspaces: wsList, currentWorkspace: ws, spaces, loading, error, refetchWorkspaces, loadSpaces, inviteNewMember } = useWorkspaces({ autoFetch: true, workspaceId: selectedWorkspaceId });

  // Use selectedWorkspaceId as the primary workspace ID to prevent stale data
  const workspaceId = selectedWorkspaceId;
  const effectiveWorkspace = currentWorkspace;

  // Clear spaces data when workspace changes to prevent stale data from previous workspace
  useEffect(() => {
    if (workspaceId && currentWorkspaceId && workspaceId !== currentWorkspaceId) {
      // Clear spaces data when switching workspaces
      dispatch(clearWorkspaceData());
    }
  }, [workspaceId, currentWorkspaceId, dispatch]);

  // Also refresh members when this screen gains focus (helps after invite acceptance)
  useFocusEffect(
    useCallback(() => {
      if (workspaceId) {
        // Refresh both members and spaces when screen focuses so counts stay current
        dispatch(fetchMembers({ id: workspaceId }));
        loadSpaces(workspaceId);
      }
      // No cleanup needed
      return undefined;
    }, [workspaceId]) // Remove dispatch and loadSpaces from dependencies to prevent infinite loops
  );

  // Optimized: Combine all space processing into a single useMemo to avoid dependency chains
  const processedSpaces = useMemo(() => {
    // Only process spaces if we have a valid workspace ID to prevent showing spaces from wrong workspace
    if (!workspaceId) {
      return [];
    }

    // Resolve spaces from hook or fallback to the workspace object returned by the hook
    let spacesSource: any[] = [];
    if (Array.isArray(spaces) && spaces.length > 0) {
      spacesSource = spaces;
    } else {
      const wsSpaces = (ws as any)?.spaces;
      spacesSource = Array.isArray(wsSpaces) ? wsSpaces : [];
    }

    // Deduplicate spaces by id to avoid duplicate renders when multiple fetches race
    const seen = new Set<string>();
    const uniqueSpaces: any[] = [];
    for (const s of spacesSource) {
      const id = String((s as any)?._id || (s as any)?.id || '');
      if (!id || seen.has(id)) continue;
      seen.add(id);
      uniqueSpaces.push(s);
    }

    // Sort so active spaces appear first, archived after
    const isArchived = (s: any): boolean => {
      const status = String(s?.status || '').toLowerCase();
      return s?.isArchived === true || s?.archived === true || status === 'archived' || status === 'inactive';
    };
    uniqueSpaces.sort((a, b) => Number(isArchived(a)) - Number(isArchived(b)));

    return uniqueSpaces;
  }, [spaces, ws, workspaceId]);

  const filteredSpaces = useMemo(() => {
    const q = spaceSearch.trim().toLowerCase();
    if (!q) return processedSpaces;
    return (processedSpaces || []).filter((s: any) => (s?.name || '').toLowerCase().includes(q) || (s?.description || '').toLowerCase().includes(q));
  }, [spaceSearch, processedSpaces]);

  const archivedSpacesCount = useMemo(() => {
    const isArchived = (s: any): boolean => {
      const status = String(s?.status || '').toLowerCase();
      return s?.isArchived === true || s?.archived === true || status === 'archived' || status === 'inactive';
    };
    return Array.isArray(processedSpaces) ? processedSpaces.filter(isArchived).length : 0;
  }, [processedSpaces]);
  
  const activeSpacesCount = useMemo(() => {
    const total = Array.isArray(processedSpaces) ? processedSpaces.length : 0;
    return Math.max(0, total - archivedSpacesCount);
  }, [processedSpaces, archivedSpacesCount]);

  

  // Deduplicate members by user id to avoid duplicate renders
  const uniqueMembers = useMemo(() => {
    const seen = new Set<string>();
    const out: any[] = [];
    const src = Array.isArray(members) ? members : [];
    for (const m of src) {
      const mid = String(m?.user?._id || m?.userId || m?._id || m?.id || '');
      if (!mid || seen.has(mid)) continue;
      seen.add(mid);
      out.push(m);
    }
    return out;
  }, [members]);

  // Workspace should count unique members (including owner via server data)
  const membersCount = Array.isArray(uniqueMembers) ? uniqueMembers.length : 0;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchWorkspaces(),
        workspaceId ? loadSpaces(workspaceId) : Promise.resolve(),
        workspaceId ? dispatch(fetchMembers({ id: workspaceId })) : Promise.resolve(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchWorkspaces, workspaceId, loadSpaces, dispatch]);

  // If there is exactly one workspace and none selected, auto-select it
  useEffect(() => {
    if (!selectedWorkspaceId && Array.isArray(workspaces) && workspaces.length === 1) {
      const only = workspaces[0];
      const id = (only as any)?._id || (only as any)?.id;
      if (id) {
        // Clear previous workspace data before auto-selecting
        dispatch(clearWorkspaceData());
        dispatch(setCurrentWorkspaceId(id));
        loadSpaces(id);
      }
    }
  }, [selectedWorkspaceId, workspaces]); // Remove dispatch and loadSpaces to prevent infinite loops

  const handleSelectWorkspace = useCallback((ws: any) => {
    const id = ws?._id || ws?.id;
    if (!id) return;
    // Clear previous workspace data before switching
    dispatch(clearWorkspaceData());
    dispatch(setCurrentWorkspaceId(id));
    loadSpaces(id);
  }, [dispatch, loadSpaces]);

  const handleOpenSpace = useCallback((space: any) => {
    const status = String(space?.status || '').toLowerCase();
    const archived = space?.isArchived === true || space?.archived === true || status === 'archived' || status === 'inactive';
    if (archived) {
      showWarning('This space is archived. Restore it to access boards.');
      return;
    }
    dispatch(setSelectedSpace(space));
    dispatch(setCurrentSpace(space));
    router.push('/workspace/space/boards');
  }, [dispatch, router, showWarning]);


  const handleInvite = useCallback(async () => {
    if (!inviteEmail.trim()) return;
    try {
      await inviteNewMember(inviteEmail.trim(), inviteRole);
     setInviteEmail('');
     // Show success banner
     showSuccess(`Invitation sent to ${inviteEmail.trim()}`);
     // Close the mobile sidebar modal after success (optional)
     setMembersSidebarOpen(false);
    } catch (e: any) {
      // Show an error banner for visibility
      showError(e?.message || 'Failed to send invitation');
    }
  }, [inviteEmail, inviteRole, inviteNewMember, showSuccess, showError]);

  // Legacy alert state (keeping for backward compatibility)
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState<string | undefined>(undefined);
  const [alertDescription, setAlertDescription] = useState<string | undefined>(undefined);
  const [alertVariant, setAlertVariant] = useState<'success' | 'error' | 'warning' | 'info'>('info');
  const [alertIsConfirmable, setAlertIsConfirmable] = useState(false);
  const [alertConfirmText, setAlertConfirmText] = useState<string>('Confirm');
  const [alertCancelText, setAlertCancelText] = useState<string>('Cancel');

  // Member removal state removed - now using MobileAlert showConfirm

  const handleRemoveMember = useCallback(async (member: any) => {
    if (!workspaceId) return;
    // Prevent removing the owner
    if (member?.role === 'owner') return;
    try {
      const memberId = member?.user?._id || member?.userId || member?._id || member?.id;
      if (!memberId) throw new Error('Could not determine member id');
      await dispatch(removeMember({ workspaceId, memberId })).unwrap();
      // Ensure local state matches backend by refetching members
      await dispatch(fetchMembers({ id: workspaceId }));
      // Show success using MobileAlert
      showSuccess('Member removed successfully');
    } catch (e: any) {
      console.warn('Failed to remove member', e);
      showError(`Failed to remove member: ${e?.message || 'Unknown error'}`);
    }
  }, [workspaceId, dispatch, showSuccess, showError]);

  const handleArchiveSpace = useCallback(async (spaceId: string, spaceName: string, isArchived: boolean) => {
    const nextAction = isArchived ? 'restore' : 'archive';
    const title = `${nextAction.charAt(0).toUpperCase() + nextAction.slice(1)} Space`;
    const message = `Are you sure you want to ${nextAction} "${spaceName}"?`;

    showConfirm(title, message, async () => {
      try {
        if (isArchived) {
          await dispatch(unarchiveSpace(spaceId));
          showSuccess('Space restored successfully!');
        } else {
          await dispatch(archiveSpace(spaceId));
          showSuccess('Space archived successfully!');
        }
        if (workspaceId) {
          loadSpaces(workspaceId);
        }
      } catch (error) {
        showError(`Failed to ${nextAction} space`);
      }
    });
  }, [dispatch, showConfirm, showSuccess, showError, workspaceId, loadSpaces]);

  // Optional: reusable permanent delete confirm using common MobileAlert UI
  const confirmPermanentDelete = useCallback((spaceId: string, spaceName: string, onConfirmed: () => Promise<void>) => {
    showConfirm(
      'Permanently Delete Space',
      `This will permanently delete "${spaceName}" and its data. This action cannot be undone.`,
      async () => {
        try {
          await onConfirmed();
          showSuccess('Space permanently deleted');
          if (workspaceId) {
            loadSpaces(workspaceId);
          }
        } catch (error: any) {
          showError(error?.message || 'Failed to permanently delete');
        }
      }
    );
  }, [showConfirm, showSuccess, showError, workspaceId, loadSpaces]);

  const handleSubmitCreate = useCallback(async ({ name, description, visibility }: { name: string; description?: string; visibility: 'private' | 'public' }) => {
    if (!workspaceId) return;
    const MAX_SPACES = 5;
    const canCreateMoreSpaces = (processedSpaces?.length || 0) < MAX_SPACES;
    if (!canCreateMoreSpaces) {
      setShowPremiumSpaceModal(true);
      return;
    }
    try {
      setCreatingSpace(true);
      await SpaceService.createSpace({
        name,
        description,
        workspaceId,
        settings: { isPrivate: visibility === 'private' },
      });
      await loadSpaces(workspaceId);
      setShowCreateSpace(false);
      showSuccess('Space created successfully!');
    } catch (e: any) {
      console.warn('Failed to create space', e);
      showError(e?.message || 'Failed to create space');
    } finally {
      setCreatingSpace(false);
    }
  }, [workspaceId, processedSpaces, loadSpaces, showSuccess, showError]);

  // Helpers to compute unique, non-owner member count per space
  const getId = useCallback((m: any): string => String(m?._id || m?.id || m?.user?._id || m?.user?.id || m?.userId || '').trim(), []);
  const getOwnerIds = useCallback((space: any): Set<string> => {
    const ids: string[] = [];
    const push = (v: any) => { const s = String(v || '').trim(); if (s) ids.push(s); };
    if (space?.owner) { const o = space.owner as any; push(o?._id || o?.id || o); }
    if (space?.ownerId) push(space.ownerId);
    if (space?.createdBy) { const c = space.createdBy as any; push(c?._id || c?.id || c); }
    return new Set(ids);
  }, []);
  
  // Calculate individual space member count (same logic as spaces.tsx)
  const getSpaceMemberCount = useCallback((space: any): number => {
    const ownerIds = getOwnerIds(space);
    const list = Array.isArray(space?.members) ? space.members.filter(Boolean) : [];
    const unique = new Set<string>();
    for (const m of list) {
      const id = getId(m);
      if (id && ownerIds.has(id)) continue; // exclude owner by id
      // build a stable composite key when id is missing or unreliable
      const key = id || `${String(m?.user?.email || m?.email || '').trim().toLowerCase()}|${String(m?.user?.name || m?.name || '').trim().toLowerCase()}`;
      if (!key) continue;
      unique.add(key);
    }
    return unique.size;
  }, [getId, getOwnerIds]);

  // Determine if a space should be locked (premium feature)
  const isSpaceLocked = useCallback((space: any, index: number): boolean => {
    // Free users can only access the first 5 spaces (index 0-4)
    // All spaces beyond index 4 require Premium
    return index >= 5;
  }, []);
  


  // Grid sizing for 3 columns in Spaces
  const [previewGridW, setPreviewGridW] = useState(0);
  const PREVIEW_COLS = 3;
  const PREVIEW_GAP = 12;
  const previewTile = previewGridW > 0
    ? Math.floor((previewGridW - PREVIEW_GAP * (PREVIEW_COLS - 1)) / PREVIEW_COLS)
    : undefined;

  const { width } = useWindowDimensions();
  const isWide = width >= 768;
  const [membersSidebarOpen, setMembersSidebarOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(320)).current;

  // Animation effect for members sidebar
  useEffect(() => {
    if (membersSidebarOpen) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 320,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [membersSidebarOpen]); // Remove slideAnim from dependencies as it's stable

  // Only owners should see the Edit Rules button
  const isOwner = useMemo(() => {
    const userId = authUser?.user?._id || authUser?.user?.id;
    if (!userId) return false;
    // Prefer Redux currentWorkspace, fallback to hook workspace (ws)
    const ownerId = (currentWorkspace?.owner?._id || currentWorkspace?.owner?.id || currentWorkspace?.ownerId)
      || (ws?.owner?._id || (ws as any)?.owner?.id || (ws as any)?.ownerId);
    if (ownerId && String(ownerId) === String(userId)) return true;
    // Use Redux members; if empty, fallback to ws.members
    const memberList: any[] = Array.isArray(members) && members.length > 0 ? members : (Array.isArray((ws as any)?.members) ? (ws as any).members : []);
    return memberList.some((m: any) => {
      const mid = m?.user?._id || m?.user?.id || m?.userId || m?._id || m?.id;
      const role = String(m?.role || '').toLowerCase();
      return String(mid) === String(userId) && role === 'owner';
    });
  }, [authUser, currentWorkspace, members, ws]);

  const handleCreateSpacePress = useCallback(() => {
    const MAX_SPACES = 5;
    const canCreateMoreSpaces = (processedSpaces?.length || 0) < MAX_SPACES;
    if (!canCreateMoreSpaces) {
      setShowPremiumSpaceModal(true);
      return;
    }
    setShowCreateSpace(true);
  }, [processedSpaces]);

  return (
    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: colors.background }}>
      <View style={{ flex: 1 }}>
        {/* Legacy banner alert - keeping for backward compatibility */}
        {alertVisible && (
          <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
            <View style={{
              backgroundColor: alertVariant === 'success' ? '#10B981' : alertVariant === 'error' ? '#EF4444' : alertVariant === 'warning' ? '#F59E0B' : '#3B82F6',
              padding: 16,
              borderRadius: 12,
              marginBottom: 16,
            }}>
              <Text style={{ color: '#FFFFFF', fontWeight: '600', marginBottom: 4 }}>
                {alertTitle}
              </Text>
              <Text style={{ color: '#FFFFFF', opacity: 0.9 }}>
                {alertDescription}
              </Text>
              {alertIsConfirmable && (
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12, gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => { setAlertVisible(false); setAlertIsConfirmable(false); }}
                    style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                  >
                    <Text style={{ color: '#FFFFFF' }}>{alertCancelText}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => { setAlertVisible(false); setAlertIsConfirmable(false); router.push('/(tabs)/settings?section=upgrade'); }}
                    style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
                  >
                    <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>{alertConfirmText}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={[styles.backButton, { backgroundColor: colors.background }]}
              onPress={() => router.push('/(tabs)')}
              accessibilityRole="button"
              accessibilityLabel="Back to dashboard"
            >
              <FontAwesome name="arrow-left" size={18} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sidebarButton, { backgroundColor: colors.background }]}
              onPress={() => setSidebarVisible(true)}
              accessibilityLabel="Open menu"
            >
              <FontAwesome name="bars" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.headerCenter}>
            <View style={styles.headerTitleContainer}>
              <View style={[styles.headerIcon, { backgroundColor: colors.primary + '15' }]}>
                <FontAwesome name="building" size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={[TextStyles.heading.h1, { color: colors.foreground }]}>Workspace</Text>
                {effectiveWorkspace && (
                  <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
                    {effectiveWorkspace.name || 'Untitled Workspace'}
                  </Text>
                )}
              </View>
            </View>
          </View>
          <View style={styles.headerRight}>
            {!isWide && (
              <TouchableOpacity 
                onPress={() => setMembersSidebarOpen(true)} 
                style={[styles.membersButton, { backgroundColor: colors.primary }]}
                accessibilityLabel="View members"
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <FontAwesome name="users" size={16} color={colors['primary-foreground']} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView
          style={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
        {/* Error */}
        {error && (
          <Card style={[styles.errorCard, { backgroundColor: colors.destructive }]}>
            <Text style={[TextStyles.body.medium, { color: colors['destructive-foreground'] }]}>Failed to load workspace data. Pull to refresh.</Text>
          </Card>
        )}

        {/* Spaces toolbar: Search + Create */}
        <Card style={[styles.sectionCard, { backgroundColor: colors.card }]}>
          <View style={styles.toolbarContainer}>
            <View style={styles.searchContainer}>
              <View style={[styles.searchIcon, { backgroundColor: colors.background }]}>
                <FontAwesome name="search" size={16} color={colors['muted-foreground']} />
              </View>
              <TextInput
                value={spaceSearch}
                onChangeText={setSpaceSearch}
                placeholder="Search spaces..."
                placeholderTextColor={colors['muted-foreground']}
                style={[styles.searchInput, { color: colors.foreground, backgroundColor: colors.background }]}
              />
              {spaceSearch.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSpaceSearch('')}
                  style={[styles.clearButton, { backgroundColor: colors.muted }]}
                >
                  <FontAwesome name="times" size={12} color={colors['muted-foreground']} />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity 
              onPress={handleCreateSpacePress} 
              style={[styles.createButton, { backgroundColor: colors.primary }]}
            >
              <FontAwesome name="plus" size={16} color={colors['primary-foreground']} />
              <Text style={[TextStyles.body.medium, { color: colors['primary-foreground'], fontWeight: '600', marginLeft: 6 }]}>
                Create Space
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Show selector ONLY if no selected id and no current workspace, and multiple workspaces exist */}
        {!workspaceId && Array.isArray(wsList) && wsList.length > 1 && (
          <Card style={styles.sectionCard}>
            <Text style={[TextStyles.heading.h2, { color: colors.foreground, marginBottom: 12 }]}>Select a Workspace</Text>
            <View style={styles.workspaceList}>
              {(wsList || []).map((ws: any) => (
                <TouchableOpacity key={ws._id || ws.id} style={[styles.workspaceItem, { backgroundColor: colors.card }]} onPress={() => handleSelectWorkspace(ws)}>
                  <FontAwesome name="folder" size={22} color={colors.primary} />
                  <View style={styles.workspaceInfo}>
                    <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>{ws.name}</Text>
                    <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
                      {(ws.members?.length || 0)} members • {(ws.spaces?.length || 0)} spaces
                    </Text>
                  </View>
                  <FontAwesome name="chevron-right" size={16} color={colors['muted-foreground']} />
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        )}

        {/* Overview + Actions only when workspace details are loaded */}
        {workspaceId && effectiveWorkspace && (
          <>
            <View style={styles.statsContainer}>
              <Card style={[styles.statCard, { backgroundColor: colors.card }]}>
                <View style={[styles.statIcon, { backgroundColor: colors.primary + '15' }]}>
                  <FontAwesome name="users" size={20} color={colors.primary} />
                </View>
                <View style={styles.statContent}>
                  <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>{membersCount}</Text>
                  <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>Members</Text>
                </View>
              </Card>
              <Card style={[styles.statCard, { backgroundColor: colors.card }]}>
                <View style={[styles.statIcon, { backgroundColor: colors.accent + '15' }]}>
                  <FontAwesome name="th-large" size={20} color={colors.accent} />
                </View>
                <View style={styles.statContent}>
                  <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>{activeSpacesCount}</Text>
                  <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>Active Spaces</Text>
                </View>
              </Card>
              <Card style={[styles.statCard, { backgroundColor: colors.card }]}>
                <View style={[styles.statIcon, { backgroundColor: colors.warning + '15' }]}>
                  <FontAwesome name="archive" size={20} color={colors.warning} />
                </View>
                <View style={styles.statContent}>
                  <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>{archivedSpacesCount}</Text>
                  <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>Archived Spaces</Text>
                </View>
              </Card>
            </View>

          </>
        )}
        {/* Spaces List */}
        {!!(processedSpaces && processedSpaces.length) && (
          <Card style={[styles.sectionCard, { backgroundColor: colors.card }]}>
            <View style={styles.spacesHeader}>
              <View style={styles.spacesTitleContainer}>
                <View style={[styles.spacesIcon, { backgroundColor: colors.primary + '15' }]}>
                  <FontAwesome name="folder" size={18} color={colors.primary} />
                </View>
                <View>
                  <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>Spaces</Text>
                  <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
                    {processedSpaces.length} space{processedSpaces.length !== 1 ? 's' : ''} • {archivedSpacesCount} archived
                  </Text>
                </View>
              </View>
              {processedSpaces.length > 5 && (
                <View style={[styles.premiumBadge, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}>
                  <FontAwesome name="star" size={12} color={colors.primary} />
                  <Text style={[TextStyles.caption.small, { color: colors.primary, marginLeft: 4, fontWeight: '600' }]}>
                    {processedSpaces.length - 5} more with Premium
                  </Text>
                </View>
              )}
            </View>
            <View
              style={[styles.spaceList, { flexDirection: 'row', flexWrap: 'wrap', gap: PREVIEW_GAP, backgroundColor: colors.background }]}
              onLayout={(e) => setPreviewGridW(e.nativeEvent.layout.width)}
            >
              {filteredSpaces.map((space: any, index: number) => {
                const isLocked = isSpaceLocked(space, index);
                const computeArchived = (s: any): boolean => {
                  const status = String(s?.status || '').toLowerCase();
                  return s?.isArchived === true || s?.archived === true || status === 'archived' || status === 'inactive';
                };
                const archived = computeArchived(space);
                
                if (isLocked) {
                  return (
                    <PremiumSpaceCard
                      key={space._id || space.id}
                      name={space.name}
                      description={space.description}
                      membersCount={getSpaceMemberCount(space)}
                      icon={space.icon || '📂'}
                      isArchived={archived}
                      createdAt={space.createdAt || space.created_at || space.createdOn || space.created || space.createdDate}
                      tileSize={previewTile}
                      onPress={() => handleOpenSpace(space)}
                      onToggleArchive={() => handleArchiveSpace(space._id || space.id, space.name, archived)}
                      isLocked={isLocked}
                      lockReason="This space requires Premium"
                      benefits={[
                        "Unlimited spaces (currently limited to 5)",
                        "Advanced analytics",
                        "Priority support",
                        "Custom integrations"
                      ]}
                    />
                  );
                }
                
                return (
                  <SpaceCard
                    key={space._id || space.id}
                    name={space.name}
                    description={space.description}
                    membersCount={getSpaceMemberCount(space)}
                    icon={space.icon || '📂'}
                    isArchived={archived}
                    createdAt={space.createdAt || space.created_at || space.createdOn || space.created || space.createdDate}
                    tileSize={previewTile}
                    boardsCount={Array.isArray((space as any)?.boards) ? (space as any).boards.length : ((space as any)?.stats?.totalBoards || 0)}
                    onPress={() => handleOpenSpace(space)}
                    onToggleArchive={() => handleArchiveSpace(space._id || space.id, space.name, archived)}
                  />
                );
              })}
            </View>
          </Card>
        )}
        </ScrollView>
      </View>

      {/* Right Sidebar */}
      {membersSidebarOpen && (
        <>
          {/* Backdrop */}
          <TouchableOpacity
            style={[styles.modalBackdrop, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}
            activeOpacity={1}
            onPress={() => setMembersSidebarOpen(false)}
          />
          
          {/* Sidebar */}
          <Animated.View 
            style={[
              styles.modalPanel, 
              { 
                backgroundColor: colors.background, 
                borderLeftColor: colors.border,
                transform: [{ translateX: slideAnim }],
              }
            ]}
          >
          {/* Header */}
          <View style={[styles.sidebarHeader, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
            <View style={styles.sidebarHeaderContent}>
              <View style={styles.sidebarHeaderLeft}>
                <View style={[styles.sidebarHeaderIcon, { backgroundColor: colors.primary + '15' }]}>
                  <FontAwesome name="users" size={18} color={colors.primary} />
                </View>
                <View>
                  <Text style={[TextStyles.heading.h3, { color: colors.foreground }]}>Workspace Members</Text>
                  <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
                    {membersCount} member{membersCount !== 1 ? 's' : ''}
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                onPress={() => setMembersSidebarOpen(false)} 
                style={[styles.sidebarCloseButton, { backgroundColor: colors.background }]}
                accessibilityLabel="Close sidebar"
              >
                <FontAwesome name="times" size={16} color={colors.foreground} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.sidebarContent} showsVerticalScrollIndicator={false}>
            {/* Invite Section */}
            {workspaceId && effectiveWorkspace && (
              <Card style={[styles.sidebarSection, { backgroundColor: colors.card }]}>
                <View style={styles.sidebarSectionHeader}>
                  <View style={styles.sidebarSectionTitle}>
                    <View style={[styles.sidebarSectionIcon, { backgroundColor: colors.primary + '15' }]}>
                      <FontAwesome name="user-plus" size={14} color={colors.primary} />
                    </View>
                    <Text style={[TextStyles.heading.h4, { color: colors.foreground }]}>Invite Members</Text>
                  </View>
                </View>
                <View style={styles.inviteContainer}>
                  <View style={styles.inviteInputContainer}>
                    <View style={[styles.inviteInputIcon, { backgroundColor: colors.background }]}>
                      <FontAwesome name="envelope" size={14} color={colors['muted-foreground']} />
                    </View>
                    <TextInput
                      value={inviteEmail}
                      onChangeText={setInviteEmail}
                      placeholder="email@example.com"
                      placeholderTextColor={colors['muted-foreground']}
                      autoCapitalize="none"
                      autoCorrect={false}
                      textContentType="emailAddress"
                      keyboardType="email-address"
                      style={[styles.inviteInput, { color: colors.foreground, backgroundColor: colors.background }]}
                    />
                  </View>
                  <View style={styles.inviteControls}>
                    <TouchableOpacity 
                      onPress={() => setInviteRole(inviteRole === 'member' ? 'admin' : 'member')} 
                      style={[styles.roleButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                    >
                      <FontAwesome name="user" size={12} color={colors.primary} />
                      <Text style={[TextStyles.caption.small, { color: colors.foreground, marginLeft: 4, fontWeight: '500' }]}>
                        {inviteRole}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={handleInvite} 
                      style={[styles.inviteButton, { backgroundColor: colors.primary }]}
                    >
                      <FontAwesome name="paper-plane" size={12} color={colors['primary-foreground']} />
                      <Text style={[TextStyles.caption.small, { color: colors['primary-foreground'], marginLeft: 4, fontWeight: '500' }]}>
                        Invite
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            )}

            {/* Members Section */}
            {workspaceId && (
              <Card style={[styles.sidebarSection, { backgroundColor: colors.card }]}>
                <View style={styles.sidebarSectionHeader}>
                  <View style={styles.sidebarSectionTitle}>
                    <View style={[styles.sidebarSectionIcon, { backgroundColor: colors.primary + '15' }]}>
                      <FontAwesome name="users" size={14} color={colors.primary} />
                    </View>
                    <Text style={[TextStyles.heading.h4, { color: colors.foreground }]}>Current Members</Text>
                  </View>
                </View>
                {membersLoading ? (
                  <View style={styles.sidebarEmptyState}>
                    <FontAwesome name="spinner" size={24} color={colors['muted-foreground']} />
                    <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'] }]}>Loading members...</Text>
                  </View>
                ) : membersError ? (
                  <View style={styles.sidebarEmptyState}>
                    <FontAwesome name="exclamation-triangle" size={24} color={colors.destructive} />
                    <Text style={[TextStyles.body.medium, { color: colors.destructive }]}>{membersError}</Text>
                  </View>
                ) : (Array.isArray(uniqueMembers) && uniqueMembers.length > 0 ? (
                  <View style={styles.membersList}>
                    {uniqueMembers.map((m: any) => {
                      const displayName = m?.user?.name || m?.name || m?.user?.email || m?.email || 'Member';
                      const email = m?.user?.email || m?.email || '';
                      const avatarUrl = m?.avatar || m?.profile?.avatar || m?.user?.avatar;
                      const letter = String(displayName).charAt(0).toUpperCase();
                      const isOwner = m.role === 'owner';
                      return (
                        <View key={m._id || m.id || m.email} style={[styles.sidebarMemberItem, { backgroundColor: colors.background, borderColor: colors.border }]}>
                          {avatarUrl ? (
                            <Image source={{ uri: avatarUrl }} style={styles.sidebarMemberAvatar} />
                          ) : (
                            <View style={[styles.sidebarMemberAvatar, styles.sidebarMemberAvatarPlaceholder, { backgroundColor: colors.muted }]}> 
                              <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>{letter}</Text>
                            </View>
                          )}
                          <View style={styles.sidebarMemberInfo}>
                            <Text style={[TextStyles.body.medium, { color: colors.foreground }]} numberOfLines={1}>
                              {displayName} {isOwner && '👑'}
                            </Text>
                            {!!email && (
                              <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]} numberOfLines={1}>{email}</Text>
                            )}
                            <View style={styles.sidebarMemberMeta}>
                              <View style={[styles.sidebarRoleBadge, { backgroundColor: isOwner ? colors.primary + '15' : colors.muted + '15' }]}>
                                <Text style={[TextStyles.caption.small, { color: isOwner ? colors.primary : colors['muted-foreground'], fontWeight: '500' }]}>
                                  {m.role || 'member'}
                                </Text>
                              </View>
                              <View style={[styles.sidebarStatusBadge, { backgroundColor: colors.success + '15' }]}>
                                <Text style={[TextStyles.caption.small, { color: colors.success, fontWeight: '500' }]}>
                                  {m.status || 'active'}
                                </Text>
                              </View>
                            </View>
                          </View>
                          {!isOwner && (
                            <TouchableOpacity
                              onPress={() => {
                                const displayName = m?.user?.name || m?.name || m?.user?.email || m?.email || 'this member';
                                showConfirm(
                                  'Remove Member',
                                  `Are you sure you want to remove ${displayName} from the workspace?`,
                                  () => handleRemoveMember(m)
                                );
                              }}
                              disabled={!!membersLoading}
                              style={[styles.sidebarRemoveButton, { backgroundColor: colors.destructive }, membersLoading ? { opacity: 0.6 } : null]}
                            >
                              <FontAwesome name="user-times" size={12} color={colors['destructive-foreground']} />
                              <Text style={[TextStyles.caption.small, { color: colors['destructive-foreground'], marginLeft: 4, fontWeight: '500' }]}>
                                {membersLoading ? 'Removing…' : 'Remove'}
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      );
                    })}
                  </View>
                ) : (
                  <View style={styles.sidebarEmptyState}>
                    <FontAwesome name="users" size={32} color={colors['muted-foreground']} />
                    <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>No members yet</Text>
                    <Text style={[TextStyles.body.small, { color: colors['muted-foreground'], textAlign: 'center' }]}>
                      Invite members to collaborate on this workspace
                    </Text>
                  </View>
                ))}
              </Card>
            )}
          </ScrollView>
          </Animated.View>
        </>
      )}

      {/* Create Space Modal */}
      <CreateSpaceModal
        visible={!!workspaceId && showCreateSpace}
        onClose={() => setShowCreateSpace(false)}
        onSubmit={handleSubmitCreate}
        submitting={creatingSpace}
      />

      {/* Premium Space Limit Modal */}
      <PremiumSpaceLimitModal
        visible={showPremiumSpaceModal}
        onClose={() => setShowPremiumSpaceModal(false)}
        currentSpacesCount={processedSpaces.length}
        maxFreeSpaces={5}
      />

      {/* Member removal confirmation now handled by MobileAlert showConfirm */}

      {/* Sidebar */}
      <Sidebar isVisible={sidebarVisible} onClose={() => setSidebarVisible(false)} context="workspace" />
    </View>
  );
}

// Wrapper component with both providers
export default function WorkspaceScreen() {
  return (
    <BannerProvider>
      <MobileAlertProvider>
        <WorkspaceScreenContent />
      </MobileAlertProvider>
    </BannerProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    minHeight: 72,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerCenter: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  sidebarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  membersButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  toolbarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  clearButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  spacesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  spacesTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  spacesIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statContent: {
    flex: 1,
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1, padding: 16 },
  errorCard: { padding: 16, marginBottom: 16, borderRadius: 12 },
  sectionCard: { padding: 20, marginBottom: 20 },
  statsContainerAlt: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statCardAlt: { flex: 1, padding: 16, marginHorizontal: 4, alignItems: 'center', borderRadius: 12 },
  workspaceList: { gap: 12 },
  workspaceItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12 },
  workspaceInfo: { flex: 1, marginLeft: 12 },
  emptyBox: { alignItems: 'center', justifyContent: 'center', padding: 24, borderRadius: 12 },
  spaceList: { gap: 12 },
  spaceItem: { padding: 16, borderRadius: 12 },
  spaceHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  spaceActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  archiveButton: { padding: 4 },
  spaceStats: { flexDirection: 'row', gap: 8, marginTop: 8 },
  archiveCountdown: {
    marginTop: 6,
  },
  countdownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  pill: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 999, borderWidth: 1 },
  spacesHeaderAlt: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  primaryBtn: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10 },
  secondaryBtn: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10 },
  memberItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 10, borderWidth: 1 },
  memberMetaRow: { flexDirection: 'row', gap: 6, marginTop: 4 },
  destructiveBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  memberAvatar: { width: 36, height: 36, borderRadius: 18 },
  memberAvatarPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  modalBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#00000088', zIndex: 1000 },
  modalPanel: { 
    position: 'absolute', 
    top: 0, 
    right: 0, 
    bottom: 0, 
    width: 320, 
    borderLeftWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1001 
  },
  sidebarHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sidebarHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  sidebarHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sidebarHeaderIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidebarCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  sidebarContent: {
    flex: 1,
    padding: 20,
  },
  sidebarSection: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sidebarSectionHeader: {
    marginBottom: 16,
  },
  sidebarSectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sidebarSectionIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviteContainer: {
    gap: 16,
  },
  inviteInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  inviteInputIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviteInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  inviteControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  membersList: {
    gap: 12,
  },
  sidebarMemberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sidebarMemberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  sidebarMemberAvatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidebarMemberInfo: {
    flex: 1,
    gap: 4,
  },
  sidebarMemberMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sidebarRoleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sidebarStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sidebarRemoveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  sidebarEmptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  ghostBtn: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
});