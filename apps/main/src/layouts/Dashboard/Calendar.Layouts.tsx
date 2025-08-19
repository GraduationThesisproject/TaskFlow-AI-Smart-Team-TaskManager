import React, { useState } from "react";
import { CalendarHeader } from "../../components/Calendar.Components/CalendarHeader.Component";
import { CalendarGrid } from "../../components/Calendar.Components/CalendarGrid.Component";
import { UpcomingTasksPanel } from "../../components/Calendar.Components/UpcomingTasksPanel.Component";
import { ProgressCircle } from "../../components/Calendar.Components/ProgressCircle.Component";
import { FooterActions } from "../../components/Calendar.Components/FooterActions.Component";
import { AddEventModal, AddEventData } from "../../components/Calendar.Components/AddEventModal.Component";

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

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
    setIsModalOpen(true);
  };

  const handleSaveEvent = (data: AddEventData) => {
    setEvents((prev) => [...prev.filter((e) => !(e.date === data.date && e.title === data.title)), data]);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <CalendarHeader title="Calendar" />

      {/* Main Layout */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-9">
          <CalendarGrid
            monthLabel="January 2024"
            weekSummary="Week 1 of 4"
            daysInMonth={31}
            events={events}
            onDayClick={handleDayClick}
          />
        </div>

        <div className="col-span-3 space-y-6">
          <div className="bg-neutral-950 rounded-xl p-6">
            <UpcomingTasksPanel
              items={[
                { color: "bg-blue-600", title: "Team Meeting", date: "Jan 1, 10:00 AM" },
                { color: "bg-emerald-400", title: "Deploy Release", date: "Jan 2, 2:00 PM" },
                { color: "bg-blue-600", title: "Sprint Planning", date: "Jan 5, 9:00 AM" },
              ]}
            />
            <ProgressCircle percent={70} label="Tasks Scheduled This Week" />
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

