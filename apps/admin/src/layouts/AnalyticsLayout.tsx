import React, { useEffect, useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  Typography,
  Badge,
  Button,
  Container,
  Grid,
  Select
} from '@taskflow/ui';
import { 
  UsersIcon, 
  FolderIcon, 
  ChartBarIcon, 
  ArrowTrendingUpIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { adminService, AnalyticsData } from '../services/adminService';

const AnalyticsLayout: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState('6-months');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminService.getAnalytics(timeRange);
      setAnalyticsData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
      console.error('Analytics fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportAnalytics = async () => {
    try {
      await adminService.exportAnalytics();
      alert('Analytics export started. You will receive a notification when ready.');
    } catch (err) {
      alert('Failed to export analytics: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  if (isLoading) {
    return (
      <Container size="7xl">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="7xl">
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
                      <Typography variant="heading-large" className="text-red-600 mb-2">
              Error Loading Analytics
            </Typography>
          <Typography variant="body-medium" className="text-muted-foreground mb-4">
            {error}
          </Typography>
          <Button 
            variant="outline" 
            onClick={fetchAnalytics}
          >
            Retry
          </Button>
        </div>
      </Container>
    );
  }

  if (!analyticsData) {
    return (
      <Container size="7xl">
        <div className="text-center py-12">
                      <Typography variant="heading-large" className="text-muted-foreground">
              No analytics data available
            </Typography>
        </div>
      </Container>
    );
  }

  return (
    <Container size="7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <Typography variant="heading-large" className="text-foreground mb-2">
              Analytics Dashboard
            </Typography>
            <Typography variant="body-medium" className="text-muted-foreground">
              Comprehensive insights into platform usage and performance
            </Typography>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
            >
              <option value="1-month">Last Month</option>
              <option value="3-months">Last 3 Months</option>
              <option value="6-months">Last 6 Months</option>
              <option value="1-year">Last Year</option>
            </select>
            <Button onClick={handleExportAnalytics}>
              <ChartBarIcon className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <Grid cols={4} className="mb-8 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
              <Typography variant="heading-large" className="text-foreground">
                {analyticsData.totalUsers.toLocaleString()}
              </Typography>
            </div>
            <div className="flex items-center mt-1">
              <ArrowUpIcon className="h-3 w-3 text-green-500 mr-1" />
              <Typography variant="body-small" className="text-green-600">
                +{Math.round((analyticsData.userGrowthData[analyticsData.userGrowthData.length - 1]?.signups || 0) / analyticsData.totalUsers * 100)}%
              </Typography>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <ArrowTrendingUpIcon className="h-4 w-4 text-muted-foreground" />
              <Typography variant="heading-large" className="text-foreground">
                {analyticsData.activeUsers.daily}
              </Typography>
            </div>
            <Typography variant="body-small" className="text-muted-foreground mt-1">
              Daily active users
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <FolderIcon className="h-4 w-4 text-muted-foreground" />
              <Typography variant="heading-large" className="text-foreground">
                {analyticsData.activeProjects}
              </Typography>
            </div>
            <Typography variant="body-small" className="text-muted-foreground mt-1">
              Currently active
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <ChartBarIcon className="h-4 w-4 text-muted-foreground" />
              <Typography variant="heading-large" className="text-foreground">
                {analyticsData.completionRate}%
              </Typography>
            </div>
            <Typography variant="body-small" className="text-muted-foreground mt-1">
              Task completion rate
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Charts and Insights */}
      <Grid cols={2} className="mb-8 gap-6">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>User Growth Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.userGrowthData.map((data, index) => (
                <div key={index} className="flex items-center justify-between">
                  <Typography variant="body-medium" className="text-muted-foreground">
                    {data.month}
                  </Typography>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ 
                          width: `${(data.signups / Math.max(...analyticsData.userGrowthData.map(d => d.signups))) * 100}%` 
                        }}
                      />
                    </div>
                    <Typography variant="body-small" className="font-medium">
                      {data.signups}
                    </Typography>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Project Creation Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Project Creation Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.projectCreationTrends.map((data, index) => (
                <div key={index} className="flex items-center justify-between">
                  <Typography variant="body-medium" className="text-muted-foreground">
                    {data.month}
                  </Typography>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-muted rounded-full h-2">
                      <div 
                        className="bg-secondary h-2 rounded-full" 
                        style={{ 
                          width: `${(data.projects / Math.max(...analyticsData.projectCreationTrends.map(d => d.projects))) * 100}%` 
                        }}
                      />
                    </div>
                    <Typography variant="body-small" className="font-medium">
                      {data.projects}
                    </Typography>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </Grid>

      {/* Task Status Overview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Task Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Grid cols={3} className="gap-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-warning/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <ClockIcon className="h-8 w-8 text-warning" />
              </div>
              <Typography variant="heading-large" className="text-foreground mb-1">
                {analyticsData.taskCompletionData.pending}
              </Typography>
              <Typography variant="body-medium" className="text-muted-foreground">
                Pending Tasks
              </Typography>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <ArrowTrendingUpIcon className="h-8 w-8 text-secondary" />
              </div>
              <Typography variant="heading-large" className="text-foreground mb-1">
                {analyticsData.taskCompletionData.inProgress}
              </Typography>
              <Typography variant="body-medium" className="text-muted-foreground">
                In Progress
              </Typography>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircleIcon className="h-8 w-8 text-success" />
              </div>
              <Typography variant="heading-large" className="text-foreground mb-1">
                {analyticsData.taskCompletionData.completed}
              </Typography>
              <Typography variant="body-medium" className="text-muted-foreground">
                Completed
              </Typography>
            </div>
          </Grid>
        </CardContent>
      </Card>

      {/* Top Teams Performance */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Top Performing Teams</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.topTeams.map((team, index) => (
              <div key={team.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <Typography variant="body-medium" className="font-medium">
                      {team.name}
                    </Typography>
                    <Typography variant="body-small" className="text-muted-foreground">
                      {team.members} members • {team.projects} projects
                    </Typography>
                  </div>
                </div>
                <div className="text-right">
                              <Typography variant="heading-large" className="font-medium">
              {team.activityScore}%
            </Typography>
                  <Typography variant="body-small" className="text-muted-foreground">
                    Activity Score
                  </Typography>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Performance */}
      <Card>
        <CardHeader>
          <CardTitle>System Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <Grid cols={3} className="gap-6">
            <div className="text-center">
              <Typography variant="heading-large" className="text-foreground mb-1">
                {analyticsData.systemPerformance.serverUptime}%
              </Typography>
              <Typography variant="body-medium" className="text-muted-foreground">
                Server Uptime
              </Typography>
            </div>
            <div className="text-center">
              <Typography variant="heading-large" className="text-foreground mb-1">
                {analyticsData.systemPerformance.apiResponseTime}ms
              </Typography>
              <Typography variant="body-medium" className="text-muted-foreground">
                API Response Time
              </Typography>
            </div>
            <div className="text-center">
              <Typography variant="heading-large" className="text-foreground mb-1">
                {analyticsData.systemPerformance.databaseHealth}%
      </Typography>
      <Typography variant="body-medium" className="text-muted-foreground">
                Database Health
      </Typography>
            </div>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AnalyticsLayout;
