import React from "react";
import { Card } from "@taskflow/ui";
import type { ActivityItemProps } from "apps/main/src/types/dashboard";



export const ActivityItem: React.FC<ActivityItemProps> = ({
  avatarUrl,
  actorName,
  action,
  highlight,
  meta,
}) => {
  return (
    <Card className="bg-card border-border rounded-lg px-4 py-3">
      <div className="flex items-center gap-3">
        <img src={avatarUrl} alt="" className="w-9 h-9 rounded-full border border-border" />
        <div>
          <p className="text-foreground">
            <span className="font-medium">{actorName}</span> {action} <span className="text-accent">{`"${highlight}"`}</span>
          </p>
          <p className="text-muted-foreground text-sm">{meta}</p>
        </div>
      </div>
    </Card>
  );
};

export default ActivityItem;
