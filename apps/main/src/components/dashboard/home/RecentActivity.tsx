import { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent, Typography, Avatar, AvatarImage, AvatarFallback, EmptyState, Skeleton } from "@taskflow/ui";
import { Clock, AlertCircle } from "lucide-react";
import { type ActivityItem } from "../../../store/slices/activitySlice";
import { useAuth } from '../../../hooks/useAuth';
import { useActivity } from '../../../hooks/useActivity';

const ActivityItemComponent: React.FC<{ activity: ActivityItem }> = ({ activity }) => {
  // Prefer actor (user) name; fallback to auth user, then generic
  const { user: authUser } = useAuth();
  const displayName = typeof activity.user === 'object'
    ? (activity.user.name || activity.user.email || 'User')
    : (authUser?.user?.name || authUser?.user?.email || 'User');

  const initials = displayName
    .split(' ')
    .map(s => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const avatarUrl = typeof activity.user === 'object' && activity.user.avatar ? activity.user.avatar : undefined;

  // Defensive sanitize/trim description
  const sanitizedDescription = String(activity.description || '')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return (
    <div className="flex items-start gap-3 p-2 hover:bg-muted/10 rounded-md transition-colors">
      <Avatar size="sm" className="flex-shrink-0 mt-1">
        <AvatarImage
          src={avatarUrl}
          alt={displayName}
        />
        <AvatarFallback variant="primary" size="sm">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <Typography variant="body-small" className="font-medium">
          {displayName}
        </Typography>
        <Typography variant="body-small" className="text-muted-foreground break-words">
          {sanitizedDescription}
        </Typography>
        <Typography variant="caption" className="text-muted-foreground mt-0.5 block">
          {new Date(activity.createdAt).toLocaleString()}
        </Typography>
      </div>
    </div>
  );
};

export const RecentActivity: React.FC = () => {
  const { activities, loading, error } = useActivity(true, { limit: 5 });

  const recentActivities = useMemo(() => {
    return [...activities]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [activities]);

  if (error) {
    return (
      <Card className="h-auto backdrop-blur-sm ring-1 ring-accent/10 border border-[hsl(var(--accent))]/20 shadow-[0_0_16px_hsl(var(--accent)/0.12)]">
        <CardHeader className="py-2">
          <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="py-2">
          <Typography variant="body-medium" className="text-red-600 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" /> Failed to load activity.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-auto backdrop-blur-sm ring-1 ring-accent/10 border border-[hsl(var(--accent))]/20 shadow-[0_0_16px_hsl(var(--accent)/0.12)]">
      <CardHeader className="py-2">
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="py-2">
        {loading && !recentActivities.length ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full rounded-md" />)}
          </div>
        ) : recentActivities.length === 0 ? (
          <EmptyState
            icon={<Clock className="h-8 w-8" />}
            title="No recent activity"
            description="Activity will appear here as your team works on tasks."
          />
        ) : (
          <div className="space-y-1">
            {recentActivities.map(activity => (
              <ActivityItemComponent key={activity._id} activity={activity} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
