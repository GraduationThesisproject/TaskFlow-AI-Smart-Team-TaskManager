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

  // Debug logging
  console.log('Settings Layout - pathname:', pathname);
  console.log('Settings Layout - location:', location);

  const renderContent = () => {
    // Handle route paths instead of just hash
    if (pathname.includes('/settings/profile')) {
      console.log('Rendering AccountSettings');
      return <AccountSettings />;
    }
    if (pathname.includes('/settings/theme')) {
      console.log('Rendering AppearanceSettings');
      return <AppearanceSettings />;
    }
    if (pathname.includes('/settings/notifications')) {
      console.log('Rendering NotificationSettings');
      return <NotificationSettings />;
    }
    if (pathname.includes('/settings/upgrade')) {
      console.log('Rendering SubscriptionCard');
      return <SubscriptionCard />;
    }
    if (pathname.includes('/settings/activity')) {
      console.log('Rendering ActivityPage');
      return <ActivityPage />;
    }
    
    // Default case - show account summary and subscription
    console.log('Rendering default content (AccountSummary + SubscriptionCard)');
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
