import React, { useMemo, useState } from "react";
import { CalendarHeader } from "../../components/Dashboard.Component/Calendar.Components/CalendarHeader.Component";
import { CalendarGrid } from "../../components/Dashboard.Component/Calendar.Components/CalendarGrid.Component";
import { UpcomingTasksPanel } from "../../components/Dashboard.Component/Calendar.Components/UpcomingTasksPanel.Component";
import { ProgressCircle } from "../../components/Dashboard.Component/Calendar.Components/ProgressCircle.Component";
import { AddEventModal } from "../../components/Dashboard.Component/Calendar.Components/AddEventModal.Component";
import type { AddEventData } from "../../components/Dashboard.Component/Calendar.Components/AddEventModal.Component";
import { useTasks } from "../../hooks";

const Calendar: React.FC = () => {
  const [events, setEvents] = useState([
    { date: 1, title: "Team Meeting", color: "bg-blue-600" },
    { date: 2, title: "Deploy", color: "bg-emerald-400" },
    { date: 4, title: "Review", color: "bg-gray-600" },
    { date: 5, title: "Sprint Plan", color: "bg-blue-600" },
    { date: 8, title: "Launch", color: "bg-emerald-400" },
    { date: 10, title: "Design", color: "bg-blue-600" },
    { date: 12, title: "Testing", color: "bg-gray-600" },
    { date: 15, title: "Demo", color: "bg-emerald-400" },
    { date: 18, title: "Standup", color: "bg-blue-600" },
    { date: 23, title: "Release", color: "bg-emerald-400" },
    { date: 26, title: "Planning", color: "bg-blue-600" },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Pull tasks from Redux (backed by dummy data)
  const { tasks } = useTasks();

  const upcomingItems = useMemo(() => {
    const now = new Date();
    const in7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const toStr = (d: string) => {
      const date = new Date(d);
      return date.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const pickColor = (priority: string) => {
      if (priority === "Very High") return "bg-rose-500";
      if (priority === "High") return "bg-emerald-400";
      return "bg-blue-600";
    };

    return tasks
      .filter(t => t.dueDate)
      .filter(t => {
        const d = new Date(t.dueDate);
        return d >= now && d <= in7;
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
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
    const count = tasks.filter(t => t.dueDate).filter(t => {
      const d = new Date(t.dueDate);
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
    <div className="min-h-screen bg-black text-white p-4 sm:p-6">
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
          <div className="bg-neutral-950 rounded-xl p-6">
            <UpcomingTasksPanel items={upcomingItems} />
            <ProgressCircle percent={scheduledPercent} label="Tasks Scheduled This Week" />
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

