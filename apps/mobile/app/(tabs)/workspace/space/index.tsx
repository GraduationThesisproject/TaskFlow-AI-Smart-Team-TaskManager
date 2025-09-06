import React, { useMemo } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { Text, View, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { useAppSelector } from '@/store';

export default function SpaceScreen() {
  const colors = useThemeColors();
  const router = useRouter();

  const { selectedSpace, currentWorkspace } = useAppSelector((s: any) => s.workspace);

  const space = selectedSpace;
  const workspaceName = useMemo(() => currentWorkspace?.name ?? 'Workspace', [currentWorkspace]);

  const goBoards = () => router.push('/(tabs)/workspace/space/boards');
  const goMembers = () => router.push('/(tabs)/workspace/space/members');
  const goSettings = () => router.push('/(tabs)/workspace/space/settings');

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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[TextStyles.heading.h1, { color: colors.foreground }]} numberOfLines={1}>
          {space.name}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content}>
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

        {/* Quick nav */}
        <Card style={styles.sectionCard}>
          <Text style={[TextStyles.heading.h2, { color: colors.foreground, marginBottom: 16 }]}>Space Actions</Text>
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary }]} onPress={goBoards}>
              <FontAwesome name="columns" size={16} color={colors['primary-foreground']} />
              <Text style={[TextStyles.body.small, { color: colors['primary-foreground'] }]}>Boards</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.secondary }]} onPress={goMembers}>
              <FontAwesome name="users" size={16} color={colors['secondary-foreground']} />
              <Text style={[TextStyles.body.small, { color: colors['secondary-foreground'] }]}>Members</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.accent }]} onPress={goSettings}>
              <FontAwesome name="cog" size={16} color={colors['accent-foreground']} />
              <Text style={[TextStyles.body.small, { color: colors['accent-foreground'] }]}>Settings</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <Card style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[TextStyles.heading.h3, { color: colors.primary }]}>{space.members?.length ?? 0}</Text>
            <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>Members</Text>
          </Card>
          <Card style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[TextStyles.heading.h3, { color: colors.accent }]}>{space.stats?.totalBoards ?? 0}</Text>
            <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>Boards</Text>
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
  content: { flex: 1, padding: 16 },
  sectionCard: { padding: 20, marginBottom: 20 },
  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statCard: { flex: 1, padding: 16, marginHorizontal: 4, alignItems: 'center', borderRadius: 12 },
  actionsContainer: { flexDirection: 'row', gap: 12 },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, gap: 8 },
});