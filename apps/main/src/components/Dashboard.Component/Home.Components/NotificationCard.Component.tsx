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
    <Card className="bg-card border-border rounded-lg p-4 flex items-start gap-3">
      {icon && (
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center bg-muted ${accentClassName || ""}`}>
          {icon}
        </div>
      )}
      <div className="flex-1">
        <p className="font-medium text-foreground">{title}</p>
        <p className="text-muted-foreground text-sm">{description}</p>
        {actions && <div className="mt-3">{actions}</div>}
      </div>
    </Card>
  );
};

export default NotificationCard;
