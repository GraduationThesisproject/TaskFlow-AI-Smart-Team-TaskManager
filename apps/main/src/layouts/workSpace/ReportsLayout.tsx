import React from 'react';
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
import {
  Calendar,
  Download,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  Target,
  Activity,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@taskflow/ui';
import { useReportWorkSpace } from '../../hooks/useReportWorkSpace';
import type { Workspace } from '../../types/workspace.types';

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

interface ReportsLayoutProps {
  currentWorkspace: Workspace;
}

const ReportsLayout: React.FC<ReportsLayoutProps> = ({ currentWorkspace }) => {
  const {
    analyticsData,
    filters,
    loading: isLoading,
    error,
    fetchAnalyticsData,
    exportData,
    handlePeriodChange,
    handleDateRangeChange,
    handleChartTypeChange,
    taskCompletionData,
    workloadDistributionData,
    weeklyTrendsData,
    peakHoursData,
    chartOptions,
  } = useReportWorkSpace({ currentWorkspace });

  const { period: selectedPeriod, dateRange, chartType: selectedChart } = filters;

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
  }> = ({ title, value, icon }) => (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="p-2 rounded-lg bg-gray-100">
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
              <Button variant="outline" size="sm" onClick={() => exportData('csv')} disabled={!currentWorkspace._id}>
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
                  onChange={(e) => handlePeriodChange(e.target.value as any)}
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
                  onChange={(e) => handleDateRangeChange(e.target.value, dateRange.end)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => handleDateRangeChange(dateRange.start, e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={selectedChart}
                onChange={(e) => handleChartTypeChange(e.target.value as any)}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <MetricCard
            title="Total Tasks"
            value={analyticsData?.coreMetrics?.totalTasks || 0}
            icon={<Target className="h-5 w-5 text-blue-600" />}
          />
          <MetricCard
            title="Completion Rate"
            value={`${analyticsData?.coreMetrics?.completionRate || 0}%`}
            icon={<CheckCircle className="h-5 w-5 text-green-600" />}
          />
          <MetricCard
            title="Velocity"
            value={analyticsData?.coreMetrics?.velocity || 0}
            icon={<Activity className="h-5 w-5 text-purple-600" />}
          />
          <MetricCard
            title="Avg Duration"
            value={`${analyticsData?.coreMetrics?.avgTaskDuration || 0}d`}
            icon={<Clock className="h-5 w-5 text-orange-600" />}
          />
          <MetricCard
            title="Overdue Tasks"
            value={analyticsData?.coreMetrics?.overdueTasks || 0}
            icon={<AlertCircle className="h-5 w-5 text-red-600" />}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Task Completion Trend */}
          <div className="bg-white rounded-lg border p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Completion Trend</h3>
            <div className="h-64">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-gray-500">Loading chart data...</div>
                </div>
              ) : taskCompletionData.labels.length > 0 && taskCompletionData.datasets[0].data.some((value: number) => value > 0) ? (
                <Line data={taskCompletionData} options={chartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-gray-500">No task completion data available</div>
                </div>
              )}
            </div>
          </div>

          {/* Workload Distribution */}
          <div className="bg-white rounded-lg border p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Workload Distribution</h3>
            <div className="h-64">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-gray-500">Loading chart data...</div>
                </div>
              ) : workloadDistributionData.labels.length > 0 && workloadDistributionData.datasets[0].data.some((value: number) => value > 0) ? (
                <Doughnut data={workloadDistributionData} options={chartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-gray-500">No workload distribution data available</div>
                </div>
              )}
            </div>
          </div>

          {/* Weekly Trends */}
          <div className="bg-white rounded-lg border p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Task Trends</h3>
            <div className="h-64">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-gray-500">Loading chart data...</div>
                </div>
              ) : weeklyTrendsData.labels.length > 0 && (weeklyTrendsData.datasets[0].data.some((value: number) => value > 0) || weeklyTrendsData.datasets[1].data.some((value: number) => value > 0)) ? (
                <Bar data={weeklyTrendsData} options={chartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-gray-500">No weekly trends data available</div>
                </div>
              )}
            </div>
          </div>

          {/* Peak Activity Hours */}
          <div className="bg-white rounded-lg border p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Peak Activity Hours</h3>
            <div className="h-64">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-gray-500">Loading chart data...</div>
                </div>
              ) : peakHoursData.labels.length > 0 && peakHoursData.datasets[0].data.some((value: number) => value > 0) ? (
                <Line data={peakHoursData} options={chartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-gray-500">No peak hours data available</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Team Analytics & Project Health */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performers */}
          <div className="bg-white rounded-lg border p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h3>
            <div className="space-y-3">
              {isLoading ? (
                <div className="text-center text-gray-500">Loading performers...</div>
              ) : analyticsData?.teamMetrics?.topPerformers?.length > 0 ? (
                analyticsData.teamMetrics.topPerformers.map((performer: any, index: number) => (
                  <div key={performer.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-900">{performer.name}</span>
                    </div>
                    <span className="text-sm text-gray-600">{performer.tasksCompleted} tasks</span>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500">No performance data available</div>
              )}
            </div>
          </div>

          {/* Project Health Metrics */}
          <div className="bg-white rounded-lg border p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Health</h3>
            <div className="grid grid-cols-2 gap-4">
              {isLoading ? (
                <div className="col-span-2 text-center text-gray-500">Loading health metrics...</div>
              ) : (
                <>
                  <div className="text-center">
                    <p className="text-xl font-bold text-red-600">{analyticsData?.projectHealth?.bugRate || 0}%</p>
                    <p className="text-sm text-gray-600">Bug Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-orange-600">{analyticsData?.projectHealth?.reworkRate || 0}%</p>
                    <p className="text-sm text-gray-600">Rework Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-yellow-600">{analyticsData?.projectHealth?.blockedTasks || 0}</p>
                    <p className="text-sm text-gray-600">Blocked Tasks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-blue-600">{analyticsData?.projectHealth?.cycleTime || 0}d</p>
                    <p className="text-sm text-gray-600">Avg Cycle Time</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsLayout;
