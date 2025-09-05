import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Typography } from "@taskflow/ui";
import { Users, Clock, AlertTriangle, Calendar } from "lucide-react";
import { useTasks } from "../../../hooks/useTasks";

export const StatsCards: React.FC = () => {
  const { taskStats, loading, error, highPriorityTasks, overdueTasks } = useTasks();
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse backdrop-blur-sm ring-1 ring-accent/10 border border-[hsl(var(--accent))]/20 shadow-[0_0_8px_hsl(var(--accent)/0.08)]" size="small">
            <CardHeader className="flex justify-between pb-1">
              <div className="h-2.5 bg-gray-200 rounded w-14"></div>
              <div className="h-2.5 w-2.5 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-5 bg-gray-200 rounded w-10 mb-1"></div>
              <div className="h-2 bg-gray-200 rounded w-18"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <Card className="col-span-full backdrop-blur-sm ring-1 ring-accent/10 border border-[hsl(var(--accent))]/20 shadow-[0_0_8px_hsl(var(--accent)/0.08)]" size="full">
          <CardContent className="p-3">
            <Typography variant="body-medium" className="text-red-600">
              Error loading statistics: {error}
            </Typography>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      <Card className="backdrop-blur-sm ring-1 ring-accent/10 border border-[hsl(var(--accent))]/20 shadow-[0_0_8px_hsl(var(--accent)/0.08)] hover:shadow-[0_0_16px_hsl(var(--accent)/0.15)] transition-shadow" size="small">
        <CardHeader className="flex justify-between pb-1">
          <CardTitle className="text-xs font-medium text-muted-foreground">Total Tasks</CardTitle>
          <Users className="h-3 w-3 text-muted-foreground/60" />
        </CardHeader>
        <CardContent>
          <Typography variant="h2" className="text-base font-bold mb-1">{taskStats.total}</Typography>
          <Typography variant="caption" className="text-xs text-muted-foreground">{taskStats.completionRate}% completed</Typography>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-sm ring-1 ring-accent/10 border border-[hsl(var(--accent))]/20 shadow-[0_0_8px_hsl(var(--accent)/0.08)] hover:shadow-[0_0_16px_hsl(var(--accent)/0.15)] transition-shadow" size="small">
        <CardHeader className="flex justify-between pb-1">
          <CardTitle className="text-xs font-medium text-muted-foreground">In Progress</CardTitle>
          <Clock className="h-3 w-3 text-muted-foreground/60" />
        </CardHeader>
        <CardContent>
          <Typography variant="h2" className="text-base font-bold mb-1">{taskStats.inProgress}</Typography>
          <Typography variant="caption" className="text-xs text-muted-foreground">Currently working on</Typography>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-sm ring-1 ring-accent/10 border border-[hsl(var(--accent))]/20 shadow-[0_0_8px_hsl(var(--accent)/0.08)] hover:shadow-[0_0_16px_hsl(var(--accent)/0.15)] transition-shadow" size="small">
        <CardHeader className="flex justify-between pb-1">
          <CardTitle className="text-xs font-medium text-muted-foreground">High Priority</CardTitle>
          <AlertTriangle className="h-3 w-3 text-muted-foreground/60" />
        </CardHeader>
        <CardContent>
          <Typography variant="h2" className="text-base font-bold mb-1">{highPriorityTasks.length}</Typography>
          <Typography variant="caption" className="text-xs text-muted-foreground">Requires attention</Typography>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-sm ring-1 ring-accent/10 border border-[hsl(var(--accent))]/20 shadow-[0_0_8px_hsl(var(--accent)/0.08)] hover:shadow-[0_0_16px_hsl(var(--accent)/0.15)] transition-shadow" size="small">
        <CardHeader className="flex justify-between pb-1">
          <CardTitle className="text-xs font-medium text-muted-foreground">Overdue</CardTitle>
          <Calendar className="h-3 w-3 text-muted-foreground/60" />
        </CardHeader>
        <CardContent>
          <Typography variant="h2" className="text-base font-bold mb-1">{overdueTasks.length}</Typography>
          <Typography variant="caption" className="text-xs text-muted-foreground">Past due date</Typography>
        </CardContent>
      </Card>
    </div>
  );
};
