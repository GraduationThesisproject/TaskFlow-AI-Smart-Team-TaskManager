import React, { useEffect, useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  Typography,
  Badge,
  Progress,
  Button,
  Grid,
  Container
} from '@taskflow/ui';
import { 
  UsersIcon, 
  FolderIcon, 
  ChartBarIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { adminService, AnalyticsData } from '../services/adminService';

const DashboardLayout: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await adminService.getAnalytics('6-months');
        setAnalyticsData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
        console.error('Dashboard data fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Container size="7xl">
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <Typography variant="heading-medium" className="text-red-600 mb-2">
            Error Loading Dashboard
          </Typography>
          <Typography variant="body-medium" className="text-muted-foreground mb-4">
            {error}
          </Typography>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
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
          <Typography variant="heading-medium" className="text-muted-foreground">
            No data available
          </Typography>
        </div>
      </Container>
    );
  }

  const getSystemHealthStatus = () => {
    const { serverUptime, apiResponseTime, databaseHealth } = analyticsData.systemPerformance;
    const avgHealth = (serverUptime + (100 - apiResponseTime / 10) + databaseHealth) / 3;
    
    if (avgHealth >= 90) return { status: 'healthy', color: 'success' as const };
    if (avgHealth >= 70) return { status: 'warning', color: 'warning' as const };
    return { status: 'critical', color: 'error' as const };
  };

  const systemHealth = getSystemHealthStatus();

  return (
    <Container size="7xl">
      {/* Welcome Section */}
      <div className="mb-8">
        <Typography variant="heading-large" className="text-foreground mb-2">
          Welcome back, Admin
        </Typography>
        <Typography variant="body-medium" className="text-muted-foreground">
          Here's what's happening with your TaskFlow system today
        </Typography>
      </div>

      {/* Key Metrics Grid */}
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
            <Typography variant="body-small" className="text-muted-foreground mt-1">
              {analyticsData.activeUsers.daily} active today
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
              {analyticsData.completionRate}% completion rate
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className={`h-4 w-4 ${
                systemHealth.color === 'success' ? 'text-green-500' : 
                systemHealth.color === 'warning' ? 'text-yellow-500' : 'text-red-500'
              }`} />
              <Typography variant="heading-large" className="text-foreground">
                {Math.round(analyticsData.systemPerformance.serverUptime)}%
              </Typography>
            </div>
            <Typography variant="body-small" className="text-muted-foreground mt-1">
              Server uptime
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              API Response
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <ClockIcon className="h-4 w-4 text-muted-foreground" />
              <Typography variant="heading-large" className="text-foreground">
                {analyticsData.systemPerformance.apiResponseTime}ms
              </Typography>
            </div>
            <Typography variant="body-small" className="text-muted-foreground mt-1">
              Average response time
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* System Status and Alerts */}
      <Grid cols={2} className="mb-8 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ChartBarIcon className="h-5 w-5" />
              <span>System Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Overall Health</span>
              <Badge variant={systemHealth.color}>{systemHealth.status}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Database Health</span>
              <div className="flex items-center space-x-2">
                <Progress value={analyticsData.systemPerformance.databaseHealth} className="w-20" />
                <span className="text-sm font-medium">{analyticsData.systemPerformance.databaseHealth}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Server Uptime</span>
              <span className="text-sm font-medium">{analyticsData.systemPerformance.serverUptime}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="h-5 w-5" />
              <span>Task Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pending Tasks</span>
              <Badge variant="warning">{analyticsData.taskCompletionData.pending}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">In Progress</span>
              <Badge variant="secondary">{analyticsData.taskCompletionData.inProgress}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Completed</span>
              <Badge variant="success">{analyticsData.taskCompletionData.completed}</Badge>
            </div>
          </CardContent>
        </Card>
      </Grid>

      {/* Top Teams */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Top Performing Teams</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.topTeams.map((team) => (
              <div key={team.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <Typography variant="body-medium" className="font-medium">
                    {team.name}
                  </Typography>
                  <Typography variant="body-small" className="text-muted-foreground">
                    {team.members} members • {team.projects} projects
                  </Typography>
                </div>
                <div className="text-right">
                  <Typography variant="body-medium" className="font-medium">
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

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = '/admin/system-health'}
            >
              View System Health
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = '/admin/analytics'}
            >
              View Analytics
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = '/admin/users'}
            >
              Manage Users
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = '/admin/templates'}
            >
              Manage Templates
            </Button>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
};

export default DashboardLayout;
