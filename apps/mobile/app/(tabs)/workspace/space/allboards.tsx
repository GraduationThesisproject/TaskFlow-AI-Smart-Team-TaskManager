import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, RefreshControl, View as RNView } from 'react-native';
import { useRouter } from 'expo-router';

import { View, Text, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { useAppDispatch, useAppSelector } from '@/store';
import BoardCard from '@/components/common/BoardCard';
import { BoardService } from '@/services/boardService';
// import { SpaceService } from '@/services/spaceService';
// import { setSelectedSpace } from '@/store/slices/workspaceSlice';

export default function AllBoardsScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { selectedSpace } = useAppSelector((s: any) => s.workspace);
  const space = selectedSpace;

  const [refreshing, setRefreshing] = useState(false);
  const [boards, setBoards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch space (defensive)
  useEffect(() => {
    const maybeFetchSpace = async () => {
      if (!space?._id && !space?.id) {
        try {
          // If needed, you can fetch a default or recent space; here we no-op.
        } catch {}
      }
    };
    maybeFetchSpace();
  }, [space]);

  const loadBoards = useCallback(async () => {
    if (!space?._id && !space?.id) return;
    setLoading(true);
    setError(null);
    try {
      const spaceId = space._id || space.id;
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
      {/* Header */}
      <RNView style={[styles.headerRow, { borderBottomColor: colors.border }]}> 
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { borderColor: colors.border }]}> 
          <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>Back</Text>
        </TouchableOpacity>
        <Text style={[TextStyles.heading.h3, { color: colors.foreground }]}>All Boards</Text>
        <RNView style={{ width: 60 }} />
      </RNView>

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
            <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'] }]}>No boards found.</Text>
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
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  backBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: StyleSheet.hairlineWidth },
  content: { flex: 1, padding: 16 },
  centerBox: { padding: 24, alignItems: 'center', justifyContent: 'center' },
  errorCard: { padding: 16, margin: 16, borderRadius: 12 },
  emptyCard: { padding: 16, borderRadius: 12 },
  boardGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridItem: { marginBottom: 12 },
});
