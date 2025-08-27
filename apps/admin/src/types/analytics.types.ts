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

// Power BI Integration Types
export interface PowerBIIntegration {
  isEnabled: boolean;
  workspaces: PowerBIWorkspace[];
  selectedWorkspace: string | null;
  selectedReport: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface PowerBIWorkspace {
  id: string;
  name: string;
  type: string;
  state: string;
  capacityId?: string;
  reports: PowerBIReport[];
  datasets: PowerBIDataset[];
}

export interface PowerBIReport {
  id: string;
  name: string;
  embedUrl: string;
  datasetId: string;
  webUrl: string;
  description?: string;
  createdDate: string;
  modifiedDate: string;
}

export interface PowerBIDataset {
  id: string;
  name: string;
  description?: string;
  tables: PowerBITable[];
  refreshSchedule?: string;
  lastRefresh?: string;
  nextRefresh?: string;
}

export interface PowerBITable {
  name: string;
  displayName: string;
  columns: PowerBIColumn[];
  rows?: any[];
  rowCount?: number;
}

export interface PowerBIColumn {
  name: string;
  displayName: string;
  dataType: string;
  formatString?: string;
  isHidden?: boolean;
}

export interface PowerBIEmbedConfig {
  reportId: string;
  workspaceId: string;
  embedToken: string;
  embedUrl: string;
  permissions: string[];
  settings: PowerBIEmbedSettings;
}

export interface PowerBIEmbedSettings {
  filterPaneEnabled: boolean;
  navContentPaneEnabled: boolean;
  bookmarksPaneEnabled: boolean;
  useCustomSaveAsDialog: boolean;
  panes: PowerBIPaneSettings;
}

export interface PowerBIPaneSettings {
  filters: {
    visible: boolean;
    expanded: boolean;
  };
  bookmarks: {
    visible: boolean;
    expanded: boolean;
  };
  pageNavigation: {
    visible: boolean;
    expanded: boolean;
  };
}
