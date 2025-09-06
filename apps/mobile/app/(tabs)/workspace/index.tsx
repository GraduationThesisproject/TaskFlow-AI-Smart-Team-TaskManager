import React, { useMemo, useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, RefreshControl, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { Text, View, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { useAppDispatch, useAppSelector } from '@/store';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { setCurrentWorkspaceId, setSelectedSpace } from '@/store/slices/workspaceSlice';
import Sidebar from '@/components/navigation/Sidebar';

// Toggle this to quickly demo with mock data
const USE_MOCK = false;

// TEMP: default workspace id until dashboard selection is fixed
const TEMP_WORKSPACE_ID = '68b06f8102fea373776954ee';

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
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [spaceSearch, setSpaceSearch] = useState('');
  const [showCreateSpace, setShowCreateSpace] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('');
  const [newSpaceDescription, setNewSpaceDescription] = useState('');
  const [newSpaceVisibility, setNewSpaceVisibility] = useState<'private' | 'public'>('private');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'member' | 'admin'>('member');

  const { currentWorkspaceId, workspaces } = useAppSelector((s: any) => s.workspace);
  const selectedWorkspaceId = (params.workspaceId as string) || (params.id as string) || currentWorkspaceId || TEMP_WORKSPACE_ID;

  const { workspaces: wsList, currentWorkspace, spaces, loading, error, refetchWorkspaces, loadSpaces, inviteNewMember, createNewWorkspace } = useWorkspaces({ autoFetch: true, workspaceId: selectedWorkspaceId });

  const realWorkspaceId = (currentWorkspace as any)?._id || (currentWorkspace as any)?.id || null;
  const effectiveWorkspace = realWorkspaceId ? currentWorkspace : (USE_MOCK ? (MOCK_WORKSPACE as any) : null);
  const workspaceId = realWorkspaceId || (selectedWorkspaceId || null);

  const activeSpaces = useMemo(() => {
    return Array.isArray(spaces) ? spaces.filter((s: any) => s?.status !== 'archived') : [];
  }, [spaces]);
  const effectiveSpaces = activeSpaces.length > 0 ? activeSpaces : (USE_MOCK ? MOCK_SPACES : activeSpaces);
  const filteredSpaces = useMemo(() => {
    const q = spaceSearch.trim().toLowerCase();
    if (!q) return effectiveSpaces;
    return (effectiveSpaces || []).filter((s: any) => (s?.name || '').toLowerCase().includes(q) || (s?.description || '').toLowerCase().includes(q));
  }, [spaceSearch, effectiveSpaces]);

  const membersCount = (effectiveWorkspace as any)?.members?.length || (effectiveWorkspace as any)?.memberCount || 0;

  const toggleSidebar = () => setSidebarVisible(!sidebarVisible);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchWorkspaces();
      if (workspaceId && !realWorkspaceId) {
        // In mock mode we don't refetch spaces
      } else if (workspaceId) {
        loadSpaces(workspaceId);
      }
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
    router.push('/(tabs)/workspace/space');
  };

  const goToReports = () => router.push('/(tabs)/workspace/reports');
  const goToWorkspaceSettings = () => router.push('/(tabs)/workspace/settings');

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    try {
      await inviteNewMember(inviteEmail.trim(), inviteRole);
      setInviteEmail('');
    } catch (e: any) {
      // surfaced via console
    }
  };

  const handleCreateSpace = async () => {
    if (!newSpaceName.trim()) return;
    try {
      await createNewWorkspace({ name: newSpaceName.trim(), description: newSpaceDescription.trim() || undefined, visibility: newSpaceVisibility });
      setNewSpaceName('');
      setNewSpaceDescription('');
      setNewSpaceVisibility('private');
      setShowCreateSpace(false);
    } catch (e) {}
  };

  // Loading state
  if (!USE_MOCK && loading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity style={[styles.sidebarButton, { backgroundColor: colors.primary }]} onPress={toggleSidebar}>
            <FontAwesome name="bars" size={20} color={colors['primary-foreground']} />
          </TouchableOpacity>
          <Text style={[TextStyles.heading.h1, { color: colors.foreground }]}>Workspace</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>Loading workspace...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={[styles.sidebarButton, { backgroundColor: colors.primary }]} onPress={toggleSidebar}>
          <FontAwesome name="bars" size={20} color={colors['primary-foreground']} />
        </TouchableOpacity>
        <Text style={[TextStyles.heading.h1, { color: colors.foreground }]}>Workspace</Text>
        <View style={styles.headerSpacer} />
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
            <TouchableOpacity onPress={() => setShowCreateSpace((v) => !v)} style={[styles.secondaryBtn, { backgroundColor: colors.secondary }]}>
              <Text style={{ color: colors['secondary-foreground'] }}>{showCreateSpace ? 'Close' : 'Create Space'}</Text>
            </TouchableOpacity>
          </View>
          {showCreateSpace && (
            <View style={{ marginTop: 12, gap: 8 }}>
              <TextInput
                value={newSpaceName}
                onChangeText={setNewSpaceName}
                placeholder="Space name"
                placeholderTextColor={colors['muted-foreground']}
                style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
              />
              <TextInput
                value={newSpaceDescription}
                onChangeText={setNewSpaceDescription}
                placeholder="Description (optional)"
                placeholderTextColor={colors['muted-foreground']}
                style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
              />
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity onPress={() => setNewSpaceVisibility('private')} style={[styles.pill, { backgroundColor: newSpaceVisibility === 'private' ? colors.primary : colors.card, borderColor: colors.border }]}>
                  <Text style={{ color: newSpaceVisibility === 'private' ? colors['primary-foreground'] : colors.foreground }}>Private</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setNewSpaceVisibility('public')} style={[styles.pill, { backgroundColor: newSpaceVisibility === 'public' ? colors.primary : colors.card, borderColor: colors.border }]}>
                  <Text style={{ color: newSpaceVisibility === 'public' ? colors['primary-foreground'] : colors.foreground }}>Public</Text>
                </TouchableOpacity>
                <View style={{ flex: 1 }} />
                <TouchableOpacity onPress={handleCreateSpace} style={[styles.primaryBtn, { backgroundColor: colors.primary }]}>
                  <Text style={{ color: colors['primary-foreground'] }}>Create</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
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

        {/* Current Workspace Overview */}
        {workspaceId && effectiveWorkspace && (
          <>
            <Card style={styles.sectionCard}>
              <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>{(effectiveWorkspace as any)?.name}</Text>
              {(effectiveWorkspace as any)?.description ? (
                <Text style={[TextStyles.body.small, { color: colors['muted-foreground'], marginTop: 6 }]}>
                  {(effectiveWorkspace as any).description}
                </Text>
              ) : null}
            </Card>

            {/* Quick Stats */}
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

            {/* Workspace Actions */}
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
              </View>
            </Card>

            {/* Spaces List */}
            <Card style={styles.sectionCard}>
              <Text style={[TextStyles.heading.h2, { color: colors.foreground, marginBottom: 16 }]}>Workspace Spaces</Text>
              {filteredSpaces.length === 0 ? (
                <View style={[styles.emptyBox, { backgroundColor: colors.card }]}>
                  <FontAwesome name="inbox" size={24} color={colors['muted-foreground']} />
                  <Text style={[TextStyles.body.small, { color: colors['muted-foreground'], marginTop: 8 }]}>No spaces yet</Text>
                </View>
              ) : (
                <View style={styles.spaceList}>
                  {filteredSpaces.map((space: any) => (
                    <TouchableOpacity key={space._id} style={[styles.spaceItem, { backgroundColor: colors.card }]} onPress={() => handleOpenSpace(space)}>
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
                        <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}> 
                          {(space.members?.length || 0)} members
                        </Text>
                        <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>•</Text>
                        <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}> 
                          {(space.stats?.totalBoards || 0)} boards
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </Card>
          </>
        )}
      </ScrollView>

      {/* Sidebar */}
      <Sidebar isVisible={sidebarVisible} onClose={() => setSidebarVisible(false)} currentSection="workspace" />
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
  sidebarButton: {
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
  spaceStats: { flexDirection: 'row', gap: 8, marginTop: 8 },
  actionsContainer: { flexDirection: 'row', gap: 12 },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, gap: 8 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  pill: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 999, borderWidth: 1 },
  primaryBtn: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10 },
  secondaryBtn: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10 },
});
