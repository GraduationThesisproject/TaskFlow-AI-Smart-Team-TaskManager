import React, { useState, useEffect } from 'react';
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

export default function DashboardScreen() {
  const colors = useThemeColors();
  const dispatch = useAppDispatch();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Redux selectors
  const { user } = useAppSelector(state => state.auth);
  const { workspaces, loading: workspacesLoading, error: workspacesError } = useAppSelector(state => state.workspace);
  const { data: analytics, loading: analyticsLoading, error: analyticsError } = useAppSelector(state => state.analytics);
  const { items: templates, loading: templatesLoading, error: templatesError } = useAppSelector(state => state.templates);

  const displayName = user?.user?.name || "User";

  // Fetch data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      await Promise.all([
        dispatch(fetchWorkspaces()),
        dispatch(fetchAnalytics({ period: 'month', startDate: '2024-01-01', endDate: '2024-12-31' })),
        dispatch(listTemplates({ status: 'active' })),
      ]);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
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

  // Calculate stats from real data
  const getTaskStats = () => {
    // Use analytics data for task stats
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

  // Get recent workspaces
  const recentWorkspaces = workspaces?.slice(0, 3) || [];

  // Get upcoming deadlines from analytics (mock data for now)
  const upcomingDeadlines = [
    { title: 'Review Design Mockups', dueDate: '2 hours ago' },
    { title: 'Submit Project Report', dueDate: '1 day ago' },
  ];

  const isLoading = workspacesLoading || analyticsLoading || templatesLoading;
  const hasError = workspacesError || analyticsError || templatesError;

  if (isLoading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.sidebarButton, { backgroundColor: colors.primary }]}
            onPress={toggleSidebar}
          >
            <FontAwesome name="bars" size={20} color={colors['primary-foreground']} />
          </TouchableOpacity>
          <Text style={[TextStyles.heading.h1, { color: colors.foreground }]}>
            Dashboard
          </Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>
            Loading dashboard...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with Sidebar Toggle */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.sidebarButton, { backgroundColor: colors.primary }]}
          onPress={toggleSidebar}
        >
          <FontAwesome name="bars" size={20} color={colors['primary-foreground']} />
        </TouchableOpacity>
        <Text style={[TextStyles.heading.h1, { color: colors.foreground }]}>
          Dashboard
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Error Message */}
        {hasError && (
          <Card style={[styles.errorCard, { backgroundColor: colors.destructive }]}>
            <Text style={[TextStyles.body.medium, { color: colors['destructive-foreground'] }]}>
              Failed to load dashboard data. Pull to refresh.
            </Text>
          </Card>
        )}

        {/* Welcome Header */}
        <Card style={styles.welcomeCard}>
          <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>
            Welcome back, {displayName}! 👋
          </Text>
          <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'], marginTop: 8 }]}>
            Here's what's happening with your tasks today.
          </Text>
        </Card>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <Card style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[TextStyles.heading.h3, { color: colors.primary }]}>
              {taskStats.total}
            </Text>
            <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
              Total Tasks
            </Text>
          </Card>
          <Card style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[TextStyles.heading.h3, { color: colors.success }]}>
              {taskStats.completed}
            </Text>
            <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
              Completed
            </Text>
          </Card>
          <Card style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[TextStyles.heading.h3, { color: colors.warning }]}>
              {taskStats.inProgress}
            </Text>
            <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
              In Progress
            </Text>
          </Card>
          <Card style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[TextStyles.heading.h3, { color: colors.destructive }]}>
              {taskStats.overdue}
            </Text>
            <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
              Overdue
            </Text>
          </Card>
        </View>

        {/* Workspaces Section */}
        {recentWorkspaces.length > 0 && (
          <Card style={styles.sectionCard}>
            <Text style={[TextStyles.heading.h2, { color: colors.foreground, marginBottom: 16 }]}>
              Your Workspaces
            </Text>
                         <View style={styles.workspaceList}>
               {recentWorkspaces.map((workspace) => (
                 <View key={workspace._id} style={[styles.workspaceItem, { backgroundColor: colors.card }]}>
                   <FontAwesome name="folder" size={24} color={colors.primary} />
                   <View style={styles.workspaceInfo}>
                     <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>
                       {workspace.name}
                     </Text>
                     <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
                       {workspace.members?.length || 0} members • {workspace.spaces?.length || 0} spaces
                     </Text>
                   </View>
                   <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                     <View style={[
                       styles.progressFill, 
                       { 
                         backgroundColor: colors.primary, 
                         width: `${workspace.isActive ? 75 : 25}%` 
                       }
                     ]} />
                   </View>
                 </View>
               ))}
             </View>
          </Card>
        )}

        {/* Upcoming Deadlines */}
        {upcomingDeadlines.length > 0 && (
          <Card style={styles.sectionCard}>
            <Text style={[TextStyles.heading.h2, { color: colors.foreground, marginBottom: 16 }]}>
              Upcoming Deadlines
            </Text>
            <View style={styles.deadlineList}>
              {upcomingDeadlines.slice(0, 3).map((deadline, index) => (
                <View key={index} style={[styles.deadlineItem, { backgroundColor: colors.card }]}>
                  <View style={[styles.deadlineDot, { backgroundColor: colors.warning }]} />
                  <View style={styles.deadlineInfo}>
                    <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>
                      {deadline.title}
                    </Text>
                    <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
                      Due {deadline.dueDate}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Quick Actions */}
        <Card style={styles.sectionCard}>
          <Text style={[TextStyles.heading.h2, { color: colors.foreground, marginBottom: 16 }]}>
            Quick Actions
          </Text>
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => {/* Navigate to create task */}}
            >
              <FontAwesome name="plus" size={16} color={colors['primary-foreground']} />
              <Text style={[TextStyles.body.small, { color: colors['primary-foreground'] }]}>
                New Task
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.secondary }]}
              onPress={() => {/* Navigate to create workspace */}}
            >
              <FontAwesome name="plus" size={16} color={colors['secondary-foreground']} />
              <Text style={[TextStyles.body.small, { color: colors['secondary-foreground'] }]}>
                New Workspace
              </Text>
            </TouchableOpacity>
          </View>
        </Card>
      </ScrollView>

      {/* Sidebar */}
      <Sidebar
        isVisible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        currentSection="dashboard"
      />
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
  headerSpacer: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  errorCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  welcomeCard: {
    padding: 20,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    borderRadius: 12,
  },
  sectionCard: {
    padding: 20,
    marginBottom: 20,
  },
  workspaceList: {
    gap: 12,
  },
  workspaceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  workspaceInfo: {
    flex: 1,
    marginLeft: 12,
  },
  progressBar: {
    width: 60,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  deadlineList: {
    gap: 12,
  },
  deadlineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  deadlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  deadlineInfo: {
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
});