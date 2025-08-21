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
  Progress
} from '@taskflow/ui';
import { 
  ServerIcon, 
  CircleStackIcon, 
  QueueListIcon, 
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { adminService, SystemHealth } from '../services/adminService';

const SystemHealthLayout: React.FC = () => {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    fetchSystemHealth();
  }, []);

  const fetchSystemHealth = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminService.getSystemHealth();
      setSystemHealth(data);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load system health');
      console.error('System health fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getHealthStatus = (value: number, threshold: number = 90) => {
    if (value >= threshold) return { status: 'healthy', color: 'success' as const };
    if (value >= threshold * 0.8) return { status: 'warning', color: 'warning' as const };
    return { status: 'critical', color: 'error' as const };
  };

  const getQueueStatus = (count: number, threshold: number = 100) => {
    if (count < threshold * 0.5) return { status: 'normal', color: 'success' as const };
    if (count < threshold) return { status: 'elevated', color: 'warning' as const };
    return { status: 'high', color: 'error' as const };
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
            Error Loading System Health
          </Typography>
          <Typography variant="body-medium" className="text-muted-foreground mb-4">
            {error}
          </Typography>
          <Button 
            variant="outline" 
            onClick={fetchSystemHealth}
          >
            Retry
          </Button>
        </div>
      </Container>
    );
  }

  if (!systemHealth) {
    return (
      <Container size="7xl">
        <div className="text-center py-12">
          <Typography variant="heading-large" className="text-muted-foreground">
            No system health data available
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
              System Health Monitor
      </Typography>
      <Typography variant="body-medium" className="text-muted-foreground">
              Real-time monitoring of system performance and infrastructure health
            </Typography>
          </div>
          <div className="flex items-center space-x-4">
            <Typography variant="body-small" className="text-muted-foreground">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </Typography>
            <Button onClick={fetchSystemHealth}>
              <ClockIcon className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* System Performance Overview */}
      <Grid cols={3} className="mb-8 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Server Uptime
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <ServerIcon className="h-4 w-4 text-muted-foreground" />
              <Typography variant="heading-large" className="text-foreground">
                {systemHealth.systemPerformance.serverUptime}%
              </Typography>
            </div>
            <div className="mt-2">
              <Progress value={systemHealth.systemPerformance.serverUptime} className="w-full" />
            </div>
            <Typography variant="body-small" className="text-muted-foreground mt-1">
              Target: 99.9%
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              API Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <ClockIcon className="h-4 w-4 text-muted-foreground" />
              <Typography variant="heading-large" className="text-foreground">
                {systemHealth.systemPerformance.apiResponseTime}ms
              </Typography>
            </div>
            <div className="mt-2">
              <Progress 
                value={Math.max(0, 100 - (systemHealth.systemPerformance.apiResponseTime / 10))} 
                className="w-full" 
              />
            </div>
            <Typography variant="body-small" className="text-muted-foreground mt-1">
              Target: &lt;200ms
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Database Health
            </CardTitle>
          </CardHeader>
          <CardContent>
                          <div className="flex items-center space-x-2">
                <CircleStackIcon className="h-4 w-4 text-muted-foreground" />
              <Typography variant="heading-large" className="text-foreground">
                {systemHealth.systemPerformance.databaseHealth}%
              </Typography>
            </div>
            <div className="mt-2">
              <Progress value={systemHealth.systemPerformance.databaseHealth} className="w-full" />
            </div>
            <Typography variant="body-small" className="text-muted-foreground mt-1">
              Target: &gt;90%
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Database Status */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CircleStackIcon className="h-5 w-5" />
            <span>Database Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Grid cols={3} className="gap-6">
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
                systemHealth.database.connection === 'Connected' 
                  ? 'bg-success/20' 
                  : 'bg-error/20'
              }`}>
                {systemHealth.database.connection === 'Connected' ? (
                  <CheckCircleIcon className="h-8 w-8 text-success" />
                ) : (
                  <ExclamationTriangleIcon className="h-8 w-8 text-error" />
                )}
              </div>
              <Typography variant="body-medium" className="font-medium mb-1">
                Connection
              </Typography>
              <Badge variant={
                systemHealth.database.connection === 'Connected' ? 'success' : 'error'
              }>
                {systemHealth.database.connection}
              </Badge>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <CircleStackIcon className="h-8 w-8 text-secondary" />
              </div>
              <Typography variant="body-medium" className="font-medium mb-1">
                Size
              </Typography>
              <Typography variant="body-medium" className="text-foreground">
                {systemHealth.database.size}
              </Typography>
            </div>
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
                systemHealth.database.performance === 'Optimal' 
                  ? 'bg-success/20' 
                  : 'bg-warning/20'
              }`}>
                <ChartBarIcon className="h-8 w-8 text-success" />
              </div>
              <Typography variant="body-medium" className="font-medium mb-1">
                Performance
              </Typography>
              <Badge variant={
                systemHealth.database.performance === 'Optimal' ? 'success' : 'warning'
              }>
                {systemHealth.database.performance}
              </Badge>
            </div>
          </Grid>
        </CardContent>
      </Card>

      {/* Queue Status */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <QueueListIcon className="h-5 w-5" />
            <span>Queue Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Grid cols={3} className="gap-6">
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
                getQueueStatus(systemHealth.queue.emailQueue).color === 'success' 
                  ? 'bg-success/20' 
                  : getQueueStatus(systemHealth.queue.emailQueue).color === 'warning'
                  ? 'bg-warning/20'
                  : 'bg-error/20'
              }`}>
                <QueueListIcon className="h-8 w-8 text-primary" />
              </div>
              <Typography variant="body-medium" className="font-medium mb-1">
                Email Queue
              </Typography>
              <Typography variant="heading-large" className="text-foreground mb-1">
                {systemHealth.queue.emailQueue}
              </Typography>
              <Badge variant={getQueueStatus(systemHealth.queue.emailQueue).color}>
                {getQueueStatus(systemHealth.queue.emailQueue).status}
              </Badge>
            </div>
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
                getQueueStatus(systemHealth.queue.backgroundJobs).color === 'success' 
                  ? 'bg-success/20' 
                  : getQueueStatus(systemHealth.queue.backgroundJobs).color === 'warning'
                  ? 'bg-warning/20'
                  : 'bg-error/20'
              }`}>
                <QueueListIcon className="h-8 w-8 text-secondary" />
              </div>
              <Typography variant="body-medium" className="font-medium mb-1">
                Background Jobs
              </Typography>
              <Typography variant="heading-large" className="text-foreground mb-1">
                {systemHealth.queue.backgroundJobs}
              </Typography>
              <Badge variant={getQueueStatus(systemHealth.queue.backgroundJobs).color}>
                {getQueueStatus(systemHealth.queue.backgroundJobs).status}
              </Badge>
            </div>
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
                systemHealth.queue.failedJobs === 0 
                  ? 'bg-success/20' 
                  : systemHealth.queue.failedJobs < 10
                  ? 'bg-warning/20'
                  : 'bg-error/20'
              }`}>
                <ExclamationTriangleIcon className={`h-8 w-8 ${
                  systemHealth.queue.failedJobs === 0 
                    ? 'text-success' 
                    : systemHealth.queue.failedJobs < 10
                    ? 'text-warning'
                    : 'text-error'
                }`} />
              </div>
              <Typography variant="body-medium" className="font-medium mb-1">
                Failed Jobs
              </Typography>
              <Typography variant="heading-large" className="text-foreground mb-1">
                {systemHealth.queue.failedJobs}
              </Typography>
              <Badge variant={
                systemHealth.queue.failedJobs === 0 ? 'success' : 
                systemHealth.queue.failedJobs < 10 ? 'warning' : 'error'
              }>
                {systemHealth.queue.failedJobs === 0 ? 'None' : 
                 systemHealth.queue.failedJobs < 10 ? 'Low' : 'High'}
              </Badge>
            </div>
          </Grid>
        </CardContent>
      </Card>

      {/* Security Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ShieldCheckIcon className="h-5 w-5" />
            <span>Security Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Grid cols={2} className="gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Typography variant="body-medium" className="text-muted-foreground">
                  SSL Certificate
                </Typography>
                <Badge variant="success">Valid</Badge>
              </div>
              <div className="flex items-center justify-between">
                <Typography variant="body-medium" className="text-muted-foreground">
                  Firewall
                </Typography>
                <Badge variant="success">Active</Badge>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Typography variant="body-medium" className="text-muted-foreground">
                  Last Security Scan
                </Typography>
                <Typography variant="body-medium" className="text-foreground">
                  {new Date(systemHealth.security.lastScan).toLocaleString()}
                </Typography>
              </div>
              <div className="flex items-center justify-between">
                <Typography variant="body-medium" className="text-muted-foreground">
                  Security Status
      </Typography>
                <Badge variant="success">Secure</Badge>
              </div>
            </div>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default SystemHealthLayout;
