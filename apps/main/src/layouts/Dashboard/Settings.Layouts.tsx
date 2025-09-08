import React from 'react';
import { useLocation } from 'react-router-dom';
import AccountSettings from '../../components/dashboard/settings/AccountSettings';
import NotificationSettings from '../../components/dashboard/settings/NotificationSettings';
import AppearanceSettings from '../../components/dashboard/settings/AppearanceSettings';
import AccountSummary from '../../components/dashboard/settings/AccountSummary';
import SubscriptionCard from '../../components/dashboard/settings/SubscriptionCard';
import DangerZone from '../../components/dashboard/settings/DangerZone';
import { ActivityPage } from '../../components/dashboard/settings/ActivityPage';

const Settings: React.FC = () => {
  const location = useLocation();
  const pathname = location.pathname;


  const renderContent = () => {
    // Handle route paths instead of just hash
    if (pathname.includes('/settings/profile')) {
      return <AccountSettings />;
    }
    if (pathname.includes('/settings/theme')) {
      return <AppearanceSettings />;
    }
    if (pathname.includes('/settings/notifications')) {
      return <NotificationSettings />;
    }
    if (pathname.includes('/settings/upgrade')) {
      return <SubscriptionCard />;
    }
    if (pathname.includes('/settings/activity')) {
      return <ActivityPage />;
    }
    
    // Default case - show account summary and subscription
    return (
      <div className="space-y-6">
        <AccountSummary />
        <SubscriptionCard />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderContent()}
    </div>
  );
};

export default Settings;
