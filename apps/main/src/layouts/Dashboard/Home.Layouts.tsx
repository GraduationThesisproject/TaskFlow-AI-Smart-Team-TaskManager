import React from 'react';
import { useTasks } from '../../hooks/useTasks';
import { WelcomeHeader } from '../../components/dashboard/home/WelcomeHeader';
import { StatsCards } from '../../components/dashboard/home/StatsCards';
import { WorkspacesSection } from '../../components/dashboard/home/WorkspacesSection';
import { UpcomingDeadlines } from '../../components/dashboard/home/UpcomingDeadlines';

const Home: React.FC = () => {
  const { loading, error } = useTasks();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-destructive text-xl mb-2">Error Loading Dashboard</div>
          <p className="text-muted-foreground mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <WelcomeHeader title="Welcome to TaskFlow AI" />
      <StatsCards />
      <WorkspacesSection />
      <UpcomingDeadlines />
    </div>
  );
};

export default Home;
