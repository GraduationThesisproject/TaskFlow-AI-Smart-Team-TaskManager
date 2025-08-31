import React from 'react';
import SettingsCard from './SettingsCard';
import UpgradeBanner from './UpgradeBanner';
import type { SettingsSection, SettingsListProps } from '../../../types/interfaces/ui';

const SettingsList: React.FC<SettingsListProps> = ({ 
  sections, 
  loading, 
  settings, 
  onClickByKey, 
  onUpgrade 
}) => {
  return (
    <div className="space-y-4">
      {/* First two settings sections */}
      {sections.slice(0, 2).map((section) => (
        <SettingsCard
          key={section.key}
          section={section}
          loading={loading}
          settings={settings}
          onClick={onClickByKey[section.key]}
        />
      ))}

      {/* Upgrade banner */}
      <UpgradeBanner
        title="Upgrade to Premium for more settings"
        description="Unlock advanced workspace management features"
        buttonText="Upgrade"
        onUpgrade={onUpgrade}
      />

      {/* Remaining settings sections */}
      {sections.slice(2).map((section) => (
        <SettingsCard
          key={section.key}
          section={section}
          loading={loading}
          settings={settings}
          onClick={onClickByKey[section.key]}
        />
      ))}
    </div>
  );
};

export default SettingsList;
