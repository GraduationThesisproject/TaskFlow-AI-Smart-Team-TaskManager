import React, { useMemo } from "react";
import { DashboardShell } from "./DashboardShell";
import { useTasks, useWorkspaces, useCreateWorkspaceModal } from "../../hooks";
import { useAppSelector } from "../../store";

import { WelcomeHeader } from "../../components/dashboard/home/WelcomeHeader";
import { StatsCards } from "../../components/dashboard/home/StatsCards";
import { WorkspacesSection } from "../../components/dashboard/home/WorkspacesSection"
import { RecentActivity } from "../../components/dashboard/home/RecentActivity";
import { UpcomingDeadlines } from "../../components/dashboard/home/UpcomingDeadlines";
import { CreateWorkspaceModal } from "../../components/workspace/CreateWorkspaceModal";

const HomeLayout: React.FC = () => {
  const { user } = useAppSelector(state => state.auth);

  const { tasks, loading: tasksLoading, error: tasksError } = useTasks();
  const { workspaces, loading: workspaceLoading, error: workspaceError } = useWorkspaces();
  const { isOpen, openModal, closeModal, handleCreateWorkspace } = useCreateWorkspaceModal();

  const displayName = user?.user?.name || "User";
  const isLoading = tasksLoading || workspaceLoading;
  const hasError = tasksError || workspaceError;

  const taskStats = useMemo(() => {
    const total = tasks?.length || 0;
    const completed = tasks?.filter(t => t.status === "done")?.length || 0;
    const inProgress = tasks?.filter(t => t.status === "in_progress")?.length || 0;
    const overdue = tasks?.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done")?.length || 0;
    const highPriority = tasks?.filter(t => t.priority === "high" || t.priority === "critical")?.length || 0;
    return {
      total,
      completed,
      inProgress,
      overdue,
      highPriority,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }, [tasks]);

  const upcomingDeadlines = useMemo(() => {
    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return tasks
      ?.filter(t => t.dueDate != null)
      .map(t => ({ ...t, dueDate: new Date(t.dueDate!) }))
      .filter(t => t.dueDate >= now && t.dueDate <= in7Days)
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
      .slice(0, 5) || [];
  }, [tasks]);

  const recentActivity: any[] = [];

  if (isLoading) return <DashboardShell title="Dashboard">Loading...</DashboardShell>;
  if (hasError) return <DashboardShell title="Dashboard">Error loading dashboard</DashboardShell>;

  return (
    <DashboardShell title="Dashboard">
      <WelcomeHeader displayName={displayName} />
      <StatsCards taskStats={taskStats} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <WorkspacesSection workspaces={workspaces} openCreateModal={openModal} />
          <RecentActivity recentActivity={recentActivity} />
        </div>

        <div className="lg:col-span-4 space-y-6">
          <UpcomingDeadlines upcomingDeadlines={upcomingDeadlines} />
        </div>
      </div>

      <CreateWorkspaceModal
        isOpen={isOpen}
        onClose={closeModal}
        onSubmit={handleCreateWorkspace}
      />
    </DashboardShell>
  );
};

export default HomeLayout;
