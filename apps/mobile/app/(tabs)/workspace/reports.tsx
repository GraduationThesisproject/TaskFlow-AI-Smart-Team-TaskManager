import React, { useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';

import { Text, View, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { useAppSelector } from '@/store';
import { useWorkspaceAnalytics } from '@/hooks/useAnalytics';

export default function WorkspaceReportsScreen() {
  const colors = useThemeColors();
  const router = useRouter();

  const { currentWorkspace, currentWorkspaceId } = useAppSelector((s: any) => s.workspace);
  const workspaceId: string | null = (currentWorkspace as any)?._id || (currentWorkspace as any)?.id || currentWorkspaceId || null;

  const [refreshing, setRefreshing] = useState(false);
  const { data, loading, error, period, setPeriod, refresh } = useWorkspaceAnalytics(workspaceId, 'month');

  const title = 'Reports';
  const goBack = () => router.back();

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}> 
        <TouchableOpacity style={[styles.headerBtn, { backgroundColor: colors.primary }]} onPress={goBack}>
          <FontAwesome name="chevron-left" size={18} color={colors['primary-foreground']} />
        </TouchableOpacity>
        <Text style={[TextStyles.heading.h1, { color: colors.foreground, flex: 1 }]} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.headerActions}>
          {/* Manual refresh */}
          <TouchableOpacity
            style={[styles.pill, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => refresh()}
          >
            <FontAwesome name="refresh" size={14} color={colors.foreground} />
          </TouchableOpacity>
          {/* Period selector */}
          <TouchableOpacity
            style={[styles.pill, { backgroundColor: period === 'week' ? colors.primary : colors.card, borderColor: colors.border }]}
            onPress={() => setPeriod('week')}
          >
            <Text style={{ color: period === 'week' ? colors['primary-foreground'] : colors.foreground }}>Week</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.pill, { backgroundColor: period === 'month' ? colors.primary : colors.card, borderColor: colors.border }]}
            onPress={() => setPeriod('month')}
          >
            <Text style={{ color: period === 'month' ? colors['primary-foreground'] : colors.foreground }}>Month</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.pill, { backgroundColor: period === 'quarter' ? colors.primary : colors.card, borderColor: colors.border }]}
            onPress={() => setPeriod('quarter')}
          >
            <Text style={{ color: period === 'quarter' ? colors['primary-foreground'] : colors.foreground }}>Quarter</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.pill, { backgroundColor: period === 'year' ? colors.primary : colors.card, borderColor: colors.border }]}
            onPress={() => setPeriod('year')}
          >
            <Text style={{ color: period === 'year' ? colors['primary-foreground'] : colors.foreground }}>Year</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Error state */}
        {error && (
          <Card style={[styles.sectionCard, { backgroundColor: colors.destructive }]}> 
            <Text style={[TextStyles.body.medium, { color: colors['destructive-foreground'] }]}>{error}</Text>
          </Card>
        )}

        {/* Core Metrics */}
        <View style={styles.statsGrid}>
          <Card style={[styles.statCard, { backgroundColor: colors.card }]}> 
            <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>Total Tasks</Text>
            <Text style={[TextStyles.heading.h3, { color: colors.primary }]}>{data?.core.totalTasks ?? 0}</Text>
          </Card>
          <Card style={[styles.statCard, { backgroundColor: colors.card }]}> 
            <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>Completion Rate</Text>
            <Text style={[TextStyles.heading.h3, { color: colors.success || colors.primary }]}>{(data?.core.completionRate ?? 0)}%</Text>
          </Card>
          <Card style={[styles.statCard, { backgroundColor: colors.card }]}> 
            <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>Avg Completion Time</Text>
            <Text style={[TextStyles.heading.h3, { color: colors.accent }]}>{data?.core.averageCompletionTime ?? 0}d</Text>
          </Card>
          <Card style={[styles.statCard, { backgroundColor: colors.card }]}> 
            <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>In Progress</Text>
            <Text style={[TextStyles.heading.h3, { color: colors.warning }]}>{data?.core.inProgressTasks ?? 0}</Text>
          </Card>
          <Card style={[styles.statCard, { backgroundColor: colors.card }]}> 
            <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>Overdue</Text>
            <Text style={[TextStyles.heading.h3, { color: colors.destructive }]}>{data?.core.overdueTasks ?? 0}</Text>
          </Card>
        </View>

        {/* Team Metrics */}
        <Card style={styles.sectionCard}>
          <Text style={[TextStyles.heading.h2, { color: colors.foreground, marginBottom: 8 }]}>Team</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Card style={[styles.inlineStat, { backgroundColor: colors.card }]}> 
              <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>Members</Text>
              <Text style={[TextStyles.heading.h3, { color: colors.primary }]}>{data?.team.totalMembers ?? 0}</Text>
            </Card>
            <Card style={[styles.inlineStat, { backgroundColor: colors.card }]}> 
              <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>Active</Text>
              <Text style={[TextStyles.heading.h3, { color: colors.success || colors.primary }]}>{data?.team.activeMembers ?? 0}</Text>
            </Card>
          </View>

          {/* Top performers */}
          <View style={{ marginTop: 12 }}>
            <Text style={[TextStyles.body.medium, { color: colors.foreground, marginBottom: 8 }]}>Top Performers</Text>
            {Array.isArray(data?.team.topPerformers) && (data!.team.topPerformers.length > 0) ? (
              <View style={{ gap: 8 }}>
                {data!.team.topPerformers.map((p, idx) => (
                  <View key={`${p.name}-${idx}`} style={[styles.row, { borderColor: colors.border }]}> 
                    <Text style={[TextStyles.body.small, { color: colors.foreground, flex: 1 }]} numberOfLines={1}>{p.name}</Text>
                    <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>{p.tasksCompleted} tasks</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>No data</Text>
            )}
          </View>
        </Card>

        {/* Workload Distribution (simple bar list) */}
        <Card style={styles.sectionCard}>
          <Text style={[TextStyles.heading.h2, { color: colors.foreground, marginBottom: 8 }]}>Workload Distribution</Text>
          {Array.isArray(data?.charts.workload) && (data!.charts.workload.length > 0) ? (
            <View style={{ gap: 10 }}>
              {data!.charts.workload.map((w, idx) => (
                <View key={`${w.label}-${idx}`}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={[TextStyles.caption.small, { color: colors.foreground }]} numberOfLines={1}>{w.label}</Text>
                    <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>{w.value}</Text>
                  </View>
                  <View style={[styles.progressTrack, { backgroundColor: colors.muted || '#333' }]}>
                    <View style={[styles.progressFill, { width: `${Math.min(100, w.value)}%`, backgroundColor: colors.primary }]} />
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>No workload data</Text>
          )}
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  headerBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  headerActions: { flexDirection: 'row', gap: 8 },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: StyleSheet.hairlineWidth },
  content: { flex: 1, padding: 16 },
  sectionCard: { padding: 20, marginBottom: 20 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 8 },
  statCard: { flexBasis: '48%', padding: 16, borderRadius: 12 },
  inlineStat: { flex: 1, padding: 12, borderRadius: 12 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth, paddingVertical: 8 },
  progressTrack: { height: 8, borderRadius: 999, overflow: 'hidden', marginTop: 6 },
  progressFill: { height: '100%', borderRadius: 999 },
});

import React, { useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { Text, View, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { useAppSelector } from '@/store';
import { useWorkspaceAnalytics } from '@/hooks/useAnalytics';
import { useRouter } from 'expo-router';
import { BannerProvider, useBanner } from '@/components/common/BannerProvider';

function WorkspaceReportsScreenContent() {
  const colors = useThemeColors();
  const { showSuccess, showError, showWarning, showInfo } = useBanner();

  const { currentWorkspace, currentWorkspaceId } = useAppSelector((s: any) => s.workspace);
  const workspaceId: string | null = (currentWorkspace as any)?._id || (currentWorkspace as any)?.id || currentWorkspaceId || null;

  const [refreshing, setRefreshing] = useState(false);
  const { data, loading, error, period, setPeriod, refresh } = useWorkspaceAnalytics(workspaceId, 'month');

  const title = 'Reports';
  const router = useRouter();
  const goBack = () => router.back();

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      {/* Professional Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.primary }]}
            onPress={goBack}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <FontAwesome name="chevron-left" size={18} color={colors['primary-foreground']} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <View style={[styles.headerIcon, { backgroundColor: colors.primary + '15' }]}>
              <FontAwesome name="bar-chart" size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>Analytics & Reports</Text>
              <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
                Track team performance and productivity
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.refreshButton, { backgroundColor: colors.accent + '15' }]}
            onPress={() => refresh()}
            accessibilityLabel="Refresh data"
          >
            <FontAwesome name="refresh" size={18} color={colors.accent} />
          </TouchableOpacity>
        </View>
        
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'], marginBottom: 8 }]}>
            Time Period
          </Text>
          <View style={styles.periodButtons}>
            {['week', 'month', 'quarter', 'year'].map((p) => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.periodButton, 
                  { 
                    backgroundColor: period === p ? colors.primary : colors.background,
                    borderColor: period === p ? colors.primary : colors.border,
                  }
                ]}
                onPress={() => setPeriod(p as any)}
              >
                <Text style={[
                  TextStyles.body.small, 
                  { 
                    color: period === p ? colors['primary-foreground'] : colors.foreground,
                    fontWeight: period === p ? '600' : '500'
                  }
                ]}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Error state */}
        {error && (
          <Card style={[styles.errorCard, { backgroundColor: colors.destructive }]}>
            <View style={styles.errorContent}>
              <FontAwesome name="exclamation-triangle" size={20} color={colors['destructive-foreground']} />
              <Text style={[TextStyles.body.medium, { color: colors['destructive-foreground'] }]}>{error}</Text>
            </View>
          </Card>
        )}

        {/* Core Metrics */}
        <Card style={[styles.metricsCard, { backgroundColor: colors.card }]}>
          <View style={styles.metricsHeader}>
            <View style={styles.metricsTitleContainer}>
              <View style={[styles.metricsIcon, { backgroundColor: colors.primary + '15' }]}>
                <FontAwesome name="tachometer" size={16} color={colors.primary} />
              </View>
              <Text style={[TextStyles.heading.h3, { color: colors.foreground }]}>Performance Metrics</Text>
            </View>
          </View>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: colors.background }]}>
              <View style={styles.statHeader}>
                <FontAwesome name="tasks" size={16} color={colors.primary} />
                <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>Total Tasks</Text>
              </View>
              <Text style={[TextStyles.heading.h2, { color: colors.primary }]}>{data?.core.totalTasks ?? 0}</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.background }]}>
              <View style={styles.statHeader}>
                <FontAwesome name="check-circle" size={16} color={colors.success} />
                <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>Completion Rate</Text>
              </View>
              <Text style={[TextStyles.heading.h2, { color: colors.success }]}>{(data?.core.completionRate ?? 0)}%</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.background }]}>
              <View style={styles.statHeader}>
                <FontAwesome name="clock-o" size={16} color={colors.accent} />
                <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>Avg Time</Text>
              </View>
              <Text style={[TextStyles.heading.h2, { color: colors.accent }]}>{data?.core.averageCompletionTime ?? 0}d</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.background }]}>
              <View style={styles.statHeader}>
                <FontAwesome name="play-circle" size={16} color={colors.warning} />
                <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>In Progress</Text>
              </View>
              <Text style={[TextStyles.heading.h2, { color: colors.warning }]}>{data?.core.inProgressTasks ?? 0}</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.background }]}>
              <View style={styles.statHeader}>
                <FontAwesome name="exclamation-triangle" size={16} color={colors.destructive} />
                <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>Overdue</Text>
              </View>
              <Text style={[TextStyles.heading.h2, { color: colors.destructive }]}>{data?.core.overdueTasks ?? 0}</Text>
            </View>
          </View>
        </Card>

        {/* Team Metrics */}
        <Card style={[styles.teamCard, { backgroundColor: colors.card }]}>
          <View style={styles.teamHeader}>
            <View style={styles.teamTitleContainer}>
              <View style={[styles.teamIcon, { backgroundColor: colors.accent + '15' }]}>
                <FontAwesome name="users" size={16} color={colors.accent} />
              </View>
              <Text style={[TextStyles.heading.h3, { color: colors.foreground }]}>Team Performance</Text>
            </View>
          </View>
          
          <View style={styles.teamStats}>
            <View style={[styles.teamStat, { backgroundColor: colors.background }]}>
              <View style={styles.teamStatHeader}>
                <FontAwesome name="user" size={14} color={colors.primary} />
                <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>Total Members</Text>
              </View>
              <Text style={[TextStyles.heading.h2, { color: colors.primary }]}>{data?.team.totalMembers ?? 0}</Text>
            </View>
            <View style={[styles.teamStat, { backgroundColor: colors.background }]}>
              <View style={styles.teamStatHeader}>
                <FontAwesome name="user" size={14} color={colors.success} />
                <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>Active Members</Text>
              </View>
              <Text style={[TextStyles.heading.h2, { color: colors.success }]}>{data?.team.activeMembers ?? 0}</Text>
            </View>
          </View>

          {/* Top performers */}
          <View style={styles.topPerformersSection}>
            <View style={styles.topPerformersHeader}>
              <FontAwesome name="trophy" size={16} color={colors.warning} />
              <Text style={[TextStyles.heading.h4, { color: colors.foreground }]}>Top Performers</Text>
            </View>
            {Array.isArray(data?.team.topPerformers) && (data!.team.topPerformers.length > 0) ? (
              <View style={styles.performersList}>
                {data!.team.topPerformers.map((p, idx) => (
                  <View key={`${p.name}-${idx}`} style={[styles.performerItem, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <View style={styles.performerRank}>
                      <Text style={[TextStyles.caption.small, { color: colors.warning, fontWeight: '600' }]}>
                        #{idx + 1}
                      </Text>
                    </View>
                    <View style={styles.performerInfo}>
                      <Text style={[TextStyles.body.medium, { color: colors.foreground }]} numberOfLines={1}>
                        {p.name}
                      </Text>
                      <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
                        {p.tasksCompleted} tasks completed
                      </Text>
                    </View>
                    <View style={[styles.performerBadge, { backgroundColor: colors.success + '15' }]}>
                      <Text style={[TextStyles.caption.small, { color: colors.success, fontWeight: '600' }]}>
                        {p.tasksCompleted}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <FontAwesome name="users" size={32} color={colors['muted-foreground']} />
                <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>No performance data</Text>
                <Text style={[TextStyles.body.small, { color: colors['muted-foreground'], textAlign: 'center' }]}>
                  Team performance data will appear here as members complete tasks
                </Text>
              </View>
            )}
          </View>
        </Card>

        {/* Workload Distribution */}
        <Card style={[styles.workloadCard, { backgroundColor: colors.card }]}>
          <View style={styles.workloadHeader}>
            <View style={styles.workloadTitleContainer}>
              <View style={[styles.workloadIcon, { backgroundColor: colors.warning + '15' }]}>
                <FontAwesome name="pie-chart" size={16} color={colors.warning} />
              </View>
              <Text style={[TextStyles.heading.h3, { color: colors.foreground }]}>Workload Distribution</Text>
            </View>
          </View>
          
          {Array.isArray(data?.charts.workload) && (data!.charts.workload.length > 0) ? (
            <View style={styles.workloadList}>
              {data!.charts.workload.map((w, idx) => (
                <View key={`${w.label}-${idx}`} style={styles.workloadItem}>
                  <View style={styles.workloadItemHeader}>
                    <Text style={[TextStyles.body.medium, { color: colors.foreground }]} numberOfLines={1}>
                      {w.label}
                    </Text>
                    <Text style={[TextStyles.body.medium, { color: colors.primary, fontWeight: '600' }]}>
                      {w.value}
                    </Text>
                  </View>
                  <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
                    <View style={[styles.progressFill, { width: `${Math.min(100, w.value)}%`, backgroundColor: colors.primary }]} />
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <FontAwesome name="bar-chart" size={32} color={colors['muted-foreground']} />
              <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>No workload data</Text>
              <Text style={[TextStyles.body.small, { color: colors['muted-foreground'], textAlign: 'center' }]}>
                Workload distribution will appear as team members work on tasks
              </Text>
            </View>
          )}
        </Card>
      </ScrollView>
    </View>
  );
}

// Wrapper component with BannerProvider
export default function WorkspaceReportsScreen() {
  return (
    <BannerProvider>
      <WorkspaceReportsScreenContent />
    </BannerProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  periodSelector: {
    marginTop: 8,
  },
  periodButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  content: { flex: 1, padding: 20 },
  errorCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  errorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metricsCard: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  metricsHeader: {
    marginBottom: 20,
  },
  metricsTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metricsIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flexBasis: '48%',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  teamCard: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  teamHeader: {
    marginBottom: 20,
  },
  teamTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  teamIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  teamStat: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  teamStatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  topPerformersSection: {
    marginTop: 8,
  },
  topPerformersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  performersList: {
    gap: 12,
  },
  performerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  performerRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  performerInfo: {
    flex: 1,
    gap: 4,
  },
  performerBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  workloadCard: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  workloadHeader: {
    marginBottom: 20,
  },
  workloadTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  workloadIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workloadList: {
    gap: 16,
  },
  workloadItem: {
    gap: 8,
  },
  workloadItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 12,
  },
});
