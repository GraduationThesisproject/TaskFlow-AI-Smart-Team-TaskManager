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
    <Card className="bg-neutral-950 border-neutral-800 rounded-xl p-6">
      <div className="flex justify-between items-center mb-4">
        <Typography variant="h3" as="h2">{monthLabel}</Typography>
        {weekSummary && (
          <Typography variant="muted" className="text-sm">{weekSummary}</Typography>
        )}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="text-center text-gray-400 text-sm">
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
              className="h-24 bg-neutral-900 rounded-md p-2 flex flex-col text-left text-sm relative hover:bg-neutral-800 transition"
            >
              <span className="text-white">{day}</span>
              {event && (
                <span className={`${event.color} text-xs text-white px-2 py-1 rounded-full mt-2 w-fit`}>
                  {event.title}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </Card>
  );
};

export default CalendarGrid;


