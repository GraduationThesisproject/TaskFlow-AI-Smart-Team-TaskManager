import React, { useMemo, useState } from 'react';
import { StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';

import { Text, View, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { useAppSelector } from '@/store';

export default function WorkspaceReportsScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const { data: analytics, loading, error } = useAppSelector((state: any) => state.analytics || { data: null, loading: false, error: null });

  const core = analytics?.coreMetrics || {};

  const onRefresh = async () => {
    setRefreshing(true);
    // If you have a thunk to refetch analytics, call it here.
    setTimeout(() => setRefreshing(false), 600);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.primary }]} onPress={() => router.back()}>
          <FontAwesome name="chevron-left" size={18} color={colors['primary-foreground']} />
        </TouchableOpacity>
        <Text style={[TextStyles.heading.h1, { color: colors.foreground }]}>Reports</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>        
        {error && (
          <Card style={[styles.errorCard, { backgroundColor: colors.destructive }]}>
            <Text style={[TextStyles.body.medium, { color: colors['destructive-foreground'] }]}>
              {String(error)}
            </Text>
          </Card>
        )}

        {/* Core Metrics */}
        <View style={styles.metricsRow}>
          <Card style={[styles.metricCard, { backgroundColor: colors.card }]}>
            <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>Total Tasks</Text>
            <Text style={[TextStyles.heading.h3, { color: colors.foreground }]}>{core.totalTasks || 0}</Text>
          </Card>
          <Card style={[styles.metricCard, { backgroundColor: colors.card }]}>
            <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>Completion Rate</Text>
            <Text style={[TextStyles.heading.h3, { color: colors.success }]}>{(core.completionRate || 0)}%</Text>
          </Card>
        </View>

        <View style={styles.metricsRow}>
          <Card style={[styles.metricCard, { backgroundColor: colors.card }]}>
            <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>Velocity</Text>
            <Text style={[TextStyles.heading.h3, { color: colors.accent }]}>{core.velocity || 0}</Text>
          </Card>
          <Card style={[styles.metricCard, { backgroundColor: colors.card }]}>
            <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>Overdue</Text>
            <Text style={[TextStyles.heading.h3, { color: colors.destructive }]}>{core.overdueTasks || 0}</Text>
          </Card>
        </View>

        {/* Trends placeholders */}
        <Card style={styles.sectionCard}>
          <Text style={[TextStyles.heading.h2, { color: colors.foreground, marginBottom: 8 }]}>Trends</Text>
          <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
            Detailed charts are available on web. On mobile, we summarize key metrics above.
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  backButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  headerSpacer: { width: 40 },
  content: { flex: 1, padding: 16 },
  errorCard: { padding: 16, marginBottom: 16, borderRadius: 12 },
  sectionCard: { padding: 20, marginBottom: 20 },
  metricsRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  metricCard: { flex: 1, padding: 16, borderRadius: 12 },
});
