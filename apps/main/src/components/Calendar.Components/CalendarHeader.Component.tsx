import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button, Typography } from "@taskflow/ui";

interface CalendarHeaderProps {
  title: string;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({ title }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <Typography variant="h1" as="h1">{title}</Typography>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="accent">Today</Button>
        <Button size="sm" variant="secondary" className="p-0 w-8 h-8">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="secondary" className="p-0 w-8 h-8">
          <ChevronRight className="w-4 h-4" />
        </Button>
        <select className="bg-neutral-900 px-3 py-1 rounded-lg text-sm">
          <option>Month</option>
          <option>Week</option>
          <option>Day</option>
        </select>
      </div>
    </div>
  );
};

export default CalendarHeader;


