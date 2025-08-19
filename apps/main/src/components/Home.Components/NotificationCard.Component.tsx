import React from "react";
import { Card } from "@taskflow/ui";

interface NotificationCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  accentClassName?: string;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  title,
  description,
  icon,
  actions,
  accentClassName,
}) => {
  return (
    <Card className="bg-neutral-900 border-neutral-800 rounded-lg p-4 flex items-start gap-3">
      {icon && (
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center bg-neutral-800 ${accentClassName || ""}`}>
          {icon}
        </div>
      )}
      <div className="flex-1">
        <p className="font-medium">{title}</p>
        <p className="text-gray-500 text-sm">{description}</p>
        {actions && <div className="mt-3">{actions}</div>}
      </div>
    </Card>
  );
};

export default NotificationCard;


