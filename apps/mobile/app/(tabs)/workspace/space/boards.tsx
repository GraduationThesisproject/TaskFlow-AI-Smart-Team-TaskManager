import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, ActivityIndicator, TouchableOpacity, TextInput, RefreshControl, Alert, ScrollView, Modal } from 'react-native';
import { Text, View, Card } from '@/components/Themed';
import { useAppDispatch, useAppSelector } from '@/store';
import { TextStyles } from '@/constants/Fonts';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useBoards } from '@/hooks/useBoards';
import { fetchMembers } from '@/store/slices/workspaceSlice';
import { archiveBoard, unarchiveBoard } from '@/store/slices/boardSlice';
import { SpaceService } from '@/services/spaceService';
import { formatArchiveCountdown, getArchiveCountdownStyle, getArchiveStatusMessage } from '@/utils/archiveTimeUtils';

export default function SpaceBoards() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { selectedSpace, currentWorkspaceId, members: workspaceMembers } = useAppSelector((s: any) => s.workspace);
  const { boards, loading, error, loadBoardsBySpace, addBoard, removeBoard } = useBoards();

  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType] = useState<'kanban' | 'list' | 'calendar' | 'timeline'>('kanban');
  const [showMembers, setShowMembers] = useState(false);
  const [addingUserId, setAddingUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<'member' | 'viewer' | 'contributor' | 'admin'>('member');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Keep a local, reactive copy of space members so UI updates immediately after add
  const [spaceMembersLocal, setSpaceMembersLocal] = useState<any[]>(() => selectedSpace?.members || []);
  useEffect(() => {
    setSpaceMembersLocal(selectedSpace?.members || []);
  }, [selectedSpace?.members]);

  // Deduplicate members by user id to avoid showing duplicates in UI
  const uniqueSpaceMembers = useMemo(() => {
    const seen = new Set<string>();
    return (spaceMembersLocal || []).filter((m: any) => {
      const uid = String(m?.user?._id || m?.user?.id || m?.user || m?._id || m?.id || '');
      if (!uid || seen.has(uid)) return false;
      seen.add(uid);
      return true;
    });
  }, [spaceMembersLocal]);

  useEffect(() => {
    if (selectedSpace?._id) {
      loadBoardsBySpace(selectedSpace._id);
    }
  }, [selectedSpace?._id, loadBoardsBySpace]);

  useEffect(() => {
    const wsId = selectedSpace?.workspace || currentWorkspaceId;
    if (wsId) {
      dispatch(fetchMembers({ id: wsId }));
    }
  }, [dispatch, selectedSpace?.workspace, currentWorkspaceId]);

  const onRefresh = useCallback(async () => {
    if (!selectedSpace?._id) return;
    setRefreshing(true);
    try {
      await loadBoardsBySpace(selectedSpace._id);
    } finally {
      setRefreshing(false);
    }
  }, [selectedSpace?._id, loadBoardsBySpace]);

  const filteredBoards = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return boards || [];
    return (boards || []).filter((b: any) =>
      (b?.name || '').toLowerCase().includes(q) || (b?.description || '').toLowerCase().includes(q)
    );
  }, [boards, query]);

  const availableMembers = useMemo(() => {
    // Use deduped local members snapshot so UI updates immediately after adding
    const spaceMemberIds = new Set((uniqueSpaceMembers || []).map((m: any) => m?.user?._id || m?.user?.id || m?.user || m?.id));
    return (workspaceMembers || []).filter((m: any) => {
      const candidateId = m?.user?._id || m?.user?.id || m?.userId || m?._id || m?.id;
      if (!candidateId) return false;
      if (spaceMemberIds.has(candidateId)) return false;
      if (m?.role === 'owner') return false;
      return true;
    });
  }, [workspaceMembers, uniqueSpaceMembers]);

  const handleCreate = useCallback(async () => {
    if (!selectedSpace?._id) return;
    if (!newName.trim()) {
      Alert.alert('Validation', 'Please enter a board name.');
      return;
    }
    try {
      setCreating(true);
      await addBoard({
        name: newName.trim(),
        description: newDesc.trim() || undefined,
        type: newType,
        spaceId: selectedSpace._id,
        visibility: 'public',
        settings: { color: '#3B82F6' },
      });
      setNewName('');
      setNewDesc('');
      setShowCreateModal(false);
      await loadBoardsBySpace(selectedSpace._id);
    } catch (e: any) {
      Alert.alert('Create Board Failed', e?.message || 'Failed to create board');
    } finally {
      setCreating(false);
    }
  }, [selectedSpace?._id, newName, newDesc, newType, addBoard, loadBoardsBySpace]);

  const handleAddMemberToSpace = useCallback(async (userId: string, memberObj?: any) => {
    if (!selectedSpace?._id) return;
    // Prevent adding the same member twice (extra safety on top of filtering)
    const alreadyInSpace = (uniqueSpaceMembers || []).some((m: any) => {
      const mid = m?.user?._id || m?.user?.id || m?.user || m?._id || m?.id;
      return String(mid) === String(userId);
    });
    if (alreadyInSpace) {
      Alert.alert('Already a member', 'This user is already a member of the space.');
      return;
    }
    try {
      setAddingUserId(userId);
      await SpaceService.addSpaceMember(selectedSpace._id, userId, selectedRole);
      Alert.alert('Member Added', 'User has been added to this space.');
      // Optimistically update local members list for immediate UI feedback
      if (memberObj) {
        const name = memberObj?.user?.name || memberObj?.name || memberObj?.user?.email || memberObj?.email || 'Member';
        const email = memberObj?.user?.email || memberObj?.email;
        setSpaceMembersLocal((prev) => [
          ...prev,
          { user: { _id: userId, id: userId, name, email }, role: selectedRole }
        ]);
      }
      // Also refresh workspace members list (for availableMembers to shrink)
      const wsId = selectedSpace?.workspace || currentWorkspaceId;
      if (wsId) {
        dispatch(fetchMembers({ id: wsId }));
      }
    } catch (e: any) {
      Alert.alert('Add Member Failed', e?.message || 'Failed to add member to space');
    } finally {
      setAddingUserId(null);
    }
  }, [selectedSpace?._id, selectedRole, selectedSpace?.workspace, currentWorkspaceId, dispatch, spaceMembersLocal]);

  const confirmDelete = useCallback((id: string) => {
    Alert.alert('Delete board', 'Are you sure you want to delete this board?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeBoard(id);
            if (selectedSpace?._id) {
              await loadBoardsBySpace(selectedSpace._id);
            }
          } catch (e: any) {
            Alert.alert('Delete Board Failed', e?.message || 'Failed to delete board');
          }
        },
      },
    ]);
  }, [removeBoard, loadBoardsBySpace, selectedSpace?._id]);

  const handleArchiveBoard = useCallback(async (boardId: string, boardName: string, isArchived: boolean) => {
    const action = isArchived ? 'restore' : 'archive';
    const actionText = isArchived ? 'restore' : 'archive';
    
    Alert.alert(
      `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} Board`,
      `Are you sure you want to ${actionText} "${boardName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: actionText.charAt(0).toUpperCase() + actionText.slice(1),
          onPress: async () => {
            try {
              if (isArchived) {
                await dispatch(unarchiveBoard(boardId));
                Alert.alert('Success', 'Board restored successfully!');
              } else {
                await dispatch(archiveBoard(boardId));
                Alert.alert('Success', 'Board archived successfully!');
              }
              // Refresh boards after archiving/unarchiving
              if (selectedSpace?._id) {
                await loadBoardsBySpace(selectedSpace._id);
              }
            } catch (error) {
              Alert.alert('Error', `Failed to ${actionText} board`);
            }
          }
        }
      ]
    );
  }, [dispatch, loadBoardsBySpace, selectedSpace?._id]);

  if (!selectedSpace) {
    return (
      <View style={styles.container}>
        <Text style={TextStyles.heading.h1}>Boards</Text>
        <Text>No space selected</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header: Space-centric with actions */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Back to Workspace">
          <FontAwesome name="chevron-left" size={18} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#e5e7eb' }}>
              <Text style={TextStyles.body.medium}>
                {selectedSpace?.name?.charAt(0)?.toUpperCase() || 'S'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={TextStyles.heading.h2} numberOfLines={1}>{selectedSpace.name || 'Space'}</Text>
              {!!selectedSpace?.description && (
                <Text style={[TextStyles.caption.small]} numberOfLines={1}>{selectedSpace.description}</Text>
              )}
            </View>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity onPress={() => setShowMembers(true)} style={styles.secondaryBtn} accessibilityLabel="Manage Members">
            <FontAwesome name="users" size={14} />
            <Text style={[TextStyles.caption.small, { marginLeft: 6 }]}>Members</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Toolbar: search + quick create */}
      <Card style={{ padding: 12, marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search boards..."
            style={{ flex: 1, borderWidth: StyleSheet.hairlineWidth, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 }}
          />
          <TouchableOpacity onPress={() => setShowCreateModal(true)} disabled={creating} style={[styles.primaryBtn, creating && { opacity: 0.7 }]}>
            <Text style={TextStyles.body.small}>New Board</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Members Panel */}
      {showMembers && (
        <Card style={{ padding: 12, marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text style={TextStyles.body.medium}>Add Members from Workspace</Text>
            <TouchableOpacity onPress={() => setShowMembers(false)} style={styles.ghostBtn}>
              <Text style={TextStyles.caption.small}>Close</Text>
            </TouchableOpacity>
          </View>
          {/* Current Space Members */}
          <View style={{ marginBottom: 10 }}>
            <Text style={[TextStyles.caption.small, { marginBottom: 6 }]}>Current Members ({uniqueSpaceMembers.length})</Text>
            {uniqueSpaceMembers.length === 0 ? (
              <Text style={TextStyles.caption.small}>No members yet.</Text>
            ) : (
              <View style={{ gap: 6 }}>
                {uniqueSpaceMembers.map((m: any, idx: number) => {
                  const uid = m?.user?._id || m?.user?.id || m?.userId || m?._id || m?.id || idx;
                  const name = m?.user?.name || m?.name || m?.user?.email || m?.email || 'Member';
                  const role = m?.role || 'member';
                  return (
                    <View key={`${uid}-${idx}`} style={[styles.memberRow, { borderColor: '#eee' }]}> 
                      <View style={{ width: 24, height: 24, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: '#e5e7eb' }}>
                        <Text style={TextStyles.caption.small}>{String(name).charAt(0).toUpperCase()}</Text>
                      </View>
                      <View style={{ flex: 1, marginLeft: 8 }}>
                        <Text style={TextStyles.body.small} numberOfLines={1}>{name}</Text>
                        <Text style={TextStyles.caption.small} numberOfLines={1}>{role}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
          {availableMembers.length === 0 ? (
            <Text style={TextStyles.caption.small}>All workspace members are already in this space.</Text>
          ) : (
            <View style={{ gap: 8 }}>
              {availableMembers.map((m: any) => {
                const uid = m?.user?._id || m?.user?.id || m?.userId || m?._id || m?.id;
                const name = m?.user?.name || m?.name || m?.user?.email || m?.email || 'Member';
                const alreadyInSpace = (uniqueSpaceMembers || []).some((sm: any) => {
                  const mid = sm?.user?._id || sm?.user?.id || sm?.user || sm?._id || sm?.id;
                  return String(mid) === String(uid);
                });
                return (
                  <View key={uid} style={[styles.memberRow, { borderColor: '#ddd' }]}> 
                    <View style={{ width: 28, height: 28, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: '#e5e7eb' }}>
                      <Text style={TextStyles.caption.small}>{String(name).charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text style={TextStyles.body.small} numberOfLines={1}>{name}</Text>
                      {!!m?.user?.email && <Text style={TextStyles.caption.small} numberOfLines={1}>{m.user.email}</Text>}
                    </View>
                    <TouchableOpacity onPress={() => handleAddMemberToSpace(uid, m)} disabled={addingUserId === uid || alreadyInSpace} style={[styles.primaryBtn, { paddingVertical: 6, opacity: (addingUserId === uid || alreadyInSpace) ? 0.5 : 1 }]}>
                      <Text style={TextStyles.caption.small}>{addingUserId === uid ? 'Adding…' : (alreadyInSpace ? 'Added' : 'Add')}</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}
        </Card>
      )}

      {/* Create Board Modal */}
      <Modal
        transparent
        animationType="slide"
        visible={showCreateModal}
        onRequestClose={() => !creating && setShowCreateModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={[TextStyles.heading.h3, { marginBottom: 12 }]}>Create Board</Text>
            <View style={{ gap: 8 }}>
              <TextInput
                value={newName}
                onChangeText={setNewName}
                placeholder="Board name"
                style={{ borderWidth: StyleSheet.hairlineWidth, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 }}
              />
              <TextInput
                value={newDesc}
                onChangeText={setNewDesc}
                placeholder="Description (optional)"
                style={{ borderWidth: StyleSheet.hairlineWidth, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 }}
              />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
              <TouchableOpacity onPress={() => setShowCreateModal(false)} disabled={creating} style={styles.ghostBtn}>
                <Text style={TextStyles.body.small}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCreate} disabled={creating} style={[styles.primaryBtn, creating && { opacity: 0.7 }]}>
                <Text style={TextStyles.body.small}>{creating ? 'Creating...' : 'Create'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Content */}
      {loading && (
        <View style={styles.centerBox}>
          <ActivityIndicator />
          <Text style={[TextStyles.body.small, { marginTop: 8 }]}>Loading boards…</Text>
        </View>
      )}

      {!loading && error && (
        <Card style={{ padding: 12 }}>
          <Text style={[TextStyles.body.small]}>Error: {typeof error === 'string' ? error : JSON.stringify(error)}</Text>
        </Card>
      )}

      {!loading && !error && (
        <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
          <View style={{ gap: 12 }}>
            {Array.isArray(filteredBoards) && filteredBoards.length > 0 ? (
              filteredBoards.map((b: any) => (
                <View key={b._id || b.id} style={[styles.boardItem, { borderColor: '#ddd' }]}>
                  <FontAwesome name="columns" size={18} />
                  <View style={{ marginLeft: 8, flex: 1 }}>
                    <Text style={TextStyles.body.medium} numberOfLines={1}>
                      {b.name || 'Board'}
                    </Text>
                    {b.description ? (
                      <Text style={TextStyles.caption.small} numberOfLines={1}>
                        {b.description}
                      </Text>
                    ) : null}
                    {/* Show current space member count on each board item for visibility */}
                    <Text style={TextStyles.caption.small} numberOfLines={1}>
                      Members: {uniqueSpaceMembers.length}
                    </Text>
                    
                    {/* Archive countdown for archived boards */}
                    {b.archived && b.archiveExpiresAt && (
                      <View style={styles.archiveCountdown}>
                        <View style={[
                          styles.countdownBadge,
                          { 
                            backgroundColor: getArchiveCountdownStyle(b.archiveExpiresAt).backgroundColor,
                            borderColor: getArchiveCountdownStyle(b.archiveExpiresAt).borderColor,
                            borderWidth: 1
                          }
                        ]}>
                          <FontAwesome 
                            name="clock-o" 
                            size={10} 
                            color={getArchiveCountdownStyle(b.archiveExpiresAt).color} 
                          />
                          <Text style={[
                            TextStyles.caption.small, 
                            { color: getArchiveCountdownStyle(b.archiveExpiresAt).color }
                          ]}>
                            {getArchiveStatusMessage(b.archiveExpiresAt)}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                  <View style={styles.boardActions}>
                    <TouchableOpacity 
                      onPress={() => handleArchiveBoard(b._id || b.id, b.name || 'Board', b.archived)}
                      style={styles.archiveBtn}
                    >
                      <FontAwesome 
                        name={b.archived ? 'undo' : 'archive'} 
                        size={16} 
                        color={b.archived ? '#10b981' : '#f59e0b'} 
                      />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => confirmDelete(b._id || b.id)} style={styles.destructiveBtn}>
                      <Text style={[TextStyles.caption.small, { color: '#fff' }]}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.centerBox}>
                <FontAwesome name="inbox" size={22} />
                <Text style={[TextStyles.body.small, { marginTop: 8 }]}>No boards</Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  backBtn: { padding: 8, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  centerBox: { alignItems: 'center', justifyContent: 'center', padding: 16 },
  boardItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth },
  boardActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  archiveBtn: { padding: 8, borderRadius: 8, backgroundColor: '#f3f4f6' },
  archiveCountdown: {
    marginTop: 4,
  },
  countdownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  primaryBtn: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, backgroundColor: '#e5e7eb' },
  secondaryBtn: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, backgroundColor: '#f3f4f6', flexDirection: 'row', alignItems: 'center' },
  ghostBtn: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8, backgroundColor: 'transparent' },
  destructiveBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: '#ef4444' },
  memberRow: { flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 8, borderWidth: StyleSheet.hairlineWidth },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  modalCard: { width: '100%', borderRadius: 12, padding: 16, backgroundColor: '#ffffff', borderWidth: StyleSheet.hairlineWidth, borderColor: '#e5e7eb' },
});
