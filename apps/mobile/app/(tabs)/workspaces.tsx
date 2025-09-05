import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, View, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { useAppSelector, useAppDispatch } from '@/store';
import { fetchWorkspaces } from '@/store/slices/workspaceSlice';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Sidebar from '@/components/navigation/Sidebar';

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

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const getWorkspaceStats = () => {
    const total = workspaces?.length || 0;
    const active = workspaces?.filter(w => w.isActive)?.length || 0;
    const publicWorkspaces = workspaces?.filter(w => w.isPublic)?.length || 0;
    const privateWorkspaces = total - publicWorkspaces;
    
    return { total, active, public: publicWorkspaces, private: privateWorkspaces };
  };

  const stats = getWorkspaceStats();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={toggleSidebar} style={styles.menuButton}>
          <FontAwesome name="bars" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>Workspaces</Text>
        <TouchableOpacity style={styles.addButton}>
          <FontAwesome name="plus" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Overview Stats */}
        <Card style={[styles.overviewCard, { backgroundColor: colors.card }]}>
          <Text style={[TextStyles.heading.h3, { color: colors.foreground, marginBottom: 16 }]}>
            Workspace Overview
          </Text>
          
          <View style={styles.statsGrid}>
            <View style={[styles.statItem, { backgroundColor: colors.background }]}>
              <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>{stats.total}</Text>
              <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>Total</Text>
            </View>
            <View style={[styles.statItem, { backgroundColor: colors.background }]}>
              <Text style={[TextStyles.heading.h2, { color: colors.success }]}>{stats.active}</Text>
              <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>Active</Text>
            </View>
            <View style={[styles.statItem, { backgroundColor: colors.background }]}>
              <Text style={[TextStyles.heading.h2, { color: colors.primary }]}>{stats.public}</Text>
              <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>Public</Text>
            </View>
            <View style={[styles.statItem, { backgroundColor: colors.background }]}>
              <Text style={[TextStyles.heading.h2, { color: colors.warning }]}>{stats.private}</Text>
              <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>Private</Text>
            </View>
          </View>
        </Card>

        {/* Workspaces List */}
        <Card style={[styles.workspacesCard, { backgroundColor: colors.card }]}>
          <Text style={[TextStyles.heading.h3, { color: colors.foreground, marginBottom: 16 }]}>
            All Workspaces
          </Text>
          
          {loading ? (
            <View style={styles.loadingState}>
              <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'] }]}>
                Loading workspaces...
              </Text>
            </View>
          ) : error ? (
            <View style={styles.errorState}>
              <FontAwesome name="exclamation-triangle" size={24} color={colors.destructive} />
              <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>
                Error loading workspaces
              </Text>
              <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
                {error}
              </Text>
            </View>
          ) : workspaces && workspaces.length > 0 ? (
            <View style={styles.workspacesList}>
              {workspaces.map((workspace) => (
                <TouchableOpacity
                  key={workspace._id}
                  style={[styles.workspaceItem, { backgroundColor: colors.background, borderColor: colors.border }]}
                >
                  <View style={styles.workspaceHeader}>
                    <View style={styles.workspaceInfo}>
                      <Text style={[TextStyles.body.medium, { color: colors.foreground }]} numberOfLines={1}>
                        {workspace.name}
                      </Text>
                      <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]} numberOfLines={2}>
                        {workspace.description || "No description"}
                      </Text>
                    </View>
                    <View style={styles.workspaceActions}>
                      <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary }]}>
                        <FontAwesome name="edit" size={14} color={colors['primary-foreground']} />
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.muted }]}>
                        <FontAwesome name="ellipsis-h" size={14} color={colors.foreground} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  <View style={styles.workspaceDetails}>
                    <View style={styles.workspaceBadges}>
                      <View style={[styles.badge, { backgroundColor: workspace.isPublic ? colors.success : colors.muted }]}>
                        <Text style={[TextStyles.caption.small, { color: colors.foreground }]}>
                          {workspace.isPublic ? 'Public' : 'Private'}
                        </Text>
                      </View>
                      <View style={[styles.badge, { backgroundColor: workspace.isActive ? colors.success : colors.destructive }]}>
                        <Text style={[TextStyles.caption.small, { color: colors.foreground }]}>
                          {workspace.isActive ? 'Active' : 'Archived'}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.workspaceMeta}>
                      <View style={styles.metaItem}>
                        <FontAwesome name="users" size={12} color={colors['muted-foreground']} />
                        <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
                          {workspace.members?.length || 0} members
                        </Text>
                      </View>
                      <View style={styles.metaItem}>
                        <FontAwesome name="calendar" size={12} color={colors['muted-foreground']} />
                        <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
                          {new Date(workspace.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <FontAwesome name="folder-open" size={48} color={colors['muted-foreground']} />
              <Text style={[TextStyles.heading.h3, { color: colors.foreground }]}>
                No Workspaces Yet
              </Text>
              <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'], textAlign: 'center' }]}>
                Create your first workspace to start collaborating with your team.
              </Text>
              <TouchableOpacity style={[styles.createButton, { backgroundColor: colors.primary }]}>
                <FontAwesome name="plus" size={16} color={colors['primary-foreground']} />
                <Text style={[TextStyles.body.medium, { color: colors['primary-foreground'] }]}>
                  Create Workspace
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </Card>

        {/* Quick Actions */}
        <Card style={[styles.actionsCard, { backgroundColor: colors.card }]}>
          <Text style={[TextStyles.heading.h3, { color: colors.foreground, marginBottom: 16 }]}>
            Quick Actions
          </Text>
          
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={[styles.actionCard, { backgroundColor: colors.background }]}>
              <FontAwesome name="plus" size={24} color={colors.primary} />
              <Text style={[TextStyles.body.small, { color: colors.foreground }]}>New Workspace</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionCard, { backgroundColor: colors.background }]}>
              <FontAwesome name="search" size={24} color={colors.primary} />
              <Text style={[TextStyles.body.small, { color: colors.foreground }]}>Search</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionCard, { backgroundColor: colors.background }]}>
              <FontAwesome name="filter" size={24} color={colors.primary} />
              <Text style={[TextStyles.body.small, { color: colors.foreground }]}>Filter</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionCard, { backgroundColor: colors.background }]}>
              <FontAwesome name="sort" size={24} color={colors.primary} />
              <Text style={[TextStyles.body.small, { color: colors.foreground }]}>Sort</Text>
            </TouchableOpacity>
          </View>
        </Card>
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
  overviewCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  workspacesCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  workspacesList: {
    gap: 12,
  },
  workspaceItem: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  workspaceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  workspaceInfo: {
    flex: 1,
    marginRight: 12,
  },
  workspaceActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  workspaceDetails: {
    gap: 8,
  },
  workspaceBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  workspaceMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  loadingState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  errorState: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 24,
  },
  emptyState: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 32,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  actionsCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    gap: 8,
  },
});
