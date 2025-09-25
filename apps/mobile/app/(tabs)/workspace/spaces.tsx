import { StyleSheet, ScrollView, TouchableOpacity, TextInput, RefreshControl, View, Alert, Modal } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import React, { useMemo, useState, useEffect } from 'react';
import { Text, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { useAppSelector, useAppDispatch } from '@/store';
import { setSelectedSpace, setCurrentWorkspaceId } from '@/store/slices/workspaceSlice';
import { setCurrentSpace } from '@/store/slices/spaceSlice';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { SpaceService } from '@/services/spaceService';
import SpaceCard from '@/components/common/SpaceCard';
import PremiumSpaceCard from '@/components/common/PremiumSpaceCard';
import Sidebar from '@/components/navigation/Sidebar';
import { BannerProvider, useBanner } from '@/components/common/BannerProvider';

function SpacesScreenContent() {
  const colors = useThemeColors();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { showSuccess, showError, showWarning, showInfo } = useBanner();
  const [showPremiumModal, setShowPremiumModal] = useState(true); // Show premium modal by default

  const params = useLocalSearchParams<{ id?: string; workspaceId?: string }>();
  const { currentWorkspaceId, selectedSpace } = useAppSelector((s: any) => s.workspace);

  // Prefer an id from route params, fallback to Redux
  const selectedWorkspaceId = (params.workspaceId as string) || (params.id as string) || currentWorkspaceId || undefined;

  const { spaces, loading, error, loadSpaces } = useWorkspaces({ autoFetch: true, workspaceId: selectedWorkspaceId });

  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);

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
    // FIXED: Also update currentSpace in spaceSlice to keep both slices in sync
    dispatch(setCurrentSpace(space));
    // Navigate to the space screen; also pass id as a param for deep-link robustness
    const id = space?._id || space?.id;
    if (id) {
      router.push({ pathname : '/(tabs)/space/allboards', params: { id } });
    } else {
      router.push('/(tabs)/space/allboards');
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

  // Determine if a space should be locked (premium feature)
  const isSpaceLocked = (space: any, index: number): boolean => {
    // Free users can only access the first 5 spaces (index 0-4)
    // All spaces beyond index 4 require Premium
    return index >= 5;
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
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.background }]}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
          >
            <FontAwesome name="arrow-left" size={18} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sidebarButton, { backgroundColor: colors.background }]}
            onPress={() => setSidebarVisible(true)}
            accessibilityLabel="Open menu"
          >
            <FontAwesome name="bars" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.headerCenter}>
          <View style={styles.headerTitleContainer}>
            <View style={[styles.headerIcon, { backgroundColor: colors.primary + '15' }]}>
              <FontAwesome name="folder" size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={[TextStyles.heading.h1, { color: colors.foreground }]}>Spaces</Text>
              <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
                {filtered.length} space{filtered.length !== 1 ? 's' : ''} available
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => setShowCreate(true)}
            style={[styles.createButton, { backgroundColor: colors.primary }]}
            accessibilityLabel="Create new space"
          >
            <FontAwesome name="plus" size={16} color={colors['primary-foreground']} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>        
        {/* Search */}
        <Card style={[styles.sectionCard, { backgroundColor: colors.card }]}>
          <View style={styles.searchContainer}>
            <View style={[styles.searchIcon, { backgroundColor: colors.background }]}>
              <FontAwesome name="search" size={16} color={colors['muted-foreground']} />
            </View>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search spaces..."
              placeholderTextColor={colors['muted-foreground']}
              style={[styles.searchInput, { color: colors.foreground, backgroundColor: colors.background }]}
            />
            {query.length > 0 && (
              <TouchableOpacity
                onPress={() => setQuery('')}
                style={[styles.clearButton, { backgroundColor: colors.muted }]}
              >
                <FontAwesome name="times" size={12} color={colors['muted-foreground']} />
              </TouchableOpacity>
            )}
          </View>
        </Card>

        {/* Spaces List */}
        <Card style={[styles.sectionCard, { backgroundColor: colors.card }]}>
          <View style={styles.spacesHeader}>
            <View style={styles.spacesTitleContainer}>
              <View style={[styles.spacesIcon, { backgroundColor: colors.primary + '15' }]}>
                <FontAwesome name="th-large" size={18} color={colors.primary} />
              </View>
              <View>
                <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>All Spaces</Text>
                <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
                  {filtered.length} space{filtered.length !== 1 ? 's' : ''} found
                </Text>
              </View>
            </View>
            {spaces && spaces.length > 5 && (
              <View style={[styles.premiumBadge, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}>
                <FontAwesome name="star" size={12} color={colors.primary} />
                <Text style={[TextStyles.caption.small, { color: colors.primary, marginLeft: 4, fontWeight: '600' }]}>
                  {spaces.length - 5} more with Premium
                </Text>
              </View>
            )}
          </View>
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
                {filtered.map((space: any, index: number) => {
                  const isLocked = isSpaceLocked(space, index);
                  
                  if (isLocked) {
                    return (
                      <PremiumSpaceCard
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
                        isLocked={isLocked}
                        lockReason="This space requires Premium"
                        benefits={[
                          "Unlimited spaces (currently limited to 5)",
                          "Advanced analytics",
                          "Priority support",
                          "Custom integrations"
                        ]}
                      />
                    );
                  }
                  
                  return (
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
                  );
                })}
              </View>
            )
          )}
        </Card>
      </ScrollView>

      {/* Sidebar */}
      <Sidebar isVisible={sidebarVisible} onClose={() => setSidebarVisible(false)} context="workspace" />

      {/* Premium Lock Modal */}
      <Modal
        visible={showPremiumModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowPremiumModal(false);
          router.back();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {/* Header */}
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <View style={[styles.modalIcon, { backgroundColor: colors.primary + '20' }]}>
                <FontAwesome name="lock" size={24} color={colors.primary} />
              </View>
              <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>
                Premium Feature
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowPremiumModal(false);
                  router.back();
                }}
                style={[styles.modalCloseButton, { backgroundColor: colors.muted }]}
              >
                <FontAwesome name="times" size={16} color={colors['muted-foreground']} />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.modalContent}>
              <Text style={[TextStyles.body.large, { color: colors.foreground, textAlign: 'center', marginBottom: 8 }]}>
                Spaces Management
              </Text>
              <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'], textAlign: 'center', marginBottom: 24 }]}>
                Access all spaces and advanced management features with Premium
              </Text>

              {/* Benefits */}
              <View style={styles.modalBenefits}>
                <Text style={[TextStyles.body.medium, { color: colors.foreground, marginBottom: 12, fontWeight: '600' }]}>
                  Premium includes:
                </Text>
                {[
                  "Unlimited spaces (currently limited to 5)",
                  "Advanced space management",
                  "Priority support",
                  "Custom integrations"
                ].map((benefit, index) => (
                  <View key={index} style={styles.modalBenefitItem}>
                    <FontAwesome name="check" size={16} color={colors.success} style={styles.modalCheckIcon} />
                    <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>
                      {benefit}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Actions */}
            <View style={[styles.modalActions, { borderTopColor: colors.border }]}>
              <TouchableOpacity
                onPress={() => {
                  setShowPremiumModal(false);
                  router.back();
                }}
                style={[styles.modalButton, styles.modalCancelButton, { borderColor: colors.border }]}
              >
                <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'] }]}>
                  Go Back
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowPremiumModal(false);
                  router.push('/(tabs)/settings?section=upgrade');
                }}
                style={[styles.modalButton, styles.modalUpgradeButton, { backgroundColor: colors.primary }]}
              >
                <FontAwesome name="star" size={16} color={colors['primary-foreground']} style={styles.modalUpgradeIcon} />
                <Text style={[TextStyles.body.medium, { color: colors['primary-foreground'], fontWeight: '600' }]}>
                  Upgrade to Premium
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Wrapper component with BannerProvider
export default function SpacesScreen() {
  return (
    <BannerProvider>
      <SpacesScreenContent />
    </BannerProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    minHeight: 72,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerCenter: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  sidebarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  createButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  content: { flex: 1, padding: 20 },
  sectionCard: { 
    padding: 20, 
    marginBottom: 20, 
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  clearButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorCard: { padding: 16, borderRadius: 12 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  emptyBox: { alignItems: 'center', justifyContent: 'center', padding: 24, borderRadius: 12 },
  spacesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  spacesTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  spacesIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  spaceList: { gap: 12 },
  fabContainer: { position: 'absolute', right: 16, bottom: 24 },
  fab: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 4 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    position: 'relative',
  },
  modalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modalCloseButton: {
    position: 'absolute',
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: 20,
  },
  modalBenefits: {
    marginTop: 8,
  },
  modalBenefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalCheckIcon: {
    marginRight: 12,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  modalCancelButton: {
    borderWidth: 1,
  },
  modalUpgradeButton: {
    // backgroundColor set dynamically
  },
  modalUpgradeIcon: {
    marginRight: 8,
  },
})