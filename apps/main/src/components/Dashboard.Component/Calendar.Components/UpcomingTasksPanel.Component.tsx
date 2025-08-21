import React, { useState } from "react";
import { Card, Typography } from "@taskflow/ui";
import { TaskItem } from "./TaskItem.Component";
import { ChevronRight } from "lucide-react";

interface UpcomingTasksPanelProps {
  title: string;
  items: { color: string; title: string; date: string }[];
  emptyMessage: string;
}

type FilterType = 'all' | 'my-tasks' | 'team';

export const UpcomingTasksPanel: React.FC<UpcomingTasksPanelProps> = ({ 
  title, 
  items, 
  emptyMessage 
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  return (
    <Card className="bg-card border border-border rounded-xl p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <button 
          className="flex items-center text-primary text-sm font-medium hover:underline"
          onClick={() => console.log('See all tasks')}
        >
          See All
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
      
      <div className="flex gap-2 mb-4">
        <button 
          className={`px-3 py-1 text-sm rounded-full ${activeFilter === 'all' ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'}`}
          onClick={() => setActiveFilter('all')}
        >
          All
        </button>
        <button 
          className={`px-3 py-1 text-sm rounded-full ${activeFilter === 'my-tasks' ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'}`}
          onClick={() => setActiveFilter('my-tasks')}
        >
          My Tasks
        </button>
        <button 
          className={`px-3 py-1 text-sm rounded-full ${activeFilter === 'team' ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'}`}
          onClick={() => setActiveFilter('team')}
        >
          Team
        </button>
      </div>

      <div className="space-y-3">
        {items.length > 0 ? (
          items.map((it, idx) => (
            <TaskItem key={idx} color={it.color} title={it.title} date={it.date} />
          ))
        ) : (
          <p className="text-muted-foreground text-sm text-center py-4">{emptyMessage}</p>
        )}
      </div>
    </Card>
  );
};

export default UpcomingTasksPanel;
