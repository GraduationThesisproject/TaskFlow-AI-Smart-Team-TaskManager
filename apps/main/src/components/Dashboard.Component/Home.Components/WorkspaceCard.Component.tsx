import React from "react";
import { Card } from "@taskflow/ui";

interface WorkspaceCardProps {
  icon: React.ReactNode;
  iconBgClass?: string;
  name: string;
  description: string;
  membersCount: number;
  avatarUrls?: string[];
  statusText?: string;
}

export const WorkspaceCard: React.FC<WorkspaceCardProps> = ({
  icon,
  iconBgClass = "bg-primary",
  name,
  description,
  membersCount,
  avatarUrls = [],
  statusText,
}) => {
  return (
    <Card className="bg-card border-border rounded-xl p-5 cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-primary/30 group">
      <div className="flex items-center justify-between gap-3">
        <div className={`p-2 rounded-lg ${iconBgClass} text-primary-foreground group-hover:scale-105 transition-transform`}>
          {icon}
        </div>
        <span className="text-sm text-accent bg-muted/50 px-3 py-1 rounded-full group-hover:bg-accent group-hover:text-white dark:group-hover:text-accent-foreground transition-colors">
          {membersCount} members
        </span>
      </div>
      <h3 className="mt-4 font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
        {name}
      </h3>
      <p className="text-muted-foreground text-sm group-hover:text-foreground/80 transition-colors">
        {description}
      </p>
      <div className="flex items-center mt-3 space-x-2 overflow-hidden">
        {avatarUrls.map((src, idx) => (
          <img 
            key={idx} 
            src={src} 
            alt="" 
            className="w-7 h-7 rounded-full flex-shrink-0 border border-border group-hover:border-primary/30 transition-colors" 
          />
        ))}
      </div>
      {statusText && (
        <p className="text-muted-foreground/80 text-xs mt-2 group-hover:text-foreground/80 transition-colors">
          {statusText}
        </p>
      )}
    </Card>
  );
};

export default WorkspaceCard;
