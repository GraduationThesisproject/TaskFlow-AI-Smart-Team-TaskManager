import React from "react";
import { Card, Typography, Button } from "@taskflow/ui";
import { TaskItem } from "./TaskItem.Component";

interface UpcomingTasksPanelProps {
  items: { color: string; title: string; date: string }[];
}

export const UpcomingTasksPanel: React.FC<UpcomingTasksPanelProps> = ({ items }) => {
  return (
    <Card className="bg-card border-border rounded-xl p-6">
      <Typography variant="h3" as="h2" className="mb-4 text-foreground">Upcoming Tasks</Typography>
      <div className="space-y-3">
        {items.map((it, idx) => (
          <TaskItem key={idx} color={it.color} title={it.title} date={it.date} />
        ))}
      </div>

      <div className="flex gap-2 mt-6">
        <Button size="sm" variant="default">All</Button>
        <Button size="sm" variant="outline">My Tasks</Button>
        <Button size="sm" variant="outline">Team</Button>
      </div>
    </Card>
  );
};

export default UpcomingTasksPanel;
