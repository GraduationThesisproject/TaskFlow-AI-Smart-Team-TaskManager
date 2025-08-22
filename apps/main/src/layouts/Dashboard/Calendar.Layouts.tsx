import React, { useMemo, useState } from "react";
import { Calendar as CalendarIcon, Plus, Clock, CheckCircle } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Button, 
  Typography,
  Badge,
  EmptyState
} from "@taskflow/ui";
import { DashboardShell } from "./DashboardShell";
import { useTasks } from "../../hooks";

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'task' | 'meeting' | 'deadline';
  priority?: string;
  status?: string;
}

const Calendar: React.FC = () => {
  const { tasks, loading, error } = useTasks();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Convert tasks to calendar events
  const calendarEvents = useMemo(() => {
    const events: CalendarEvent[] = [];
    
    tasks.forEach(task => {
      if (task.dueDate) {
        events.push({
          id: task._id,
          title: task.title,
          date: new Date(task.dueDate),
          type: 'task',
          priority: task.priority,
          status: task.status
        });
      }
    });

    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [tasks]);

  // Get current month data
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // Generate calendar grid
  const calendarDays = useMemo(() => {
    const days = [];
    const totalDays = firstDayOfMonth + daysInMonth;
    const totalWeeks = Math.ceil(totalDays / 7);

    for (let week = 0; week < totalWeeks; week++) {
      const weekDays = [];
      for (let day = 0; day < 7; day++) {
        const dayNumber = week * 7 + day - firstDayOfMonth + 1;
        const isValidDay = dayNumber > 0 && dayNumber <= daysInMonth;
        
        if (isValidDay) {
          const date = new Date(currentYear, currentMonth, dayNumber);
          const dayEvents = calendarEvents.filter(event => 
            event.date.toDateString() === date.toDateString()
          );
          
          weekDays.push({
            day: dayNumber,
            date,
            events: dayEvents,
            isToday: date.toDateString() === currentDate.toDateString(),
            isSelected: selectedDate?.toDateString() === date.toDateString()
          });
        } else {
          weekDays.push(null);
        }
      }
      days.push(weekDays);
    }
    
    return days;
  }, [currentMonth, currentYear, daysInMonth, firstDayOfMonth, calendarEvents, selectedDate, currentDate]);

  // Get upcoming events (next 7 days)
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return calendarEvents
      .filter(event => event.date >= now && event.date <= in7Days)
      .slice(0, 5);
  }, [calendarEvents]);

  // Calculate completion rate for scheduled tasks
  const scheduledStats = useMemo(() => {
    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const scheduledTasks = tasks.filter(task => 
      task.dueDate && 
      new Date(task.dueDate) >= now && 
      new Date(task.dueDate) <= in7Days
    );
    
    const completedTasks = scheduledTasks.filter(task => task.status === 'done');
    
    return {
      total: scheduledTasks.length,
      completed: completedTasks.length,
      percentage: scheduledTasks.length > 0 ? Math.round((completedTasks.length / scheduledTasks.length) * 100) : 0
    };
  }, [tasks]);

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const handleAddEvent = () => {
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <DashboardShell title="Calendar">
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-9">
              <div className="h-96 bg-muted rounded"></div>
            </div>
            <div className="lg:col-span-3 space-y-6">
              <div className="h-48 bg-muted rounded"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (error) {
    return (
      <DashboardShell title="Calendar">
        <EmptyState
          icon={<CalendarIcon className="h-12 w-12" />}
          title="Couldn't load calendar"
          description="We couldn't load your calendar data. Please try refreshing the page."
          action={{
            label: "Refresh Page",
            onClick: () => window.location.reload(),
            variant: "default"
          }}
        />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title="Calendar">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <Typography variant="h1" className="text-2xl font-bold">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Typography>
            <Typography variant="body-medium" className="text-muted-foreground">
              Manage your schedule and deadlines
            </Typography>
          </div>
          <Button onClick={handleAddEvent}>
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-9">
          <Card>
            <CardContent className="p-6">
              {/* Calendar Header */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center py-2">
                    <Typography variant="caption" className="font-medium text-muted-foreground">
                      {day}
                    </Typography>
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((week, weekIndex) =>
                  week.map((day, dayIndex) => (
                    <div key={`${weekIndex}-${dayIndex}`} className="min-h-[100px]">
                      {day ? (
                        <div
                          className={`
                            h-full p-2 border border-border rounded-lg cursor-pointer transition-colors
                            ${day.isToday ? 'bg-primary/10 border-primary/50' : 'hover:bg-muted/50'}
                            ${day.isSelected ? 'ring-2 ring-primary' : ''}
                          `}
                          onClick={() => handleDayClick(day.date)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <Typography 
                              variant="body-small" 
                              className={`font-medium ${
                                day.isToday ? 'text-primary' : 'text-foreground'
                              }`}
                            >
                              {day.day}
                            </Typography>
                            {day.events.length > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {day.events.length}
                              </Badge>
                            )}
                          </div>
                          
                          {/* Events */}
                          <div className="space-y-1">
                            {day.events.slice(0, 2).map(event => (
                              <div
                                key={event.id}
                                className={`
                                  text-xs p-1 rounded truncate
                                  ${event.type === 'task' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : ''}
                                  ${event.type === 'meeting' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}
                                  ${event.type === 'deadline' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : ''}
                                `}
                                title={event.title}
                              >
                                {event.title}
                              </div>
                            ))}
                            {day.events.length > 2 && (
                              <Typography variant="caption" className="text-muted-foreground">
                                +{day.events.length - 2} more
                              </Typography>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="h-full p-2 border border-transparent" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-3 space-y-6">
          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length > 0 ? (
                <div className="space-y-3">
                  {upcomingEvents.map(event => (
                    <div key={event.id} className="flex items-start gap-3 p-3 border border-border rounded-lg">
                      <div className="flex-shrink-0 mt-1">
                        {event.type === 'task' && <CheckCircle className="h-4 w-4 text-blue-500" />}
                        {event.type === 'meeting' && <Clock className="h-4 w-4 text-green-500" />}
                        {event.type === 'deadline' && <CalendarIcon className="h-4 w-4 text-red-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Typography variant="body-small" className="font-medium truncate">
                          {event.title}
                        </Typography>
                        <Typography variant="caption" className="text-muted-foreground">
                          {event.date.toLocaleDateString()}
                        </Typography>
                        {event.priority && (
                          <Badge 
                            variant={event.priority === 'high' || event.priority === 'critical' ? 'destructive' : 'secondary'}
                            className="mt-1"
                          >
                            {event.priority}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<Clock className="h-8 w-8" />}
                  title="No upcoming events"
                  description="You have no events scheduled for the next 7 days."
                />
              )}
            </CardContent>
          </Card>

          {/* Scheduled Tasks Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="relative inline-flex items-center justify-center w-20 h-20 mb-4">
                  <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-muted"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-primary"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray={`${scheduledStats.percentage}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Typography variant="body-medium" className="font-bold">
                      {scheduledStats.percentage}%
                    </Typography>
                  </div>
                </div>
                <Typography variant="body-small" className="text-muted-foreground">
                  {scheduledStats.completed} of {scheduledStats.total} tasks completed
                </Typography>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Event Modal would go here */}
      {/* For now, we'll just close the modal state */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg max-w-md w-full mx-4">
            <Typography variant="h3" className="mb-4">
              Add Event
            </Typography>
                         <Typography variant="body-medium" className="text-muted-foreground mb-4">
               Event creation functionality will be implemented here.
             </Typography>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsModalOpen(false)}>
                Add Event
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
};

export default Calendar;