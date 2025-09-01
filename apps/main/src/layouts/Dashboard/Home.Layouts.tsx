import React from "react";
import { DashboardShell } from "./DashboardShell";
import { useTasks } from "../../hooks";

import { WelcomeHeader } from "../../components/dashboard/home/WelcomeHeader";
import { StatsCards } from "../../components/dashboard/home/StatsCards";
import { WorkspacesSection } from "../../components/dashboard/home/WorkspacesSection";
import { UpcomingDeadlines } from "../../components/dashboard/home/UpcomingDeadlines";

const HomeLayout: React.FC = () => {
  const { loading: tasksLoading, error: tasksError } = useTasks();
  const isLoading = tasksLoading;
  const hasError = tasksError;

  if (isLoading) return <DashboardShell title="Dashboard">Loading...</DashboardShell>;
  if (hasError) return <DashboardShell title="Dashboard">Error loading dashboard</DashboardShell>;

  return (
    <DashboardShell title="Dashboard">
      <WelcomeHeader title="Dashboard"/>
      <StatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <WorkspacesSection />
        </div>

        <div className="lg:col-span-4 space-y-6">
          <UpcomingDeadlines />
        </div>
      </div>
    </DashboardShell>
  );
};

export default HomeLayout;
