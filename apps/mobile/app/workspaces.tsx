import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { Text, View, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { useAppSelector, useAppDispatch } from '@/store';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Sidebar from '@/components/navigation/Sidebar';
import { fetchWorkspaces, createWorkspace, deleteWorkspace } from '@/store/slices/workspaceSlice';

export default function WorkspacesScreen() {
  const colors = useThemeColors();
  const dispatch = useAppDispatch();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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

  const handleCreateWorkspace = () => {
    Alert.alert(
      'Create Workspace',
      'Enter workspace details',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create',
          onPress: async () => {
            try {
              await dispatch(createWorkspace({
                name: 'New Workspace',
                description: 'A new workspace for collaboration',
                isPublic: false,
                isActive: true
              }));
              Alert.alert('Success', 'Workspace created successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to create workspace');
            }
          }
        }
      ]
    );
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
              await dispatch(deleteWorkspace(workspaceId));
              Alert.alert('Success', 'Workspace deleted successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete workspace');
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
        <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>Workspaces</Text>
        <TouchableOpacity onPress={handleCreateWorkspace} style={styles.addButton}>
          <FontAwesome name="plus" size={20} color={colors.primary} />
        </TouchableOpacity>
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
              <Card key={workspace._id} style={[styles.workspaceCard, { backgroundColor: colors.card }]}>
                <View style={styles.workspaceHeader}>
                  <Text style={[TextStyles.heading.h3, { color: colors.foreground }]}>
                    {workspace.name}
                  </Text>
                  <TouchableOpacity 
                    onPress={() => handleDeleteWorkspace(workspace._id, workspace.name)}
                    style={styles.deleteButton}
                  >
                    <FontAwesome name="trash" size={16} color={colors.destructive} />
                  </TouchableOpacity>
                </View>
                
                <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'] }]}>
                  {workspace.description || 'No description'}
                </Text>
                
                <View style={styles.workspaceInfo}>
                  <View style={styles.infoRow}>
                    <FontAwesome name="users" size={14} color={colors['muted-foreground']} />
                    <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
                      {workspace.members?.length || 0} members
                    </Text>
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
                </View>
              </Card>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <FontAwesome name="folder-open" size={64} color={colors['muted-foreground']} />
            <Text style={[TextStyles.heading.h3, { color: colors.foreground }]}>
              No Workspaces Yet
            </Text>
            <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'], textAlign: 'center' }]}>
              Create your first workspace to start collaborating with your team.
            </Text>
            <TouchableOpacity 
              onPress={handleCreateWorkspace}
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
    padding: 8,
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
    gap: 8,
    marginTop: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
    gap: 16,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
});
