import axiosInstance from '../config/axios';

export type RangeParam = '1m' | '3m' | '6m' | '12m';
export type TimePeriod = 'week' | 'month' | 'quarter' | 'year';

export interface ProjectsOverTimePoint { month: string; count: number }
export interface ActivityPoint { date: string; value: number }
export interface ContributionPoint { period: string; count: number }

export interface RecentProject { id: string; name: string; createdAt?: string; role?: string }
export interface RecentTask { id: string; title: string; status: 'completed' | 'in_progress' | 'pending' | string; updatedAt?: string }
export interface Collaborator { id: string; name: string; avatar?: string; interactions?: number }

export interface UserAnalyticsResponse {
  totalProjects?: number;
  tasksAssigned?: number;
  tasksCompleted?: number;
  completionRate?: number;
  lastActiveAt?: string;

  projectsOverTime?: ProjectsOverTimePoint[];
  taskStatusBreakdown?: { completed?: number; inProgress?: number; pending?: number; overdue?: number };
  activityHeatmap?: ActivityPoint[];
  contributionsOverTime?: ContributionPoint[];

  recentProjects?: RecentProject[];
  recentTasks?: RecentTask[];
  collaborators?: Collaborator[];
}

export interface WorkspaceAnalyticsResponse {
  analytics: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    overdueTasks: number;
    completionRate: number;
    averageCompletionTime: number;
    totalTimeSpent: number;
    totalMembers: number;
    activeMembers: number;
    customerSatisfaction: number;
    taskMetrics: {
      totalTasks: number;
      completedTasks: number;
      inProgressTasks: number;
      overdueTasks: number;
      completionRate: number;
      priorityDistribution: {
        low: number;
        medium: number;
        high: number;
        urgent: number;
      };
    };
    timeMetrics: {
      averageCompletionTime: number;
      totalTimeSpent: number;
      totalEstimated: number;
      totalActual: number;
      averageAccuracy: number;
      totalOvertime: number;
    };
    teamMetrics: {
      totalMembers: number;
      activeMembers: number;
      topPerformers: Array<{ name: string; tasksCompleted: number; }>;
      workloadDistribution: Array<{ member: string; tasks: number; }>;
    };
    qualityMetrics: {
      customerSatisfaction: number;
      bugRate: number;
      reworkRate: number;
      blockedTasks: number;
      cycleTime: number;
    };
  };
  period: string;
}

export interface SpaceAnalyticsResponse {
  analytics: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    overdueTasks: number;
    completionRate: number;
    averageCompletionTime: number;
    totalTimeSpent: number;
    totalMembers: number;
    activeMembers: number;
    customerSatisfaction: number;
    taskMetrics: {
      totalTasks: number;
      completedTasks: number;
      inProgressTasks: number;
      overdueTasks: number;
      completionRate: number;
    };
    timeMetrics: {
      averageCompletionTime: number;
      totalTimeSpent: number;
    };
    teamMetrics: {
      totalMembers: number;
      activeMembers: number;
    };
  };
  period: string;
}

export interface TeamPerformanceResponse {
  analytics: {
    topPerformers: Array<{ name: string; tasksCompleted: number; }>;
    workloadDistribution: Array<{ member: string; tasks: number; }>;
    teamVelocity: number;
    collaborationScore: number;
  };
  period: string;
  spaceId: string;
}

export interface AnalyticsParams {
  period?: TimePeriod;
  startDate?: string;
  endDate?: string;
}

export const AnalyticsService = {
  async getUserAnalytics(range: RangeParam = '3m') {
    const res = await axiosInstance.get<UserAnalyticsResponse>('/analytics/user', { params: { range } });
    return res.data;
  },

  async getWorkspaceAnalytics(workspaceId: string, params?: AnalyticsParams) {
    const res = await axiosInstance.get<WorkspaceAnalyticsResponse>(
      `/analytics/workspace/${workspaceId}`,
      { params }
    );
    return res.data;
  },

  async getSpaceAnalytics(spaceId: string, params?: AnalyticsParams) {
    const res = await axiosInstance.get<SpaceAnalyticsResponse>(
      `/analytics/space/${spaceId}`,
      { params }
    );
    return res.data;
  },

  async getTeamPerformance(spaceId: string, params?: AnalyticsParams) {
    const res = await axiosInstance.get<TeamPerformanceResponse>(
      `/analytics/space/${spaceId}/team-performance`,
      { params }
    );
    return res.data;
  },

  async exportAnalytics(spaceId: string, format: 'csv' | 'json' | 'pdf' = 'json', params?: AnalyticsParams) {
    const res = await axiosInstance.get(
      `/analytics/space/${spaceId}/export`,
      { 
        params: { ...params, format },
        responseType: format === 'json' ? 'json' : 'blob'
      }
    );
    return res.data;
  },

  async generateSpaceAnalytics(spaceId: string, options: {
    periodType?: TimePeriod;
    startDate?: string;
    endDate?: string;
    includeAI?: boolean;
  } = {}) {
    const res = await axiosInstance.post(
      `/analytics/space/${spaceId}/generate`,
      options
    );
    return res.data;
  }
};
