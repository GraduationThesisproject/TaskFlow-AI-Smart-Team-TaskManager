import React from "react";
import { DashboardShell } from "./DashboardShell";
import AccountSettings from "../../components/dashboard/settings/AccountSettings"; 
import NotificationSettings from "../../components/dashboard/settings/NotificationSettings"; 
import AppearanceSettings from "../../components/dashboard/settings/AppearanceSettings"; 
import AccountSummary from "../../components/dashboard/settings/AccountSummary"; 
import SubscriptionCard from "../../components/dashboard/settings/SubscriptionCard"; 
import DangerZone from "../../components/dashboard/settings/DangerZone"; 
import { useLocation } from "react-router-dom";

const Settings: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;
  const section: 'profile' | 'theme' | 'notifications' | 'upgrade' =
    path.endsWith('/theme') ? 'theme'
    : path.endsWith('/notifications') ? 'notifications'
    : path.endsWith('/upgrade') ? 'upgrade'
    : 'profile';

  return (
    <DashboardShell title="Settings">
      {section === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left (main content) */}
          <div className="lg:col-span-8 space-y-6">
            <AccountSettings />
          </div>

          {/* Right (sidebar) */}
          <div className="lg:col-span-4 space-y-6">
            <AccountSummary />
            <DangerZone />
          </div>
        </div>
      )}

      {section === 'theme' && (
        <div className="space-y-6">
          <AppearanceSettings />
        </div>
      )}

      {section === 'notifications' && (
        <div className="space-y-6">
          <NotificationSettings />
        </div>
      )}

      {section === 'upgrade' && (
        <div className="space-y-6">
          <SubscriptionCard />
        </div>
      )}
    </DashboardShell>
  );
};

export default Settings;
