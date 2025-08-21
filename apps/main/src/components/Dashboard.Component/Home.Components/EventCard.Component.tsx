import React from "react";
import { Card } from "@taskflow/ui";
import type { EventCardProps } from "../../../types/dashboard";

export const EventCard: React.FC<EventCardProps> = ({ month, day, title, meta }) => {
  return (
    <Card className="bg-card border-border rounded-lg p-4 flex items-center gap-4">
      <div className="w-16 h-16 rounded-lg bg-muted border border-border flex flex-col items-center justify-center">
        <span className="text-xs text-muted-foreground">{month}</span>
        <span className="text-2xl font-semibold text-foreground">{day}</span>
      </div>
      <div>
        <p className="font-medium text-foreground">{title}</p>
        <p className="text-muted-foreground text-sm">{meta}</p>
      </div>
    </Card>
  );
};

export default EventCard;
