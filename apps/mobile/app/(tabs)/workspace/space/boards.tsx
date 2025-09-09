import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert, useWindowDimensions, View as RNView, Modal, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { View, Text, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { useAppDispatch, useAppSelector } from '@/store';
import SpaceHeader from '@/components/space/SpaceHeader';
import SpaceRightSidebar from '@/components/space/SpaceRightSidebar';
import { BoardService } from '@/services/boardService';
import { SpaceService } from '@/services/spaceService';
import { setSelectedSpace } from '@/store/slices/workspaceSlice';

export default function SpaceBoardsScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const dispatch = useAppDispatch();
  const { width } = useWindowDimensions();
  const isWide = width >= 768; // show right sidebar on tablets/landscape

  const { selectedSpace } = useAppSelector((s: any) => s.workspace);
  const space = selectedSpace;

  const [refreshing, setRefreshing] = useState(false);
  const [boards, setBoards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const loadBoards = useCallback(async () => {
    if (!space?._id && !space?.id) return;
    setLoading(true);
    setError(null);
    try {
      const spaceId = space._id || space.id;
      const resp = await BoardService.getBoardsBySpace(spaceId);
      const list = Array.isArray((resp as any)?.data)
        ? (resp as any).data
        : Array.isArray(resp as any)
        ? (resp as any)
        : (resp as any)?.boards || [];
      setBoards(list || []);
    } catch (e: any) {
      console.warn('Failed to load boards', e);
      setError(e?.message || 'Failed to load boards');
    } finally {
      setLoading(false);
    }
  }, [space]);

  useEffect(() => {
    loadBoards();
  }, [loadBoards]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadBoards();
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreateBoard = async () => {
    if (!space?._id && !space?.id) return;
    try {
      const spaceId = space._id || space.id;
      await BoardService.createBoard({
        name: 'New Board',
        description: '',
        type: 'kanban',
        visibility: 'private',
        spaceId,
      });
      Alert.alert('Board created', 'Your board has been created.');
      await loadBoards();
    } catch (e: any) {
      Alert.alert('Failed to create board', e?.message || 'Unknown error');
    }
  };

  const goMembers = () => {
    // On phones, open the sidebar as a drawer; on wide screens it's already visible
    if (!isWide) setSidebarOpen(true);
  };
  const goSettings = () => router.push('/workspace/space/settings');
  const onAddMembersToBoard = (ids: string[]) => {
    // TODO: integrate with API to add members to current board or space
    Alert.alert('Add to board', `Selected member IDs: ${ids.join(', ')}`);
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
            space={space}
            onCreateBoard={handleCreateBoard}
            onMembers={goMembers}
            onSettings={goSettings}
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
                <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'] }]}>No boards yet.</Text>
                <TouchableOpacity onPress={handleCreateBoard} style={[styles.primaryBtn, { backgroundColor: colors.primary, marginTop: 12 }]}>
                  <Text style={{ color: colors['primary-foreground'] }}>Create your first board</Text>
                </TouchableOpacity>
              </Card>
            ) : (
              <View style={styles.boardList}>
                {boards.map((b: any) => (
                  <Card key={b._id || b.id} style={[styles.boardItem, { backgroundColor: colors.card }]}> 
                    <View style={styles.rowBetween}>
                      <Text style={[TextStyles.body.medium, { color: colors.foreground }]} numberOfLines={1}>
                        {b.name || 'Untitled Board'}
                      </Text>
                    </View>
                    {!!b.description && (
                      <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'], marginTop: 6 }]} numberOfLines={2}>
                        {b.description}
                      </Text>
                    )}
                  </Card>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
        <View style={{ width: 300, padding: 16 }}>
          <SpaceRightSidebar
            space={space}
            onSettings={goSettings}
            onMembers={goMembers}
            onAddMembersToBoard={onAddMembersToBoard}
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
        onCreateBoard={handleCreateBoard}
        onMembers={goMembers}
        onSettings={goSettings}
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
            <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'] }]}>No boards yet.</Text>
            <TouchableOpacity onPress={handleCreateBoard} style={[styles.primaryBtn, { backgroundColor: colors.primary, marginTop: 12 }]}>
              <Text style={{ color: colors['primary-foreground'] }}>Create your first board</Text>
            </TouchableOpacity>
          </Card>
        ) : (
          <View style={styles.boardList}>
            {boards.map((b: any) => (
              <Card key={b._id || b.id} style={[styles.boardItem, { backgroundColor: colors.card }]}> 
                <View style={styles.rowBetween}>
                  <Text style={[TextStyles.body.medium, { color: colors.foreground }]} numberOfLines={1}>
                    {b.name || 'Untitled Board'}
                  </Text>
                </View>
                {!!b.description && (
                  <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'], marginTop: 6 }]} numberOfLines={2}>
                    {b.description}
                  </Text>
                )}
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
      {/* Sidebar Modal Drawer */}
      <Modal animationType="slide" transparent visible={sidebarOpen} onRequestClose={() => setSidebarOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setSidebarOpen(false)} />
        <View style={[styles.modalPanel, { backgroundColor: colors.background, borderLeftColor: colors.border }]}> 
          <SpaceRightSidebar
            space={space}
            onSettings={goSettings}
            onMembers={() => setSidebarOpen(false)}
            onAddMembersToBoard={(ids: string[]) => {
              setSidebarOpen(false);
              Alert.alert('Add to board', `Selected member IDs: ${ids.join(', ')}`);
            }}
          />
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
  emptyCard: { padding: 16, borderRadius: 12, alignItems: 'center' },
  primaryBtn: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10 },
  boardList: { gap: 12 },
  boardItem: { padding: 16, borderRadius: 12 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#00000088' },
  modalPanel: { position: 'absolute', top: 0, right: 0, bottom: 0, width: 320, borderLeftWidth: StyleSheet.hairlineWidth, padding: 16 },
});
