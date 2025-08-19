import React from 'react';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Typography, Badge, Progress } from '@taskflow/ui';
import { formatDate, getRelativeTime } from '@taskflow/utils';
import { ThemeProvider, ThemeToggle } from '@taskflow/theme/ThemeProvider';
import './App.css';

function App() {
  const [tasks, setTasks] = React.useState([
    { id: 1, title: 'Setup project structure', completed: true, createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    { id: 2, title: 'Implement user authentication', completed: false, createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    { id: 3, title: 'Design dashboard UI', completed: false, createdAt: new Date(Date.now() - 30 * 60 * 1000) },
  ]);

  return (
    <ThemeProvider defaultTheme="dark">
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <header className="text-center">
            <div className="flex justify-between items-center mb-8">
              <Typography variant="heading-xl">
                TaskFlow AI
              </Typography>
              <ThemeToggle />
            </div>
            <Typography variant="body-large" textColor="muted">
              Smart Team Task Manager
            </Typography>
          </header>

          {/* Test Design System Components */}
          <div className="space-y-4">
            <Typography variant="heading-large">Design System Test</Typography>
            
            <div className="flex gap-4 flex-wrap">
              <Button variant="default" size="default">Default Button</Button>
              <Button variant="outline" size="default">Outline Button</Button>
              <Button variant="secondary" size="default">Secondary Button</Button>
              <Button variant="gradient" size="default">Gradient Button</Button>
            </div>

            <div className="flex gap-4 flex-wrap">
              <Badge variant="default">Default Badge</Badge>
              <Badge variant="success">Success Badge</Badge>
              <Badge variant="warning">Warning Badge</Badge>
              <Badge variant="error">Error Badge</Badge>
            </div>

            <div className="space-y-2">
              <Progress value={75} variant="default" showValue />
              <Progress value={100} variant="success" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card variant="default" padding="default">
                <CardHeader>
                  <CardTitle>Recent Tasks</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => {
                            setTasks(tasks.map(t => 
                              t.id === task.id ? { ...t, completed: !t.completed } : t
                            ));
                          }}
                          className="w-4 h-4"
                        />
                        <span className={task.completed ? 'line-through text-muted-foreground' : ''}>
                          {task.title}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {getRelativeTime(task.createdAt)}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card variant="default" padding="default">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="default" size="default" className="w-full">Create New Task</Button>
                  <Button variant="outline" size="default" className="w-full">View All Projects</Button>
                  <Button variant="secondary" size="default" className="w-full">Team Dashboard</Button>
                </CardContent>
              </Card>

              <Card variant="default" padding="default">
                <CardHeader>
                  <CardTitle>Add New Task</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input placeholder="Enter task title..." />
                  <Button variant="default" size="default" className="w-full">Add Task</Button>
                </CardContent>
              </Card>
            </div>
          </div>

          <footer className="text-center text-sm text-muted-foreground">
            Built with TaskFlow Monorepo • Last updated: {formatDate(new Date())}
          </footer>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
