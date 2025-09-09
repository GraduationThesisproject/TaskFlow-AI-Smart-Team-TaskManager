import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

import { View, Text, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { useAppSelector } from '@/store';
import SpaceHeader from '@/components/space/SpaceHeader';
import { SpaceService } from '@/services/spaceService';
import { BoardService } from '@/services/boardService';

export default function SpaceOverviewScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { selectedSpace } = useAppSelector((s: any) => s.workspace);
  const space = selectedSpace;

  const [refreshing, setRefreshing] = useState(false);
  const [boards, setBoards] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    if (!space?._id && !space?.id) return;
    const id = space._id || space.id;
    try {
      const [b, m] = await Promise.all([
        BoardService.getBoardsBySpace(id),
        SpaceService.getSpaceMembers(id),
      ]);
      const boardsList = Array.isArray((b as any)?.data) ? (b as any).data : (Array.isArray(b as any) ? (b as any) : (b as any)?.boards || []);
      const membersList = Array.isArray((m as any)?.data) ? (m as any).data : (Array.isArray(m as any) ? (m as any) : (m as any)?.members || []);
      setBoards(boardsList || []);
      setMembers(membersList || []);
    } catch (e) {
      // allow silent fail; detailed states shown in boards/members tabs
    }
  }, [space]);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    try { await loadData(); } finally { setRefreshing(false); }
  };

  const goBoards = () => router.push('/(tabs)/workspace/space/boards');
  const goSettings = () => router.push('/(tabs)/workspace/settings');

  const membersPreview = useMemo(() => (members || []).slice(0, 5), [members]);
  const boardPreview = useMemo(() => (boards || []).slice(0, 4), [boards]);

  if (!space) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>Space</Text>
        </View>
        <View style={styles.centerBox}>
          <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'] }]}>No space selected.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SpaceHeader
        space={space}
        onCreateBoard={goBoards}
        onMembers={() => router.push('/(tabs)/workspace')}
        onSettings={goSettings}
      />
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Quick stats */}
        <View style={styles.statsRow}>
          <Card style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[TextStyles.heading.h3, { color: colors.primary }]}>{boards.length}</Text>
            <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>Boards</Text>
          </Card>
          <Card style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[TextStyles.heading.h3, { color: colors.accent }]}>{members.length}</Text>
            <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>Members</Text>
          </Card>
        </View>

        {/* Boards preview */}
        <Card style={[styles.sectionCard, { backgroundColor: colors.card }]}> 
          <View style={styles.rowBetween}>
            <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>Recent Boards</Text>
            <TouchableOpacity onPress={goBoards}>
              <Text style={[TextStyles.body.small, { color: colors.primary }]}>View all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.listGap}>
            {boardPreview.length === 0 ? (
              <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'] }]}>No boards yet.</Text>
            ) : (
              boardPreview.map((b: any) => (
                <Card key={b._id || b.id} style={[styles.boardItem, { backgroundColor: colors.background }]}> 
                  <Text style={[TextStyles.body.medium, { color: colors.foreground }]} numberOfLines={1}>{b.name || 'Untitled Board'}</Text>
                  {!!b.description && (
                    <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'], marginTop: 4 }]} numberOfLines={2}>{b.description}</Text>
                  )}
                </Card>
              ))
            )}
          </View>
        </Card>

        {/* Members preview */}
        <Card style={[styles.sectionCard, { backgroundColor: colors.card }]}> 
          <View style={styles.rowBetween}>
            <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>Team Members</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/workspace')}>
              <Text style={[TextStyles.body.small, { color: colors.primary }]}>Manage</Text>
            </TouchableOpacity>
          </View>
          <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'], marginTop: 6 }]}>
            Showing {membersPreview.length} of {members.length}
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderBottomWidth: 1 },
  content: { flex: 1, padding: 16 },
  centerBox: { padding: 24, alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statCard: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center' },
  sectionCard: { padding: 16, borderRadius: 12, marginBottom: 16 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  listGap: { gap: 8, marginTop: 12 },
  boardItem: { padding: 12, borderRadius: 10 },
});
