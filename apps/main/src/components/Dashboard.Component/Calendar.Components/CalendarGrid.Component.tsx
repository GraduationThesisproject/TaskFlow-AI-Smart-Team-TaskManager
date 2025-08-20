import React from "react";
import { Card, Typography } from "@taskflow/ui";

interface EventItem {
  date: number;
  title: string;
  color: string; // tailwind bg class
}

interface CalendarGridProps {
  monthLabel: string;
  weekSummary?: string;
  daysInMonth?: number;
  events?: EventItem[];
  onDayClick?: (day: number) => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  monthLabel,
  weekSummary,
  daysInMonth = 31,
  events = [],
  onDayClick,
}) => {
  return (
    <Card className="bg-card border-border rounded-xl p-6">
      <div className="flex justify-between items-center mb-4">
        <Typography variant="h3" as="h2" className="text-foreground">{monthLabel}</Typography>
        {weekSummary && (
          <Typography variant="muted" className="text-sm">{weekSummary}</Typography>
        )}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="text-center text-muted-foreground text-sm">
            {d}
          </div>
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const event = events.find((e) => e.date === day);
          return (
            <button
              key={day}
              type="button"
              onClick={() => onDayClick && onDayClick(day)}
              className="h-24 bg-muted/30 rounded-md p-2 flex flex-col text-left text-sm relative hover:bg-muted/50 transition"
            >
              <span className="text-foreground">{day}</span>
              {event && (
                <div className={`mt-1 text-xs p-1 rounded truncate ${event.color} text-primary-foreground`}>
                  {event.title}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </Card>
  );
};

export default CalendarGrid;
