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

  // Derive avatar URL (normalized in slice, but handle both shapes just in case)
  const avatarUrl = typeof activity.user === 'object'
    ? (typeof activity.user.avatar === 'string' ? activity.user.avatar : (activity.user as any)?.avatar?.url)
    : undefined;

  // Initials fallback from display name
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(s => s[0]?.toUpperCase())
    .join('') || 'U';

  // Remove email from login description but keep rest of text
  let sanitizedDescription = activity.description || activity.action;
  sanitizedDescription = sanitizedDescription.replace(
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
    ''
  ).trim();

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
      <EmptyState
        icon={<AlertCircle className="h-8 w-8 text-destructive" />}
        title="Error loading activities"
        description={error}
      />
    );
  }

  return (
    <Card className="h-auto">
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
