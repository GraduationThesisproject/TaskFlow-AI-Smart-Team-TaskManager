import React, { useMemo, useState } from "react";
import { CalendarHeader } from "../../components/Dashboard.Component/Calendar.Components/CalendarHeader.Component";
import { CalendarGrid } from "../../components/Dashboard.Component/Calendar.Components/CalendarGrid.Component";
import { ProgressCircle } from "../../components/Dashboard.Component/Calendar.Components/ProgressCircle.Component";
import { AddEventModal } from "../../components/Dashboard.Component/Calendar.Components/AddEventModal.Component";
import { UpcomingTasksPanel } from "../../components/Dashboard.Component/Calendar.Components/UpcomingTasksPanel.Component";
import type { AddEventData } from "../../components/Dashboard.Component/Calendar.Components/AddEventModal.Component";
import { useTasks } from "../../hooks";

const Calendar: React.FC = () => {
  const [events, setEvents] = useState([
    { date: 1, title: "Team Meeting", color: "bg-primary" },
    { date: 2, title: "Deploy", color: "bg-accent" },
    { date: 4, title: "Review", color: "bg-muted" },
    { date: 5, title: "Sprint Plan", color: "bg-primary" },
    { date: 8, title: "Launch", color: "bg-accent" },
    { date: 10, title: "Design", color: "bg-primary" },
    { date: 12, title: "Testing", color: "bg-muted" },
    { date: 15, title: "Demo", color: "bg-accent" },
    { date: 18, title: "Standup", color: "bg-primary" },
    { date: 23, title: "Release", color: "bg-accent" },
    { date: 26, title: "Planning", color: "bg-primary" },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Pull tasks from Redux (backed by dummy data)
  const { tasks } = useTasks();

  const toStr = (d: string | Date) => {
    const date = typeof d === 'string' ? new Date(d) : d;
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const upcomingItems = useMemo(() => {
    const now = new Date();
    const in7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const pickColor = (priority: string) => {
      if (priority === "Very High") return "bg-destructive";
      if (priority === "High") return "bg-accent";
      return "bg-primary";
    };

    return tasks
      .filter(t => t.dueDate)  // Filter out tasks without dueDate
      .map(t => ({
        ...t,
        dueDate: new Date(t.dueDate as string)  // We've already filtered out undefined
      }))
      .filter(t => {
        const d = t.dueDate;
        return d >= now && d <= in7;
      })
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
      .slice(0, 5)
      .map(t => ({
        color: pickColor(t.priority),
        title: t.title,
        date: toStr(t.dueDate),
      }));
  }, [tasks]);

  const scheduledPercent = useMemo(() => {
    if (tasks.length === 0) return 0;
    const now = new Date();
    const in7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const count = tasks
      .filter(t => t.dueDate)  
      .filter(t => {
        const d = new Date(t.dueDate!);  
        return d >= now && d <= in7;
      }).length;
    return Math.min(100, Math.round((count / tasks.length) * 100));
  }, [tasks]);

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
    setIsModalOpen(true);
  };

  const handleSaveEvent = (data: AddEventData) => {
    setEvents((prev) => [...prev.filter((e) => !(e.date === data.date && e.title === data.title)), data]);
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6">
      <CalendarHeader title="Calendar" />

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-9">
          <CalendarGrid
            monthLabel="January 2024"
            weekSummary="Week 1 of 4"
            daysInMonth={31}
            events={events}
            onDayClick={handleDayClick}
          />
        </div>

        <div className="lg:col-span-3 space-y-6">
          <UpcomingTasksPanel 
            title="Upcoming Tasks"
            items={upcomingItems}
            emptyMessage="No upcoming tasks"
          />
          <div className="bg-card p-4 rounded-lg border border-border">
            <h3 className="text-lg font-semibold mb-4">Scheduled Tasks</h3>
            <div className="flex justify-center">
              <ProgressCircle percent={scheduledPercent} label={`${scheduledPercent}% scheduled`} />
            </div>
          </div>
        </div>
      </div>

      <AddEventModal
        isOpen={isModalOpen}
        date={selectedDay}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEvent}
      />
    </div>
  );
};

export default Calendar;