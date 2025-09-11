import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, RefreshControl, TextInput, Image, Alert, useWindowDimensions, Modal, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { Text, View, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { useAppDispatch, useAppSelector } from '@/store';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { setCurrentWorkspaceId, setSelectedSpace, fetchMembers, removeMember } from '@/store/slices/workspaceSlice';
import { archiveSpace, unarchiveSpace } from '@/store/slices/spaceSlice';
import { SpaceService } from '@/services/spaceService';
import CreateSpaceModal from '@/components/common/CreateSpaceModal';
import MobileAlert from '@/components/common/Alert';
import ConfirmationDialog from '@/components/common/ConfirmationDialog';
import SpaceCard from '@/components/common/SpaceCard';


// Toggle this to quickly demo with mock data
const USE_MOCK = false;

const MOCK_WORKSPACE = {
  _id: 'mock-ws-1',
  id: 'mock-ws-1',
  name: 'Demo Workspace',
  description: 'This is a demo workspace used to preview the mobile UI.',
  members: [{ id: 'u1' }, { id: 'u2' }, { id: 'u3' }],
};

const MOCK_SPACES = [
  {
    _id: 'mock-space-1',
    name: 'Engineering',
    description: 'All engineering related work and sprints',
    members: [{ id: 'u1' }, { id: 'u2' }],
    stats: { totalBoards: 4 },
  },
  {
    _id: 'mock-space-2',
    name: 'Design',
    description: 'Design tasks, assets and reviews',
    members: [{ id: 'u3' }],
    stats: { totalBoards: 2 },
  },
];

export default function WorkspaceScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; workspaceId?: string }>();
  const dispatch = useAppDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const [spaceSearch, setSpaceSearch] = useState('');
  const [showCreateSpace, setShowCreateSpace] = useState(false);
  const [creatingSpace, setCreatingSpace] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'member' | 'admin'>('member');

  const { currentWorkspaceId, workspaces } = useAppSelector((s: any) => s.workspace);
  const { members, isLoading: membersLoading, error: membersError, currentWorkspace } = useAppSelector((s: any) => s.workspace);
  const { user: authUser } = useAppSelector((s: any) => s.auth);
  const selectedWorkspaceId = (params.workspaceId as string) || (params.id as string) || currentWorkspaceId || null;

  const { workspaces: wsList, currentWorkspace: ws, spaces, loading, error, refetchWorkspaces, loadSpaces, inviteNewMember } = useWorkspaces({ autoFetch: true, workspaceId: selectedWorkspaceId });

  const realWorkspaceId = (currentWorkspace as any)?._id || (currentWorkspace as any)?.id || null;
  const effectiveWorkspace = realWorkspaceId ? currentWorkspace : (USE_MOCK ? (MOCK_WORKSPACE as any) : null);
  const workspaceId = realWorkspaceId || (selectedWorkspaceId || null);

  // Also refresh members when this screen gains focus (helps after invite acceptance)
  useFocusEffect(
    useCallback(() => {
      if (!USE_MOCK && workspaceId) {
        // Refresh both members and spaces when screen focuses so counts stay current
        dispatch(fetchMembers({ id: workspaceId }));
        loadSpaces(workspaceId);
      }
      // No cleanup needed
      return undefined;
    }, [workspaceId, dispatch, loadSpaces])
  );

  // Resolve spaces from hook or fallback to the workspace object returned by the hook
  const spacesSource = useMemo(() => {
    if (Array.isArray(spaces) && spaces.length > 0) return spaces;
    const wsSpaces = (ws as any)?.spaces;
    return Array.isArray(wsSpaces) ? wsSpaces : [];
  }, [spaces, ws]);

  const activeSpaces = useMemo(() => (
    Array.isArray(spacesSource) ? spacesSource.filter((s: any) => s?.status !== 'archived') : []
  ), [spacesSource]);

  // Deduplicate spaces by id to avoid duplicate renders when multiple fetches race
  const uniqueSpaces = useMemo(() => {
    const seen = new Set<string>();
    const list: any[] = [];
    for (const s of activeSpaces) {
      const id = String((s as any)?._id || (s as any)?.id || '');
      if (!id || seen.has(id)) continue;
      seen.add(id);
      list.push(s);
    }
    return list;
  }, [activeSpaces]);

  const effectiveSpaces = uniqueSpaces.length > 0 ? uniqueSpaces : (USE_MOCK ? MOCK_SPACES : []);

  const filteredSpaces = useMemo(() => {
    const q = spaceSearch.trim().toLowerCase();
    if (!q) return effectiveSpaces;
    return (effectiveSpaces || []).filter((s: any) => (s?.name || '').toLowerCase().includes(q) || (s?.description || '').toLowerCase().includes(q));
  }, [spaceSearch, effectiveSpaces]);

  // Deduplicate members by user id to avoid duplicate renders
  const uniqueMembers = useMemo(() => {
    const seen = new Set<string>();
    const out: any[] = [];
    const src = Array.isArray(members) ? members : [];
    for (const m of src) {
      const mid = String(m?.user?._id || m?.userId || m?._id || m?.id || '');
      if (!mid || seen.has(mid)) continue;
      seen.add(mid);
      out.push(m);
    }
    return out;
  }, [members]);

  // Workspace should count unique members (including owner via server data)
  const membersCount = uniqueMembers.length;

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchWorkspaces(),
        workspaceId && !USE_MOCK ? loadSpaces(workspaceId) : Promise.resolve(),
        workspaceId && !USE_MOCK ? dispatch(fetchMembers({ id: workspaceId })) : Promise.resolve(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  // If there is exactly one workspace and none selected, auto-select it
  useEffect(() => {
    if (!USE_MOCK && !selectedWorkspaceId && Array.isArray(workspaces) && workspaces.length === 1) {
      const only = workspaces[0];
      const id = (only as any)?._id || (only as any)?.id;
      if (id) {
        dispatch(setCurrentWorkspaceId(id));
        loadSpaces(id);
      }
    }
  }, [selectedWorkspaceId, workspaces, dispatch, loadSpaces]);

  const handleSelectWorkspace = (ws: any) => {
    const id = ws?._id || ws?.id;
    if (!id) return;
    dispatch(setCurrentWorkspaceId(id));
    loadSpaces(id);
  };

  const handleOpenSpace = (space: any) => {
    dispatch(setSelectedSpace(space));
    router.push('/workspace/space/main');
  };

  const goToReports = () => router.push('/workspace/reports');
  const goToWorkspaceSettings = () => router.push('/workspace/settings');

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    try {
      await inviteNewMember(inviteEmail.trim(), inviteRole);
     setInviteEmail('');
     // Show success banner alert
     setAlertVariant('success');
     setAlertTitle('Invitation sent');
     setAlertDescription(`We sent an invite to ${inviteEmail.trim()}.`);
     setAlertVisible(true);
     // Close the mobile sidebar modal after success (optional)
     setMembersSidebarOpen(false);
    } catch (e: any) {
      // Show an error banner for visibility
      setAlertVariant('error');
      setAlertTitle('Failed to send invite');
      setAlertDescription(e?.message || 'Please try again.');
      setAlertVisible(true);
    }
  };

  // Banner alert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState<string | undefined>(undefined);
  const [alertDescription, setAlertDescription] = useState<string | undefined>(undefined);
  const [alertVariant, setAlertVariant] = useState<'success' | 'error' | 'warning' | 'info'>('info');

  // Confirm removal dialog state
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<any | null>(null);

  const handleRemoveMember = async (member: any) => {
    if (!workspaceId) return;
    // Prevent removing the owner
    if (member?.role === 'owner') return;
    try {
      const memberId = member?.user?._id || member?.userId || member?._id || member?.id;
      console.log('[Workspace] Removing member', {
        workspaceId,
        rawMember: member,
        resolvedMemberId: memberId,
      });
      if (!memberId) throw new Error('Could not determine member id');
      await dispatch(removeMember({ workspaceId, memberId })).unwrap();
      // Ensure local state matches backend by refetching members
      await dispatch(fetchMembers({ id: workspaceId }));
      // Show success banner alert
      setAlertVariant('success');
      setAlertTitle('Member removed');
      setAlertDescription('The member was removed successfully.');
      setAlertVisible(true);
    } catch (e: any) {
      console.warn('Failed to remove member', e);
      Alert.alert('Failed to remove member', e?.message || 'Unknown error');
      // Also show an error banner for visibility
      setAlertVariant('error');
      setAlertTitle('Failed to remove member');
      setAlertDescription(e?.message || 'Unknown error');
      setAlertVisible(true);
    }
  };

  const handleArchiveSpace = async (spaceId: string, spaceName: string, isArchived: boolean) => {
    const action = isArchived ? 'restore' : 'archive';
    const actionText = isArchived ? 'restore' : 'archive';
    
    Alert.alert(
      `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} Space`,
      `Are you sure you want to ${actionText} "${spaceName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: actionText.charAt(0).toUpperCase() + actionText.slice(1),
          onPress: async () => {
            try {
              if (isArchived) {
                await dispatch(unarchiveSpace(spaceId));
                Alert.alert('Success', 'Space restored successfully!');
              } else {
                await dispatch(archiveSpace(spaceId));
                Alert.alert('Success', 'Space archived successfully!');
              }
              // Refresh spaces after archiving/unarchiving
              if (workspaceId) {
                loadSpaces(workspaceId);
              }
            } catch (error) {
              Alert.alert('Error', `Failed to ${actionText} space`);
            }
          }
        }
      ]
    );
  };

  const handleSubmitCreate = async ({ name, description, visibility }: { name: string; description?: string; visibility: 'private' | 'public' }) => {
    if (!workspaceId) return;
    try {
      setCreatingSpace(true);
      await SpaceService.createSpace({
        name,
        description,
        workspaceId,
        settings: { isPrivate: visibility === 'private' },
      });
      await loadSpaces(workspaceId);
      setShowCreateSpace(false);
    } catch (e) {
      console.warn('Failed to create space', e);
    } finally {
      setCreatingSpace(false);
    }
  };

  // Helpers to compute unique, non-owner member count per space
  const getId = (m: any): string => String(m?._id || m?.id || m?.user?._id || m?.user?.id || m?.userId || '').trim();
  const getOwnerIds = (space: any): Set<string> => {
    const ids: string[] = [];
    const push = (v: any) => { const s = String(v || '').trim(); if (s) ids.push(s); };
    if (space?.owner) { const o = space.owner as any; push(o?._id || o?.id || o); }
    if (space?.ownerId) push(space.ownerId);
    if (space?.createdBy) { const c = space.createdBy as any; push(c?._id || c?.id || c); }
    return new Set(ids);
  };
  const getUniqueNonOwnerMemberCount = (space: any): number => {
    const ownerIds = getOwnerIds(space);
    const list = Array.isArray(space?.members) ? space.members.filter(Boolean) : [];
    const unique = new Set<string>();
    for (const m of list) {
      const id = getId(m);
      if (!id || ownerIds.has(id)) continue;
      unique.add(id);
    }
    return unique.size;
  };

  // Grid sizing for 3 columns in Spaces preview
  const [previewGridW, setPreviewGridW] = useState(0);
  const PREVIEW_COLS = 3;
  const PREVIEW_GAP = 12;
  const previewTile = previewGridW > 0
    ? Math.floor((previewGridW - PREVIEW_GAP * (PREVIEW_COLS - 1)) / PREVIEW_COLS)
    : undefined;

  const { width } = useWindowDimensions();
  const isWide = width >= 768;
  const [membersSidebarOpen, setMembersSidebarOpen] = useState(false);

  // Loading state — only block the UI if we have no cached spaces yet
  if (!USE_MOCK && loading && !refreshing && (!Array.isArray(spaces) || spaces.length === 0)) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <FontAwesome name="arrow-left" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[TextStyles.heading.h2, { color: colors.foreground }]} >
            Workspace
          </Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'] }]}>
            Loading workspace...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      {/* Inline banner alert */}
      <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
        <MobileAlert
          variant={alertVariant}
          title={alertTitle}
          description={alertDescription}
          visible={alertVisible}
          onClose={() => setAlertVisible(false)}
        />

      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Error */}
        {!USE_MOCK && error && (
          <Card style={[styles.errorCard, { backgroundColor: colors.destructive }]}>
            <Text style={[TextStyles.body.medium, { color: colors['destructive-foreground'] }]}>Failed to load workspace data. Pull to refresh.</Text>
          </Card>
        )}

        {/* Invite & Quick actions */}
        {workspaceId && effectiveWorkspace && (
          <Card style={styles.sectionCard}>
            <Text style={[TextStyles.heading.h2, { color: colors.foreground, marginBottom: 12 }]}>Invite Members</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TextInput
                value={inviteEmail}
                onChangeText={setInviteEmail}
                placeholder="email@example.com"
                placeholderTextColor={colors['muted-foreground']}
                autoCapitalize="none"
                keyboardType="email-address"
                style={[styles.input, { flex: 1, color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
              />
              <TouchableOpacity onPress={() => setInviteRole(inviteRole === 'member' ? 'admin' : 'member')} style={[styles.pill, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[TextStyles.caption.small, { color: colors.foreground }]}>{inviteRole}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleInvite} style={[styles.primaryBtn, { backgroundColor: colors.primary }]}>
                <Text style={{ color: colors['primary-foreground'] }}>Invite</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* Members List */}
        {workspaceId && (
          <Card style={styles.sectionCard}>
            <Text style={[TextStyles.heading.h2, { color: colors.foreground, marginBottom: 12 }]}>Members ({members?.length || 0})</Text>
            {membersLoading ? (
              <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'] }]}>Loading members...</Text>
            ) : membersError ? (
              <Text style={[TextStyles.body.medium, { color: colors.destructive }]}>{membersError}</Text>
            ) : (Array.isArray(members) && members.length > 0 ? (
              <View style={{ gap: 8 }}>
                {members.map((m: any) => {
                  const displayName = m?.user?.name || m?.name || m?.user?.email || m?.email || 'Member';
                  const email = m?.user?.email || m?.email || '';
                  const avatarUrl = m?.avatar || m?.profile?.avatar || m?.user?.avatar;
                  const letter = String(displayName).charAt(0).toUpperCase();
                  return (
                    <View key={m._id || m.id || m.email} style={[styles.memberItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                      {/* Avatar */}
                      {avatarUrl ? (
                        <Image source={{ uri: avatarUrl }} style={styles.memberAvatar} />
                      ) : (
                        <View style={[styles.memberAvatar, styles.memberAvatarPlaceholder, { backgroundColor: colors.muted }]}>
                          <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>{letter}</Text>
                        </View>
                      )}
                      {/* Name and meta */}
                      <View style={{ flex: 1 }}>
                        <Text style={[TextStyles.body.medium, { color: colors.foreground }]} numberOfLines={1}>{displayName}</Text>
                        {!!email && (
                          <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]} numberOfLines={1}>{email}</Text>
                        )}
                        <View style={styles.memberMetaRow}>
                          <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>{m.role || 'member'}</Text>
                          <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>•</Text>
                          <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>{m.status || 'active'}</Text>
                        </View>
                      </View>
                      {m.role !== 'owner' && (
                        <TouchableOpacity
                          onPress={() => handleRemoveMember(m)}
                          disabled={!!membersLoading}
                          style={[
                            styles.destructiveBtn,
                            { backgroundColor: colors.destructive },
                            membersLoading ? { opacity: 0.6 } : null,
                          ]}
                        >
                          <Text style={{ color: colors['destructive-foreground'] }}>
                            {membersLoading ? 'Removing…' : 'Remove'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}
              </View>
            ) : (
              <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'] }]}>No members yet.</Text>
            ))}
          </Card>
        )}

        {/* Spaces toolbar: Search + Create */}
        <Card style={styles.sectionCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TextInput
              value={spaceSearch}
              onChangeText={setSpaceSearch}
              placeholder="Search spaces..."
              placeholderTextColor={colors['muted-foreground']}
              style={[styles.input, { flex: 1, color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
            />
            <TouchableOpacity onPress={() => setShowCreateSpace(true)} style={[styles.secondaryBtn, { backgroundColor: colors.secondary }]}>
              <Text style={{ color: colors['secondary-foreground'] }}>Create Space</Text>
            </TouchableOpacity>
            {!isWide && (
              <TouchableOpacity onPress={() => setMembersSidebarOpen(true)} style={[styles.primaryBtn, { backgroundColor: colors.primary }]}>
                <Text style={{ color: colors['primary-foreground'] }}>Members</Text>
              </TouchableOpacity>
            )}
          </View>
        </Card>

        {/* Show selector ONLY if no selected id and no current workspace, and multiple workspaces exist */}
        {!USE_MOCK && !workspaceId && Array.isArray(wsList) && wsList.length > 1 && (
          <Card style={styles.sectionCard}>
            <Text style={[TextStyles.heading.h2, { color: colors.foreground, marginBottom: 12 }]}>Select a Workspace</Text>
            <View style={styles.workspaceList}>
              {(wsList || []).map((ws: any) => (
                <TouchableOpacity key={ws._id || ws.id} style={[styles.workspaceItem, { backgroundColor: colors.card }]} onPress={() => handleSelectWorkspace(ws)}>
                  <FontAwesome name="folder" size={22} color={colors.primary} />
                  <View style={styles.workspaceInfo}>
                    <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>{ws.name}</Text>
                    <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
                      {(ws.members?.length || 0)} members • {(ws.spaces?.length || 0)} spaces
                    </Text>
                  </View>
                  <FontAwesome name="chevron-right" size={16} color={colors['muted-foreground']} />
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        )}

        {/* Overview + Actions only when workspace details are loaded */}
        {workspaceId && effectiveWorkspace && (
          <>
            <View style={styles.statsContainer}>
              <Card style={[styles.statCard, { backgroundColor: colors.card }]}>
                <Text style={[TextStyles.heading.h3, { color: colors.primary }]}>{membersCount}</Text>
                <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>Members</Text>
              </Card>
              <Card style={[styles.statCard, { backgroundColor: colors.card }]}>
                <Text style={[TextStyles.heading.h3, { color: colors.accent }]}>{effectiveSpaces.length}</Text>
                <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>Active Spaces</Text>
              </Card>
            </View>

            <Card style={styles.sectionCard}>
              <Text style={[TextStyles.heading.h2, { color: colors.foreground, marginBottom: 16 }]}>Workspace Actions</Text>
              <View style={styles.actionsContainer}>
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary }]} onPress={goToReports}>
                  <FontAwesome name="line-chart" size={16} color={colors['primary-foreground']} />
                  <Text style={[TextStyles.body.small, { color: colors['primary-foreground'] }]}>Reports</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.secondary }]} onPress={goToWorkspaceSettings}>
                  <FontAwesome name="cog" size={16} color={colors['secondary-foreground']} />
                  <Text style={[TextStyles.body.small, { color: colors['secondary-foreground'] }]}>Settings</Text>
                </TouchableOpacity>
                {isOwner && (
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]}
                    onPress={() => router.push({ pathname: '/(tabs)/workspace/rules', params: { workspaceId } })}
                  >
                    <FontAwesome name="pencil" size={16} color={colors.foreground} />
                    <Text style={[TextStyles.body.small, { color: colors.foreground }]}>Edit Rules</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]}
                  onPress={() => router.push('/(tabs)/workspace/rules')}
                >
                  <FontAwesome name="file-text" size={16} color={colors.foreground} />
                  <Text style={[TextStyles.body.small, { color: colors.foreground }]}>Rules</Text>
                </TouchableOpacity>
              </View>
            </Card>
          </>
        )}
        {/* Spaces Preview: show only first 4, with View more */}
        {!!(effectiveSpaces && effectiveSpaces.length) && (
          <Card style={styles.sectionCard}>
            <Text style={[TextStyles.heading.h2, { color: colors.foreground, marginBottom: 16 }]}>Spaces</Text>
            <View style={styles.spaceList}>
              {filteredSpaces.slice(0, 4).map((space: any) => (
                <TouchableOpacity key={space._id || space.id} style={[styles.spaceItem, { backgroundColor: colors.card }]} onPress={() => handleOpenSpace(space)}>
                  <View style={styles.spaceHeader}>
                    <Text style={[TextStyles.body.medium, { color: colors.foreground }]} numberOfLines={1}>{space.name}</Text>
                    <View style={styles.spaceActions}>
                      <TouchableOpacity 
                        onPress={(e) => {
                          e.stopPropagation();
                          handleArchiveSpace(space._id || space.id, space.name, space.isArchived);
                        }}
                        style={styles.archiveButton}
                      >
                        <FontAwesome 
                          name={space.isArchived ? 'undo' : 'archive'} 
                          size={14} 
                          color={space.isArchived ? colors.success : colors.warning} 
                        />
                      </TouchableOpacity>
                      <FontAwesome name="chevron-right" size={14} color={colors['muted-foreground']} />
                    </View>
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
                  
                  {/* Archive countdown for archived spaces */}
                  {space.isArchived && space.archiveExpiresAt && (
                    <View style={styles.archiveCountdown}>
                      <View style={[
                        styles.countdownBadge,
                        { 
                          backgroundColor: getArchiveCountdownStyle(space.archiveExpiresAt).backgroundColor,
                          borderColor: getArchiveCountdownStyle(space.archiveExpiresAt).borderColor,
                          borderWidth: 1
                        }
                      ]}>
                        <FontAwesome 
                          name="clock-o" 
                          size={10} 
                          color={getArchiveCountdownStyle(space.archiveExpiresAt).color} 
                        />
                        <Text 
                          style={[
                            TextStyles.caption.small, 
                            { color: getArchiveCountdownStyle(space.archiveExpiresAt).color }
                          ]}
                        >
                          {getArchiveStatusMessage(space.archiveExpiresAt)}
                        </Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
              {filteredSpaces.length > 9 && (
                <TouchableOpacity
                  style={{ paddingVertical: 8, alignItems: 'center' }}
                  onPress={() => router.push({ pathname: '/workspace/spaces', params: { workspaceId } })}
                >
                  <Text style={[TextStyles.body.small, { color: colors.primary }]}>View more spaces →</Text>
                </TouchableOpacity>
              )}
            </View>
          </Card>
        )}
      </ScrollView>

      {/* Create Space Modal */}
      <CreateSpaceModal
        visible={!!workspaceId && showCreateSpace}
        onClose={() => setShowCreateSpace(false)}
        onSubmit={handleSubmitCreate}
        submitting={creatingSpace}
      />

      {/* Confirm remove member */}
      <ConfirmationDialog
        visible={confirmVisible}
        title="Remove member?"
        message={
          memberToRemove
            ? `Are you sure you want to remove ${memberToRemove?.user?.name || memberToRemove?.name || 'this member'} from the workspace?`
            : 'Are you sure you want to remove this member from the workspace?'
        }
        confirmText="Remove"
        cancelText="Cancel"
        onConfirm={async () => {
          const target = memberToRemove;
          setConfirmVisible(false);
          setMemberToRemove(null);
          if (target) {
            await handleRemoveMember(target);
          }
        }}
        onCancel={() => {
          setConfirmVisible(false);
          setMemberToRemove(null);
        }}
        variant="danger"
      />

      {isWide && (
        <View style={{ width: 320, padding: 16 }}>
          {/* Sidebar: Invite */}
          {workspaceId && effectiveWorkspace && (
            <Card style={styles.sectionCard}>
              <Text style={[TextStyles.heading.h2, { color: colors.foreground, marginBottom: 12 }]}>Invite Members</Text>
              <View style={{ gap: 8 }}>
                <TextInput
                  value={inviteEmail}
                  onChangeText={setInviteEmail}
                  placeholder="email@example.com"
                  placeholderTextColor={colors['muted-foreground']}
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="emailAddress"
                  keyboardType="email-address"
                  style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
                />
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity onPress={() => setInviteRole(inviteRole === 'member' ? 'admin' : 'member')} style={[styles.pill, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[TextStyles.caption.small, { color: colors.foreground }]}>{inviteRole}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleInvite} style={[styles.primaryBtn, { backgroundColor: colors.primary }]}> 
                    <Text style={{ color: colors['primary-foreground'] }}>Invite</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          )}
          {/* Sidebar: Members */}
          {workspaceId && (
            <Card style={styles.sectionCard}>
              <Text style={[TextStyles.heading.h2, { color: colors.foreground, marginBottom: 12 }]}>Members ({membersCount})</Text>
              {membersLoading ? (
                <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'] }]}>Loading members...</Text>
              ) : membersError ? (
                <Text style={[TextStyles.body.medium, { color: colors.destructive }]}>{membersError}</Text>
              ) : (Array.isArray(uniqueMembers) && uniqueMembers.length > 0 ? (
                <View style={{ gap: 8 }}>
                  {uniqueMembers.map((m: any) => {
                    const displayName = m?.user?.name || m?.name || m?.user?.email || m?.email || 'Member';
                    const email = m?.user?.email || m?.email || '';
                    const avatarUrl = m?.avatar || m?.profile?.avatar || m?.user?.avatar;
                    const letter = String(displayName).charAt(0).toUpperCase();
                    return (
                      <View key={m._id || m.id || m.email} style={[styles.memberItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        {avatarUrl ? (
                          <Image source={{ uri: avatarUrl }} style={styles.memberAvatar} />
                        ) : (
                          <View style={[styles.memberAvatar, styles.memberAvatarPlaceholder, { backgroundColor: colors.muted }]}> 
                            <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>{letter}</Text>
                          </View>
                        )}
                        <View style={{ flex: 1 }}>
                          <Text style={[TextStyles.body.medium, { color: colors.foreground }]} numberOfLines={1}>{displayName}</Text>
                          {!!email && (
                            <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]} numberOfLines={1}>{email}</Text>
                          )}
                          <View style={styles.memberMetaRow}>
                            <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>{m.role || 'member'}</Text>
                            <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>•</Text>
                            <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>{m.status || 'active'}</Text>
                          </View>
                        </View>
                        {m.role !== 'owner' && (
                          <TouchableOpacity
                            onPress={() => { setMemberToRemove(m); setConfirmVisible(true); }}
                            disabled={!!membersLoading}
                            style={[styles.destructiveBtn, { backgroundColor: colors.destructive }, membersLoading ? { opacity: 0.6 } : null]}
                          >
                            <Text style={{ color: colors['destructive-foreground'] }}>
                              {membersLoading ? 'Removing…' : 'Remove'}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    );
                  })}
                </View>
              ) : (
                <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'] }]}>No members yet.</Text>
              ))}
            </Card>
          )}
        </View>
      )}
      {/* Sidebar modal on phones */}
      {!isWide && (
        <Modal animationType="slide" transparent visible={membersSidebarOpen} onRequestClose={() => setMembersSidebarOpen(false)}>
          <Pressable style={styles.modalBackdrop} onPress={() => setMembersSidebarOpen(false)} />
          <View style={[styles.modalPanel, { backgroundColor: colors.background, borderLeftColor: colors.border }]}> 
            {/* Invite */}
            {workspaceId && effectiveWorkspace && (
              <Card style={styles.sectionCard}>
                <Text style={[TextStyles.heading.h2, { color: colors.foreground, marginBottom: 12 }]}>Invite Members</Text>
                <View style={{ gap: 8 }}>
                  <TextInput
                    value={inviteEmail}
                    onChangeText={setInviteEmail}
                    placeholder="email@example.com"
                    placeholderTextColor={colors['muted-foreground']}
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="emailAddress"
                    keyboardType="email-address"
                    style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
                  />
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity onPress={() => setInviteRole(inviteRole === 'member' ? 'admin' : 'member')} style={[styles.pill, { backgroundColor: colors.card, borderColor: colors.border }]}>
                      <Text style={[TextStyles.caption.small, { color: colors.foreground }]}>{inviteRole}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleInvite} style={[styles.primaryBtn, { backgroundColor: colors.primary }]}> 
                      <Text style={{ color: colors['primary-foreground'] }}>Invite</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            )}
            {/* Members */}
            {workspaceId && (
              <Card style={styles.sectionCard}>
                <Text style={[TextStyles.heading.h2, { color: colors.foreground, marginBottom: 12 }]}>Members ({membersCount})</Text>
                {membersLoading ? (
                  <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'] }]}>Loading members...</Text>
                ) : membersError ? (
                  <Text style={[TextStyles.body.medium, { color: colors.destructive }]}>{membersError}</Text>
                ) : (Array.isArray(uniqueMembers) && uniqueMembers.length > 0 ? (
                  <View style={{ gap: 8 }}>
                    {uniqueMembers.map((m: any) => {
                      const displayName = m?.user?.name || m?.name || m?.user?.email || m?.email || 'Member';
                      const email = m?.user?.email || m?.email || '';
                      const avatarUrl = m?.avatar || m?.profile?.avatar || m?.user?.avatar;
                      const letter = String(displayName).charAt(0).toUpperCase();
                      return (
                        <View key={m._id || m.id || m.email} style={[styles.memberItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                          {avatarUrl ? (
                            <Image source={{ uri: avatarUrl }} style={styles.memberAvatar} />
                          ) : (
                            <View style={[styles.memberAvatar, styles.memberAvatarPlaceholder, { backgroundColor: colors.muted }]}> 
                              <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>{letter}</Text>
                            </View>
                          )}
                          <View style={{ flex: 1 }}>
                            <Text style={[TextStyles.body.medium, { color: colors.foreground }]} numberOfLines={1}>{displayName}</Text>
                            {!!email && (
                              <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]} numberOfLines={1}>{email}</Text>
                            )}
                            <View style={styles.memberMetaRow}>
                              <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>{m.role || 'member'}</Text>
                              <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>•</Text>
                              <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>{m.status || 'active'}</Text>
                            </View>
                          </View>
                          {m.role !== 'owner' && (
                            <TouchableOpacity
                              onPress={() => { setMemberToRemove(m); setConfirmVisible(true); }}
                              disabled={!!membersLoading}
                              style={[styles.destructiveBtn, { backgroundColor: colors.destructive }, membersLoading ? { opacity: 0.6 } : null]}
                            >
                              <Text style={{ color: colors['destructive-foreground'] }}>
                                {membersLoading ? 'Removing…' : 'Remove'}
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      );
                    })}
                  </View>
                ) : (
                  <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'] }]}>No members yet.</Text>
                ))}
              </Card>
            )}
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1, padding: 16 },
  errorCard: { padding: 16, marginBottom: 16, borderRadius: 12 },
  sectionCard: { padding: 20, marginBottom: 20 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statCard: { flex: 1, padding: 16, marginHorizontal: 4, alignItems: 'center', borderRadius: 12 },
  workspaceList: { gap: 12 },
  workspaceItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12 },
  workspaceInfo: { flex: 1, marginLeft: 12 },
  emptyBox: { alignItems: 'center', justifyContent: 'center', padding: 24, borderRadius: 12 },
  spaceList: { gap: 12 },
  spaceItem: { padding: 16, borderRadius: 12 },
  spaceHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  spaceActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  archiveButton: { padding: 4 },
  spaceStats: { flexDirection: 'row', gap: 8, marginTop: 8 },
  archiveCountdown: {
    marginTop: 6,
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
  actionsContainer: { flexDirection: 'row', gap: 12 },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, gap: 8 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  pill: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 999, borderWidth: 1 },
  primaryBtn: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10 },
  secondaryBtn: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10 },
  memberItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 10, borderWidth: 1 },
  memberMetaRow: { flexDirection: 'row', gap: 6, marginTop: 4 },
  destructiveBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  memberAvatar: { width: 36, height: 36, borderRadius: 18 },
  memberAvatarPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  modalBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#00000088' },
  modalPanel: { position: 'absolute', top: 0, right: 0, bottom: 0, width: 320, borderLeftWidth: StyleSheet.hairlineWidth, padding: 16 },
});