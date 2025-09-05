import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Typography, AvatarWithFallback, EmptyState, Skeleton, Button } from "@taskflow/ui";
import { Clock, AlertCircle, Settings } from "lucide-react";
import { useAuth } from '../../../hooks/useAuth';
import { useActivity } from '../../../hooks/useActivity';
import { useNavigate } from 'react-router-dom';
import type { ActivityItem } from '../../../types/store.types';

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
    <div className="flex items-start gap-2 py-1 hover:bg-muted/10 rounded-md transition-colors">
      <AvatarWithFallback 
        size="xs" 
        className="flex-shrink-0 mt-0.5"
        src={avatarUrl}
        alt={actorName}
      />
      <div className="flex-1 min-w-0">
        <Typography variant="caption" className="font-medium text-xs">{actorName}</Typography>
        <Typography variant="caption" className="text-muted-foreground break-words text-xs leading-tight">
          {displayDescription}
        </Typography>
        <Typography variant="caption" className="text-muted-foreground mt-0.5 block text-xs">
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
  const navigate = useNavigate();

  const recentActivities = useMemo(() => {
    return [...activities]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [activities]);

  const displayedActivities = expanded ? recentActivities : recentActivities.slice(0, 3);

  const handleShowMore = () => {
    navigate('/dashboard/settings/activity');
  };

  if (error) {
    return (
      <Card className="h-auto backdrop-blur-sm ring-1 ring-accent/10 border border-[hsl(var(--accent))]/20 shadow-[0_0_16px_hsl(var(--accent)/0.12)]">
        <CardHeader className="py-2">
          <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="py-2">
          <Typography variant="caption" className="text-red-600 flex items-center gap-2 text-xs">
            <AlertCircle className="h-3 w-3" /> Failed to load activity.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-auto backdrop-blur-sm ring-1 ring-accent/10 border border-[hsl(var(--accent))]/20 shadow-[0_0_16px_hsl(var(--accent)/0.12)]">
      <CardHeader className="py-2">
        <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="py-2">
        {loading && !recentActivities.length ? (
          <div className="space-y-1">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-8 w-full rounded-md" />)}
          </div>
        ) : recentActivities.length === 0 ? (
          <EmptyState
            icon={<Clock className="h-5 w-5" />}
            title="No recent activity"
            description="Activity will appear here as your team works on tasks."
          />
        ) : (
          <>
            <div className="space-y-0.5">
              {displayedActivities.map(activity => {
                return <ActivityItemComponent key={activity._id} activity={activity} />
              })}
            </div>
            {recentActivities.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 w-full text-xs h-6"
                onClick={handleShowMore}
                aria-expanded={expanded}
              >
                <Settings className="h-3 w-3 mr-1" />
                View all in Settings
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
