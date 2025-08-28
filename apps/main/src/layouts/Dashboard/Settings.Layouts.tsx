import React from "react";
import { DashboardShell } from "./DashboardShell";
import { 
  AccountSettings,
  NotificationSettings, 
  AppearanceSettings, 
  AccountSummary, 
  SubscriptionCard,
  DangerZone 
} from "../../components/dashboard/settings";

const Settings: React.FC = () => {
  return (
    <DashboardShell title="Settings">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (main content) */}
        <div className="lg:col-span-8 space-y-6">
          <AccountSettings />
          <NotificationSettings />
          <AppearanceSettings />
        </div>

        {/* Right (sidebar, same level as Home’s UpcomingDeadlines) */}
        <div className="lg:col-span-4 space-y-6">
          <AccountSummary />
          <SubscriptionCard />
          <DangerZone />
        </div>
      </div>
    </DashboardShell>
  );
};

export default Settings;
