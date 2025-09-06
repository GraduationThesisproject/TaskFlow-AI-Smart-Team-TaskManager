import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, View, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { useAppSelector, useAppDispatch } from '@/store';
import { fetchWorkspaces } from '@/store/slices/workspaceSlice';
import { fetchAnalytics } from '@/store/slices/analyticsSlice';
import { listTemplates } from '@/store/slices/templatesSlice';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Sidebar from '@/components/navigation/Sidebar';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import StatsCards from '@/components/cards/StatsCards';

// Welcome Header Component
const WelcomeHeader: React.FC<{ displayName: string }> = ({ displayName }) => {
  const colors = useThemeColors();
  const dispatch = useAppDispatch();
  const { logout } = useAuth();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Redux selectors
  const { user } = useAppSelector(state => state.auth);
  const { workspaces, loading: workspacesLoading, error: workspacesError } = useAppSelector(state => state.workspace);
  const { data: analytics, loading: analyticsLoading, error: analyticsError } = useAppSelector(state => state.analytics);

  // Debug logging
  console.log('🔧 [Dashboard] User data from Redux:', {
    hasUser: !!user,
    userEmail: user?.user?.email,
    userName: user?.user?.name,
    userStructure: user ? Object.keys(user) : 'No user'
  });

  const getTaskStats = () => {
    const totalTasks = analytics?.coreMetrics?.totalTasks || 0;
    const completedTasks = Math.round((analytics?.coreMetrics?.completionRate || 0) * totalTasks / 100);
    const overdueTasks = analytics?.coreMetrics?.overdueTasks || 0;
    const inProgressTasks = totalTasks - completedTasks - overdueTasks;
    
    return {
      total: totalTasks,
      completed: completedTasks,
      inProgress: inProgressTasks,
      overdue: overdueTasks,
      completionRate: analytics?.coreMetrics?.completionRate || 0,
    };
  };

  const taskStats = getTaskStats();

  if (analyticsLoading) {
    return (
      <View style={styles.statsGrid}>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} style={[styles.statsCard, { backgroundColor: colors.card }]}>
            <View style={styles.statsCardHeader}>
              <View style={[styles.skeleton, { backgroundColor: colors.border }]} />
              <View style={[styles.skeletonIcon, { backgroundColor: colors.border }]} />
            </View>
            <View style={styles.statsCardContent}>
              <View style={[styles.skeletonNumber, { backgroundColor: colors.border }]} />
              <View style={[styles.skeletonText, { backgroundColor: colors.border }]} />
            </View>
          </Card>
        ))}
      </View>
    );
  }

  if (analyticsError) {
    return (
      <Card style={[styles.errorCard, { backgroundColor: colors.card }]}>
        <Text style={[TextStyles.body.medium, { color: colors.destructive }]}>
          Error loading statistics: {analyticsError}
        </Text>
      </Card>
    );
  }

  return (
    <View style={styles.statsGrid}>
      <Card style={[styles.statsCard, { backgroundColor: colors.card }]}>
        <View style={styles.statsCardHeader}>
          <Text style={[TextStyles.body.small, { color: colors.foreground }]}>Total Tasks</Text>
          <FontAwesome name="users" size={16} color={colors['muted-foreground']} />
        </View>
        <View style={styles.statsCardContent}>
          <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>{taskStats.total}</Text>
          <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
            {taskStats.completionRate}% completed
          </Text>
        </View>
      </Card>

      <Card style={[styles.statsCard, { backgroundColor: colors.card }]}>
        <View style={styles.statsCardHeader}>
          <Text style={[TextStyles.body.small, { color: colors.foreground }]}>In Progress</Text>
          <FontAwesome name="clock-o" size={16} color={colors['muted-foreground']} />
        </View>
        <View style={styles.statsCardContent}>
          <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>{taskStats.inProgress}</Text>
          <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
            Currently working on
          </Text>
        </View>
      </Card>

      <Card style={[styles.statsCard, { backgroundColor: colors.card }]}>
        <View style={styles.statsCardHeader}>
          <Text style={[TextStyles.body.small, { color: colors.foreground }]}>High Priority</Text>
          <FontAwesome name="exclamation-triangle" size={16} color={colors['muted-foreground']} />
        </View>
        <View style={styles.statsCardContent}>
          <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>
            {analytics?.coreMetrics?.overdueTasks || 0}
          </Text>
          <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
            Requires attention
          </Text>
        </View>
      </Card>

      <Card style={[styles.statsCard, { backgroundColor: colors.card }]}>
        <View style={styles.statsCardHeader}>
          <Text style={[TextStyles.body.small, { color: colors.foreground }]}>Overdue</Text>
          <FontAwesome name="calendar" size={16} color={colors['muted-foreground']} />
        </View>
        <View style={styles.statsCardContent}>
          <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>{taskStats.overdue}</Text>
          <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
            Past due date
          </Text>
        </View>
      </Card>
    </View>
  );
};

