import React, { useMemo, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { Text, View, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { useAppSelector, useAppDispatch } from '@/store';
import { fetchSpace, setSelectedSpace } from '@/store/slices/workspaceSlice';

export default function SpaceScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const params = useLocalSearchParams<{ id?: string }>();
  const spaceIdParam = params?.id as string | undefined;

  const { selectedSpace, currentWorkspace } = useAppSelector((s: any) => s.workspace);

  const space = selectedSpace;
  const workspaceName = useMemo(() => currentWorkspace?.name ?? 'Workspace', [currentWorkspace]);

  // If opened with an id param, load and select the space if not already selected
  useEffect(() => {
    const currentId = (space as any)?._id || (space as any)?.id;
    if (spaceIdParam && spaceIdParam !== currentId) {
      dispatch(fetchSpace(spaceIdParam))
        .unwrap()
        .then((sp: any) => {
          if (sp) dispatch(setSelectedSpace(sp));
        })
        .catch(() => {
          // ignore; UI will show fallback state
        });
    }
  }, [spaceIdParam, (space as any)?._id, (space as any)?.id, dispatch]);

  const goKanban = () => router.push('/(tabs)/workspace/space/boards'); // Kanban view parity -> boards list for now
  const goList = () => Alert.alert('List View', 'List view coming soon on mobile.');
  const goTimeline = () => Alert.alert('Timeline', 'Timeline view coming soon on mobile.');
  const goMembers = () => router.push('/(tabs)/workspace/space/members');
  const goSettings = () => router.push('/(tabs)/workspace/space/settings');
  const createBoard = () => Alert.alert('Create Board', 'Quick create coming soon on mobile. Navigate to Boards to create.');

  const goBack = () => router.back();

  if (!space) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <Text style={[TextStyles.heading.h1, { color: colors.foreground }]}>Space</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.emptyBox}>
          <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'], textAlign: 'center' }]}>
            No space selected. Go back and choose a space from the Workspace screen.
          </Text>
        </View>
      </View>
    );
  }

  const totalBoards = space.totalBoards ?? space.stats?.totalBoards ?? 0;
  const totalTasks = space.totalTasks ?? 0;
  const completedTasks = space.completedTasks ?? 0;
  const progressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={[styles.headerBtn, { backgroundColor: colors.primary }]} onPress={goBack}>
          <FontAwesome name="chevron-left" size={18} color={colors['primary-foreground']} />
        </TouchableOpacity>
        <Text style={[TextStyles.heading.h1, { color: colors.foreground, flex: 1 }]} numberOfLines={1}>
          {space.name}
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={goSettings}>
            <FontAwesome name="cog" size={16} color={colors['muted-foreground']} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={goMembers}>
            <FontAwesome name="users" size={16} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={createBoard}>
            <FontAwesome name="columns" size={16} color={colors.accent} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Sub-navigation (web SubNavigation parity) */}
        <Card style={[styles.sectionCard, { paddingVertical: 12 }]}>
          <View style={styles.subnavRow}>
            <TouchableOpacity style={[styles.subnavChip, { backgroundColor: colors.primary }]} onPress={goKanban}>
              <Text style={{ color: colors['primary-foreground'] }}>Kanban</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.subnavChip, { backgroundColor: colors.secondary }]} onPress={goList}>
              <Text style={{ color: colors['secondary-foreground'] }}>List</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.subnavChip, { backgroundColor: colors.accent }]} onPress={goTimeline}>
              <Text style={{ color: colors['accent-foreground'] }}>Timeline</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* About */}
        <Card style={styles.sectionCard}>
          <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
            {workspaceName}
          </Text>
          <Text style={[TextStyles.heading.h2, { color: colors.foreground, marginTop: 2 }]} numberOfLines={1}>
            {space.name}
          </Text>
          {space.description ? (
            <Text style={[TextStyles.body.small, { color: colors['muted-foreground'], marginTop: 8 }]}>
              {space.description}
            </Text>
          ) : null}
        </Card>

        {/* Stats (aligned with web: Total Boards, Total Tasks, Completed, Progress) */}
        <View style={styles.statsGrid}>
          <Card style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>Total Boards</Text>
            <Text style={[TextStyles.heading.h3, { color: colors.primary }]}>{totalBoards}</Text>
          </Card>
          <Card style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>Total Tasks</Text>
            <Text style={[TextStyles.heading.h3, { color: colors.accent }]}>{totalTasks}</Text>
          </Card>
          <Card style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>Completed</Text>
            <Text style={[TextStyles.heading.h3, { color: colors.success || colors.primary }]}>{completedTasks}</Text>
          </Card>
          <Card style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>Progress</Text>
            <Text style={[TextStyles.heading.h3, { color: colors.warning }]}>{progressPct}%</Text>
          </Card>
        </View>
      </ScrollView>
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
  headerSpacer: { width: 40 },
  headerBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, marginLeft: 8 },
  content: { flex: 1, padding: 16 },
  sectionCard: { padding: 20, marginBottom: 20 },
  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  statCard: { flexBasis: '48%', padding: 16, borderRadius: 12 },
  subnavRow: { flexDirection: 'row', gap: 8, justifyContent: 'space-between' },
  subnavChip: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 999 },
});