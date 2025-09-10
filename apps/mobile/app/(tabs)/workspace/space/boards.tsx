import React, { useEffect, useState, useCallback, useRef } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert, useWindowDimensions, View as RNView, Modal, Pressable, TextInput, Switch } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { View, Text, Card } from '@/components/Themed';
import BoardCard from '@/components/common/BoardCard';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { useAppDispatch, useAppSelector } from '@/store';
import { TextStyles } from '@/constants/Fonts';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useBoards } from '@/hooks/useBoards';
import { fetchMembers } from '@/store/slices/workspaceSlice';
import { archiveBoard, unarchiveBoard } from '@/store/slices/boardSlice';
import { SpaceService } from '@/services/spaceService';
import { setSelectedSpace } from '@/store/slices/workspaceSlice';

export default function SpaceBoardsScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const dispatch = useAppDispatch();
  const { width } = useWindowDimensions();
  const isWide = width >= 768; // show right sidebar on tablets/landscape

  const { selectedSpace, members: workspaceMembers } = useAppSelector((s: any) => s.workspace);
  const space = selectedSpace;

  const [refreshing, setRefreshing] = useState(false);
  const lastLoadedSpaceId = useRef<string | null>(null);
  const [boards, setBoards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
  useEffect(() => {
    const maybeFetch = async () => {
      if (!space && params?.id) {
        try {
          const resp = await SpaceService.getSpace(String(params.id));
          const fetched = (resp as any)?.space || (resp as any)?.data || (resp as any);
          if (fetched) dispatch(setSelectedSpace(fetched));
        } catch (e) {
          // ignore; error will surface in boards load if needed
        }
      }
    };
    maybeFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.id]);

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
      await BoardService.createBoard({
        name: boardName.trim(),
        description: boardDesc.trim() || undefined,
        type: boardType,
        visibility: isPrivate ? 'private' : 'public',
        spaceId,
      });
      setCreateVisible(false);
      resetCreateState();
      Alert.alert('Board created', 'Your board has been created.');
      await loadBoards();
    } catch (e: any) {
      Alert.alert('Failed to create board', e?.response?.data?.message || e?.message || 'Unknown error');
    } finally {
      setCreating(false);
    }
  };

  const handleAddMemberToSpace = useCallback(async (userId: string, memberObj?: any) => {
    if (!selectedSpace?._id) return;
    // Prevent adding the same member twice (extra safety on top of filtering)
    const alreadyInSpace = (uniqueSpaceMembers || []).some((m: any) => {
      const mid = m?.user?._id || m?.user?.id || m?.user || m?._id || m?.id;
      return String(mid) === String(userId);
    });
    if (alreadyInSpace) {
      Alert.alert('Already a member', 'This user is already a member of the space.');
      return;
    }
    try {
      setAddingUserId(userId);
      await SpaceService.addSpaceMember(selectedSpace._id, userId, selectedRole);
      Alert.alert('Member Added', 'User has been added to this space.');
      // Optimistically update local members list for immediate UI feedback
      if (memberObj) {
        const name = memberObj?.user?.name || memberObj?.name || memberObj?.user?.email || memberObj?.email || 'Member';
        const email = memberObj?.user?.email || memberObj?.email;
        setSpaceMembersLocal((prev) => [
          ...prev,
          { user: { _id: userId, id: userId, name, email }, role: selectedRole }
        ]);
      }
      // Also refresh workspace members list (for availableMembers to shrink)
      const wsId = selectedSpace?.workspace || currentWorkspaceId;
      if (wsId) {
        dispatch(fetchMembers({ id: wsId }));
      }
    } catch (e: any) {
      Alert.alert('Add Member Failed', e?.message || 'Failed to add member to space');
    } finally {
      setAddingUserId(null);
    }
  }, [selectedSpace?._id, selectedRole, selectedSpace?.workspace, currentWorkspaceId, dispatch, spaceMembersLocal]);

  const confirmDelete = useCallback((id: string) => {
    Alert.alert('Delete board', 'Are you sure you want to delete this board?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeBoard(id);
            if (selectedSpace?._id) {
              await loadBoardsBySpace(selectedSpace._id);
            }
          } catch (e: any) {
            Alert.alert('Delete Board Failed', e?.message || 'Failed to delete board');
          }
        },
      },
    ]);
  }, [removeBoard, loadBoardsBySpace, selectedSpace?._id]);

  const handleArchiveBoard = useCallback(async (boardId: string, boardName: string, isArchived: boolean) => {
    const action = isArchived ? 'restore' : 'archive';
    const actionText = isArchived ? 'restore' : 'archive';
    
    Alert.alert(
      `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} Board`,
      `Are you sure you want to ${actionText} "${boardName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: actionText.charAt(0).toUpperCase() + actionText.slice(1),
          onPress: async () => {
            try {
              if (isArchived) {
                await dispatch(unarchiveBoard(boardId));
                Alert.alert('Success', 'Board restored successfully!');
              } else {
                await dispatch(archiveBoard(boardId));
                Alert.alert('Success', 'Board archived successfully!');
              }
              // Refresh boards after archiving/unarchiving
              if (selectedSpace?._id) {
                await loadBoardsBySpace(selectedSpace._id);
              }
            } catch (error) {
              Alert.alert('Error', `Failed to ${actionText} board`);
            }
          }
        }
      ]
    );
  }, [dispatch, loadBoardsBySpace, selectedSpace?._id]);

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
            space={space}
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
        <View style={{ width: 300, padding: 16 }}>
          <SpaceRightSidebar
            space={space}
            availableMembers={workspaceMembers}
            onInvite={onAddMembersToBoard}
          />
        </View>
      </RNView>
    );
  }

  // Stacked layout on phones
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SpaceHeader
        space={space}
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
          <SpaceRightSidebar
            space={space}
            availableMembers={workspaceMembers}
            onMembersClose={() => setSidebarOpen(false)}
            onInvite={(ids: string[]) => {
              setSidebarOpen(false);
              Alert.alert('Add to board', `Selected member IDs: ${ids.join(', ')}`);
            }}
          />
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

      {/* Content */}
      {loading && (
        <View style={styles.centerBox}>
          <ActivityIndicator />
          <Text style={[TextStyles.body.small, { marginTop: 8 }]}>Loading boards…</Text>
        </View>
      )}

      {!loading && error && (
        <Card style={{ padding: 12 }}>
          <Text style={[TextStyles.body.small]}>Error: {typeof error === 'string' ? error : JSON.stringify(error)}</Text>
        </Card>
      )}

      {!loading && !error && (
        <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
          <View style={{ gap: 12 }}>
            {Array.isArray(filteredBoards) && filteredBoards.length > 0 ? (
              filteredBoards.map((b: any) => (
                <View key={b._id || b.id} style={[styles.boardItem, { borderColor: '#ddd' }]}>
                  <FontAwesome name="columns" size={18} />
                  <View style={{ marginLeft: 8, flex: 1 }}>
                    <Text style={TextStyles.body.medium} numberOfLines={1}>
                      {b.name || 'Board'}
                    </Text>
                    {b.description ? (
                      <Text style={TextStyles.caption.small} numberOfLines={1}>
                        {b.description}
                      </Text>
                    ) : null}
                    {/* Show current space member count on each board item for visibility */}
                    <Text style={TextStyles.caption.small} numberOfLines={1}>
                      Members: {uniqueSpaceMembers.length}
                    </Text>
                  </View>
                  <View style={styles.boardActions}>
                    <TouchableOpacity 
                      onPress={() => handleArchiveBoard(b._id || b.id, b.name || 'Board', b.archived)}
                      style={styles.archiveBtn}
                    >
                      <FontAwesome 
                        name={b.archived ? 'undo' : 'archive'} 
                        size={16} 
                        color={b.archived ? '#10b981' : '#f59e0b'} 
                      />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => confirmDelete(b._id || b.id)} style={styles.destructiveBtn}>
                      <Text style={[TextStyles.caption.small, { color: '#fff' }]}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.centerBox}>
                <FontAwesome name="inbox" size={22} />
                <Text style={[TextStyles.body.small, { marginTop: 8 }]}>No boards</Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  backBtn: { padding: 8, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  centerBox: { alignItems: 'center', justifyContent: 'center', padding: 16 },
  boardItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth },
  boardActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  archiveBtn: { padding: 8, borderRadius: 8, backgroundColor: '#f3f4f6' },
  primaryBtn: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, backgroundColor: '#e5e7eb' },
  secondaryBtn: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, backgroundColor: '#f3f4f6', flexDirection: 'row', alignItems: 'center' },
  ghostBtn: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8, backgroundColor: 'transparent' },
  destructiveBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: '#ef4444' },
  memberRow: { flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 8, borderWidth: StyleSheet.hairlineWidth },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  modalCard: { width: '100%', borderRadius: 12, padding: 16, backgroundColor: '#ffffff', borderWidth: StyleSheet.hairlineWidth, borderColor: '#e5e7eb' },
});
