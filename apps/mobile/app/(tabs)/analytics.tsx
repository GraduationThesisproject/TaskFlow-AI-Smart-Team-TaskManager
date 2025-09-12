import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, View, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { useAppSelector, useAppDispatch } from '@/store';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Sidebar from '@/components/navigation/Sidebar';
import { fetchAnalytics } from '@/store/slices/analyticsSlice';

export default function AnalyticsScreen() {
  const colors = useThemeColors();
  const dispatch = useAppDispatch();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { data: analytics, loading, error } = useAppSelector(state => state.analytics);
  const { workspaces, currentWorkspaceId } = useAppSelector(state => state.workspace);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const workspaceId = currentWorkspaceId || workspaces?.[0]?._id;
      if (workspaceId) {
        await dispatch(fetchAnalytics({ 
          period: 'month', 
          startDate: '2024-01-01', 
          endDate: '2024-12-31',
          workspaceId: workspaceId
        }));
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => setSidebarVisible(true)} style={styles.menuButton}>
          <FontAwesome name="bars" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>Analytics</Text>
        <View style={styles.headerRight} />
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
              Loading analytics...
            </Text>
          </View>
        ) : error ? (
          <Card style={[styles.errorCard, { backgroundColor: colors.card }]}>
            <Text style={[TextStyles.body.medium, { color: colors.destructive }]}>
              Error: {error}
            </Text>
          </Card>
        ) : (
          <>
            {/* Stats Overview */}
            <View style={styles.statsGrid}>
              <Card style={[styles.statsCard, { backgroundColor: colors.card }]}>
                <View style={styles.statsCardHeader}>
                  <Text style={[TextStyles.body.small, { color: colors.foreground }]}>Total Tasks</Text>
                  <FontAwesome name="tasks" size={16} color={colors['muted-foreground']} />
                </View>
                <View style={styles.statsCardContent}>
                  <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>{taskStats.total}</Text>
                  <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
                    All time
                  </Text>
                </View>
              </Card>

              <Card style={[styles.statsCard, { backgroundColor: colors.card }]}>
                <View style={styles.statsCardHeader}>
                  <Text style={[TextStyles.body.small, { color: colors.foreground }]}>Completed</Text>
                  <FontAwesome name="check-circle" size={16} color={colors.success} />
                </View>
                <View style={styles.statsCardContent}>
                  <Text style={[TextStyles.heading.h2, { color: colors.success }]}>{taskStats.completed}</Text>
                  <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
                    {taskStats.completionRate}% completion rate
                  </Text>
                </View>
              </Card>

              <Card style={[styles.statsCard, { backgroundColor: colors.card }]}>
                <View style={styles.statsCardHeader}>
                  <Text style={[TextStyles.body.small, { color: colors.foreground }]}>In Progress</Text>
                  <FontAwesome name="clock-o" size={16} color={colors.warning} />
                </View>
                <View style={styles.statsCardContent}>
                  <Text style={[TextStyles.heading.h2, { color: colors.warning }]}>{taskStats.inProgress}</Text>
                  <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
                    Currently working
                  </Text>
                </View>
              </Card>

              <Card style={[styles.statsCard, { backgroundColor: colors.card }]}>
                <View style={styles.statsCardHeader}>
                  <Text style={[TextStyles.body.small, { color: colors.foreground }]}>Overdue</Text>
                  <FontAwesome name="exclamation-triangle" size={16} color={colors.destructive} />
                </View>
                <View style={styles.statsCardContent}>
                  <Text style={[TextStyles.heading.h2, { color: colors.destructive }]}>{taskStats.overdue}</Text>
                  <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
                    Need attention
                  </Text>
                </View>
              </Card>
            </View>

            {/* Performance Metrics */}
            <Card style={[styles.metricsCard, { backgroundColor: colors.card }]}>
              <Text style={[TextStyles.heading.h3, { color: colors.foreground }]}>Performance Metrics</Text>
              <View style={styles.metricsList}>
                <View style={styles.metricRow}>
                  <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>Average Completion Time</Text>
                  <Text style={[TextStyles.body.medium, { color: colors.primary }]}>
                    {analytics?.performanceMetrics?.averageCompletionTime || 'N/A'}
                  </Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>Productivity Score</Text>
                  <Text style={[TextStyles.body.medium, { color: colors.primary }]}>
                    {analytics?.performanceMetrics?.productivityScore || 'N/A'}
                  </Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>Team Efficiency</Text>
                  <Text style={[TextStyles.body.medium, { color: colors.primary }]}>
                    {analytics?.performanceMetrics?.teamEfficiency || 'N/A'}
                  </Text>
                </View>
              </View>
            </Card>

            {/* Recent Activity */}
            <Card style={[styles.activityCard, { backgroundColor: colors.card }]}>
              <Text style={[TextStyles.heading.h3, { color: colors.foreground }]}>Recent Activity</Text>
              <View style={styles.activityList}>
                {analytics?.recentActivity?.map((activity, index) => (
                  <View key={index} style={styles.activityItem}>
                    <FontAwesome name="circle" size={8} color={colors.primary} />
                    <Text style={[TextStyles.body.small, { color: colors.foreground }]}>
                      {activity.description || 'Activity'}
                    </Text>
                    <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
                      {activity.timestamp ? new Date(activity.timestamp).toLocaleDateString() : 'Recently'}
                    </Text>
                  </View>
                )) || (
                  <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'] }]}>
                    No recent activity
                  </Text>
                )}
              </View>
            </Card>
          </>
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
  headerRight: {
    width: 40,
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
  metricsCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  metricsList: {
    marginTop: 16,
    gap: 12,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  activityList: {
    marginTop: 16,
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
