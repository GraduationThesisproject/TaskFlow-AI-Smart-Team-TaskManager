import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl, TextInput } from 'react-native';
import { Text, View, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { useAppSelector, useAppDispatch } from '@/store';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Sidebar from '@/components/navigation/Sidebar';
import { fetchWorkspaces, createWorkspace, deleteWorkspace, permanentDeleteWorkspace, restoreWorkspace, setCurrentWorkspaceId } from '@/store/slices/workspaceSlice';
import { useRouter } from 'expo-router';
import { formatArchiveCountdown, getArchiveCountdownStyle, getArchiveStatusMessage } from '@/utils/archiveTimeUtils';
import { BannerProvider, useBanner } from '@/components/common/BannerProvider';

function WorkspacesScreenContent() {
  const colors = useThemeColors();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { showSuccess, showError } = useBanner();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [currentTime, setCurrentTime] = useState(Date.now()); // For countdown timer updates

  const { workspaces: rawWorkspaces, loading, error } = useAppSelector(state => state.workspace);

  // Deduplicate workspaces by id to avoid duplicate renders
  const workspaces = useMemo(() => {
    if (!Array.isArray(rawWorkspaces)) return [];
    
    const seen = new Set<string>();
    const uniqueWorkspaces: any[] = [];
    for (const workspace of rawWorkspaces) {
      const id = String(workspace?._id || workspace?.id || '');
      if (!id || seen.has(id)) continue;
      seen.add(id);
      uniqueWorkspaces.push(workspace);
    }
    return uniqueWorkspaces;
  }, [rawWorkspaces]);

  useEffect(() => {
    loadWorkspaces();
  }, []);

  // Update countdown timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const loadWorkspaces = async () => {
    try {
      await dispatch(fetchWorkspaces());
    } catch (error) {
      console.error('Failed to load workspaces:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWorkspaces();
    setRefreshing(false);
  };

  // Navigate to the main Workspace screen (where you can create spaces)
  const goToWorkspace = (ws: any) => {
    const id = ws?._id || ws?.id;
    if (!id) return;
    dispatch(setCurrentWorkspaceId(id));
    router.push({ pathname: '/(tabs)/workspace', params: { workspaceId: id } });
  };

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) return;
    
    try {
      await dispatch(createWorkspace({
        name: newWorkspaceName.trim(),
        description: '',
        isPublic: false
      }));
      setNewWorkspaceName('');
      setIsCreating(false);
      showSuccess('Workspace created successfully!');
    } catch (error: any) {
      console.error('Failed to create workspace:', error);
      showError(error?.message || 'Failed to create workspace');
    }
  };

  const handleCancelCreate = () => {
    setNewWorkspaceName('');
    setIsCreating(false);
  };

  const handleDeleteWorkspace = (workspaceId: string, workspaceName: string, isArchived: boolean = false) => {
    if (isArchived) {
      // Second delete - permanent deletion
      Alert.alert(
        'Permanently Delete Workspace',
        `Are you sure you want to permanently delete "${workspaceName}"? This action cannot be undone and will remove all data permanently.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete Permanently',
            style: 'destructive',
            onPress: async () => {
              try {
                await dispatch(permanentDeleteWorkspace({ id: workspaceId }));
                showSuccess('Workspace permanently deleted!');
              } catch (error) {
                showError('Failed to permanently delete workspace');
              }
            }
          }
        ]
      );
    } else {
      // First delete - archive workspace
      Alert.alert(
        'Archive Workspace',
        `Are you sure you want to archive "${workspaceName}"? It will be moved to archived workspaces and can be restored later.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Archive',
            style: 'destructive',
            onPress: async () => {
              try {
                await dispatch(deleteWorkspace({ id: workspaceId }));
                showSuccess('Workspace archived successfully!');
              } catch (error) {
                showError('Failed to archive workspace');
              }
            }
          }
        ]
      );
    }
  };

  const handleArchiveWorkspace = (workspaceId: string, workspaceName: string, isArchived: boolean) => {
    const action = isArchived ? 'restore' : 'archive';
    const actionText = isArchived ? 'restore' : 'archive';
    
    Alert.alert(
      `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} Workspace`,
      `Are you sure you want to ${actionText} "${workspaceName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: actionText.charAt(0).toUpperCase() + actionText.slice(1),
          onPress: async () => {
            try {
              if (isArchived) {
                await dispatch(restoreWorkspace({ id: workspaceId }));
                Alert.alert('Success', 'Workspace restored successfully!');
              } else {
                await dispatch(deleteWorkspace({ id: workspaceId }));
                Alert.alert('Success', 'Workspace archived successfully!');
              }
            } catch (error) {
              Alert.alert('Error', `Failed to ${actionText} workspace`);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => setSidebarVisible(true)} style={styles.menuButton}>
          <FontAwesome name="bars" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>Your Workspaces</Text>
        {!isCreating ? (
          <TouchableOpacity onPress={() => setIsCreating(true)} style={styles.addButton}>
            <FontAwesome name="plus" size={16} color={colors.primary} />
            <Text style={[TextStyles.body.small, { color: colors.primary, marginLeft: 4 }]}>New</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.createRow}>
            <TextInput
              style={[styles.inlineInput, { 
                backgroundColor: colors.background, 
                color: colors.foreground,
                borderColor: colors.border 
              }]}
              value={newWorkspaceName}
              onChangeText={setNewWorkspaceName}
              placeholder="Enter workspace name..."
              placeholderTextColor={colors['muted-foreground']}
              autoFocus
              onSubmitEditing={handleCreateWorkspace}
              returnKeyType="done"
            />
            <TouchableOpacity 
              onPress={handleCreateWorkspace}
              style={[styles.actionButton, { 
                backgroundColor: newWorkspaceName.trim() ? colors.success : colors.muted,
                opacity: newWorkspaceName.trim() ? 1 : 0.5
              }]}
              disabled={!newWorkspaceName.trim()}
            >
              <FontAwesome name="check" size={14} color={colors['primary-foreground']} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleCancelCreate}
              style={[styles.actionButton, { backgroundColor: colors.muted }]}
            >
              <FontAwesome name="times" size={14} color={colors['muted-foreground']} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'] }]}>
              Loading workspaces...
            </Text>
          </View>
        ) : error ? (
          <Card style={[styles.errorCard, { backgroundColor: colors.card }]}>
            <Text style={[TextStyles.body.medium, { color: colors.destructive }]}>
              Error: {error}
            </Text>
          </Card>
        ) : workspaces && workspaces.length > 0 ? (
          <View style={styles.workspacesList}>
            {workspaces.map((workspace) => (
              <TouchableOpacity
                key={workspace._id}
                activeOpacity={0.85}
                onPress={() => goToWorkspace(workspace)}
              >
                <Card style={[
                  styles.workspaceCard, 
                  { 
                    backgroundColor: workspace.status === 'archived' ? colors.muted : colors.card,
                    opacity: workspace.status === 'archived' ? 0.8 : 1
                  }
                ]}>
                  <View style={styles.workspaceHeader}>
                    <Text style={[TextStyles.heading.h3, { color: colors.foreground }]}>
                      {workspace.name}
                    </Text>
                    <View style={styles.actionButtons}>
                      <TouchableOpacity 
                        onPress={() => handleArchiveWorkspace(workspace._id, workspace.name, workspace.status === 'archived')}
                        style={styles.archiveButton}
                      >
                        <FontAwesome 
                          name={workspace.status === 'archived' ? 'undo' : 'archive'} 
                          size={16} 
                          color={workspace.status === 'archived' ? colors.success : colors.warning} 
                        />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={() => handleDeleteWorkspace(workspace._id, workspace.name, workspace.status === 'archived')}
                        style={styles.deleteButton}
                      >
                        <FontAwesome 
                          name={workspace.status === 'archived' ? 'trash' : 'trash-o'} 
                          size={16} 
                          color={workspace.status === 'archived' ? colors.destructive : colors['muted-foreground']} 
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'] }]}>
                    {workspace.description || 'No description'}
                  </Text>
                  
                  <View style={styles.workspaceInfo}>
                    <View style={styles.infoRow}>
                      <FontAwesome name="users" size={14} color={colors['muted-foreground']} />
                      {(() => {
                        const memberLen = Array.isArray(workspace.members) ? workspace.members.length : 0;
                        const ownerIncluded = workspace.owner ? 1 : 0;
                        const totalMembers = memberLen + ownerIncluded;
                        return (
                          <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
                            {totalMembers} members
                          </Text>
                        );
                      })()}
                    </View>
                    
                    <View style={styles.infoRow}>
                      <FontAwesome name="calendar" size={14} color={colors['muted-foreground']} />
                      <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
                        Created {new Date(workspace.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    
                    <View style={styles.badges}>
                      <View style={[
                        styles.badge, 
                        { backgroundColor: workspace.isPublic ? colors.success : colors.muted }
                      ]}>
                        <Text style={[TextStyles.caption.small, { color: colors.foreground }]}>
                          {workspace.isPublic ? 'Public' : 'Private'}
                        </Text>
                      </View>
                      
                      <View style={[
                        styles.badge, 
                        { backgroundColor: workspace.isActive ? colors.success : colors.destructive }
                      ]}>
                        <Text style={[TextStyles.caption.small, { color: colors.foreground }]}>
                          {workspace.isActive ? 'Active' : 'Archived'}
                        </Text>
                      </View>
                    </View>
                    
                    {/* Archive countdown for archived workspaces */}
                    {workspace.status === 'archived' && workspace.archiveExpiresAt && (
                      <View style={styles.archiveCountdown}>
                        <View style={[
                          styles.countdownBadge,
                          { 
                            backgroundColor: getArchiveCountdownStyle(workspace.archiveExpiresAt, currentTime).backgroundColor,
                            borderColor: getArchiveCountdownStyle(workspace.archiveExpiresAt, currentTime).borderColor,
                            borderWidth: 1
                          }
                        ]}>
                          <FontAwesome 
                            name="clock-o" 
                            size={12} 
                            color={getArchiveCountdownStyle(workspace.archiveExpiresAt, currentTime).color} 
                          />
                          <Text style={[
                            TextStyles.caption.small, 
                            { color: getArchiveCountdownStyle(workspace.archiveExpiresAt, currentTime).color }
                          ]}>
                            {getArchiveStatusMessage(workspace.archiveExpiresAt, currentTime)}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <FontAwesome name="folder-open" size={64} color={colors['muted-foreground']} />
            <Text style={[TextStyles.heading.h3, { color: colors.foreground }]}>
              No workspaces yet
            </Text>
            <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'], textAlign: 'center' }]}>
              Create your first workspace to get started with team collaboration.
            </Text>
            <TouchableOpacity 
              onPress={() => setIsCreating(true)}
              style={[styles.emptyStateButton, { backgroundColor: colors.primary }]}
            >
              <FontAwesome name="plus" size={16} color={colors['primary-foreground']} />
              <Text style={[TextStyles.body.medium, { color: colors['primary-foreground'] }]}>
                Create Workspace
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>


      <Sidebar isVisible={sidebarVisible} onClose={() => setSidebarVisible(false)} context="dashboard" />
    </View>
  );
}

export default function WorkspacesScreen() {
  return (
    <BannerProvider>
      <WorkspacesScreenContent />
    </BannerProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  menuButton: {
    padding: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  createRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inlineInput: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    minWidth: 120,
    maxWidth: 200,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  errorCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  workspacesList: {
    gap: 16,
  },
  workspaceCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  workspaceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  archiveButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  workspaceInfo: {
    marginTop: 12,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  archiveCountdown: {
    marginTop: 8,
  },
  countdownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
    gap: 16,
  },
  actionButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
});
