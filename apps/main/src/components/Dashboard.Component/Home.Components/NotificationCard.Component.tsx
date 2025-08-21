import React from "react";
import { Card } from "@taskflow/ui";
import type { NotificationCardProps } from "../../../types/dashboard";


export const NotificationCard: React.FC<NotificationCardProps> = ({
  title,
  description,
  time,
  icon,
  actions,
  accentClassName,
}) => {
  return (
    <Card className="bg-card border-border rounded-lg p-4 flex items-start gap-3">
      {icon && (
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center bg-muted ${accentClassName || ""}`}>
          {icon}
        </div>
      )}
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <p className="font-medium text-foreground">{title}</p>
          {time && <span className="text-xs text-muted-foreground">{time}</span>}
        </div>
        <p className="text-muted-foreground text-sm mt-1">{description}</p>
        {actions && <div className="mt-3">{actions}</div>}
      </div>
    </Card>
  );
};

export default NotificationCard;
