import { Button, Card, CardHeader, CardTitle, CardContent } from '@taskflow/ui';
import { applyTheme } from '@taskflow/theme';
import { formatDate } from '@taskflow/utils';
import './App.css';

function App() {
  // Apply light theme on mount
  React.useEffect(() => {
    applyTheme('light');
  }, []);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            TaskFlow Admin Panel
          </h1>
          <p className="text-muted-foreground">
            Manage your team and projects efficiently
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Overview of your team's activities
              </p>
              <Button>View Dashboard</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Team Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Manage team members and permissions
              </p>
              <Button variant="outline">Manage Team</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Project Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Configure project settings and workflows
              </p>
              <Button variant="secondary">Settings</Button>
            </CardContent>
          </Card>
        </div>

        <footer className="text-center text-sm text-muted-foreground">
          Last updated: {formatDate(new Date())}
        </footer>
      </div>
    </div>
  );
}

export default App;
