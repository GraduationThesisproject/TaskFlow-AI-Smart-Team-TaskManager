import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, Typography, Badge, EmptyState } from "@taskflow/ui";
import { Calendar } from "lucide-react";
import { useTasks } from "../../../hooks/useTasks";

export const UpcomingDeadlines: React.FC = () => {
  const { timelineTasks, loading, error } = useTasks();
  
  const upcomingDeadlines = timelineTasks
    .filter(task => {
      const dueDate = new Date(task.dueDate!);
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      return dueDate >= today && dueDate <= nextWeek;
    })
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());

  if (loading) {
    return (
      <Card className="backdrop-blur-sm ring-1 ring-accent/10 border border-[hsl(var(--accent))]/20 shadow-[0_0_8px_hsl(var(--accent)/0.08)]" size="full">
        <CardHeader><CardTitle className="text-sm">Upcoming Deadlines</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-1.5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-2 border rounded-md ring-1 ring-accent/10 border-[hsl(var(--accent))]/20 shadow-[0_0_4px_hsl(var(--accent)/0.06)]">
                <div className="flex-1">
                  <div className="h-2.5 bg-gray-200 rounded w-24 mb-1"></div>
                  <div className="h-2 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-10"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="backdrop-blur-sm ring-1 ring-accent/10 border border-[hsl(var(--accent))]/20 shadow-[0_0_8px_hsl(var(--accent)/0.08)]" size="full">
        <CardHeader><CardTitle className="text-sm">Upcoming Deadlines</CardTitle></CardHeader>
        <CardContent>
          <Typography variant="body-medium" className="text-red-600 text-sm">
            Error loading deadlines: {error}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="backdrop-blur-sm ring-1 ring-accent/10 border border-[hsl(var(--accent))]/20 shadow-[0_0_8px_hsl(var(--accent)/0.08)]" size="full">
      <CardHeader><CardTitle className="text-sm">Upcoming Deadlines</CardTitle></CardHeader>
      <CardContent>
        {upcomingDeadlines.length > 0 ? (
          <div className="space-y-1.5">
            {upcomingDeadlines.map(task => (
              <div key={task._id} className="flex items-center justify-between p-2 border rounded-md ring-1 ring-accent/10 border-[hsl(var(--accent))]/20 shadow-[0_0_4px_hsl(var(--accent)/0.06)]">
                <div className="flex-1">
                  <Typography variant="body-small" className="font-medium text-xs">{task.title}</Typography>
                  <Typography variant="caption" className="text-muted-foreground text-xs">
                    Due {new Date(task.dueDate!).toLocaleDateString()}
                  </Typography>
                </div>
                <Badge variant={task.priority === 'high' || task.priority === 'critical' ? 'destructive' : 'secondary'} className="text-xs px-1.5 py-0.5">
                  {task.priority}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState 
            icon={<Calendar className="h-5 w-5" />} 
            title="No upcoming deadlines" 
            description="You're all caught up! No tasks are due in the next 7 days." 
          />
        )}
      </CardContent>
    </Card>
  );
};
