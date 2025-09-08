import React, { useMemo, useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, TextInput, RefreshControl } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';

import { Text, View, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { useAppSelector, useAppDispatch } from '@/store';
import { setSelectedSpace } from '@/store/slices/workspaceSlice';
import { useWorkspaces } from '@/hooks/useWorkspaces';

export default function SpacesScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { currentWorkspaceId } = useAppSelector((s: any) => s.workspace);
  const { spaces, loading, error, loadSpaces } = useWorkspaces({ autoFetch: true, workspaceId: currentWorkspaceId || undefined });

  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (currentWorkspaceId) {
      loadSpaces(currentWorkspaceId);
    }
  }, [currentWorkspaceId, loadSpaces]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return spaces || [];
    return (spaces || []).filter((s: any) => (s?.name || '').toLowerCase().includes(q) || (s?.description || '').toLowerCase().includes(q));
  }, [query, spaces]);

  const onRefresh = async () => {
    if (!currentWorkspaceId) return;
    setRefreshing(true);
    try {
      await loadSpaces(currentWorkspaceId);
    } finally {
      setRefreshing(false);
    }
  };

  const openSpace = (space: any) => {
    // Persist the selection in the store so the details screen can render
    dispatch(setSelectedSpace(space));
    // Navigate to the space screen; also pass id as a param for deep-link robustness
    const id = space?._id || space?.id;
    if (id) {
      router.push({ pathname: '/(tabs)/workspace/space', params: { id } });
    } else {
      router.push('/(tabs)/workspace/space');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.primary }]} onPress={() => router.back()}>
          <FontAwesome name="chevron-left" size={18} color={colors['primary-foreground']} />
        </TouchableOpacity>
        <Text style={[TextStyles.heading.h1, { color: colors.foreground }]} numberOfLines={1}>Spaces</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>        
        {/* Search */}
        <Card style={styles.sectionCard}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search spaces..."
            placeholderTextColor={colors['muted-foreground']}
            style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
          />
        </Card>

        {/* Spaces List */}
        <Card style={styles.sectionCard}>
          <Text style={[TextStyles.heading.h2, { color: colors.foreground, marginBottom: 16 }]}>All Spaces</Text>
          {error && (
            <Card style={[styles.errorCard, { backgroundColor: colors.destructive }]}> 
              <Text style={[TextStyles.body.small, { color: colors['destructive-foreground'] }]}>Failed to load spaces</Text>
            </Card>
          )}
          {(!filtered || filtered.length === 0) ? (
            <View style={[styles.emptyBox, { backgroundColor: colors.card }]}> 
              <FontAwesome name="inbox" size={24} color={colors['muted-foreground']} />
              <Text style={[TextStyles.body.small, { color: colors['muted-foreground'], marginTop: 8 }]}>No spaces yet</Text>
            </View>
          ) : (
            <View style={styles.spaceList}>
              {filtered.map((space: any) => (
                <TouchableOpacity key={space._id || space.id} style={[styles.spaceItem, { backgroundColor: colors.card }]} onPress={() => openSpace(space)}>
                  <View style={styles.spaceHeader}>
                    <Text style={[TextStyles.body.medium, { color: colors.foreground }]} numberOfLines={1}>{space.name}</Text>
                    <FontAwesome name="chevron-right" size={14} color={colors['muted-foreground']} />
                  </View>
                  {space.description ? (
                    <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'], marginTop: 6 }]} numberOfLines={2}>
                      {space.description}
                    </Text>
                  ) : null}
                  <View style={styles.spaceStats}>
                    <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}> {(space.members?.length || 0)} members</Text>
                    <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>•</Text>
                    <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}> {(space.stats?.totalBoards || 0)} boards</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  backButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  headerSpacer: { width: 40 },
  content: { flex: 1, padding: 16 },
  sectionCard: { padding: 20, marginBottom: 20 },
  errorCard: { padding: 12, borderRadius: 12 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  emptyBox: { alignItems: 'center', justifyContent: 'center', padding: 24, borderRadius: 12 },
  spaceList: { gap: 12 },
  spaceItem: { padding: 16, borderRadius: 12 },
  spaceHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  spaceStats: { flexDirection: 'row', gap: 8, marginTop: 8 },
});
