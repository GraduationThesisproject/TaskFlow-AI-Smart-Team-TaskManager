import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Typography, AvatarWithFallback, EmptyState, Skeleton, Button, Input, Select, SelectOption } from "@taskflow/ui";
import { Clock, Search, Filter, Calendar } from "lucide-react";
import { useAuth } from '../../../hooks/useAuth';
import { useActivity } from '../../../hooks/useActivity';

// Define the ActivityItem type locally
interface ActivityItem {
  _id: string;
  user: any;
  description: string;
  createdAt: string;
  action?: string;
  entity?: any;
}

const ActivityItemComponent: React.FC<{ activity: ActivityItem }> = ({ activity }) => {
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
    <div className="flex items-start gap-3 p-3 hover:bg-muted/10 rounded-lg transition-colors border border-transparent hover:border-border/50">
      <AvatarWithFallback 
        size="sm" 
        className="flex-shrink-0 mt-1"
        src={avatarUrl}
        alt={actorName}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Typography variant="body-small" className="font-medium">{actorName}</Typography>
          {activity.action && (
            <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
              {activity.action}
            </span>
          )}
        </div>
        <Typography variant="body-small" className="text-muted-foreground break-words mb-2">
          {displayDescription}
        </Typography>
        <Typography variant="caption" className="text-muted-foreground">
          {(() => {
            const d = new Date(activity.createdAt);
            const date = d.toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            });
            const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return `${date} at ${time}`;
          })()}
        </Typography>
      </div>
    </div>
  );
};

export const ActivityPage: React.FC = () => {
  const { activities, loading, error } = useActivity(false); // Don't limit for full view
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'user' | 'system' | 'workspace'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  const filteredActivities = useMemo(() => {
    let filtered = [...activities];

    // Apply search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((activity) => {
        const description = String(activity.description || '').toLowerCase();
        const userName = typeof activity.user === 'string' 
          ? activity.user.toLowerCase()
          : String(activity.user?.name || '').toLowerCase();
        return description.includes(q) || userName.includes(q);
      });
    }

    // Apply type filter
    if (filterType !== 'all') {
      // This is a simplified filter - you can enhance it based on your activity structure
      filtered = filtered.filter((activity) => {
        if (filterType === 'user') return activity.user;
        if (filterType === 'system') return !activity.user;
        if (filterType === 'workspace') return activity.entity?.type === 'workspace';
        return true;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [activities, searchQuery, filterType, sortBy]);

  if (error) {
    return (
      <Card className="h-auto">
        <CardHeader className="py-4">
          <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="py-4">
          <EmptyState
            icon={<Clock className="h-8 w-8 text-destructive" />}
            title="Error loading activity"
            description="Failed to load activity data. Please try again later."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <Typography variant="h3" className="font-semibold mb-2">Recent Activity</Typography>
            <Typography variant="body-small" className="text-muted-foreground">
              View detailed activity history and team updates
            </Typography>
          </div>
          
          <div className="flex items-center gap-2">
            <Select
              value={sortBy}
              onValueChange={(value) => setSortBy(value as 'newest' | 'oldest')}
              className="w-32"
            >
              <SelectOption value="newest">Newest first</SelectOption>
              <SelectOption value="oldest">Oldest first</SelectOption>
            </Select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select
            value={filterType}
            onValueChange={(value) => setFilterType(value as 'all' | 'user' | 'system' | 'workspace')}
            className="w-40"
          >
            <SelectOption value="all">All activities</SelectOption>
            <SelectOption value="user">User actions</SelectOption>
            <SelectOption value="system">System events</SelectOption>
            <SelectOption value="workspace">Workspace updates</SelectOption>
          </Select>
        </div>
      </Card>

      {/* Activity List */}
      <Card>
        <CardHeader className="py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              Activity History
            </CardTitle>
            <Typography variant="body-small" className="text-muted-foreground">
              {filteredActivities.length} activities
            </Typography>
          </div>
        </CardHeader>
        <CardContent className="py-4">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          ) : filteredActivities.length === 0 ? (
            <EmptyState
              icon={<Clock className="h-12 w-12" />}
              title="No activities found"
              description={
                searchQuery
                  ? `No activities match "${searchQuery}". Try adjusting your search.`
                  : 'No activities available yet.'
              }
            />
          ) : (
            <div className="space-y-2">
              {filteredActivities.map((activity) => (
                <ActivityItemComponent key={activity._id} activity={activity} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
