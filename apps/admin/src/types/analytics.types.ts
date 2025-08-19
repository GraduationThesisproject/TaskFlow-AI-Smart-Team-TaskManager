export interface Analytics {
  overview: OverviewStats;
  userStats: UserStats;
  workspaceStats: WorkspaceStats;
  taskStats: TaskStats;
  isLoading: boolean;
  error: string | null;
  dateRange: DateRange;
}

export interface OverviewStats {
  totalUsers: number;
  totalWorkspaces: number;
  totalTasks: number;
  activeUsers: number;
  growthRate: number;
}

export interface UserStats {
  newUsers: TimeSeriesData[];
  activeUsers: TimeSeriesData[];
  userRetention: number;
  topUsers: TopUser[];
}

export interface WorkspaceStats {
  totalWorkspaces: number;
  activeWorkspaces: number;
  workspaceGrowth: TimeSeriesData[];
  topWorkspaces: TopWorkspace[];
}

export interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  taskCompletionRate: number;
  tasksByStatus: StatusDistribution[];
  tasksByPriority: PriorityDistribution[];
}

export interface TimeSeriesData {
  date: string;
  value: number;
}

export interface TopUser {
  id: string;
  name: string;
  email: string;
  taskCount: number;
  workspaceCount: number;
}

export interface TopWorkspace {
  id: string;
  name: string;
  memberCount: number;
  taskCount: number;
  activityScore: number;
}

export interface StatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

export interface PriorityDistribution {
  priority: string;
  count: number;
  percentage: number;
}

export interface DateRange {
  start: Date;
  end: Date;
}
