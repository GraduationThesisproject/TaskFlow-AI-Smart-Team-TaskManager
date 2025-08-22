import { Card, CardHeader, CardTitle, CardContent, Typography, Badge, EmptyState } from "@taskflow/ui";
import { Calendar } from "lucide-react";

interface UpcomingDeadlinesProps {
  upcomingDeadlines: Array<{ _id: string; title: string; dueDate: Date; priority: string }>;
}

export const UpcomingDeadlines: React.FC<UpcomingDeadlinesProps> = ({ upcomingDeadlines }) => (
  <Card>
    <CardHeader><CardTitle>Upcoming Deadlines</CardTitle></CardHeader>
    <CardContent>
      {upcomingDeadlines.length > 0 ? (
        <div className="space-y-3">
          {upcomingDeadlines.map(task => (
            <div key={task._id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <Typography variant="body-small" className="font-medium">{task.title}</Typography>
                <Typography variant="caption" className="text-muted-foreground">Due {task.dueDate.toLocaleDateString()}</Typography>
              </div>
              <Badge variant={task.priority === 'high' || task.priority === 'critical' ? 'destructive' : 'secondary'}>
                {task.priority}
              </Badge>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={<Calendar className="h-8 w-8" />} title="No upcoming deadlines" description="You're all caught up! No tasks are due in the next 7 days." />
      )}
    </CardContent>
  </Card>
);
