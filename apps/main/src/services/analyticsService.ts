import axiosInstance from '../config/axios';

export type RangeParam = '1m' | '3m' | '6m' | '12m';

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

export const AnalyticsService = {
  async getUserAnalytics(range: RangeParam = '3m') {
    const res = await axiosInstance.get<UserAnalyticsResponse>('/analytics/user', { params: { range } });
    return res.data;
  }
};
