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
  iconBgClass = "bg-blue-600",
  name,
  description,
  membersCount,
  avatarUrls = [],
  statusText,
}) => {
  return (
    <Card className="bg-neutral-900 border-neutral-800 rounded-xl p-5">
      <div className="flex items-center justify-between gap-3">
        <div className={`p-2 rounded-lg ${iconBgClass}`}>{icon}</div>
        <span className="text-sm text-emerald-400 bg-neutral-800 px-3 py-1 rounded-full">
          {membersCount} members
        </span>
      </div>
      <h3 className="mt-4 font-semibold text-lg">{name}</h3>
      <p className="text-gray-500 text-sm">{description}</p>
      <div className="flex items-center mt-3 space-x-2 overflow-hidden">
        {avatarUrls.map((src, idx) => (
          <img key={idx} src={src} alt="" className="w-7 h-7 rounded-full flex-shrink-0" />
        ))}
      </div>
      {statusText && <p className="text-gray-600 text-xs mt-2">{statusText}</p>}
    </Card>
  );
};

export default WorkspaceCard;


