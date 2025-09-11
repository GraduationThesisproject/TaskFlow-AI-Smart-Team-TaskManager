import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { AnalyticsService, type TimePeriod, type AnalyticsParams } from '@/services/analyticsService';

export interface WorkspaceAnalyticsUI {
  core: {
    totalTasks: number;
    completionRate: number;
    averageCompletionTime: number;
    overdueTasks: number;
    inProgressTasks: number;
  };
  team: {
    totalMembers: number;
    activeMembers: number;
    topPerformers: Array<{ name: string; tasksCompleted: number }>;
  };
  charts: {
    workload: Array<{ label: string; value: number }>; // derived from teamMetrics.workloadDistribution
  };
}

export function useWorkspaceAnalytics(workspaceId: string | null | undefined, initialPeriod: TimePeriod = 'month') {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<TimePeriod>(initialPeriod);
  const [data, setData] = useState<WorkspaceAnalyticsUI | null>(null);

  const fetchAnalytics = useCallback(async (params?: AnalyticsParams) => {
    if (!workspaceId) return;
    setError(null);
    setLoading(true);
    try {
      const res = await AnalyticsService.getWorkspaceAnalytics(workspaceId, params ?? { period });
      const a = (res as any)?.analytics || {};
      const ui: WorkspaceAnalyticsUI = {
        core: {
          totalTasks: a?.taskMetrics?.totalTasks ?? a?.totalTasks ?? 0,
          completionRate: a?.taskMetrics?.completionRate ?? a?.completionRate ?? 0,
          averageCompletionTime: a?.timeMetrics?.averageCompletionTime ?? a?.averageCompletionTime ?? 0,
          overdueTasks: a?.taskMetrics?.overdueTasks ?? a?.overdueTasks ?? 0,
          inProgressTasks: a?.taskMetrics?.inProgressTasks ?? a?.inProgressTasks ?? 0,
        },
        team: {
          totalMembers: a?.teamMetrics?.totalMembers ?? a?.totalMembers ?? 0,
          activeMembers: a?.teamMetrics?.activeMembers ?? a?.activeMembers ?? 0,
          topPerformers: a?.teamMetrics?.topPerformers ?? [],
        },
        charts: {
          workload: Array.isArray(a?.teamMetrics?.workloadDistribution)
            ? a.teamMetrics.workloadDistribution.map((w: any) => ({ label: w.member, value: w.tasks }))
            : [],
        },
      };
      setData(ui);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load workspace analytics');
    } finally {
      setLoading(false);
    }
  }, [workspaceId, period]);

  useEffect(() => {
    if (workspaceId) fetchAnalytics({ period });
  }, [workspaceId, period, fetchAnalytics]);

  useFocusEffect(
    useCallback(() => {
      if (workspaceId) fetchAnalytics({ period });
      return () => {};
    }, [workspaceId, period, fetchAnalytics])
  );

  const refresh = useCallback(async () => {
    await fetchAnalytics({ period });
  }, [fetchAnalytics, period]);

  return { data, loading, error, period, setPeriod, refresh } as const;
}