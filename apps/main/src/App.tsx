import React from 'react';
import { Button, Card, CardHeader, CardTitle, CardContent, Input } from '@taskflow/ui';
import { applyTheme } from '@taskflow/theme';
import { formatDate, getRelativeTime } from '@taskflow/utils';
import './App.css';

function App() {
  const [tasks, setTasks] = React.useState([
    { id: 1, title: 'Setup project structure', completed: true, createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    { id: 2, title: 'Implement user authentication', completed: false, createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    { id: 3, title: 'Design dashboard UI', completed: false, createdAt: new Date(Date.now() - 30 * 60 * 1000) },
  ]);

  React.useEffect(() => {
    applyTheme('light');
  }, []);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="text-center">
          <h1 className="text-5xl font-bold text-foreground mb-4">
            TaskFlow AI
          </h1>
          <p className="text-xl text-muted-foreground">
            Smart Team Task Manager
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Tasks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
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
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full">Create New Task</Button>
                <Button variant="outline" className="w-full">View All Projects</Button>
                <Button variant="secondary" className="w-full">Team Dashboard</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Add New Task</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder="Enter task title..." />
                <Button className="w-full">Add Task</Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <footer className="text-center text-sm text-muted-foreground">
          Built with TaskFlow Monorepo • Last updated: {formatDate(new Date())}
        </footer>
      </div>
    </div>
  );
}

export default App;
