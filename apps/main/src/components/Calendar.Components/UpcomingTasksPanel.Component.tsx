import React from "react";
import { Card, Typography } from "@taskflow/ui";
import { TaskItem } from "./TaskItem.Component";

interface UpcomingTasksPanelProps {
  items: { color: string; title: string; date: string }[];
}

export const UpcomingTasksPanel: React.FC<UpcomingTasksPanelProps> = ({ items }) => {
  return (
    <Card className="bg-neutral-950 border-neutral-800 rounded-xl p-6">
      <Typography variant="h3" as="h2" className="mb-4">Upcoming Tasks</Typography>
      <div className="space-y-3">
        {items.map((it, idx) => (
          <TaskItem key={idx} color={it.color} title={it.title} date={it.date} />
        ))}
      </div>

      <div className="flex gap-2 mt-6">
        <button className="bg-blue-600 px-3 py-1 rounded-lg text-sm">All</button>
        <button className="bg-neutral-900 px-3 py-1 rounded-lg text-sm">My Tasks</button>
        <button className="bg-neutral-900 px-3 py-1 rounded-lg text-sm">Team</button>
      </div>
    </Card>
  );
};

export default UpcomingTasksPanel;


