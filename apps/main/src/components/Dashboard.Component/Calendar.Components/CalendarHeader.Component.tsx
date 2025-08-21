import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button, Typography } from "@taskflow/ui";

interface CalendarHeaderProps {
  title: string;
  onPrevious?: () => void;
  onNext?: () => void;
  onToday?: () => void;
  view?: string;
  onViewChange?: (view: string) => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  title,
  onPrevious,
  onNext,
  onToday,
  view = 'month',
  onViewChange,
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <Typography variant="h1" as="h1" className="text-foreground">
        {title}
      </Typography>
      <div className="flex items-center gap-2">
        <Button 
          size="sm" 
          variant="accent" 
          onClick={onToday}
          className="relative overflow-hidden group"
        >
          <span className="relative z-10">Today</span>
          <span className="absolute inset-0 bg-accent/20 group-hover:bg-accent/30 transition-colors"></span>
          <span className="absolute inset-0 bg-gradient-to-r from-accent/40 via-accent/20 to-accent/40 opacity-0 group-hover:opacity-100 transition-opacity"></span>
          <span className="absolute inset-0 rounded-md border border-accent/30 group-hover:border-accent/50 transition-colors"></span>
          <span className="absolute -inset-1 bg-accent/20 rounded-md blur-sm group-hover:blur-md transition-all duration-300"></span>
        </Button>
        <Button 
          size="sm" 
          variant="secondary" 
          className="p-0 w-8 h-8"
          onClick={onPrevious}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button 
          size="sm" 
          variant="secondary" 
          className="p-0 w-8 h-8"
          onClick={onNext}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
        <select 
          className="bg-background border border-input rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          value={view}
          onChange={(e) => onViewChange?.(e.target.value)}
        >
          <option value="month">Month</option>
          <option value="week">Week</option>
          <option value="day">Day</option>
        </select>
      </div>
    </div>
  );
};

export default CalendarHeader;
