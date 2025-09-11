import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl, TextInput } from 'react-native';
import { Text, View, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { useAppSelector, useAppDispatch } from '@/store';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Sidebar from '@/components/navigation/Sidebar';
import { fetchWorkspaces, createWorkspace, deleteWorkspace, restoreWorkspace, setCurrentWorkspaceId } from '@/store/slices/workspaceSlice';
import CreateWorkspaceModal from '@/components/common/CreateWorkspaceModal';
import { useRouter } from 'expo-router';
import { formatArchiveCountdown, getArchiveCountdownStyle, getArchiveStatusMessage } from '@/utils/archiveTimeUtils';

export default function WorkspacesScreen() {
  const colors = useThemeColors();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');

  const { workspaces, loading, error } = useAppSelector(state => state.workspace);

  useEffect(() => {
    loadWorkspaces();
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
        visibility: 'private'
      }));
      setNewWorkspaceName('');
      setIsCreating(false);
    } catch (error: any) {
      console.error('Failed to create workspace:', error);
      Alert.alert('Error', error?.message || 'Failed to create workspace');
    }
  };

  const handleCancelCreate = () => {
    setNewWorkspaceName('');
    setIsCreating(false);
  };

  const handleDeleteWorkspace = (workspaceId: string, workspaceName: string) => {
    Alert.alert(
      'Delete Workspace',
      `Are you sure you want to delete "${workspaceName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteWorkspace({ id: workspaceId }));
              Alert.alert('Success', 'Workspace archived successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to archive workspace');
            }
          }
        }
      ]
    );
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
          <FontAwesome name="bars" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>Your Workspaces</Text>
        {!isCreating ? (
          <TouchableOpacity onPress={() => setIsCreating(true)} style={styles.addButton}>
            <FontAwesome name="plus" size={16} color={colors.foreground} />
            <Text style={[TextStyles.body.small, { color: colors.foreground, marginLeft: 4 }]}>New</Text>
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
              style={[styles.createButton, { backgroundColor: colors.success }]}
              disabled={!newWorkspaceName.trim()}
            >
              <FontAwesome name="check" size={14} color={colors.foreground} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleCancelCreate}
              style={[styles.cancelButton, { backgroundColor: colors.muted }]}
            >
              <FontAwesome name="times" size={14} color={colors.foreground} />
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
                <Card style={[styles.workspaceCard, { backgroundColor: colors.card }]}>
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
                        onPress={() => handleDeleteWorkspace(workspace._id, workspace.name)}
                        style={styles.deleteButton}
                      >
                        <FontAwesome name="trash" size={16} color={colors.destructive} />
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
                            backgroundColor: getArchiveCountdownStyle(workspace.archiveExpiresAt).backgroundColor,
                            borderColor: getArchiveCountdownStyle(workspace.archiveExpiresAt).borderColor,
                            borderWidth: 1
                          }
                        ]}>
                          <FontAwesome 
                            name="clock-o" 
                            size={12} 
                            color={getArchiveCountdownStyle(workspace.archiveExpiresAt).color} 
                          />
                          <Text style={[
                            TextStyles.caption.small, 
                            { color: getArchiveCountdownStyle(workspace.archiveExpiresAt).color }
                          ]}>
                            {getArchiveStatusMessage(workspace.archiveExpiresAt)}
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
              style={[styles.createButton, { backgroundColor: colors.primary }]}
            >
              <FontAwesome name="plus" size={16} color={colors['primary-foreground']} />
              <Text style={[TextStyles.body.medium, { color: colors['primary-foreground'] }]}>
                Create Workspace
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <CreateWorkspaceModal
        visible={isCreating}
        onClose={() => setIsCreating(false)}
        onSubmit={handleCreateWorkspace}
        submitting={isCreating}
      />

      <Sidebar isVisible={sidebarVisible} onClose={() => setSidebarVisible(false)} context="dashboard" />
    </View>
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
  createButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
