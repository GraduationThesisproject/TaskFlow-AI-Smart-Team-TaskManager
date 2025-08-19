import React, { useEffect, useState } from 'react';
// import { useAppDispatch } from '../store';
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

const DashboardLayout: React.FC = () => {
  // const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for now - replace with actual API calls
  const dashboardData = {
    totalUsers: 1247,
    activeUsers: 892,
    totalWorkspaces: 156,
    activeWorkspaces: 142,
    systemHealth: 'healthy',
    uptime: '99.9%',
    lastBackup: '2 hours ago',
    pendingUpdates: 3,
    criticalAlerts: 0,
    performanceScore: 94
  };

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

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
                {dashboardData.totalUsers.toLocaleString()}
              </Typography>
            </div>
            <Typography variant="body-small" className="text-muted-foreground mt-1">
              +12% from last month
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Workspaces
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <FolderIcon className="h-4 w-4 text-muted-foreground" />
              <Typography variant="heading-large" className="text-foreground">
                {dashboardData.activeWorkspaces}
              </Typography>
            </div>
            <Typography variant="body-small" className="text-muted-foreground mt-1">
              {Math.round((dashboardData.activeWorkspaces / dashboardData.totalWorkspaces) * 100)}% active
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
              <CheckCircleIcon className="h-4 w-4 text-green-500" />
              <Typography variant="heading-large" className="text-foreground">
                {dashboardData.performanceScore}%
              </Typography>
            </div>
            <Typography variant="body-small" className="text-muted-foreground mt-1">
              Performance score
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Uptime
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <ClockIcon className="h-4 w-4 text-muted-foreground" />
              <Typography variant="heading-large" className="text-foreground">
                {dashboardData.uptime}
              </Typography>
            </div>
            <Typography variant="body-small" className="text-muted-foreground mt-1">
              Last 30 days
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
              <Badge variant="success">{dashboardData.systemHealth}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Performance</span>
              <div className="flex items-center space-x-2">
                <Progress value={dashboardData.performanceScore} className="w-20" />
                <span className="text-sm font-medium">{dashboardData.performanceScore}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Last Backup</span>
              <span className="text-sm font-medium">{dashboardData.lastBackup}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="h-5 w-5" />
              <span>Alerts & Updates</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Critical Alerts</span>
                             <Badge variant={dashboardData.criticalAlerts > 0 ? "error" : "success"}>
                 {dashboardData.criticalAlerts}
               </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pending Updates</span>
              <Badge variant="warning">{dashboardData.pendingUpdates}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Security Status</span>
              <Badge variant="success">Secure</Badge>
            </div>
          </CardContent>
        </Card>
      </Grid>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Button variant="outline" size="sm">
              View System Logs
            </Button>
            <Button variant="outline" size="sm">
              Run Health Check
            </Button>
            <Button variant="outline" size="sm">
              Backup System
            </Button>
            <Button variant="outline" size="sm">
              Update System
            </Button>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
};

export default DashboardLayout;
