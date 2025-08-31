// Analytics types for Redux state management
export interface CoreMetrics {
  totalTasks: number;
  completionRate: number;
  velocity: number;
  avgTaskDuration: number;
  overdueTasks: number;
}

export interface TeamMetrics {
  totalMembers: number;
  activeMembers: number;
  topPerformers: Array<{ name: string; tasksCompleted: number; }>;
  workloadDistribution: Array<{ member: string; tasks: number; }>;
}

export interface TimeInsights {
  peakHours: Array<{ hour: number; activity: number; }>;
  dailyActivity: Array<{ date: string; tasks: number; }>;
  weeklyTrends: Array<{ week: string; completed: number; created: number; }>;
}

export interface ProjectHealth {
  bugRate: number;
  reworkRate: number;
  blockedTasks: number;
  cycleTime: number;
}

export interface AnalyticsData {
  coreMetrics: CoreMetrics;
  teamMetrics: TeamMetrics;
  timeInsights: TimeInsights;
  projectHealth: ProjectHealth;
}

export interface AnalyticsFilters {
  period: 'week' | 'month' | 'quarter' | 'year';
  dateRange: {
    start: string;
    end: string;
  };
  chartType: 'line' | 'bar' | 'pie' | 'doughnut';
}

export interface AnalyticsState {
  data: AnalyticsData;
  filters: AnalyticsFilters;
  loading: boolean;
  error: string | null;
  lastFetch: string | null;
}

export interface FetchAnalyticsParams {
  id?: string;
  workspaceId?: string;
  period: 'week' | 'month' | 'quarter' | 'year';
  startDate: string;
  endDate: string;
}

export interface ExportAnalyticsParams {
  id: string;
  format: 'csv' | 'json' | 'pdf';
  period: 'week' | 'month' | 'quarter' | 'year';
  startDate: string;
  endDate: string;
}
