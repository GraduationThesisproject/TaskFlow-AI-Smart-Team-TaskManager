import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Typography } from "@taskflow/ui";
import { Users, Clock, AlertTriangle, Calendar } from "lucide-react";
import { useTasks } from "../../../hooks/useTasks";

export const StatsCards: React.FC = () => {
  const { taskStats, loading, error, highPriorityTasks, overdueTasks } = useTasks();
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse backdrop-blur-sm ring-1 ring-accent/10 border border-[hsl(var(--accent))]/20 shadow-[0_0_16px_hsl(var(--accent)/0.12)]">
            <CardHeader className="flex justify-between pb-2">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="col-span-full backdrop-blur-sm ring-1 ring-accent/10 border border-[hsl(var(--accent))]/20 shadow-[0_0_16px_hsl(var(--accent)/0.12)]">
          <CardContent className="p-6">
            <Typography variant="body-medium" className="text-red-600">
              Error loading statistics: {error}
            </Typography>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="backdrop-blur-sm ring-1 ring-accent/10 border border-[hsl(var(--accent))]/20 shadow-[0_0_16px_hsl(var(--accent)/0.12)] hover:shadow-[0_0_28px_hsl(var(--accent)/0.22)] transition-shadow">
        <CardHeader className="flex justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <Typography variant="h2" className="text-2xl font-bold">{taskStats.total}</Typography>
          <Typography variant="caption" className="text-muted-foreground">{taskStats.completionRate}% completed</Typography>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-sm ring-1 ring-accent/10 border border-[hsl(var(--accent))]/20 shadow-[0_0_16px_hsl(var(--accent)/0.12)] hover:shadow-[0_0_28px_hsl(var(--accent)/0.22)] transition-shadow">
        <CardHeader className="flex justify-between pb-2">
          <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <Typography variant="h2" className="text-2xl font-bold">{taskStats.inProgress}</Typography>
          <Typography variant="caption" className="text-muted-foreground">Currently working on</Typography>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-sm ring-1 ring-accent/10 border border-[hsl(var(--accent))]/20 shadow-[0_0_16px_hsl(var(--accent)/0.12)] hover:shadow-[0_0_28px_hsl(var(--accent)/0.22)] transition-shadow">
        <CardHeader className="flex justify-between pb-2">
          <CardTitle className="text-sm font-medium">High Priority</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <Typography variant="h2" className="text-2xl font-bold">{highPriorityTasks.length}</Typography>
          <Typography variant="caption" className="text-muted-foreground">Requires attention</Typography>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-sm ring-1 ring-accent/10 border border-[hsl(var(--accent))]/20 shadow-[0_0_16px_hsl(var(--accent)/0.12)] hover:shadow-[0_0_28px_hsl(var(--accent)/0.22)] transition-shadow">
        <CardHeader className="flex justify-between pb-2">
          <CardTitle className="text-sm font-medium">Overdue</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <Typography variant="h2" className="text-2xl font-bold">{overdueTasks.length}</Typography>
          <Typography variant="caption" className="text-muted-foreground">Past due date</Typography>
        </CardContent>
      </Card>
    </div>
  );
};
