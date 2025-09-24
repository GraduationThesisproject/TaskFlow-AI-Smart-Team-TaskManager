import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View as RNView, Platform, StatusBar } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { View, Text, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { useAppDispatch, useAppSelector } from '@/store';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import BoardCard from '@/components/common/BoardCard';
import { BoardService } from '@/services/boardService';
import { MobileAlertProvider, useMobileAlert } from '@/components/common/MobileAlertProvider';
import { BannerProvider, useBanner } from '@/components/common/BannerProvider';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import BoardSearch from './components/BoardSearch';
import GridBoards from './components/GridBoards';

function AllBoardsContent() {
  const colors = useThemeColors();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const dispatch = useAppDispatch();
  const { loadSpaces } = useWorkspaces({ autoFetch: false });
  const { showConfirm } = useMobileAlert();
  const { showSuccess, showError, showWarning } = useBanner();
  
  const topInset = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0;

  const { selectedSpace } = useAppSelector((s: any) => s.workspace);
  const space = selectedSpace;

  const [boards, setBoards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [boardSearch, setBoardSearch] = useState('');

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
    const sid = String(space?._id || space?.id || params?.id || '').trim();
    if (!sid) return;
    setLoading(true);
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
      // Ignore errors in UI per requirements
    } finally {
      setLoading(false);
    }
  }, [space?._id, space?.id, params?.id]);

  useEffect(() => {
    loadBoards();
  }, [loadBoards]);

  const filteredBoards = useMemo(() => {
    const q = (boardSearch || '').trim().toLowerCase();
    if (!q) return boards;
    return boards.filter((b: any) => String(b?.name || '').toLowerCase().includes(q) || String(b?.description || '').toLowerCase().includes(q));
  }, [boardSearch, boards]);

  const handlePressBoard = useCallback((board: any) => {
    const id = board?._id || board?.id;
    const name = board?.name || 'Board';
    if (!id) return;
    router.push({ pathname: '/(tabs)/board', params: { boardId: String(id), boardName: name } });
  }, [router]);

  const isBoardArchived = useCallback((b: any): boolean => {
    const status = String(b?.status || '').toLowerCase();
    return b?.archived === true || b?.isArchived === true || status === 'archived' || status === 'inactive';
  }, []);

  const archivingIdsRef = React.useRef<Set<string>>(new Set());

  const handleToggleArchive = useCallback((board: any) => {
    const id = board?._id || board?.id;
    if (!id) return;
    if (archivingIdsRef.current.has(String(id))) {
      return;
    }
    const archived = isBoardArchived(board);
    const nextAction = archived ? 'restore' : 'archive';
    showConfirm(
      `${archived ? 'Restore' : 'Archive'} Board`,
      `Are you sure you want to ${nextAction} "${board?.name || 'this board'}"?`,
      async () => {
        try {
          archivingIdsRef.current.add(String(id));
          const resp = archived ? await BoardService.unarchiveBoard(id) : await BoardService.archiveBoard(id);
          showSuccess(archived ? 'Board restored successfully!' : 'Board archived successfully!');
          // Keep current list order; avoid refetching that may reorder
        } catch (e: any) {
          showError(e?.response?.data?.message || e?.message || `Failed to ${nextAction} board`);
        } finally {
          archivingIdsRef.current.delete(String(id));
        }
      }
    );
  }, [isBoardArchived, showConfirm, showSuccess, showError, loadBoards]);

  // 3-column grid sizing
  const [gridWidth, setGridWidth] = useState(0);
  const COLUMNS = 3;
  const GRID_GAP = 12;
  const itemWidth = gridWidth > 0
    ? Math.floor((gridWidth - GRID_GAP * (COLUMNS - 1)) / COLUMNS)
    : undefined;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      {/* Minimal header: back only */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border, paddingTop: 28 + topInset }]}>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/space/main')}
          style={[styles.backBtn, { backgroundColor: colors.background }]}
          accessibilityLabel="Back to space"
        >
          <FontAwesome name="arrow-left" size={18} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>All Boards</Text>
        <RNView style={{ width: 44 }} />
      </View>

      {/* Search */}
      <BoardSearch value={boardSearch} onChange={setBoardSearch} />

      {/* Boards Grid */}
      <ScrollView style={styles.content}>
        <RNView onLayout={(e) => setGridWidth(e.nativeEvent.layout.width)}>
          <GridBoards
            boards={filteredBoards}
            itemWidth={itemWidth}
            onPressBoard={handlePressBoard}
            onToggleArchive={handleToggleArchive}
          />
        </RNView>
      </ScrollView>
    </View>
  );
}

export default function AllBoardsScreen() {
  return (
    <BannerProvider>
      <MobileAlertProvider>
        <AllBoardsContent />
      </MobileAlertProvider>
    </BannerProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  backBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
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
