import { Card, CardContent, CardHeader, CardTitle, Typography } from "@taskflow/ui";
import { Users, Clock, AlertTriangle, Calendar } from "lucide-react";
import type { StatsCardsProps } from "../../../types/dash.types";




export const StatsCards: React.FC<StatsCardsProps> = ({ taskStats }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <Card>
      <CardHeader className="flex justify-between pb-2">
        <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <Typography variant="h2" className="text-2xl font-bold">{taskStats.total}</Typography>
        <Typography variant="caption" className="text-muted-foreground">{taskStats.completionRate}% completed</Typography>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="flex justify-between pb-2">
        <CardTitle className="text-sm font-medium">In Progress</CardTitle>
        <Clock className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <Typography variant="h2" className="text-2xl font-bold">{taskStats.inProgress}</Typography>
        <Typography variant="caption" className="text-muted-foreground">Currently working on</Typography>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="flex justify-between pb-2">
        <CardTitle className="text-sm font-medium">High Priority</CardTitle>
        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <Typography variant="h2" className="text-2xl font-bold">{taskStats.highPriority}</Typography>
        <Typography variant="caption" className="text-muted-foreground">Requires attention</Typography>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="flex justify-between pb-2">
        <CardTitle className="text-sm font-medium">Overdue</CardTitle>
        <Calendar className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <Typography variant="h2" className="text-2xl font-bold">{taskStats.overdue}</Typography>
        <Typography variant="caption" className="text-muted-foreground">Past due date</Typography>
      </CardContent>
    </Card>
  </div>
);
