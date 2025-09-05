import React, { useMemo, useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';

import { Text, View, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { useAppSelector, useAppDispatch } from '@/store';
import { setSelectedSpace } from '@/store/slices/workspaceSlice';

export default function SpaceScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [refreshing, setRefreshing] = useState(false);

  const { selectedSpace } = useAppSelector((state: any) => state.workspace);

  const membersCount = selectedSpace?.members?.length || 0;
  const boardsCount = selectedSpace?.stats?.totalBoards || 0;

  const onRefresh = async () => {
    setRefreshing(true);
    // If there is a specific reload action for space, call it here
    // For now just end the refresh
    setTimeout(() => setRefreshing(false), 600);
  };

  if (!selectedSpace) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.primary }]} onPress={() => router.back()}>
            <FontAwesome name="chevron-left" size={18} color={colors['primary-foreground']} />
          </TouchableOpacity>
          <Text style={[TextStyles.heading.h1, { color: colors.foreground }]}>Space</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'] }]}>No space selected</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.primary }]} onPress={() => router.back()}>
          <FontAwesome name="chevron-left" size={18} color={colors['primary-foreground']} />
        </TouchableOpacity>
        <Text style={[TextStyles.heading.h1, { color: colors.foreground }]} numberOfLines={1}>
          {selectedSpace?.name || 'Space'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {/* Space Overview */}
        <Card style={styles.sectionCard}>
          <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>{selectedSpace?.name}</Text>
          {selectedSpace?.description ? (
            <Text style={[TextStyles.body.small, { color: colors['muted-foreground'], marginTop: 6 }]}>
              {selectedSpace.description}
            </Text>
          ) : null}
        </Card>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <Card style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[TextStyles.heading.h3, { color: colors.primary }]}>{membersCount}</Text>
            <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>Members</Text>
          </Card>
          <Card style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[TextStyles.heading.h3, { color: colors.accent }]}>{boardsCount}</Text>
            <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>Boards</Text>
          </Card>
        </View>

        {/* Boards List (placeholder - wire to real data if available) */}
        <Card style={styles.sectionCard}>
          <Text style={[TextStyles.heading.h2, { color: colors.foreground, marginBottom: 16 }]}>Boards</Text>
          {Array.isArray(selectedSpace?.boards) && selectedSpace?.boards?.length > 0 ? (
            <View style={styles.listContainer}>
              {selectedSpace.boards.map((b: any) => (
                <View key={b._id || b.id} style={[styles.listItem, { backgroundColor: colors.card }]}>
                  <Text style={[TextStyles.body.medium, { color: colors.foreground }]} numberOfLines={1}>{b.name}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={[styles.emptyBox, { backgroundColor: colors.card }]}>
              <FontAwesome name="inbox" size={24} color={colors['muted-foreground']} />
              <Text style={[TextStyles.body.small, { color: colors['muted-foreground'], marginTop: 8 }]}>No boards</Text>
            </View>
          )}
        </Card>

        {/* Members List (compact) */}
        <Card style={styles.sectionCard}>
          <Text style={[TextStyles.heading.h2, { color: colors.foreground, marginBottom: 16 }]}>Members</Text>
          {Array.isArray(selectedSpace?.members) && selectedSpace.members.length > 0 ? (
            <View style={styles.listContainer}>
              {selectedSpace.members.map((m: any) => (
                <View key={m._id || m.id} style={[styles.memberItem, { backgroundColor: colors.card }]}>
                  <FontAwesome name="user" size={18} color={colors.primary} />
                  <Text style={[TextStyles.body.medium, { color: colors.foreground, marginLeft: 8 }]} numberOfLines={1}>
                    {m.user?.name || m.name || 'Member'}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={[styles.emptyBox, { backgroundColor: colors.card }]}>
              <FontAwesome name="users" size={24} color={colors['muted-foreground']} />
              <Text style={[TextStyles.body.small, { color: colors['muted-foreground'], marginTop: 8 }]}>No members</Text>
            </View>
          )}
        </Card>
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerSpacer: { width: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1, padding: 16 },
  sectionCard: { padding: 20, marginBottom: 20 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statCard: { flex: 1, padding: 16, marginHorizontal: 4, alignItems: 'center', borderRadius: 12 },
  listContainer: { gap: 12 },
  listItem: { padding: 16, borderRadius: 12 },
  emptyBox: { alignItems: 'center', justifyContent: 'center', padding: 24, borderRadius: 12 },
  memberItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12 },
});
