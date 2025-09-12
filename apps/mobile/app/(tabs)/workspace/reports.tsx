import React, { useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { Text, View, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { useAppSelector } from '@/store';
import { useWorkspaceAnalytics } from '@/hooks/useAnalytics';
import { useRouter } from 'expo-router';

export default function WorkspaceReportsScreen() {
  const colors = useThemeColors();

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
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}> 
        <TouchableOpacity
          style={[styles.headerBtn, { backgroundColor: colors.primary }]}
          onPress={goBack}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
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
