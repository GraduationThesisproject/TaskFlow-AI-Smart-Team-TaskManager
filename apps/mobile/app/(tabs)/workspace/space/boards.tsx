import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert, useWindowDimensions, View as RNView, Modal, Pressable, TextInput, Switch, ActivityIndicator, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { View, Text, Card } from '@/components/Themed';
import BoardCard from '@/components/common/BoardCard';
import { useThemeColors } from '@/components/ThemeProvider';
import { useAppDispatch, useAppSelector } from '@/store';
import { TextStyles } from '@/constants/Fonts';
import { BoardService } from '@/services/boardService';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import SpaceHeader from '@/components/space/SpaceHeader';

export default function SpaceBoardsScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const dispatch = useAppDispatch();
  const { width } = useWindowDimensions();
  const isWide = width >= 768; // show right sidebar on tablets/landscape

  const { selectedSpace, members: workspaceMembers } = useAppSelector((s: any) => s.workspace);
  const { user: authUser } = useAppSelector((s: any) => s.auth);
  const currentUserId = useMemo(() => String(authUser?.user?._id || authUser?.user?.id || ''), [authUser]);
  const space = selectedSpace;
  const { loadSpaces } = useWorkspaces({ autoFetch: false });

  // Include all members (including owner). We'll prevent adding yourself via UI guards.
  const displayMembers = useMemo(() => (
    Array.isArray(workspaceMembers) ? workspaceMembers : []
  ), [workspaceMembers]);

  // Precompute owner IDs for disable logic
  const ownerIds = useMemo(() => {
    const ids = new Set<string>();
    (Array.isArray(displayMembers) ? displayMembers : []).forEach((m: any) => {
      if (String(m?.role || '').toLowerCase() === 'owner') {
        const id = String(m?.user?._id || m?.user?.id || m?._id || m?.id || '');
        if (id) ids.add(id);
      }
    });
    return ids;
  }, [displayMembers]);

  const [refreshing, setRefreshing] = useState(false);
  const lastLoadedSpaceId = useRef<string | null>(null);
  const [boards, setBoards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  // Grid sizing for 3 columns
  const [gridWidth, setGridWidth] = useState(0);
  const COLUMNS = 3;
  const GRID_GAP = 12; // must match styles.boardGrid gap
  // Fallback estimate uses screen width minus content padding (16 * 2)
  const estimatedContainer = Math.max(0, width - 32);
  const containerW = gridWidth > 0 ? gridWidth : estimatedContainer;
  const itemWidth = containerW > 0
    ? Math.floor((containerW - GRID_GAP * (COLUMNS - 1)) / COLUMNS)
    : undefined;

  // Only show first 5 boards here; show full list in allboards screen
  const VISIBLE_MAX = 5;
  const visibleBoards = Array.isArray(boards) ? boards.slice(0, VISIBLE_MAX) : [];

  // Create Board modal state
  const [createVisible, setCreateVisible] = useState(false);
  const [creating, setCreating] = useState(false);
  const [boardName, setBoardName] = useState('');
  const [boardDesc, setBoardDesc] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [boardType, setBoardType] = useState<'kanban' | 'list' | 'calendar' | 'timeline'>('kanban');

  // If navigated directly with an id param and no selectedSpace in store, fetch it.


  const loadBoards = useCallback(async (force = false) => {
    const spaceId = space?._id || space?.id;
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
      const wsId = String((space as any)?.workspaceId || (space as any)?.workspace?._id || (space as any)?.workspace?.id || '').trim();
      if (wsId) {
        loadSpaces(wsId);
      }
    } catch (e: any) {
      console.warn('Failed to load boards', e);
      setError(e?.message || 'Failed to load boards');
    } finally {
      setLoading(false);
    }
  }, [space?._id, space?.id]);

  useEffect(() => {
    loadBoards(false);
  }, [loadBoards]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadBoards(true);
    } finally {
      setRefreshing(false);
    }
  };

  const openCreateBoard = () => setCreateVisible(true);
  const resetCreateState = () => {
    setBoardName('');
    setBoardDesc('');
    setIsPrivate(false);
    setBoardType('kanban');
  };
  const submitCreateBoard = async () => {
    if (!space?._id && !space?.id) return;
    if (!boardName.trim()) {
      Alert.alert('Board name required', 'Please enter a name for the board.');
      return;
    }
    try {
      setCreating(true);
      const spaceId = space._id || space.id;
      const createResp = await BoardService.createBoard({
        name: boardName.trim(),
        description: boardDesc.trim() || undefined,
        type: boardType,
        visibility: isPrivate ? 'private' : 'public',
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
      Alert.alert('Board created', 'Your board has been created.');
      // Force reload to ensure we bypass the lastLoadedSpaceId guard and get server truth
      await loadBoards(true);
      // Refresh spaces via hook so Workspace list immediately reflects the new count
      const wsId = String((space as any)?.workspaceId || (space as any)?.workspace?._id || (space as any)?.workspace?.id || '').trim();
      if (wsId) {
        loadSpaces(wsId);
      }
    } catch (e: any) {
      Alert.alert('Failed to create board', e?.response?.data?.message || e?.message || 'Unknown error');
    } finally {
      setCreating(false);
    }
  };

  // Simple handlers used by SpaceHeader/Sidebar
  const goMembers = () => {
    // On phones, open the sidebar as a drawer; on wide screens it's already visible
    if (!isWide) setSidebarOpen(true);
  };
  const goSettings = () => router.push('/workspace/space/settings');
  const onAddMembersToBoard = (ids: string[]) => {
    Alert.alert('Add to board', `Selected member IDs: ${ids.join(', ')}`);
  };

  const toggleMemberSelection = (id: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

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
              totalBoards: Array.isArray(boards) ? boards.length : (space?.totalBoards || space?.stats?.totalBoards || 0),
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
                  />
                ))}
              </View>
            )}
            {/* View more button */}
            {!loading && boards.length > VISIBLE_MAX && (
              <TouchableOpacity onPress={() => router.push('/(tabs)/workspace/space/allboards')} style={[styles.viewMoreBtn, { borderColor: colors.border }]}> 
                <Text style={[TextStyles.body.medium, { color: colors.primary }]}>View more</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
        <View style={{ width: 320, padding: 16 }}>
          {/* Sidebar: Add Members to Board (workspace members only; you can't add yourself) */}
          <Card style={[styles.sidebarCard, { backgroundColor: colors.card }]}>
            <Text style={[TextStyles.heading.h2, { color: colors.foreground, marginBottom: 12 }]}>Add Members to Board</Text>
            {Array.isArray(displayMembers) && displayMembers.length > 0 ? (
              <RNView style={{ gap: 8 }}>
                {displayMembers.map((m: any) => {
                  const displayName = m?.user?.name || m?.name || m?.user?.email || m?.email || 'Member';
                  const email = m?.user?.email || m?.email || '';
                  const avatarUrl = m?.avatar || m?.profile?.avatar || m?.user?.avatar;
                  const memberId = String(m?.user?._id || m?.user?.id || m?._id || m?.id);
                  const selected = selectedMemberIds.includes(memberId);
                  const isSelf = currentUserId && memberId === currentUserId;
                  const isOwner = ownerIds.has(memberId);
                  const letter = String(displayName).charAt(0).toUpperCase();
                  return (
                    <TouchableOpacity
                      key={memberId}
                      onPress={() => { if (!isSelf && !isOwner) toggleMemberSelection(memberId); }}
                      style={[
                        styles.memberItem,
                        { backgroundColor: colors.background, borderColor: colors.border },
                        (isSelf || isOwner) ? { opacity: 0.6 } : null,
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
                      </View>
                      <View style={[
                        styles.checkbox,
                        { borderColor: colors.border, backgroundColor: selected ? colors.primary : 'transparent' },
                        (isSelf || isOwner) ? { backgroundColor: 'transparent' } : null,
                      ]} />
                    </TouchableOpacity>
                  );
                })}
                <TouchableOpacity
                  onPress={() => {
                    const ids = selectedMemberIds.filter((id) => (!currentUserId || id !== currentUserId) && !ownerIds.has(id));
                    onAddMembersToBoard(ids);
                    setSelectedMemberIds([]);
                  }}
                  disabled={selectedMemberIds.filter((id) => (!currentUserId || id !== currentUserId) && !ownerIds.has(id)).length === 0}
                  style={[
                    styles.primaryBtn,
                    { backgroundColor: colors.primary, opacity: selectedMemberIds.filter((id) => (!currentUserId || id !== currentUserId) && !ownerIds.has(id)).length === 0 ? 0.6 : 1 },
                  ]}
                >
                  <Text style={{ color: colors['primary-foreground'] }}>Add to Board</Text>
                </TouchableOpacity>
              </RNView>
            ) : (
              <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'] }]}>No workspace members available.</Text>
            )}
          </Card>
          {/* Sidebar: Members list (read-only) */}
          <Card style={[styles.sidebarCard, { backgroundColor: colors.card, marginTop: 12 }]}>
            <Text style={[TextStyles.heading.h2, { color: colors.foreground, marginBottom: 12 }]}>Members ({Array.isArray(displayMembers) ? displayMembers.length : 0})</Text>
            {Array.isArray(displayMembers) && displayMembers.length > 0 ? (
              <RNView style={{ gap: 8 }}>
                {displayMembers.map((m: any) => {
                  const displayName = m?.user?.name || m?.name || m?.user?.email || m?.email || 'Member';
                  const email = m?.user?.email || m?.email || '';
                  const avatarUrl = m?.avatar || m?.profile?.avatar || m?.user?.avatar;
                  const letter = String(displayName).charAt(0).toUpperCase();
                  return (
                    <View key={m._id || m.id || m.email} style={[styles.memberItem, { backgroundColor: colors.background, borderColor: colors.border }]}> 
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
                    </View>
                  );
                })}
              </RNView>
            ) : (
              <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'] }]}>No members yet.</Text>
            )}
          </Card>
        </View>
      </RNView>
    );
  }

  // Stacked layout on phones
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SpaceHeader
        space={{
          ...space,
          totalBoards: Array.isArray(boards) ? boards.length : (space?.totalBoards || space?.stats?.totalBoards || 0),
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
              />
            ))}
          </View>
        )}
        {/* View more button (phone) */}
        {!loading && boards.length > VISIBLE_MAX && (
          <TouchableOpacity onPress={() => router.push('/(tabs)/workspace/space/allboards')} style={[styles.viewMoreBtn, { borderColor: colors.border, alignSelf: 'center', marginTop: 12 }]}> 
            <Text style={[TextStyles.body.medium, { color: colors.primary }]}>View more</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
      {/* Sidebar Modal Drawer */}
      <Modal animationType="slide" transparent visible={sidebarOpen} onRequestClose={() => setSidebarOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setSidebarOpen(false)} />
        <View style={[styles.modalPanel, { backgroundColor: colors.background, borderLeftColor: colors.border }]}> 
          <Card style={[styles.sidebarCard, { backgroundColor: colors.card }]}>
            <Text style={[TextStyles.heading.h2, { color: colors.foreground, marginBottom: 12 }]}>Add Members to Board</Text>
            {Array.isArray(displayMembers) && displayMembers.length > 0 ? (
              <RNView style={{ gap: 8 }}>
                {displayMembers.map((m: any) => {
                  const displayName = m?.user?.name || m?.name || m?.user?.email || m?.email || 'Member';
                  const email = m?.user?.email || m?.email || '';
                  const avatarUrl = m?.avatar || m?.profile?.avatar || m?.user?.avatar;
                  const memberId = String(m?.user?._id || m?.user?.id || m?._id || m?.id);
                  const selected = selectedMemberIds.includes(memberId);
                  const isSelf = currentUserId && memberId === currentUserId;
                  const isOwner = ownerIds.has(memberId);
                  const letter = String(displayName).charAt(0).toUpperCase();
                  return (
                    <TouchableOpacity
                      key={memberId}
                      onPress={() => { if (!isSelf && !isOwner) toggleMemberSelection(memberId); }}
                      style={[
                        styles.memberItem,
                        { backgroundColor: colors.background, borderColor: colors.border },
                        (isSelf || isOwner) ? { opacity: 0.6 } : null,
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
                      </View>
                      <View style={[
                        styles.checkbox,
                        { borderColor: colors.border, backgroundColor: selected ? colors.primary : 'transparent' },
                        (isSelf || isOwner) ? { backgroundColor: 'transparent' } : null,
                      ]} />
                    </TouchableOpacity>
                  );
                })}
                <RNView style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity onPress={() => setSidebarOpen(false)} style={[styles.ghostBtn, { borderColor: colors.border }]}> 
                    <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>Close</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      const ids = selectedMemberIds.filter((id) => (!currentUserId || id !== currentUserId) && !ownerIds.has(id));
                      setSidebarOpen(false);
                      onAddMembersToBoard(ids);
                      setSelectedMemberIds([]);
                    }}
                    disabled={selectedMemberIds.filter((id) => (!currentUserId || id !== currentUserId) && !ownerIds.has(id)).length === 0}
                    style={[
                      styles.primaryBtn,
                      { backgroundColor: colors.primary, opacity: selectedMemberIds.filter((id) => (!currentUserId || id !== currentUserId) && !ownerIds.has(id)).length === 0 ? 0.6 : 1 },
                    ]}
                  >
                    <Text style={{ color: colors['primary-foreground'] }}>Add to Board</Text>
                  </TouchableOpacity>
                </RNView>
              </RNView>
            ) : (
              <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'] }]}>No workspace members available.</Text>
            )}
          </Card>
        </View>
      </Modal>

      {/* Create Board Modal */}
      <Modal animationType="slide" transparent visible={createVisible} onRequestClose={() => setCreateVisible(false)}>
        <View style={styles.modalBackdrop} />
        <View style={[styles.createModalCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
          <Text style={[TextStyles.heading.h3, { color: colors.foreground, marginBottom: 8 }]}>New Board</Text>
          <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'], marginBottom: 12 }]}>Create a new board in this space.</Text>

          <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>Name</Text>
          <TextInput
            value={boardName}
            onChangeText={setBoardName}
            placeholder="Board name"
            placeholderTextColor={colors['muted-foreground']}
            style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.background }]}
          />

          <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'], marginTop: 10 }]}>Description</Text>
          <TextInput
            value={boardDesc}
            onChangeText={setBoardDesc}
            placeholder="Optional description"
            placeholderTextColor={colors['muted-foreground']}
            multiline
            numberOfLines={3}
            style={[styles.textarea, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.background }]}
          />

          <RNView style={[styles.rowBetween, { marginTop: 12 }]}>
            <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>Private</Text>
            <Switch value={isPrivate} onValueChange={setIsPrivate} trackColor={{ true: colors.primary, false: colors.border }} />
          </RNView>

          <RNView style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            {(['kanban', 'list', 'calendar', 'timeline'] as const).map((t) => (
              <TouchableOpacity key={t} onPress={() => setBoardType(t)} style={[styles.pill, { borderColor: colors.border, backgroundColor: boardType === t ? colors.primary : colors.card }]}> 
                <Text style={[TextStyles.caption.small, { color: boardType === t ? colors['primary-foreground'] : colors.foreground }]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </RNView>

          <RNView style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <TouchableOpacity onPress={() => { setCreateVisible(false); resetCreateState(); }} style={[styles.ghostBtn, { borderColor: colors.border }]}> 
              <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={submitCreateBoard} disabled={creating} style={[styles.primaryBtn, { backgroundColor: colors.primary, opacity: creating ? 0.7 : 1 }]}> 
              <Text style={{ color: colors['primary-foreground'], fontWeight: '600' }}>{creating ? 'Creating…' : 'Create Board'}</Text>
            </TouchableOpacity>
          </RNView>
        </View>
      </Modal>
    </View>
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
});
