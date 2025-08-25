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
      <div className="space-y-6">
        <AccountSettings />
        <NotificationSettings />
        <AppearanceSettings />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AccountSummary />
          <SubscriptionCard />
        </div>
        <DangerZone />
      </div>
    </DashboardShell>
  );
};

export default Settings;
