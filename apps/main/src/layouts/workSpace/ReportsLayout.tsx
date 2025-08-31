import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import {
  Calendar,
  Download,
  Filter,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Target,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@taskflow/ui';
import { 
  fetchAnalytics, 
  exportAnalytics, 
  setPeriod, 
  setDateRange, 
  setChartType, 
  clearError 
} from '../../store/slices/analyticsSlice';
import type { RootState } from '../../store';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type ChartType = 'line' | 'bar' | 'pie' | 'doughnut';
type TimePeriod = 'week' | 'month' | 'quarter' | 'year';

const ReportsLayout: React.FC = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const query = new URLSearchParams(location.search);
  const id = '68b0fe70cda1977ca4c9a092'; // Force correct analytics space ID
  
  // Get workspaceId from Redux store like other components
  const currentWorkspace = useAppSelector((state: RootState) => state.workspace.currentWorkspace);
  const workspaces = useAppSelector((state: RootState) => state.workspace.workspaces) as Array<{ _id: string }> | undefined;
  const persistedWorkspaceId = useAppSelector((state: RootState) => state.workspace.currentWorkspaceId);
  const derivedId = currentWorkspace?._id || workspaces?.[0]?._id || persistedWorkspaceId || null;
  const workspaceId = derivedId || '';

  // Get analytics state from Redux
  const { data: analyticsData, filters, loading: isLoading, error } = useAppSelector((state: RootState) => state.analytics);
  const { period: selectedPeriod, dateRange, chartType: selectedChart } = filters;

  // Debug logging
  console.log('🔍 URL Debug Info:');
  console.log('Current URL:', window.location.href);
  console.log('Location search:', location.search);
  console.log('All query params:', Object.fromEntries(query.entries()));
  console.log('Extracted id:', id);
  console.log('Extracted workspaceId:', workspaceId);
  console.log('Current workspace:', currentWorkspace);
  console.log('Derived ID:', derivedId);

  const fetchAnalyticsData = () => {
    if (!id && !workspaceId) {
      console.log('No id or workspace ID provided');
      return;
    }

    console.log("id", id);
    console.log("workspaceId", workspaceId);
    
    dispatch(fetchAnalytics({
      id: id || undefined,
      workspaceId: workspaceId || undefined,
      period: selectedPeriod,
      startDate: dateRange.start,
      endDate: dateRange.end,
    }));
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod, dateRange, id, workspaceId, dispatch]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#374151',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
        ticks: {
          color: '#6B7280',
        },
      },
      y: {
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
        ticks: {
          color: '#6B7280',
        },
      },
    },
  };

  const taskCompletionData = {
    labels: analyticsData.timeInsights.dailyActivity.map(d => d.date),
    datasets: [
      {
        label: 'Tasks Completed',
        data: analyticsData.timeInsights.dailyActivity.map(d => d.tasks),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const workloadDistributionData = {
    labels: analyticsData.teamMetrics.workloadDistribution.map(w => w.member),
    datasets: [
      {
        label: 'Tasks Assigned',
        data: analyticsData.teamMetrics.workloadDistribution.map(w => w.tasks),
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

  const weeklyTrendsData = {
    labels: analyticsData.timeInsights.weeklyTrends.map(w => w.week),
    datasets: [
      {
        label: 'Tasks Created',
        data: analyticsData.timeInsights.weeklyTrends.map(w => w.created),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
      {
        label: 'Tasks Completed',
        data: analyticsData.timeInsights.weeklyTrends.map(w => w.completed),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
      },
    ],
  };

  const peakHoursData = {
    labels: analyticsData.timeInsights.peakHours.map(h => `${h.hour}:00`),
    datasets: [
      {
        label: 'Activity Level',
        data: analyticsData.timeInsights.peakHours.map(h => h.activity),
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const exportData = (format: 'csv' | 'json' | 'pdf') => {
    if (!id) {
      console.warn('Export only available for spaces');
      return;
    }

    dispatch(exportAnalytics({
      id,
      format,
      period: selectedPeriod,
      startDate: dateRange.start,
      endDate: dateRange.end,
    }));
  };

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    change?: number;
    icon: React.ReactNode;
    color?: string;
  }> = ({ title, value, change, icon, color = 'blue' }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              {change >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(change)}%
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Workspace Analytics</h1>
              <p className="text-gray-600 mt-1">Comprehensive insights into your team's performance</p>
              {error && (
                <p className="text-red-600 mt-2 text-sm">{error}</p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchAnalyticsData()}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportData('csv')} disabled={!id}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <select
                  value={selectedPeriod}
                  onChange={(e) => dispatch(setPeriod(e.target.value as TimePeriod))}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                  <option value="year">This Year</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => dispatch(setDateRange({ ...dateRange, start: e.target.value }))}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => dispatch(setDateRange({ ...dateRange, end: e.target.value }))}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={selectedChart}
                onChange={(e) => dispatch(setChartType(e.target.value as ChartType))}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="line">Line Chart</option>
                <option value="bar">Bar Chart</option>
                <option value="pie">Pie Chart</option>
                <option value="doughnut">Doughnut Chart</option>
              </select>
            </div>
          </div>
        </div>

        {/* Core Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <MetricCard
            title="Total Tasks"
            value={analyticsData.coreMetrics.totalTasks}
            change={12.5}
            icon={<Target className="h-6 w-6 text-blue-600" />}
            color="blue"
          />
          <MetricCard
            title="Completion Rate"
            value={`${analyticsData.coreMetrics.completionRate}%`}
            change={5.2}
            icon={<CheckCircle className="h-6 w-6 text-green-600" />}
            color="green"
          />
          <MetricCard
            title="Velocity"
            value={analyticsData.coreMetrics.velocity}
            change={-2.1}
            icon={<Activity className="h-6 w-6 text-purple-600" />}
            color="purple"
          />
          <MetricCard
            title="Avg Duration"
            value={`${analyticsData.coreMetrics.avgTaskDuration}d`}
            change={-8.3}
            icon={<Clock className="h-6 w-6 text-orange-600" />}
            color="orange"
          />
          <MetricCard
            title="Overdue Tasks"
            value={analyticsData.coreMetrics.overdueTasks}
            change={-15.7}
            icon={<AlertCircle className="h-6 w-6 text-red-600" />}
            color="red"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Task Completion Trend */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Task Completion Trend</h3>
              <LineChart className="h-5 w-5 text-gray-500" />
            </div>
            <div className="h-80">
              <Line data={taskCompletionData} options={chartOptions} />
            </div>
          </div>

          {/* Workload Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Team Workload Distribution</h3>
              <PieChart className="h-5 w-5 text-gray-500" />
            </div>
            <div className="h-80">
              <Doughnut data={workloadDistributionData} options={chartOptions} />
            </div>
          </div>

          {/* Weekly Trends */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Weekly Task Trends</h3>
              <BarChart3 className="h-5 w-5 text-gray-500" />
            </div>
            <div className="h-80">
              <Bar data={weeklyTrendsData} options={chartOptions} />
            </div>
          </div>

          {/* Peak Activity Hours */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Peak Activity Hours</h3>
              <Activity className="h-5 w-5 text-gray-500" />
            </div>
            <div className="h-80">
              <Line data={peakHoursData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Team Analytics & Project Health */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Performers */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Top Performers</h3>
              <Users className="h-5 w-5 text-gray-500" />
            </div>
            <div className="space-y-4">
              {analyticsData.teamMetrics.topPerformers.map((performer, index) => (
                <div key={performer.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-900">{performer.name}</span>
                  </div>
                  <span className="text-sm text-gray-600">{performer.tasksCompleted} tasks</span>
                </div>
              ))}
            </div>
          </div>

          {/* Project Health Metrics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Project Health</h3>
              <Target className="h-5 w-5 text-gray-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{analyticsData.projectHealth.bugRate}%</p>
                <p className="text-sm text-gray-600">Bug Rate</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{analyticsData.projectHealth.reworkRate}%</p>
                <p className="text-sm text-gray-600">Rework Rate</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{analyticsData.projectHealth.blockedTasks}</p>
                <p className="text-sm text-gray-600">Blocked Tasks</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{analyticsData.projectHealth.cycleTime}d</p>
                <p className="text-sm text-gray-600">Avg Cycle Time</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsLayout;
