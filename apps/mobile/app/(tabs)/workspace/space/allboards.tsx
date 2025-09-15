import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, RefreshControl, View as RNView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { View, Text, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { useAppDispatch, useAppSelector } from '@/store';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import BoardCard from '@/components/common/BoardCard';
import { BoardService } from '@/services/boardService';
import SpaceHeader from '@/components/space/SpaceHeader';

export default function AllBoardsScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const dispatch = useAppDispatch();
  const { loadSpaces } = useWorkspaces({ autoFetch: false });

  const { selectedSpace } = useAppSelector((s: any) => s.workspace);
  const space = selectedSpace;

  const [refreshing, setRefreshing] = useState(false);
  const [boards, setBoards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch space (defensive)
  useEffect(() => {
    const maybeFetchSpace = async () => {
      console.log('maybeFetchSpace', space);
      if (!space?._id && !space?.id) {
        try {
          // If needed, you can fetch a default or recent space; here we no-op.
        } catch {}
      }
    };
    maybeFetchSpace();
  }, [space]);

  const loadBoards = useCallback(async () => {
    const sid = String(space?._id || space?.id || params?.id || '').trim();
    if (!sid) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await BoardService.getBoardsBySpace(sid);
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
      setError(e?.message || 'Failed to load boards');
    } finally {
      setLoading(false);
    }
  }, [space?._id, space?.id, params?.id]);

  useEffect(() => {
    loadBoards();
  }, [loadBoards]);

  const onRefresh = async () => {
    setRefreshing(true);
    try { await loadBoards(); } finally { setRefreshing(false); }
  };

  // 3-column grid sizing
  const [gridWidth, setGridWidth] = useState(0);
  const COLUMNS = 3;
  const GRID_GAP = 12;
  const itemWidth = gridWidth > 0
    ? Math.floor((gridWidth - GRID_GAP * (COLUMNS - 1)) / COLUMNS)
    : undefined;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      {/* Match SpaceBoardsScreen header */}
      <SpaceHeader
        space={{
          ...space,
          totalBoards: Array.isArray(boards) ? boards.length : (space?.totalBoards || space?.stats?.totalBoards || 0),
          stats: { ...(space?.stats || {}), totalBoards: Array.isArray(boards) ? boards.length : (space?.stats?.totalBoards || 0) },
        }}
        onBackToWorkspace={() => router.push('/(tabs)/workspace')}
        onSettings={() => router.push('/workspace/space/settings')}
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
            {/* Preview board UI (match SpaceBoardsScreen) */}
            <RNView style={[styles.previewBoard, { borderColor: colors.border, backgroundColor: colors.background }]}> 
              {['To do', 'In progress', 'Done'].map((col) => (
                <RNView key={col} style={styles.previewColumn}> 
                  <Text style={[TextStyles.caption.small, { color: colors.foreground, marginBottom: 6 }]} numberOfLines={1}>{col}</Text>
                  <RNView style={[styles.previewCard, { backgroundColor: colors.card, borderColor: colors.border }]} />
                  <RNView style={[styles.previewCard, { backgroundColor: colors.card, borderColor: colors.border }]} />
                </RNView>
              ))}
            </RNView>
          </Card>
        ) : (
          <RNView
            style={styles.boardGrid}
            onLayout={(e) => setGridWidth(e.nativeEvent.layout.width)}
          >
            {boards.map((b: any) => (
              <BoardCard
                key={b._id || b.id}
                board={b}
                style={[styles.gridItem, itemWidth ? { width: itemWidth } : null]}
              />
            ))}
          </RNView>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 16 },
  centerBox: { padding: 24, alignItems: 'center', justifyContent: 'center' },
  errorCard: { padding: 16, margin: 16, borderRadius: 12 },
  emptyCard: { padding: 16, borderRadius: 12 },
  boardGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridItem: { marginBottom: 12 },
  previewBoard: { flexDirection: 'row', gap: 8, padding: 8, borderWidth: StyleSheet.hairlineWidth, borderRadius: 10 },
  previewColumn: { flex: 1 },
  previewCard: { height: 36, borderRadius: 8, borderWidth: StyleSheet.hairlineWidth, marginBottom: 6 },
})
