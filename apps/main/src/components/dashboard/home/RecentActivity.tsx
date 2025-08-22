import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, Typography, Avatar, AvatarImage, AvatarFallback, EmptyState } from "@taskflow/ui";
import { Clock } from "lucide-react";

interface RecentActivityProps {
  recentActivity: Array<{ user: { name: string; avatar?: string }; action: string; timestamp: string }>;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ recentActivity }) => (
  <Card>
    <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
    <CardContent>
      {recentActivity.length > 0 ? (
        <div className="space-y-4">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center gap-3">
              <Avatar size="sm">
                <AvatarImage src={activity.user?.avatar} />
                <AvatarFallback variant="primary" size="sm">{activity.user?.name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Typography variant="body-small">
                  <span className="font-medium">{activity.user?.name}</span> {activity.action}
                </Typography>
                <Typography variant="caption" className="text-muted-foreground">{activity.timestamp}</Typography>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={<Clock className="h-8 w-8" />} title="No recent activity" description="Activity will appear here as you and your team work on tasks." />
      )}
    </CardContent>
  </Card>
);
