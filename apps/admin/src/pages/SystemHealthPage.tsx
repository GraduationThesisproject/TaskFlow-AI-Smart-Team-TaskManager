import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  Typography, 
  Badge, 
  Button, 
  Input, 
  Switch,
  Progress
} from '@taskflow/ui';
import { 
  ServerIcon, 
  DatabaseIcon, 
  QueueIcon,
  BellIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface SystemMetric {
  name: string;
  value: string;
  status: 'healthy' | 'warning' | 'error';
  description: string;
}

interface Alert {
  id: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
  isResolved: boolean;
}

const mockSystemMetrics: SystemMetric[] = [
  {
    name: 'Server Uptime',
    value: '99.97%',
    status: 'healthy',
    description: 'Last 30 days'
  },
  {
    name: 'API Response Time',
    value: '142ms',
    status: 'healthy',
    description: 'Average response'
  },
  {
    name: 'Database Connection',
    value: 'Connected',
    status: 'healthy',
    description: 'Active connections: 45'
  },
  {
    name: 'Memory Usage',
    value: '78%',
    status: 'warning',
    description: '7.8GB / 10GB'
  }
];

const mockAlerts: Alert[] = [
  {
    id: '1',
    message: 'Database timeout - connection pool exhausted',
    severity: 'high',
    timestamp: '12:04 PM',
    isResolved: false
  },
  {
    id: '2',
    message: 'API rate limit exceeded - 1000 requests/min',
    severity: 'medium',
    timestamp: '12:15 AM',
    isResolved: false
  },
  {
    id: '3',
    message: 'Memory usage high - 85% threshold reached',
    severity: 'low',
    timestamp: '09:22 AM',
    isResolved: true
  }
];

const SystemHealthPage: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [notificationSettings, setNotificationSettings] = useState({
    outageAlerts: true,
    emailNotifications: true,
    smsNotifications: false,
    emailAddress: 'admin@company.com',
    phoneNumber: '+1 (555) 123-4567'
  });

  const handleResolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, isResolved: true }
        : alert
    ));
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'success' as const;
      case 'warning':
        return 'warning' as const;
      case 'error':
        return 'error' as const;
      default:
        return 'default' as const;
    }
  };

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'default' as const;
      case 'medium':
        return 'warning' as const;
      case 'high':
        return 'error' as const;
      default:
        return 'default' as const;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <Typography variant="heading-xl" className="text-foreground mb-2">
          System Health Monitoring
        </Typography>
        <Typography variant="body-large" className="text-muted-foreground">
          Monitor server performance, API responses, and system alerts
        </Typography>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockSystemMetrics.map((metric) => (
          <Card key={metric.name}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="body-medium" className="text-muted-foreground mb-1">
                    {metric.name}
                  </Typography>
                  <Typography variant="heading-large" className="text-foreground mb-2">
                    {metric.value}
                  </Typography>
                  <Typography variant="body-small" className="text-muted-foreground">
                    {metric.description}
                  </Typography>
                </div>
                <div className={`p-3 rounded-lg ${
                  metric.status === 'healthy' ? 'bg-green-100 dark:bg-green-900/20' :
                  metric.status === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                  'bg-red-100 dark:bg-red-900/20'
                }`}>
                  {metric.status === 'healthy' ? (
                    <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                  ) : metric.status === 'warning' ? (
                    <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  ) : (
                    <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                  )}
                </div>
              </div>
              {metric.name === 'Memory Usage' && (
                <Progress 
                  value={parseInt(metric.value)} 
                  variant={metric.status === 'healthy' ? 'success' : 'warning'}
                  className="mt-4"
                />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alert Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Alert Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Typography variant="heading-small" className="text-foreground">
                Outage Alerts
              </Typography>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Typography variant="body-medium">Enable outage notifications</Typography>
                  <Switch
                    checked={notificationSettings.outageAlerts}
                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, outageAlerts: e.target.checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Typography variant="body-medium">Email notifications</Typography>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Typography variant="body-medium">SMS notifications</Typography>
                  <Switch
                    checked={notificationSettings.smsNotifications}
                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, smsNotifications: e.target.checked }))}
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <Typography variant="heading-small" className="text-foreground">
                Notification Settings
              </Typography>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email Address
                  </label>
                  <Input
                    value={notificationSettings.emailAddress}
                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, emailAddress: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Phone Number
                  </label>
                  <Input
                    value={notificationSettings.phoneNumber}
                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  />
                </div>
                <Button variant="default" size="sm">
                  Save Settings
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Database & Queue Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Database Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Database Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Typography variant="body-medium">Users</Typography>
                  <Typography variant="body-medium">2.1 GB</Typography>
                </div>
                <Progress value={35} variant="default" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Typography variant="body-medium">Projects</Typography>
                  <Typography variant="body-medium">1.8 GB</Typography>
                </div>
                <Progress value={30} variant="default" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Typography variant="body-medium">Tasks</Typography>
                  <Typography variant="body-medium">1.2 GB</Typography>
                </div>
                <Progress value={20} variant="default" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Typography variant="body-medium">Files</Typography>
                  <Typography variant="body-medium">4.5 GB</Typography>
                </div>
                <Progress value={75} variant="warning" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Typography variant="body-medium">Logs</Typography>
                  <Typography variant="body-medium">0.8 GB</Typography>
                </div>
                <Progress value={13} variant="default" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Queue Status */}
        <Card>
          <CardHeader>
            <CardTitle>Queue Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Typography variant="body-medium">Redis Queue</Typography>
                  <Typography variant="body-medium">75%</Typography>
                </div>
                <Progress value={75} variant="success" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Typography variant="body-medium">Email Queue</Typography>
                  <Typography variant="body-medium">45%</Typography>
                </div>
                <Progress value={45} variant="default" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Typography variant="body-medium">Background Jobs</Typography>
                  <Typography variant="body-medium">90%</Typography>
                </div>
                <Progress value={90} variant="warning" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Typography variant="body-medium">Failed Jobs</Typography>
                  <Typography variant="body-medium">12%</Typography>
                </div>
                <Progress value={12} variant="error" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className={`flex items-center justify-between p-4 rounded-lg border ${
                alert.isResolved ? 'bg-muted/50 border-muted' : 'border-border'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    alert.severity === 'high' ? 'bg-red-100 dark:bg-red-900/20' :
                    alert.severity === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                    'bg-blue-100 dark:bg-blue-900/20'
                  }`}>
                    <BellIcon className={`w-4 h-4 ${
                      alert.severity === 'high' ? 'text-red-600 dark:text-red-400' :
                      alert.severity === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-blue-600 dark:text-blue-400'
                    }`} />
                  </div>
                  <div>
                    <Typography variant="body-medium" className="text-foreground">
                      {alert.message}
                    </Typography>
                    <Typography variant="body-small" className="text-muted-foreground">
                      {alert.timestamp}
                    </Typography>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant={getSeverityBadgeVariant(alert.severity)}>
                    {alert.severity.toUpperCase()}
                  </Badge>
                  {!alert.isResolved && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResolveAlert(alert.id)}
                    >
                      Resolve
                    </Button>
                  )}
                  {alert.isResolved && (
                    <Badge variant="success">Resolved</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Response Time Trend */}
        <Card>
          <CardHeader>
            <CardTitle>API Response Time Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-end justify-between space-x-2">
              {[120, 135, 142, 138, 145, 150, 142].map((time, index) => (
                <div key={index} className="flex flex-col items-center space-y-2">
                  <div 
                    className="w-6 bg-blue-500 rounded-t"
                    style={{ height: `${(time / 150) * 150}px` }}
                  />
                  <Typography variant="body-small" className="text-muted-foreground">
                    {time}ms
                  </Typography>
                </div>
              ))}
            </div>
            <div className="text-center mt-4">
              <Typography variant="body-small" className="text-muted-foreground">
                Last 7 days - Average: 142ms
              </Typography>
            </div>
          </CardContent>
        </Card>

        {/* Error Rate */}
        <Card>
          <CardHeader>
            <CardTitle>Error Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center">
              <div className="text-center">
                <Typography variant="heading-large" className="text-foreground mb-2">
                  0.8%
                </Typography>
                <Typography variant="body-medium" className="text-muted-foreground">
                  Error Rate (Last 24h)
                </Typography>
                <div className="mt-4">
                  <Progress value={0.8} variant="success" className="w-32" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SystemHealthPage;
