import React, { useMemo } from "react";
import { Briefcase, Code } from "lucide-react";
import { Button } from "@taskflow/ui";
import { WorkspaceCard } from "../../components/Dashboard.Component/Home.Components/WorkspaceCard.Component";
import { ActivityItem } from "../../components/Dashboard.Component/Home.Components/ActivityItem.Component";
import { NotificationCard } from "../../components/Dashboard.Component/Home.Components/NotificationCard.Component";
import { EventCard } from "../../components/Dashboard.Component/Home.Components/EventCard.Component";
import { UpgradeCard } from "../../components/Dashboard.Component/Home.Components/UpgradeCard.Component";
import { useTasks } from "../../hooks";
import { useAppSelector } from "../../store";
import { PermissionGuard, ProtectedLink } from "../../components";
import { ROUTES } from "../../config/routes";
// Removed dummy data import - will use real user data from Redux

const Home: React.FC = () => {
  const { highPriorityTasks, overdueTasks } = useTasks();

  const nextTwoDeadlines = useMemo(() => {
    const upcoming = [...highPriorityTasks, ...overdueTasks]
      .filter(t => t.dueDate)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    return upcoming.slice(0, 2).map(t => ({
      month: new Date(t.dueDate).toLocaleString(undefined, { month: 'short' }).toUpperCase(),
      day: new Date(t.dueDate).getDate(),
      title: t.title,
      meta: `${t.category || 'Task'} • ${t.priority}`,
    }));
  }, [highPriorityTasks, overdueTasks]);

  const { user } = useAppSelector(state => state.auth);
  const displayName = user?.firstName || 'User';

  return (
    <div className="min-h-screen bg-background text-foreground px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <h1 className="text-3xl font-bold text-foreground">Welcome back, {displayName}!</h1>
      <p className="text-muted-foreground mt-1">Here's what's happening with your projects today.</p>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
        {/* Left Section */}
        <div className="lg:col-span-8">
          {/* Workspaces */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-foreground">Your Workspaces</h2>
              <PermissionGuard requiredRole="admin">
                <Button variant="default">+ New</Button>
              </PermissionGuard>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <WorkspaceCard
                icon={<Briefcase className="w-5 h-5 text-primary-foreground" />}
                iconBgClass="bg-primary"
                name="Marketing Team"
                description="Q1 Campaign Planning & Social Media Strategy"
                membersCount={12}
                avatarUrls={[
                  "https://i.pravatar.cc/32?img=1",
                  "https://i.pravatar.cc/32?img=2",
                  "https://i.pravatar.cc/32?img=3",
                ]}
                statusText="Last active 2h ago"
              />

              <WorkspaceCard
                icon={<Code className="w-5 h-5 text-primary-foreground" />}
                iconBgClass="bg-emerald-600"
                name="Product Development"
                description="Mobile App v2.0 Development & Testing"
                membersCount={8}
                avatarUrls={["https://i.pravatar.cc/32?img=4", "https://i.pravatar.cc/32?img=5"]}
                statusText="Active now"
              />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">Recent Activity</h2>
            <div className="space-y-3">
              <ActivityItem
                avatarUrl="https://i.pravatar.cc/40?img=6"
                actorName="John Smith"
                action="moved"
                highlight="Design Review"
                meta="Marketing Team • 2 hours ago"
              />
              <ActivityItem
                avatarUrl="https://i.pravatar.cc/40?img=7"
                actorName="Emma Davis"
                action="assigned you to"
                highlight="API Integration"
                meta="Product Development • 4 hours ago"
              />
              <ActivityItem
                avatarUrl="https://i.pravatar.cc/40?img=8"
                actorName="Mike Johnson"
                action="commented on"
                highlight="User Testing Results"
                meta="Marketing Team • 6 hours ago"
              />
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="lg:col-span-4 space-y-6">
          {/* Notifications */}
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">Notifications</h2>
            <div className="space-y-3">
              <NotificationCard
                title="Team Invitation"
                description={'Join "Design System" workspace'}
                actions={
                  <div className="flex gap-2">
                    <Button variant="default">Accept</Button>
                    <Button variant="secondary">Decline</Button>
                  </div>
                }
              />
              <NotificationCard
                title="Due Date Reminder"
                description={'"Q1 Report" due tomorrow'}
                accentClassName=""
              />
            </div>
          </div>

          {/* Events */}
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">Upcoming Events</h2>
            <div className="space-y-3">
              {nextTwoDeadlines.map((e, idx) => (
                <EventCard key={idx} month={e.month} day={e.day} title={e.title} meta={e.meta} />
              ))}
            </div>
          </div>

          {/* Upgrade */}
          <UpgradeCard
            title="Upgrade to Premium"
            description="Unlock timeline view, calendar integration, and advanced reporting"
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
