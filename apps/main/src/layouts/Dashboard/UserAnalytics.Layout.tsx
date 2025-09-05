import React from 'react';
import { useTasks } from '../../hooks/useTasks';
import { useWorkspaces } from '../../hooks/useWorkspaces';
import { Card, CardContent, CardHeader, CardTitle, Typography } from '@taskflow/ui';
import { BarChart3, Users, CheckCircle, Clock, TrendingUp, Loader2 } from 'lucide-react';

const UserAnalytics: React.FC = () => {
  const { items: tasks, loading: tasksLoading, error: tasksError } = useTasks();
  const { workspaces, loading: workspacesLoading, error: workspacesError } = useWorkspaces();

  const isLoading = tasksLoading || workspacesLoading;
  const hasError = tasksError || workspacesError;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Typography variant="h1" className="text-3xl font-bold mb-2">
            Analytics Dashboard
          </Typography>
          <Typography variant="body" className="text-muted-foreground">
            Track your productivity and workspace performance
          </Typography>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <Typography variant="body">Loading analytics data...</Typography>
          </div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="space-y-6">
        <div>
          <Typography variant="h1" className="text-3xl font-bold mb-2">
            Analytics Dashboard
          </Typography>
          <Typography variant="body" className="text-muted-foreground">
            Track your productivity and workspace performance
          </Typography>
        </div>
        
        <div className="text-center py-8">
          <div className="text-red-500 mb-4">
            Error loading analytics data
          </div>
          <div className="text-sm text-muted-foreground">
            {tasksError && <p>Tasks error: {tasksError}</p>}
            {workspacesError && <p>Workspaces error: {workspacesError}</p>}
          </div>
        </div>
      </div>
    );
  }

  const totalTasks = tasks?.length || 0;
  const completedTasks = tasks?.filter(task => task.status === 'completed').length || 0;
  const totalWorkspaces = workspaces?.length || 0;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const stats = [
    {
      title: 'Total Tasks',
      value: totalTasks,
      icon: <BarChart3 className="h-4 w-4" />,
      description: 'All tasks across workspaces'
    },
    {
      title: 'Completed Tasks',
      value: completedTasks,
      icon: <CheckCircle className="h-4 w-4" />,
      description: 'Successfully completed tasks'
    },
    {
      title: 'Total Workspaces',
      value: totalWorkspaces,
      icon: <Users className="h-4 w-4" />,
      description: 'Active workspaces'
    },
    {
      title: 'Completion Rate',
      value: `${completionRate}%`,
      icon: <TrendingUp className="h-4 w-4" />,
      description: 'Task completion percentage'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <Typography variant="h1" className="text-3xl font-bold mb-2">
          Analytics Dashboard
        </Typography>
        <Typography variant="body" className="text-muted-foreground">
          Track your productivity and workspace performance
        </Typography>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className="text-muted-foreground">
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <Typography variant="body-small" className="text-muted-foreground">
                {stat.description}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <Typography variant="body">Activity tracking coming soon...</Typography>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserAnalytics;
