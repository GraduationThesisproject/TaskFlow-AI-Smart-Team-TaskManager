import React from 'react';
import SettingsCard from './SettingsCard';

interface SettingsSection {
  key: string;
  title: string;
  description?: string;
  bullets?: string[];
  cta: string;
  learnMore?: boolean;
}

interface SettingsListProps {
  sections: SettingsSection[];
  loading: boolean;
  settings?: any;
  onClickByKey: Record<string, () => void>;
}

const SettingsList: React.FC<SettingsListProps> = ({ 
  sections, 
  loading, 
  settings, 
  onClickByKey, 
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
