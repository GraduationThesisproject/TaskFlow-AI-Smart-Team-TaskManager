import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, View as RNView, ScrollView, TextInput } from 'react-native';
import { Text, View, Card } from '@/components/Themed';
import { TextStyles } from '@/constants/Fonts';
import { useThemeColors } from '@/components/ThemeProvider';
import { useSpaceManager } from '@/hooks/useSpaceManager';
import type { Board } from '@/types/board.types';
import { router } from 'expo-router';

export default function SpaceBoardsScreen() {
  const colors = useThemeColors();
  const {
    currentSpace,
    loading,
    error,
    loadBoardsBySpace,
    getBoardsBySpace,
    selectBoard,
    addBoard,
    loadSpaceMembers,
  } = useSpaceManager();

  const spaceId = currentSpace?._id;
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (spaceId) {
      loadBoardsBySpace(spaceId);
    }
  }, [spaceId, loadBoardsBySpace]);

  const boardsInSpace = useMemo<Board[]>(() => {
    return spaceId ? getBoardsBySpace(spaceId) : [];
  }, [spaceId, getBoardsBySpace]);

  const filteredBoards = useMemo<Board[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return boardsInSpace;
    return boardsInSpace.filter(b =>
      (b.name || '').toLowerCase().includes(q) ||
      (b.description || '').toLowerCase().includes(q)
    );
  }, [boardsInSpace, query]);

  const openBoard = (board: Board) => {
    // set current board in state so downstream screens can use it
    selectBoard(board);

    // navigate based on board type; fallback to kanban
    const type = board.type || 'kanban';
    const routeByType: Record<string, string> = {
      kanban: '/(tabs)/board/kanban',
      list: '/(tabs)/board/list',
      timeline: '/(tabs)/board/timeline',
      calendar: '/(tabs)/board/kanban',
    };
    router.push(routeByType[type] || '/(tabs)/board/kanban');
  };

  const handleCreateBoard = async () => {
    if (!spaceId) return;
    try {
      await addBoard({
        name: `New Board`,
        description: '',
        type: 'kanban',
        visibility: 'private',
        spaceId: spaceId,
        settings: {},
      } as any);
      loadBoardsBySpace(spaceId);
    } catch (e) {
      console.error('Create board failed', e);
    }
  };

  const renderBoardItem = ({ item }: { item: Board }) => (
    <TouchableOpacity onPress={() => openBoard(item)} style={viewMode === 'grid' ? { flex: 1 } : undefined}>
      <Card style={[styles.card, viewMode === 'grid' ? styles.cardGrid : null, { borderColor: colors.border, backgroundColor: colors.card }]} > 
        <View style={styles.cardHeader}>
          <Text style={[TextStyles.heading.h2, { color: colors.foreground }]} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={[styles.badge, { backgroundColor: colors.muted }]} > 
            <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
              {item.isTemplate ? 'Template' : item.type}
            </Text>
          </View>
        </View>
        {!!item.description && (
          <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        <View style={styles.cardFooter}>
          <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
            Members: {Array.isArray(item.members) ? item.members.length : 0}
          </Text>
          {item.archived && (
            <View style={[styles.badge, { backgroundColor: colors.muted }]}>
              <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>Archived</Text>
            </View>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <RNView style={{ flex: 1 }}>
          <Text style={[TextStyles.heading.h1, { color: colors.foreground }]} numberOfLines={1}>
            {currentSpace?.name || 'Space'}
          </Text>
          {!!currentSpace?.description && (
            <Text style={[TextStyles.body.small, { color: colors['muted-foreground'], marginTop: 4 }]} numberOfLines={2}>
              {currentSpace.description}
            </Text>
          )}
        </RNView>
        <RNView style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity style={[styles.actionBtn, { borderColor: colors.border }]} onPress={() => router.push('/(tabs)/settings')}>
            <Text style={[TextStyles.caption.small, { color: colors.foreground }]}>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { borderColor: colors.border }]}
            onPress={async () => {
              if (spaceId) {
                try { await loadSpaceMembers(spaceId); } catch {}
              }
              router.push('/(tabs)/settings');
            }}
          >
            <Text style={[TextStyles.caption.small, { color: colors.foreground }]}>Members</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.primary }]} onPress={handleCreateBoard}>
            <Text style={[TextStyles.caption.small, { color: colors['primary-foreground'] }]}>New Board</Text>
          </TouchableOpacity>
        </RNView>
      </View>

      {/* Sub header actions: search and view toggle */}
      <RNView style={[styles.subHeader, { borderBottomColor: colors.border }]}>
        <RNView style={[styles.searchBox, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search boards..."
            placeholderTextColor={colors['muted-foreground']}
            style={{ color: colors.foreground }}
          />
        </RNView>
        <RNView style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            onPress={() => setViewMode('grid')}
            style={[styles.toggleBtn, { borderColor: colors.border, backgroundColor: viewMode === 'grid' ? colors.muted : 'transparent' }]}
          >
            <Text style={[TextStyles.caption.small, { color: colors.foreground }]}>Grid</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setViewMode('list')}
            style={[styles.toggleBtn, { borderColor: colors.border, backgroundColor: viewMode === 'list' ? colors.muted : 'transparent' }]}
          >
            <Text style={[TextStyles.caption.small, { color: colors.foreground }]}>List</Text>
          </TouchableOpacity>
        </RNView>
      </RNView>

      {/* Content */}
      {loading && (
        <View style={styles.center}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'], marginTop: 8 }]}>Loading boards…</Text>
        </View>
      )}

      {!loading && !!error && (
        <View style={styles.center}>
          <Text style={[TextStyles.body.medium, { color: colors.destructive || '#ef4444' }]}>Failed to load boards</Text>
        </View>
      )}

      {!loading && !error && filteredBoards.length === 0 && (
        <View style={[styles.center, { padding: 24 }]}>
          <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'], textAlign: 'center' }]}>No boards found in this space.</Text>
          <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'], marginTop: 6, textAlign: 'center' }]}>Create a board from web or add one here if supported.</Text>
        </View>
      )}

      {/* Stats like web SpaceHeader */}
      {currentSpace?.stats && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }} style={{ marginTop: 8 }}>
          <Card style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]} > 
            <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>Total Boards</Text>
            <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>{currentSpace.stats.totalBoards ?? 0}</Text>
          </Card>
          <Card style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]} > 
            <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>Total Tasks</Text>
            <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>{currentSpace.stats.totalTasks ?? 0}</Text>
          </Card>
          <Card style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]} > 
            <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>Completed</Text>
            <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>{currentSpace.stats.completedTasks ?? 0}</Text>
          </Card>
          <Card style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]} > 
            <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>Progress</Text>
            <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>{(() => {
              const total = currentSpace.stats.totalTasks ?? 0;
              const done = currentSpace.stats.completedTasks ?? 0;
              return total > 0 ? Math.round((done / total) * 100) : 0;
            })()}%</Text>
          </Card>
        </ScrollView>
      )}

      {!loading && !error && filteredBoards.length > 0 && (
        <FlatList
          data={filteredBoards}
          keyExtractor={(b) => b._id}
          renderItem={renderBoardItem}
          numColumns={viewMode === 'grid' ? 2 : 1}
          columnWrapperStyle={viewMode === 'grid' ? { gap: 12 } : undefined}
          contentContainerStyle={{ padding: 16, gap: viewMode === 'grid' ? 12 : 0 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 12,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  cardGrid: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 12,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  cardFooter: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  searchBox: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  toggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  primaryBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  statCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 140,
  },
});