// Workspaces Section Component
const WorkspacesSection: React.FC = () => {
  const colors = useThemeColors();
  const { workspaces, loading: workspacesLoading, error: workspacesError } = useAppSelector(state => state.workspace);

  const recentWorkspaces = workspaces?.slice(0, 3) || [];

  if (workspacesLoading) {
    return (
      <Card style={[styles.workspacesCard, { backgroundColor: colors.card }]}>
        <View style={styles.workspacesCardHeader}>
          <Text style={[TextStyles.heading.h3, { color: colors.foreground }]}>Your Workspaces</Text>
          <TouchableOpacity style={[styles.addButton, { borderColor: colors.border }]}>
            <FontAwesome name="plus" size={16} color={colors['muted-foreground']} />
            <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>New Workspace</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.workspacesCardContent}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={[styles.workspaceSkeleton, { backgroundColor: colors.border }]} />
          ))}
        </View>
      </Card>
    );
  }

  if (workspacesError) {
    return (
      <Card style={[styles.workspacesCard, { backgroundColor: colors.card }]}>
        <View style={styles.workspacesCardHeader}>
          <Text style={[TextStyles.heading.h3, { color: colors.foreground }]}>Your Workspaces</Text>
        </View>
        <View style={styles.workspacesCardContent}>
          <View style={styles.errorState}>
            <FontAwesome name="users" size={32} color={colors.destructive} />
            <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>Error loading workspaces</Text>
            <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>{workspacesError}</Text>
          </View>
        </View>
      </Card>
    );
  }

  return (
    <Card style={[styles.workspacesCard, { backgroundColor: colors.card }]}>
      <View style={styles.workspacesCardHeader}>
        <Text style={[TextStyles.heading.h3, { color: colors.foreground }]}>Your Workspaces</Text>
        <TouchableOpacity style={[styles.addButton, { borderColor: colors.border }]}>
          <FontAwesome name="plus" size={16} color={colors['muted-foreground']} />
          <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>New Workspace</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.workspacesCardContent}>
        {recentWorkspaces.length > 0 ? (
          <View style={styles.workspacesList}>
            {recentWorkspaces.map((workspace) => (
              <TouchableOpacity
                key={workspace._id}
                style={[styles.workspaceItem, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={styles.workspaceItemHeader}>
                  <Text style={[TextStyles.body.medium, { color: colors.foreground }]} numberOfLines={1}>
                    {workspace.name}
                  </Text>
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
                    <View style={[styles.badge, { backgroundColor: colors.muted }]}>
                      <Text style={[TextStyles.caption.small, { color: colors.foreground }]}>
                        {workspace.members?.length || 0} members
                      </Text>
                    </View>
                  </View>
                </View>
                <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]} numberOfLines={2}>
                  {workspace.description || "No description"}
                </Text>
                <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
                  Created: {new Date(workspace.createdAt).toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            ))}
            {workspaces.length > 3 && (
              <TouchableOpacity style={styles.viewAllButton}>
                <Text style={[TextStyles.body.small, { color: colors.primary }]}>
                  View all {workspaces.length} workspaces →
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <FontAwesome name="users" size={32} color={colors['muted-foreground']} />
            <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>No workspaces yet</Text>
            <Text style={[TextStyles.body.small, { color: colors['muted-foreground'], textAlign: 'center' }]}>
              Create your first workspace to get started with team collaboration.
            </Text>
            <TouchableOpacity style={[styles.createButton, { backgroundColor: colors.primary }]}>
              <Text style={[TextStyles.body.small, { color: colors['primary-foreground'] }]}>Create Workspace</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Card>
  );
};

// Upcoming Deadlines Component
const UpcomingDeadlines: React.FC = () => {
  const colors = useThemeColors();
  const { tasks } = useAppSelector(state => state.tasks);
  
  // Get upcoming deadlines from real tasks data
  const upcomingDeadlines = useMemo(() => {
    if (!tasks || tasks.length === 0) return [];
    
    return tasks
      .filter(task => task.dueDate && new Date(task.dueDate) > new Date())
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 5)
      .map(task => ({
        id: task._id,
        title: task.title,
        dueDate: task.dueDate!,
        priority: task.priority
      }));
  }, [tasks]);

  return (
    <Card style={[styles.deadlinesCard, { backgroundColor: colors.card }]}>
      <View style={styles.deadlinesCardHeader}>
        <Text style={[TextStyles.heading.h3, { color: colors.foreground }]}>Upcoming Deadlines</Text>
      </View>
      <View style={styles.deadlinesCardContent}>
        {upcomingDeadlines.length > 0 ? (
          <View style={styles.deadlinesList}>
            {upcomingDeadlines.map((task) => (
              <View key={task.id} style={[styles.deadlineItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.deadlineItemContent}>
                  <Text style={[TextStyles.body.small, { color: colors.foreground }]} numberOfLines={1}>
                    {task.title}
                  </Text>
                  <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
                    Due {new Date(task.dueDate).toLocaleDateString()}
                  </Text>
                </View>
                <View style={[
                  styles.priorityBadge,
                  { backgroundColor: task.priority === 'high' ? colors.destructive : colors.muted }
                ]}>
                  <Text style={[TextStyles.caption.small, { color: colors.foreground }]}>
                    {task.priority}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <FontAwesome name="calendar" size={32} color={colors['muted-foreground']} />
            <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>No upcoming deadlines</Text>
            <Text style={[TextStyles.body.small, { color: colors['muted-foreground'], textAlign: 'center' }]}>
              You're all caught up! No tasks are due in the next 7 days.
            </Text>
          </View>
        )}
      </View>
    </Card>
  );
};

export default function DashboardScreen() {
  const colors = useThemeColors();
  const dispatch = useAppDispatch();
  const { logout } = useAuth();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { user, isAuthenticated, token } = useAppSelector(state => state.auth);
  const { workspaces, currentWorkspaceId } = useAppSelector(state => state.workspace);
  const displayName = user?.user?.name || "User";

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      console.log('🔄 Loading dashboard data...');
      console.log('🔐 Auth status:', { isAuthenticated, hasToken: !!token, hasUser: !!user });
      
      if (!isAuthenticated || !token) {
        console.log('❌ Not authenticated, skipping dashboard data load');
        return;
      }
      
      // Load data one by one to identify which call fails
      console.log('📁 Fetching workspaces...');
      const workspacesResult = await dispatch(fetchWorkspaces());
      console.log('📁 Workspaces result:', workspacesResult);
      
      // Only fetch analytics if we have a workspace ID
      if (currentWorkspaceId || (workspaces && workspaces.length > 0)) {
        const workspaceId = currentWorkspaceId || workspaces[0]?._id;
        console.log('📊 Fetching analytics for workspace:', workspaceId);
        const analyticsResult = await dispatch(fetchAnalytics({ 
          period: 'month', 
          startDate: '2024-01-01', 
          endDate: '2024-12-31',
          workspaceId: workspaceId
        }));
        console.log('📊 Analytics result:', analyticsResult);
      } else {
        console.log('📊 Skipping analytics - no workspace available');
      }
      
      console.log('📋 Fetching templates...');
      const templatesResult = await dispatch(listTemplates({ status: 'active' }));
      console.log('📋 Templates result:', templatesResult);
      
      console.log('✅ Dashboard data loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={toggleSidebar} style={styles.menuButton}>
          <FontAwesome name="bars" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>Dashboard</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <WelcomeHeader displayName={displayName} />
        
        
        <StatsCards />
        
        <View style={styles.mainContent}>
          <WorkspacesSection />
          <UpcomingDeadlines />
        </View>
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
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  welcomeHeader: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statsCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  statsCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statsCardContent: {
    gap: 4,
  },
  skeleton: {
    height: 16,
    width: 80,
    borderRadius: 4,
  },
  skeletonIcon: {
    height: 16,
    width: 16,
    borderRadius: 8,
  },
  skeletonNumber: {
    height: 24,
    width: 40,
    borderRadius: 4,
    marginBottom: 4,
  },
  skeletonText: {
    height: 12,
    width: 60,
    borderRadius: 4,
  },
  errorCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  mainContent: {
    gap: 16,
  },
  workspacesCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  workspacesCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  workspacesCardContent: {
    gap: 12,
  },
  workspacesList: {
    gap: 12,
  },
  workspaceItem: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  workspaceItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  workspaceBadges: {
    flexDirection: 'row',
    gap: 4,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  viewAllButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  workspaceSkeleton: {
    height: 80,
    borderRadius: 12,
  },
  errorState: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 24,
  },
  emptyState: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 24,
  },
  createButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  deadlinesCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  deadlinesCardHeader: {
    marginBottom: 16,
  },
  deadlinesCardContent: {
    gap: 12,
  },
  deadlinesList: {
    gap: 8,
  },
  deadlineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  deadlineItemContent: {
    flex: 1,
    gap: 2,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
});
