import { useEffect, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '../store';
import { 
  fetchAnalytics, 
  exportAnalytics, 
  setPeriod, 
  setDateRange, 
  setChartType,
  clearError
} from '../store/slices/analyticsSlice';
import type { Workspace } from '../types/workspace.types';

type ChartType = 'line' | 'bar' | 'pie' | 'doughnut';
type TimePeriod = 'week' | 'month' | 'quarter' | 'year';

interface UseReportWorkSpaceProps {
  currentWorkspace: Workspace;
}

interface UseReportWorkSpaceReturn {
  // State
  analyticsData: any;
  filters: {
    period: TimePeriod;
    dateRange: { start: string; end: string };
    chartType: ChartType;
  };
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchAnalyticsData: () => void;
  exportData: (format: 'csv' | 'json' | 'pdf') => void;
  handlePeriodChange: (period: TimePeriod) => void;
  handleDateRangeChange: (start: string, end: string) => void;
  handleChartTypeChange: (chartType: ChartType) => void;
  clearAnalyticsError: () => void;
  
  // Chart data
  taskCompletionData: any;
  workloadDistributionData: any;
  weeklyTrendsData: any;
  peakHoursData: any;
  
  // Chart options
  chartOptions: any;
}

export const useReportWorkSpace = ({ currentWorkspace }: UseReportWorkSpaceProps): UseReportWorkSpaceReturn => {
  const dispatch = useAppDispatch();
  const workspaceId = currentWorkspace._id;

  // Get analytics state from Redux
  const { data: analyticsData, filters, loading, error } = useAppSelector((state) => state.analytics);
  const { period: selectedPeriod, dateRange, chartType: selectedChart } = filters;

  // Fetch analytics data
  const fetchAnalyticsData = () => {
    if (!workspaceId) {
      console.warn('No workspace ID available for analytics');
      return;
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Fetching analytics with:', {
        workspaceId,
        period: selectedPeriod,
        startDate: dateRange.start,
        endDate: dateRange.end,
      });
    }
    
    dispatch(fetchAnalytics({
      workspaceId,
      period: selectedPeriod,
      startDate: dateRange.start,
      endDate: dateRange.end,
    }));
  };

  // Export analytics data
  const exportData = (format: 'csv' | 'json' | 'pdf') => {
    if (!workspaceId) {
      console.warn('No workspace ID available for export');
      return;
    }

    dispatch(exportAnalytics({
      id: workspaceId,
      format,
      period: selectedPeriod,
      startDate: dateRange.start,
      endDate: dateRange.end,
    }));
  };

  // Handle period change
  const handlePeriodChange = (period: TimePeriod) => {
    dispatch(setPeriod(period));
  };

  // Handle date range change
  const handleDateRangeChange = (start: string, end: string) => {
    dispatch(setDateRange({ start, end }));
  };

  // Handle chart type change
  const handleChartTypeChange = (chartType: ChartType) => {
    dispatch(setChartType(chartType));
  };

  // Clear analytics error
  const clearAnalyticsError = () => {
    dispatch(clearError());
  };

  // Chart options
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  }), []);

  // Task completion chart data
  const taskCompletionData = useMemo(() => {
    if (!analyticsData?.timeInsights?.dailyActivity || !Array.isArray(analyticsData.timeInsights.dailyActivity)) {
      return {
        labels: [],
        datasets: [{
          label: 'Tasks Completed',
          data: [],
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
        }],
      };
    }

    const dailyActivity = analyticsData.timeInsights.dailyActivity;
    if (dailyActivity.length === 0) {
      return {
        labels: [],
        datasets: [{
          label: 'Tasks Completed',
          data: [],
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
        }],
      };
    }

    return {
      labels: dailyActivity.map((d: any) => d.date || ''),
      datasets: [
        {
          label: 'Tasks Completed',
          data: dailyActivity.map((d: any) => d.tasks || 0),
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
        },
      ],
    };
  }, [analyticsData?.timeInsights?.dailyActivity]);

  // Workload distribution chart data
  const workloadDistributionData = useMemo(() => {
    if (!analyticsData?.teamMetrics?.workloadDistribution || !Array.isArray(analyticsData.teamMetrics.workloadDistribution)) {
      return {
        labels: [],
        datasets: [{
          label: 'Tasks Assigned',
          data: [],
          backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
          borderWidth: 2,
          borderColor: '#fff',
        }],
      };
    }

    const workloadData = analyticsData.teamMetrics.workloadDistribution;
    if (workloadData.length === 0) {
      return {
        labels: [],
        datasets: [{
          label: 'Tasks Assigned',
          data: [],
          backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
          borderWidth: 2,
          borderColor: '#fff',
        }],
      };
    }

    return {
      labels: workloadData.map((w: any) => w.member || 'Unknown'),
      datasets: [
        {
          label: 'Tasks Assigned',
          data: workloadData.map((w: any) => w.tasks || 0),
          backgroundColor: [
            '#3B82F6',
            '#10B981',
            '#F59E0B',
            '#EF4444',
            '#8B5CF6',
          ],
          borderWidth: 2,
          borderColor: '#fff',
        },
      ],
    };
  }, [analyticsData?.teamMetrics?.workloadDistribution]);

  // Weekly trends chart data
  const weeklyTrendsData = useMemo(() => {
    if (!analyticsData?.timeInsights?.weeklyTrends || !Array.isArray(analyticsData.timeInsights.weeklyTrends)) {
      return {
        labels: [],
        datasets: [
          {
            label: 'Tasks Created',
            data: [],
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
          },
          {
            label: 'Tasks Completed',
            data: [],
            backgroundColor: 'rgba(16, 185, 129, 0.8)',
          },
        ],
      };
    }

    const weeklyData = analyticsData.timeInsights.weeklyTrends;
    if (weeklyData.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            label: 'Tasks Created',
            data: [],
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
          },
          {
            label: 'Tasks Completed',
            data: [],
            backgroundColor: 'rgba(16, 185, 129, 0.8)',
          },
        ],
      };
    }

    return {
      labels: weeklyData.map((w: any) => w.week || ''),
      datasets: [
        {
          label: 'Tasks Created',
          data: weeklyData.map((w: any) => w.created || 0),
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
        },
        {
          label: 'Tasks Completed',
          data: weeklyData.map((w: any) => w.completed || 0),
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
        },
      ],
    };
  }, [analyticsData?.timeInsights?.weeklyTrends]);

  // Peak hours chart data
  const peakHoursData = useMemo(() => {
    if (!analyticsData?.timeInsights?.peakHours || !Array.isArray(analyticsData.timeInsights.peakHours)) {
      return {
        labels: [],
        datasets: [{
          label: 'Activity Level',
          data: [],
          borderColor: '#8B5CF6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          fill: true,
          tension: 0.4,
        }],
      };
    }

    const peakHours = analyticsData.timeInsights.peakHours;
    if (peakHours.length === 0) {
      return {
        labels: [],
        datasets: [{
          label: 'Activity Level',
          data: [],
          borderColor: '#8B5CF6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          fill: true,
          tension: 0.4,
        }],
      };
    }

    return {
      labels: peakHours.map((h: any) => `${h.hour || 0}:00`),
      datasets: [
        {
          label: 'Activity Level',
          data: peakHours.map((h: any) => h.activity || 0),
          borderColor: '#8B5CF6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          fill: true,
          tension: 0.4,
        },
      ],
    };
  }, [analyticsData?.timeInsights?.peakHours]);

  // Debug analytics data (can be removed in production)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics data:', analyticsData);
    }
  }, [analyticsData]);

  // Fetch data on mount and when dependencies change
  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod, dateRange, workspaceId, dispatch]);

  return {
    // State
    analyticsData,
    filters: {
      period: selectedPeriod,
      dateRange,
      chartType: selectedChart,
    },
    loading,
    error,
    
    // Actions
    fetchAnalyticsData,
    exportData,
    handlePeriodChange,
    handleDateRangeChange,
    handleChartTypeChange,
    clearAnalyticsError,
    
    // Chart data
    taskCompletionData,
    workloadDistributionData,
    weeklyTrendsData,
    peakHoursData,
    
    // Chart options
    chartOptions,
  };
};
