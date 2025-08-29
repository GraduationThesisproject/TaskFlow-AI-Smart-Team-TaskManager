import { useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, Typography, Avatar, AvatarImage, AvatarFallback, EmptyState, Skeleton, Button } from "@taskflow/ui";
import { Clock, AlertCircle } from "lucide-react";
import { type ActivityItem } from "../../../store/slices/activitySlice";
import { useAuth } from '../../../hooks/useAuth';
import { useActivity } from '../../../hooks/useActivity';

const ActivityItemComponent: React.FC<{ activity: ActivityItem }> = ({ activity }) => {
  // Prefer the actor from the activity; fall back to authenticated user
  const { user: authUser } = useAuth();

  const authDisplay = (authUser as any)?.displayName || authUser?.user?.name || authUser?.user?.email || 'User';

  const isObjUser = activity && typeof activity.user === 'object' && activity.user !== null;

  const actorName = isObjUser
    ? (activity.user as any).name
      || (activity.user as any).displayName
      || (activity.user as any).email
      || (activity.user as any).username
      || authDisplay
    : authDisplay;

  const avatarUrl = isObjUser
    ? ((activity.user as any).avatar || (activity.user as any).image || undefined)
    : undefined;
    

  const initials = String(actorName)
    .trim()
    .split(' ')
    .map((s: string) => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // Defensive sanitize/trim description, then normalize wording
  const sanitizedDescription = String(activity.description || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Remove leading 'User ', strip emails after 'logged in:', and normalize phrasing
  const displayDescription = sanitizedDescription
    .replace(/^user\s+/i, '')
    .replace(/^logged in:.*$/i, 'Logged in')
    .replace(/^logged out.*$/i, 'Logged out');

  return (
    <div className="flex items-start gap-3 p-2 hover:bg-muted/10 rounded-md transition-colors">
      <Avatar size="sm" className="flex-shrink-0 mt-1">
        <AvatarImage src={avatarUrl} alt={actorName} />
        <AvatarFallback variant="primary" size="sm">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <Typography variant="body-small" className="font-medium">{actorName}</Typography>
        <Typography variant="body-small" className="text-muted-foreground break-words">
          {displayDescription}
        </Typography>
        <Typography variant="caption" className="text-muted-foreground mt-0.5 block">
          {(() => {
            const d = new Date(activity.createdAt);
            const date = d.toLocaleDateString();
            const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return `${date} • ${time}`;
          })()}
        </Typography>
      </div>
    </div>
  );
};

export const RecentActivity: React.FC = () => {
  const { activities, loading, error } = useActivity(true);
  const [expanded, setExpanded] = useState(false);

  const recentActivities = useMemo(() => {
    return [...activities]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [activities]);

  const displayedActivities = expanded ? recentActivities : recentActivities.slice(0, 3);

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
          <>
            <div className="space-y-1">
              {displayedActivities.map(activity => {
                // console.log(activity);
                return <ActivityItemComponent key={activity._id} activity={activity} />
              })}
            </div>
            {recentActivities.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 w-full"
                onClick={() => setExpanded(v => !v)}
                aria-expanded={expanded}
              >
                {expanded ? 'Show less' : 'Show more details'}
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
