import { Card, CardHeader, CardTitle, CardContent, Typography, Badge, EmptyState } from "@taskflow/ui";
import { Calendar } from "lucide-react";
import { useTasks } from "../../../hooks/useTasks";

export const UpcomingDeadlines: React.FC = () => {
  const { timelineTasks, loading, error } = useTasks();
  
  // Filter for upcoming deadlines (next 7 days)
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
      <Card className="backdrop-blur-sm ring-1 ring-accent/10 border border-[hsl(var(--accent))]/20 shadow-[0_0_16px_hsl(var(--accent)/0.12)]">
        <CardHeader><CardTitle>Upcoming Deadlines</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg ring-1 ring-accent/10 border-[hsl(var(--accent))]/20 shadow-[0_0_8px_hsl(var(--accent)/0.08)]">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="backdrop-blur-sm ring-1 ring-accent/10 border border-[hsl(var(--accent))]/20 shadow-[0_0_16px_hsl(var(--accent)/0.12)]">
        <CardHeader><CardTitle>Upcoming Deadlines</CardTitle></CardHeader>
        <CardContent>
          <Typography variant="body-medium" className="text-red-600">
            Error loading deadlines: {error}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="backdrop-blur-sm ring-1 ring-accent/10 border border-[hsl(var(--accent))]/20 shadow-[0_0_16px_hsl(var(--accent)/0.12)]">
      <CardHeader><CardTitle>Upcoming Deadlines</CardTitle></CardHeader>
      <CardContent>
        {upcomingDeadlines.length > 0 ? (
          <div className="space-y-3">
            {upcomingDeadlines.map(task => (
              <div key={task._id} className="flex items-center justify-between p-3 border rounded-lg ring-1 ring-accent/10 border-[hsl(var(--accent))]/20 shadow-[0_0_8px_hsl(var(--accent)/0.08)]">
                <div className="flex-1">
                  <Typography variant="body-small" className="font-medium">{task.title}</Typography>
                  <Typography variant="caption" className="text-muted-foreground">
                    Due {new Date(task.dueDate!).toLocaleDateString()}
                  </Typography>
                </div>
                <Badge variant={task.priority === 'high' || task.priority === 'critical' ? 'destructive' : 'secondary'}>
                  {task.priority}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState 
            icon={<Calendar className="h-8 w-8" />} 
            title="No upcoming deadlines" 
            description="You're all caught up! No tasks are due in the next 7 days." 
          />
        )}
      </CardContent>
    </Card>
  );
};
