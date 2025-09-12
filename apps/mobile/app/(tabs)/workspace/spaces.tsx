import React, { useMemo, useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, TextInput, RefreshControl, View, Alert } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

import { Text, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { useAppSelector, useAppDispatch } from '@/store';
import { setSelectedSpace, setCurrentWorkspaceId } from '@/store/slices/workspaceSlice';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { SpaceService } from '@/services/spaceService';
import SpaceCard from '@/components/common/SpaceCard';

export default function SpacesScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const params = useLocalSearchParams<{ id?: string; workspaceId?: string }>();
  const { currentWorkspaceId, selectedSpace } = useAppSelector((s: any) => s.workspace);

  // Prefer an id from route params, fallback to Redux
  const selectedWorkspaceId = (params.workspaceId as string) || (params.id as string) || currentWorkspaceId || undefined;

  const { spaces, loading, error, loadSpaces } = useWorkspaces({ autoFetch: true, workspaceId: selectedWorkspaceId });

  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return spaces || [];
    return (spaces || []).filter((s: any) => (s?.name || '').toLowerCase().includes(q) || (s?.description || '').toLowerCase().includes(q));
  }, [query, spaces]);

  useEffect(() => {
    // Sync route-provided id into Redux to keep state consistent
    if (selectedWorkspaceId && selectedWorkspaceId !== currentWorkspaceId) {
      dispatch(setCurrentWorkspaceId(selectedWorkspaceId));
    }
    if (selectedWorkspaceId) {
      loadSpaces(selectedWorkspaceId);
    }
  }, [selectedWorkspaceId, currentWorkspaceId, dispatch, loadSpaces]);

  // Refresh spaces data whenever this screen gains focus (ensures boards count stays fresh)
  useFocusEffect(
    React.useCallback(() => {
      if (selectedWorkspaceId) {
        loadSpaces(selectedWorkspaceId);
      }
      return undefined;
    }, [selectedWorkspaceId, loadSpaces])
  );

  const onRefresh = async () => {
    if (!selectedWorkspaceId) return;
    setRefreshing(true);
    try {
      await loadSpaces(selectedWorkspaceId);
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
      router.push({ pathname: '/workspace/space/boards', params: { id } });
    } else {
      router.push('/workspace/space/boards');
    }
  };

  const handleSubmitCreate = async ({ name, description, visibility }: { name: string; description?: string; visibility: 'private' | 'public' }) => {
    if (!selectedWorkspaceId) return;
    if (!name || !name.trim()) {
      alert('Name is required.');
      return;
    }
    try {
      setCreating(true);
      await SpaceService.createSpace({
        name: name.trim(),
        description,
        workspaceId: String(selectedWorkspaceId),
      });
      await loadSpaces(selectedWorkspaceId);
      setShowCreate(false);
    } catch (e: any) {
      console.warn('Failed to create space', e?.response?.data || e);
      const msg = e?.response?.data?.message || e?.message || 'Failed to create space';
      alert(msg);
    } finally {
      setCreating(false);
    }
  };

  // Toggle archive/unarchive for a space
  const handleToggleArchive = async (space: any) => {
    if (!selectedWorkspaceId) return;
    const spaceId = String(space?._id || space?.id || '').trim();
    if (!spaceId) return;
    try {
      const isArchived = !!space?.isArchived;
      if (isArchived) {
        await SpaceService.unarchiveSpace(spaceId);
        Alert.alert('Space restored', 'The space has been restored.');
      } else {
        await SpaceService.archiveSpace(spaceId);
        Alert.alert('Space archived', 'The space has been archived.');
      }
      await loadSpaces(selectedWorkspaceId);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to toggle archive state';
      Alert.alert('Action failed', msg);
    }
  };

  // Helpers to compute unique, non-owner member count per space
  const normalizeId = (m: any): string => String(
    m?._id || m?.id || m?.user?._id || m?.user?.id || m?.userId || m?.memberId || ''
  ).trim();
  const normalizeEmail = (m: any): string => String(m?.user?.email || m?.email || '').trim().toLowerCase();
  const normalizeName = (m: any): string => String(m?.user?.name || m?.name || '').trim().toLowerCase();
  const collectOwnerIds = (space: any): Set<string> => {
    const ids: string[] = [];
    const push = (v: any) => { const s = String(v || '').trim(); if (s) ids.push(s); };
    // common owner fields across shapes
    if (space?.owner) { const o = space.owner as any; push(o?._id || o?.id || o?.userId || o); }
    if (space?.ownerId) push(space.ownerId);
    if (space?.owner_id) push(space.owner_id);
    if (space?.ownerUserId) push(space.ownerUserId);
    if (space?.createdBy) { const c = space.createdBy as any; push(c?._id || c?.id || c?.userId || c); }
    if (space?.createdById) push(space.createdById);
    return new Set(ids);
  };
  const getUniqueNonOwnerMemberCount = (space: any): number => {
    const ownerIds = collectOwnerIds(space);
    const list = Array.isArray(space?.members) ? space.members.filter(Boolean) : [];
    const unique = new Set<string>();
    for (const m of list) {
      const id = normalizeId(m);
      if (id && ownerIds.has(id)) continue; // exclude owner by id
      // build a stable composite key when id is missing or unreliable
      const key = id || `${normalizeEmail(m)}|${normalizeName(m)}`;
      if (!key) continue;
      unique.add(key);
    }
    return unique.size;
  };

  // Grid sizing to match Workspace index preview
  const [gridW, setGridW] = useState(0);
  const PREVIEW_COLS = 3;
  const PREVIEW_GAP = 12;
  const tileSize = gridW > 0
    ? Math.floor((gridW - PREVIEW_GAP * (PREVIEW_COLS - 1)) / PREVIEW_COLS)
    : undefined;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.primary }]} onPress={() => router.back()}>
          <FontAwesome name="chevron-left" size={18} color={colors['primary-foreground']} />
        </TouchableOpacity>
        <Text style={[TextStyles.heading.h2, { color: colors.foreground }]} numberOfLines={1}>Spaces</Text>
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
          {!selectedWorkspaceId && (
            <View style={[styles.emptyBox, { backgroundColor: colors.card }]}> 
              <FontAwesome name="exclamation-circle" size={24} color={colors['muted-foreground']} />
              <Text style={[TextStyles.body.small, { color: colors['muted-foreground'], marginTop: 8 }]}>Select a workspace to see its spaces.</Text>
            </View>
          )}
          {error && (
            <Card style={[styles.errorCard, { backgroundColor: colors.destructive }]}> 
              <Text style={[TextStyles.body.small, { color: colors['destructive-foreground'] }]}>Failed to load spaces</Text>
            </Card>
          )}
          {selectedWorkspaceId && (!filtered || filtered.length === 0) ? (
            <View style={[styles.emptyBox, { backgroundColor: colors.card }]}> 
              <FontAwesome name="inbox" size={24} color={colors['muted-foreground']} />
              <Text style={[TextStyles.body.small, { color: colors['muted-foreground'], marginTop: 8 }]}>No spaces yet</Text>
            </View>
          ) : (
            selectedWorkspaceId && (
              <View
                style={[styles.spaceList, { flexDirection: 'row', flexWrap: 'wrap', gap: PREVIEW_GAP, backgroundColor: colors.background }]}
                onLayout={(e) => setGridW(e.nativeEvent.layout.width)}
              >
                {filtered.map((space: any) => (
                  <SpaceCard
                    key={space._id || space.id}
                    name={space.name}
                    description={space.description}
                    membersCount={getUniqueNonOwnerMemberCount(space)}
                    icon={space.icon || '📂'}
                    isArchived={!!space.isArchived}
                    createdAt={space.createdAt || space.created_at || space.createdOn || space.created || space.createdDate}
                    tileSize={tileSize}
                    onPress={() => openSpace(space)}
                    onToggleArchive={() => handleToggleArchive(space)}
                  />
                ))}
              </View>
            )
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
  fabContainer: { position: 'absolute', right: 16, bottom: 24 },
  fab: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 4 },
})