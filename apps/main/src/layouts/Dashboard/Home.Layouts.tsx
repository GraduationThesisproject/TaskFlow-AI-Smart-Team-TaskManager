import React, { useMemo, useEffect } from "react";
import { Plus, Users, Calendar, Clock, AlertTriangle } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Button, 
  Typography,
  Badge,
  Avatar,
  AvatarImage,
  AvatarFallback,
  EmptyState
} from "@taskflow/ui";
import { DashboardShell } from "./DashboardShell";
import { useTasks, useWorkspaces, usePermissions, useCreateWorkspaceModal } from "../../hooks";
import { useAppSelector } from "../../store";
import { PermissionGuard } from "../../components";
import { CreateWorkspaceModal } from "../../components/workspace/CreateWorkspaceModal";

const Home: React.FC = () => {
  const { user } = useAppSelector(state => state.auth);
  const { tasks, loading: tasksLoading, error: tasksError } = useTasks();
  const { workspaces, currentWorkspace, loading: workspaceLoading, error: workspaceError } = useWorkspaces();
  const { permissions } = usePermissions();
  const { 
    isOpen: isCreateModalOpen, 
    openModal: openCreateModal, 
    closeModal: closeCreateModal, 
    handleCreateWorkspace 
  } = useCreateWorkspaceModal();

  // Load initial data
  useEffect(() => {
    // Tasks will be loaded by the useTasks hook
    // Workspaces will be loaded by the useWorkspaces hook
  }, []);

  const displayName = user?.user?.name || 'User';

  // Compute derived data
  const taskStats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'done').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date()).length;
    const highPriority = tasks.filter(t => t.priority === 'high' || t.priority === 'critical').length;

    return {
      total,
      completed,
      inProgress,
      overdue,
      highPriority,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [tasks]);

  const upcomingDeadlines = useMemo(() => {
    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return tasks
      .filter(t => t.dueDate)
      .map(t => ({
        ...t,
        dueDate: new Date(t.dueDate as string)
      }))
      .filter(t => {
        const dueDate = t.dueDate;
        return dueDate >= now && dueDate <= in7Days;
      })
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
      .slice(0, 5);
  }, [tasks]);

  const recentActivity = useMemo(() => {
    // This would come from a real activity feed API
    // For now, we'll show a placeholder
    return [] as Array<{
      user: {
        name: string;
        avatar?: string;
      };
      action: string;
      timestamp: string;
    }>;
  }, []);

  const isLoading = tasksLoading || workspaceLoading;
  const hasError = tasksError || workspaceError;

  if (isLoading) {
    return (
      <DashboardShell title="Dashboard">
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (hasError) {
    return (
      <DashboardShell title="Dashboard">
        <EmptyState
          icon={<AlertTriangle className="h-12 w-12" />}
          title="Something went wrong"
          description="We couldn't load your dashboard data. Please try refreshing the page."
          action={{
            label: "Refresh Page",
            onClick: () => window.location.reload(),
            variant: "default"
          }}
        />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title="Dashboard">
      {/* Welcome Header */}
      <div className="mb-8">
        <Typography variant="h1" className="text-3xl font-bold text-foreground">
          Welcome back, {displayName}!
        </Typography>
        <Typography variant="body-medium" className="text-muted-foreground mt-2">
          Here's what's happening with your projects today.
        </Typography>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Typography variant="h2" className="text-2xl font-bold">
              {taskStats.total}
            </Typography>
            <Typography variant="caption" className="text-muted-foreground">
              {taskStats.completionRate}% completed
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Typography variant="h2" className="text-2xl font-bold">
              {taskStats.inProgress}
            </Typography>
            <Typography variant="caption" className="text-muted-foreground">
              Currently working on
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Typography variant="h2" className="text-2xl font-bold">
              {taskStats.highPriority}
            </Typography>
            <Typography variant="caption" className="text-muted-foreground">
              Requires attention
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Typography variant="h2" className="text-2xl font-bold">
              {taskStats.overdue}
            </Typography>
            <Typography variant="caption" className="text-muted-foreground">
              Past due date
            </Typography>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Section */}
        <div className="lg:col-span-8 space-y-6">
          {/* Workspaces */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Your Workspaces</CardTitle>
                <PermissionGuard requiredRole="member">
                  <Button variant="default" size="sm" onClick={openCreateModal}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Workspace
                  </Button>
                </PermissionGuard>
              </div>
            </CardHeader>
            <CardContent>
              {workspaces.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {workspaces.slice(0, 4).map((workspace) => (
                    <div
                      key={workspace.id}
                      className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Typography variant="body-medium" className="font-medium">
                          {workspace.name}
                        </Typography>
                        <Badge variant="secondary">
                          {workspace.members?.length || 0} members
                        </Badge>
                      </div>
                      <Typography variant="caption" className="text-muted-foreground">
                        {workspace.description || 'No description'}
                      </Typography>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<Users className="h-8 w-8" />}
                  title="No workspaces yet"
                  description="Create your first workspace to get started with team collaboration."
                  action={{
                    label: "Create Workspace",
                    onClick: () => {/* TODO: Open create workspace modal */},
                    variant: "default"
                  }}
                />
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Avatar size="sm">
                        <AvatarImage src={activity.user?.avatar} />
                        <AvatarFallback variant="primary" size="sm">
                          {activity.user?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Typography variant="body-small">
                          <span className="font-medium">{activity.user?.name}</span>
                          {' '}{activity.action}
                        </Typography>
                        <Typography variant="caption" className="text-muted-foreground">
                          {activity.timestamp}
                        </Typography>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<Clock className="h-8 w-8" />}
                  title="No recent activity"
                  description="Activity will appear here as you and your team work on tasks."
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Section */}
        <div className="lg:col-span-4 space-y-6">
          {/* Upcoming Deadlines */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Deadlines</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingDeadlines.length > 0 ? (
                <div className="space-y-3">
                  {upcomingDeadlines.map((task) => (
                    <div key={task._id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div className="flex-1">
                        <Typography variant="body-small" className="font-medium">
                          {task.title}
                        </Typography>
                        <Typography variant="caption" className="text-muted-foreground">
                          Due {new Date(task.dueDate).toLocaleDateString()}
                        </Typography>
                      </div>
                      <Badge 
                        variant={task.priority === 'high' || task.priority === 'critical' ? 'destructive' : 'secondary'}
                      >
                        {task.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<Calendar className="h-8 w-8" />}
                  title="No upcoming deadlines"
                  description="You're all caught up! No tasks are due in the next 7 days."
                />
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="h-4 w-4 mr-2" />
                Create New Task
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Invite Team Member
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Meeting
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Workspace Modal */}
      <CreateWorkspaceModal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        onSubmit={handleCreateWorkspace}
      />
    </DashboardShell>
  );
};

export default Home;
