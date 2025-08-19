import React from "react";
import { Card } from "@taskflow/ui";

interface ActivityItemProps {
  avatarUrl: string;
  actorName: string;
  action: string;
  highlight: string;
  meta: string;
}

export const ActivityItem: React.FC<ActivityItemProps> = ({
  avatarUrl,
  actorName,
  action,
  highlight,
  meta,
}) => {
  return (
    <Card className="bg-neutral-900 border-neutral-800 rounded-lg px-4 py-3">
      <div className="flex items-center gap-3">
        <img src={avatarUrl} alt="" className="w-9 h-9 rounded-full" />
        <div>
          <p>
            <span className="font-medium">{actorName}</span> {action} <span className="text-emerald-400">{`"${highlight}"`}</span>
          </p>
          <p className="text-gray-500 text-sm">{meta}</p>
        </div>
      </div>
    </Card>
  );
};

export default ActivityItem;


