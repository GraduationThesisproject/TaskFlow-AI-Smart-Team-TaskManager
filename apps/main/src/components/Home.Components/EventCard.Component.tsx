import React from "react";
import { Card } from "@taskflow/ui";

interface EventCardProps {
  month: string;
  day: number | string;
  title: string;
  meta: string;
}

export const EventCard: React.FC<EventCardProps> = ({ month, day, title, meta }) => {
  return (
    <Card className="bg-neutral-900 border-neutral-800 rounded-lg p-4 flex items-center gap-4">
      <div className="w-16 h-16 rounded-lg bg-neutral-950 border border-neutral-800 flex flex-col items-center justify-center">
        <span className="text-xs text-gray-400">{month}</span>
        <span className="text-2xl font-semibold">{day}</span>
      </div>
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-gray-500 text-sm">{meta}</p>
      </div>
    </Card>
  );
};

export default EventCard;


