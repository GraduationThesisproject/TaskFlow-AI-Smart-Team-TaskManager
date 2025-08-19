import React from 'react';
import { Button, Card, CardHeader, CardTitle, CardContent, Typography, Badge, Progress } from '@taskflow/ui';
import { formatDate } from '@taskflow/utils';
import { ThemeProvider, ThemeToggle } from '@taskflow/theme/ThemeProvider';
import './App.css';

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <header>
            <div className="flex justify-between items-center mb-8">
              <Typography variant="heading-xl">
                TaskFlow Admin Panel
              </Typography>
              <ThemeToggle />
            </div>
            <Typography variant="body-large" textColor="muted">
              Manage your team and projects efficiently
            </Typography>
          </header>

          {/* Admin Dashboard Overview */}
          <div className="space-y-4">
            <Typography variant="heading-large">Dashboard Overview</Typography>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card variant="default" padding="default">
                <CardContent className="text-center">
                  <Typography variant="heading-large" className="text-primary">1,234</Typography>
                  <Typography variant="body-medium" textColor="muted">Total Users</Typography>
                </CardContent>
              </Card>
              
              <Card variant="default" padding="default">
                <CardContent className="text-center">
                  <Typography variant="heading-large" className="text-success">89</Typography>
                  <Typography variant="body-medium" textColor="muted">Active Projects</Typography>
                </CardContent>
              </Card>
              
              <Card variant="default" padding="default">
                <CardContent className="text-center">
                  <Typography variant="heading-large" className="text-warning">23</Typography>
                  <Typography variant="body-medium" textColor="muted">Pending Tasks</Typography>
                </CardContent>
              </Card>
              
              <Card variant="default" padding="default">
                <CardContent className="text-center">
                  <Typography variant="heading-large" className="text-error">5</Typography>
                  <Typography variant="body-medium" textColor="muted">System Alerts</Typography>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-2">
              <Typography variant="body-medium">System Performance</Typography>
              <Progress value={85} variant="default" showValue />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card variant="default" padding="default">
              <CardHeader>
                <CardTitle>Dashboard</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Typography variant="body-medium" textColor="muted">
                  Overview of your team's activities
                </Typography>
                <Button variant="default" size="default" className="w-full">View Dashboard</Button>
              </CardContent>
            </Card>

            <Card variant="default" padding="default">
              <CardHeader>
                <CardTitle>Team Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Typography variant="body-medium" textColor="muted">
                  Manage team members and permissions
                </Typography>
                <div className="flex gap-2">
                  <Badge variant="success">Admin</Badge>
                  <Badge variant="default">User</Badge>
                  <Badge variant="warning">Guest</Badge>
                </div>
                <Button variant="outline" size="default" className="w-full">Manage Team</Button>
              </CardContent>
            </Card>

            <Card variant="default" padding="default">
              <CardHeader>
                <CardTitle>Project Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Typography variant="body-medium" textColor="muted">
                  Configure project settings and workflows
                </Typography>
                <Button variant="secondary" size="default" className="w-full">Settings</Button>
              </CardContent>
            </Card>

            <Card variant="default" padding="default">
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Typography variant="body-medium" textColor="muted">
                  View detailed analytics and reports
                </Typography>
                <div className="space-y-2">
                  <Progress value={75} variant="success" />
                  <Progress value={45} variant="warning" />
                </div>
                <Button variant="gradient" size="default" className="w-full">View Analytics</Button>
              </CardContent>
            </Card>

            <Card variant="default" padding="default">
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Typography variant="body-medium" textColor="muted">
                  Add, edit, and manage user accounts
                </Typography>
                <div className="flex gap-2">
                  <Button variant="default" size="sm">Add User</Button>
                  <Button variant="outline" size="sm">Import</Button>
                </div>
              </CardContent>
            </Card>

            <Card variant="default" padding="default">
              <CardHeader>
                <CardTitle>System Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Typography variant="body-medium" textColor="muted">
                  Monitor system performance and health
                </Typography>
                <div className="flex gap-2">
                  <Badge variant="success">Online</Badge>
                  <Badge variant="error">2 Issues</Badge>
                </div>
                <Button variant="outline" size="default" className="w-full">View Logs</Button>
              </CardContent>
            </Card>
          </div>

          <footer className="text-center text-sm text-muted-foreground">
            TaskFlow Admin Panel • Last updated: {formatDate(new Date())}
          </footer>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
