import React from 'react';
import { Card, CardTitle, CardDescription, Button } from '@taskflow/ui';
import GlobeIcon from './GlobeIcon';
import BuildingIcon from './BuildingIcon';
import LockIcon from './LockIcon';
import SlidersIcon from './SlidersIcon';

interface SettingsSection {
  key: string;
  title: string;
  description?: string;
  bullets?: string[];
  cta: string;
  learnMore?: boolean;
}

interface SettingsCardProps {
  section: SettingsSection;
  loading: boolean;
  settings?: any;
  onClick: () => void;
}

const SettingsCard: React.FC<SettingsCardProps> = ({ section, loading, settings, onClick }) => {
  const renderBulletIcon = (sectionKey: string, index: number) => {
    if (sectionKey === "creation" || sectionKey === "deletion") {
      if (index === 0) return <GlobeIcon size={16} className="text-[hsl(var(--accent))]" />;
      if (index === 1) return <BuildingIcon size={16} className="text-[hsl(var(--accent))]" />;
      return <LockIcon size={16} className="text-[hsl(var(--accent))]" />;
    }
    
    const colorClass = index === 0 
      ? "mt-1 inline-flex h-4 w-4 items-center justify-center rounded-sm bg-[hsl(var(--accent))]/20 text-[hsl(var(--accent))]"
      : index === 1
      ? "mt-1 inline-flex h-4 w-4 items-center justify-center rounded-sm bg-[hsl(var(--primary))]/20 text-[hsl(var(--primary))]"
      : "mt-1 inline-flex h-4 w-4 items-center justify-center rounded-sm bg-foreground/10";
    
    return <span className={colorClass} aria-hidden>●</span>;
  };

  const getDescription = () => {
    if (section.key === "visibility") {
      return settings?.permissions?.publicJoin
        ? "Public – Anyone with link can request to join this Workspace."
        : "Private – This Workspace is private. It's not indexed or visible to those outside the Workspace.";
    }
    if (section.key === "slack") {
      return settings?.notifications?.slackIntegration
        ? "Slack is linked. You can collaborate from Slack."
        : section.description;
    }
    return section.description;
  };

  return (
    <Card className="bg-[hsl(var(--neutral-100))] border border-[hsl(var(--neutral-200))] rounded-md">
      <div className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0">
          <CardTitle className="text-base mb-1">{section.title}</CardTitle>

          {Array.isArray(section.bullets) ? (
            <ul className="mt-1 space-y-1 text-[13px] text-foreground/80">
              {section.bullets.map((bullet: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-[2px] inline-flex h-4 w-4 items-center justify-center" aria-hidden>
                    {renderBulletIcon(section.key, i)}
                  </span>
                  <span className="flex-1 leading-relaxed">{bullet}</span>
                </li>
              ))}
            </ul>
          ) : (
            <CardDescription className="mt-1">
              {getDescription()}
              {section.learnMore && (
                <a href="#" className="ml-2 text-[13px] text-[hsl(var(--info))] hover:underline">
                  Learn more
                </a>
              )}
            </CardDescription>
          )}
        </div>

        <div className="shrink-0 pt-1">
          <Button size="sm" className="rounded-md px-4" disabled={loading} onClick={onClick}>
            {section.key === "slack" && (
              <span className="mr-2 inline-flex items-center">
                <SlidersIcon size={16} className="text-white" />
              </span>
            )}
            {loading ? "Saving..." : section.cta}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default SettingsCard;
