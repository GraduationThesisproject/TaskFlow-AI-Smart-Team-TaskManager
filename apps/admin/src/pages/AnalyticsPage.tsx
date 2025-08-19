import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  Typography, 
  Badge, 
  Button, 
  Select,
  Avatar,
  Progress
} from '@taskflow/ui';
import { 
  UsersIcon, 
  FolderIcon, 
  CheckCircleIcon, 
  TrendingUpIcon,
  CalendarIcon,
  ClockIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

interface Team {
  id: string;
  name: string;
  members: number;
  projects: number;
  activityScore: number;
  avatar?: string;
}

const mockTeams: Team[] = [
  {
    id: '1',
    name: 'Design Team Alpha',
    members: 12,
    projects: 8,
    activityScore: 96.5
  },
  {
    id: '2',
    name: 'Development Squad',
    members: 15,
    projects: 12,
    activityScore: 96.2
  },
  {
    id: '3',
    name: 'Marketing Force',
    members: 9,
    projects: 6,
    activityScore: 94.8
  },
  {
    id: '4',
    name: 'QA Engineers',
    members: 8,
    projects: 10,
    activityScore: 93.1
  },
  {
    id: '5',
    name: 'Product Managers',
    members: 6,
    projects: 15,
    activityScore: 91.7
  }
];

const AnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState('6-months');

  // Mock data for charts
  const projectData = [
    { month: 'Jan', projects: 45 },
    { month: 'Feb', projects: 50 },
    { month: 'Mar', projects: 35 },
    { month: 'Apr', projects: 70 },
    { month: 'May', projects: 55 },
    { month: 'Jun', projects: 65 },
    { month: 'Jul', projects: 70 }
  ];

  const userGrowthData = [
    { month: 'Jan', signups: 280 },
    { month: 'Feb', signups: 320 },
    { month: 'Mar', signups: 380 },
    { month: 'Apr', signups: 420 },
    { month: 'May', signups: 480 },
    { month: 'Jun', signups: 550 }
  ];

  const taskCompletionData = {
    pending: 8,
    inProgress: 15,
    completed: 77
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <Typography variant="heading-xl" className="text-foreground mb-2">
            Global Statistics & Insights
          </Typography>
          <Typography variant="body-large" className="text-muted-foreground">
            Comprehensive overview of system usage, user activity, and performance metrics
          </Typography>
        </div>
        <Select
          value={timeRange}
          onChange={(value) => setTimeRange(value)}
          options={[
            { value: '7-days', label: 'Last 7 days' },
            { value: '30-days', label: 'Last 30 days' },
            { value: '3-months', label: 'Last 3 months' },
            { value: '6-months', label: 'Last 6 months' },
            { value: '1-year', label: 'Last year' }
          ]}
        />
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="body-medium" className="text-muted-foreground mb-1">
                  Total Users
                </Typography>
                <Typography variant="heading-large" className="text-foreground mb-2">
                  12,847
                </Typography>
                <div className="flex items-center space-x-1">
                  <TrendingUpIcon className="w-4 h-4 text-green-500" />
                  <Typography variant="body-small" className="text-green-500">
                    +2.1%
                  </Typography>
                  <Typography variant="body-small" className="text-muted-foreground">
                    from last month
                  </Typography>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <UsersIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="body-medium" className="text-muted-foreground mb-1">
                  Active Users
                </Typography>
                <Typography variant="heading-large" className="text-foreground mb-2">
                  Daily: 3,421
                </Typography>
                <Typography variant="body-medium" className="text-muted-foreground">
                  Weekly: 8,932
                </Typography>
              </div>
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
                <UsersIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="body-medium" className="text-muted-foreground mb-1">
                  Active Projects
                </Typography>
                <Typography variant="heading-large" className="text-foreground mb-2">
                  1,293
                </Typography>
                <div className="flex items-center space-x-1">
                  <TrendingUpIcon className="w-4 h-4 text-green-500" />
                  <Typography variant="body-small" className="text-green-500">
                    +12.5%
                  </Typography>
                  <Typography variant="body-small" className="text-muted-foreground">
                    from last month
                  </Typography>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                <FolderIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="body-medium" className="text-muted-foreground mb-1">
                  Completion Rate
                </Typography>
                <Typography variant="heading-large" className="text-foreground mb-2">
                  87.3%
                </Typography>
                <div className="flex items-center space-x-1">
                  <TrendingUpIcon className="w-4 h-4 text-green-500" />
                  <Typography variant="body-small" className="text-green-500">
                    +3.1%
                  </Typography>
                  <Typography variant="body-small" className="text-muted-foreground">
                    from last month
                  </Typography>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                <CheckCircleIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects Created Chart */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Projects Created</CardTitle>
              <Select
                value={timeRange}
                onChange={(value) => setTimeRange(value)}
                options={[
                  { value: '6-months', label: 'Last 6 months' },
                  { value: '1-year', label: 'Last year' }
                ]}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between space-x-2">
              {projectData.map((data, index) => (
                <div key={index} className="flex flex-col items-center space-y-2">
                  <div 
                    className="w-8 bg-blue-500 rounded-t"
                    style={{ height: `${(data.projects / 70) * 200}px` }}
                  />
                  <Typography variant="body-small" className="text-muted-foreground">
                    {data.month}
                  </Typography>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <Typography variant="body-small" className="text-muted-foreground">
                  Projects Created
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task Completion Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Task Completion by Organization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <div className="relative w-48 h-48">
                {/* Simplified pie chart representation */}
                <div className="absolute inset-0 rounded-full border-8 border-blue-200 dark:border-blue-800" />
                <div 
                  className="absolute inset-0 rounded-full border-8 border-transparent"
                  style={{
                    borderTopColor: '#1e40af',
                    borderRightColor: '#1e40af',
                    transform: 'rotate(277deg)'
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Typography variant="heading-large" className="text-foreground">
                      77%
                    </Typography>
                    <Typography variant="body-small" className="text-muted-foreground">
                      Completed
                    </Typography>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center space-x-6 mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <Typography variant="body-small" className="text-muted-foreground">
                  Completed
                </Typography>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-300 rounded-full" />
                <Typography variant="body-small" className="text-muted-foreground">
                  In Progress
                </Typography>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-300 rounded-full" />
                <Typography variant="body-small" className="text-muted-foreground">
                  Pending
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Heatmap Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
              <ClockIcon className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <Typography variant="body-medium" className="text-muted-foreground">
                Activity heatmap visualization coming soon
              </Typography>
              <Typography variant="body-small" className="text-muted-foreground">
                Shows system-wide productivity patterns and peak usage times
              </Typography>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Growth Tracking */}
      <Card>
        <CardHeader>
          <CardTitle>User Growth Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between space-x-2">
            {userGrowthData.map((data, index) => (
              <div key={index} className="flex flex-col items-center space-y-2">
                <div 
                  className="w-8 bg-teal-500 rounded-t"
                  style={{ height: `${(data.signups / 550) * 200}px` }}
                />
                <Typography variant="body-small" className="text-muted-foreground">
                  {data.month}
                </Typography>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center mt-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-teal-500 rounded-full" />
              <Typography variant="body-small" className="text-muted-foreground">
                Monthly Signups
              </Typography>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Active Teams */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Active Teams</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-medium text-muted-foreground">Rank</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Team</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Members</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Projects</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Activity Score</th>
                </tr>
              </thead>
              <tbody>
                {mockTeams.map((team, index) => (
                  <tr key={team.id} className="border-b border-border hover:bg-muted/50">
                    <td className="p-3">
                      <Typography variant="body-medium" className="text-foreground font-medium">
                        #{index + 1}
                      </Typography>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-3">
                        <Avatar size="sm" className="bg-primary text-primary-foreground">
                          <span className="text-sm font-medium">
                            {team.name.charAt(0)}
                          </span>
                        </Avatar>
                        <Typography variant="body-medium" className="text-foreground">
                          {team.name}
                        </Typography>
                      </div>
                    </td>
                    <td className="p-3">
                      <Typography variant="body-medium" className="text-foreground">
                        {team.members}
                      </Typography>
                    </td>
                    <td className="p-3">
                      <Typography variant="body-medium" className="text-foreground">
                        {team.projects}
                      </Typography>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <Typography 
                          variant="body-medium" 
                          className={team.activityScore >= 95 ? 'text-green-500' : 'text-foreground'}
                        >
                          {team.activityScore}
                        </Typography>
                        <Progress 
                          value={team.activityScore} 
                          variant={team.activityScore >= 95 ? 'success' : 'default'}
                          className="w-20"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Peak Usage Times</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Typography variant="body-medium">Morning (9-11 AM)</Typography>
                <Badge variant="success">High</Badge>
              </div>
              <div className="flex justify-between items-center">
                <Typography variant="body-medium">Afternoon (2-4 PM)</Typography>
                <Badge variant="warning">Medium</Badge>
              </div>
              <div className="flex justify-between items-center">
                <Typography variant="body-medium">Evening (6-8 PM)</Typography>
                <Badge variant="error">Low</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Geographic Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Typography variant="body-medium">North America</Typography>
                <Typography variant="body-medium">45%</Typography>
              </div>
              <div className="flex justify-between items-center">
                <Typography variant="body-medium">Europe</Typography>
                <Typography variant="body-medium">32%</Typography>
              </div>
              <div className="flex justify-between items-center">
                <Typography variant="body-medium">Asia Pacific</Typography>
                <Typography variant="body-medium">23%</Typography>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Device Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Typography variant="body-medium">Desktop</Typography>
                <Typography variant="body-medium">68%</Typography>
              </div>
              <div className="flex justify-between items-center">
                <Typography variant="body-medium">Mobile</Typography>
                <Typography variant="body-medium">24%</Typography>
              </div>
              <div className="flex justify-between items-center">
                <Typography variant="body-medium">Tablet</Typography>
                <Typography variant="body-medium">8%</Typography>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPage;
