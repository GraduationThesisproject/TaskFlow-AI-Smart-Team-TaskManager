import React from "react";
import { useTasks, useWorkspaces, useCreateWorkspaceModal } from "../../hooks";
import { DashboardShell } from "./DashboardShell";
import { WorkspacesSection } from "../../components/dashboard/home/WorkspacesSection";
import { RecentActivity } from "../../components/dashboard/home/RecentActivity";
import { QuickActions } from "../../components/dashboard/home/QuickActions";
import { StatsCards } from "../../components/dashboard/home/StatsCards";

const HomeLayout = () => {
  const { tasks } = useTasks();
  const { workspaces } = useWorkspaces();

  return (
    <DashboardShell title="Dashboard">
      <div className="space-y-6">
        <StatsCards taskStats={{ total: tasks.length, completed: 0, inProgress: 0, overdue: 0, highPriority: 0, completionRate: 0 }} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WorkspacesSection />
          <RecentActivity recentActivity={[]} />
        </div>
        
        <QuickActions />
      </div>
    </DashboardShell>
  );
};

export default HomeLayout;
