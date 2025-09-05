import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, View, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { useAppSelector, useAppDispatch } from '@/store';
import { fetchAnalytics } from '@/store/slices/analyticsSlice';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Sidebar from '@/components/navigation/Sidebar';

export default function AnalyticsScreen() {
  const colors = useThemeColors();
  const dispatch = useAppDispatch();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { data: analytics, loading, error } = useAppSelector(state => state.analytics);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      await dispatch(fetchAnalytics({ 
        period: 'month', 
        startDate: '2024-01-01', 
        endDate: '2024-12-31' 
      }));
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const getTaskStats = () => {
    const totalTasks = analytics?.coreMetrics?.totalTasks || 0;
    const completionRate = analytics?.coreMetrics?.completionRate || 0;
    const overdueTasks = analytics?.coreMetrics?.overdueTasks || 0;
    const completedTasks = Math.round((completionRate * totalTasks) / 100);
    const inProgressTasks = totalTasks - completedTasks - overdueTasks;
    
    return {
      total: totalTasks,
      completed: completedTasks,
      inProgress: inProgressTasks,
      overdue: overdueTasks,
      completionRate: completionRate,
    };
  };

  const taskStats = getTaskStats();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={toggleSidebar} style={styles.menuButton}>
          <FontAwesome name="bars" size={24} color={colors.foreground} />
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
        {/* Overview Section */}
        <Card style={[styles.overviewCard, { backgroundColor: colors.card }]}>
          <Text style={[TextStyles.heading.h3, { color: colors.foreground, marginBottom: 16 }]}>
            Task Overview
          </Text>
          
          <View style={styles.statsGrid}>
            <View style={[styles.statItem, { backgroundColor: colors.background }]}>
              <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>{taskStats.total}</Text>
              <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>Total Tasks</Text>
            </View>
            <View style={[styles.statItem, { backgroundColor: colors.background }]}>
              <Text style={[TextStyles.heading.h2, { color: colors.success }]}>{taskStats.completed}</Text>
              <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>Completed</Text>
            </View>
            <View style={[styles.statItem, { backgroundColor: colors.background }]}>
              <Text style={[TextStyles.heading.h2, { color: colors.warning }]}>{taskStats.inProgress}</Text>
              <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>In Progress</Text>
            </View>
            <View style={[styles.statItem, { backgroundColor: colors.background }]}>
              <Text style={[TextStyles.heading.h2, { color: colors.destructive }]}>{taskStats.overdue}</Text>
              <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>Overdue</Text>
            </View>
          </View>
        </Card>

        {/* Completion Rate */}
        <Card style={[styles.completionCard, { backgroundColor: colors.card }]}>
          <Text style={[TextStyles.heading.h3, { color: colors.foreground, marginBottom: 16 }]}>
            Completion Rate
          </Text>
          <View style={styles.completionBar}>
            <View style={[styles.completionProgress, { 
              backgroundColor: colors.primary,
              width: `${taskStats.completionRate}%`
            }]} />
          </View>
          <Text style={[TextStyles.body.medium, { color: colors.foreground, textAlign: 'center', marginTop: 8 }]}>
            {taskStats.completionRate}% Complete
          </Text>
        </Card>

        {/* Performance Metrics */}
        <Card style={[styles.metricsCard, { backgroundColor: colors.card }]}>
          <Text style={[TextStyles.heading.h3, { color: colors.foreground, marginBottom: 16 }]}>
            Performance Metrics
          </Text>
          
          <View style={styles.metricItem}>
            <View style={styles.metricHeader}>
              <FontAwesome name="clock-o" size={16} color={colors['muted-foreground']} />
              <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>Average Task Duration</Text>
            </View>
                         <Text style={[TextStyles.heading.h3, { color: colors.foreground }]}>
               3.2 days
             </Text>
          </View>

          <View style={styles.metricItem}>
            <View style={styles.metricHeader}>
              <FontAwesome name="check-circle" size={16} color={colors['muted-foreground']} />
              <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>Tasks Completed This Week</Text>
            </View>
                         <Text style={[TextStyles.heading.h3, { color: colors.foreground }]}>
               12
             </Text>
          </View>

          <View style={styles.metricItem}>
            <View style={styles.metricHeader}>
              <FontAwesome name="exclamation-triangle" size={16} color={colors['muted-foreground']} />
              <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>Tasks Overdue</Text>
            </View>
            <Text style={[TextStyles.heading.h3, { color: colors.destructive }]}>
              {taskStats.overdue}
            </Text>
          </View>
        </Card>

        {/* Recent Activity */}
        <Card style={[styles.activityCard, { backgroundColor: colors.card }]}>
          <Text style={[TextStyles.heading.h3, { color: colors.foreground, marginBottom: 16 }]}>
            Recent Activity
          </Text>
          
          {loading ? (
            <View style={styles.loadingState}>
              <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'] }]}>
                Loading activity...
              </Text>
            </View>
          ) : error ? (
            <View style={styles.errorState}>
              <FontAwesome name="exclamation-triangle" size={24} color={colors.destructive} />
              <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>
                Error loading activity
              </Text>
              <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
                {error}
              </Text>
            </View>
          ) : (
            <View style={styles.activityList}>
              <View style={styles.activityItem}>
                <FontAwesome name="check-circle" size={16} color={colors.success} />
                <Text style={[TextStyles.body.small, { color: colors.foreground }]}>
                  Task "Design Review" completed
                </Text>
                <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
                  2 hours ago
                </Text>
              </View>
              <View style={styles.activityItem}>
                <FontAwesome name="plus" size={16} color={colors.primary} />
                <Text style={[TextStyles.body.small, { color: colors.foreground }]}>
                  New task "Client Meeting" created
                </Text>
                <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
                  4 hours ago
                </Text>
              </View>
              <View style={styles.activityItem}>
                <FontAwesome name="user" size={16} color={colors.warning} />
                <Text style={[TextStyles.body.small, { color: colors.foreground }]}>
                  John joined the project
                </Text>
                <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
                  1 day ago
                </Text>
              </View>
            </View>
          )}
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
  headerRight: {
    width: 40,
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
  completionCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  completionBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  completionProgress: {
    height: '100%',
    borderRadius: 4,
  },
  metricsCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  metricItem: {
    marginBottom: 16,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  activityCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
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
});
