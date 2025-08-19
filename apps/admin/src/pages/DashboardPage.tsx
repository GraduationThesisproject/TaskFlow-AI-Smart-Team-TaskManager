import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  Typography, 
  Badge, 
  Progress, 
  Button 
} from '@taskflow/ui';
import { 
  UsersIcon, 
  FolderIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'success' | 'warning' | 'error';
  description?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  variant = 'default',
  description 
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'success':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'error':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      default:
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <Typography variant="body-medium" className="text-muted-foreground mb-1">
              {title}
            </Typography>
            <Typography variant="heading-large" className="text-foreground mb-2">
              {value}
            </Typography>
            {change !== undefined && (
              <div className="flex items-center space-x-1">
                {change >= 0 ? (
                  <ArrowUpIcon className="w-4 h-4 text-green-500" />
                ) : (
                  <ArrowDownIcon className="w-4 h-4 text-red-500" />
                )}
                <Typography 
                  variant="body-small" 
                  className={change >= 0 ? 'text-green-500' : 'text-red-500'}
                >
                  {Math.abs(change)}%
                </Typography>
                <Typography variant="body-small" className="text-muted-foreground">
                  from last month
                </Typography>
              </div>
            )}
            {description && (
              <Typography variant="body-small" className="text-muted-foreground mt-2">
                {description}
              </Typography>
            )}
          </div>
          <div className={`p-3 rounded-lg ${getVariantClasses()}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: 'Add New User',
      description: 'Create a new user account',
      action: () => navigate('/users'),
      variant: 'default' as const
    },
    {
      title: 'Create Template',
      description: 'Set up a new project template',
      action: () => navigate('/templates'),
      variant: 'secondary' as const
    },
    {
      title: 'View Analytics',
      description: 'Check system performance metrics',
      action: () => navigate('/analytics'),
      variant: 'outline' as const
    },
    {
      title: 'System Health',
      description: 'Monitor system status',
      action: () => navigate('/system-health'),
      variant: 'outline' as const
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <Typography variant="heading-xl" className="text-foreground mb-2">
          Dashboard Overview
        </Typography>
        <Typography variant="body-large" className="text-muted-foreground">
          Welcome back! Here's what's happening with your system today.
        </Typography>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Users"
          value="12,847"
          change={2.1}
          icon={UsersIcon}
          variant="default"
          description="Active registered users"
        />
        <MetricCard
          title="Active Projects"
          value="1,293"
          change={12.5}
          icon={FolderIcon}
          variant="success"
          description="Projects in progress"
        />
        <MetricCard
          title="Task Completion"
          value="87.3%"
          change={3.1}
          icon={CheckCircleIcon}
          variant="success"
          description="Overall completion rate"
        />
        <MetricCard
          title="System Alerts"
          value="5"
          change={-2}
          icon={ExclamationTriangleIcon}
          variant="warning"
          description="Active system warnings"
        />
      </div>

      {/* System Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Typography variant="body-medium">Server Uptime</Typography>
                <Typography variant="body-medium" className="text-success">99.97%</Typography>
              </div>
              <Progress value={99.97} variant="success" />
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Typography variant="body-medium">API Response Time</Typography>
                <Typography variant="body-medium">142ms</Typography>
              </div>
              <Progress value={85} variant="default" />
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Typography variant="body-medium">Database Health</Typography>
                <Typography variant="body-medium" className="text-success">Excellent</Typography>
              </div>
              <Progress value={95} variant="success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {[
                { text: 'New user registration: john.doe@company.com', time: '2 minutes ago', type: 'success' },
                { text: 'Project "Website Redesign" completed', time: '15 minutes ago', type: 'success' },
                { text: 'System backup completed successfully', time: '1 hour ago', type: 'default' },
                { text: 'API rate limit warning', time: '2 hours ago', type: 'warning' }
              ].map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'success' ? 'bg-green-500' :
                    activity.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1">
                    <Typography variant="body-medium" className="text-foreground">
                      {activity.text}
                    </Typography>
                    <Typography variant="body-small" className="text-muted-foreground">
                      {activity.time}
                    </Typography>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <Typography variant="heading-large" className="text-foreground mb-4">
          Quick Actions
        </Typography>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <Typography variant="heading-small" className="text-foreground mb-2">
                  {action.title}
                </Typography>
                <Typography variant="body-small" className="text-muted-foreground mb-4">
                  {action.description}
                </Typography>
                <Button 
                  variant={action.variant} 
                  size="sm" 
                  onClick={action.action}
                  className="w-full"
                >
                  {action.title}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Database Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Typography variant="body-medium">Connection</Typography>
              <Badge variant="success">Connected</Badge>
            </div>
            <div className="flex items-center justify-between mt-2">
              <Typography variant="body-medium">Size</Typography>
              <Typography variant="body-medium">2.4 GB</Typography>
            </div>
            <div className="flex items-center justify-between mt-2">
              <Typography variant="body-medium">Performance</Typography>
              <Badge variant="success">Optimal</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Queue Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Typography variant="body-medium">Email Queue</Typography>
                <Badge variant="default">45%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <Typography variant="body-medium">Background Jobs</Typography>
                <Badge variant="success">90%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <Typography variant="body-medium">Failed Jobs</Typography>
                <Badge variant="error">12%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Typography variant="body-medium">SSL Certificate</Typography>
                <Badge variant="success">Valid</Badge>
              </div>
              <div className="flex justify-between items-center">
                <Typography variant="body-medium">Firewall</Typography>
                <Badge variant="success">Active</Badge>
              </div>
              <div className="flex justify-between items-center">
                <Typography variant="body-medium">Last Scan</Typography>
                <Typography variant="body-medium">2 hours ago</Typography>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
