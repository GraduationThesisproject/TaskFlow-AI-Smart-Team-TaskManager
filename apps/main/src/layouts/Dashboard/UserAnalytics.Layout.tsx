import React, { useEffect, useMemo, useState } from 'react';
import { DashboardShell } from './DashboardShell';
import { AnalyticsService, type UserAnalyticsResponse } from '../../services/analyticsService';
import { format } from 'date-fns';
import { CalendarClock, CheckCircle2, Folder, ListChecks, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@taskflow/ui';
import { Typography } from '@taskflow/ui';
import { useAuth } from '../../hooks/useAuth';

// Response shape is made flexible to avoid tight coupling with backend
// Only rely on fields we render and guard with optional chaining
import type { ActivityPoint } from '../../types/interfaces/ui';

const fallbackArray = <T,>(v?: T[]) => Array.isArray(v) ? v : [];

const pct = (num?: number, denom?: number) => {
  const n = typeof num === 'number' ? num : 0;
  const d = typeof denom === 'number' && denom > 0 ? denom : 1;
  return Math.round((n / d) * 100);
};

const Donut: React.FC<{ completed: number; inProgress: number; pending: number; overdue: number }> = ({ completed, inProgress, pending, overdue }) => {
  const total = Math.max(1, completed + inProgress + pending + overdue);
  const p1 = (completed / total) * 100;
  const p2 = ((completed + inProgress) / total) * 100;
  const p3 = ((completed + inProgress + pending) / total) * 100;
  const bg = `conic-gradient(#16a34a 0% ${p1}%, #eab308 ${p1}% ${p2}%, #3b82f6 ${p2}% ${p3}%, #ef4444 ${p3}% 100%)`;
  return (
    <div className="relative w-36 h-36" title="Task Completion Breakdown">
      <div className="w-36 h-36 rounded-full" style={{ backgroundImage: bg }} />
      <div className="absolute inset-3 rounded-full bg-background flex items-center justify-center">
        <Typography variant="caption" className="text-muted-foreground">Breakdown</Typography>
      </div>
    </div>
  );
};

const Sparkline: React.FC<{ points: number[]; width?: number; height?: number; color?: string }> = ({ points, width = 220, height = 60, color = 'hsl(var(--primary))' }) => {
  if (!points.length) return null;
  const max = Math.max(...points, 1);
  const step = width / Math.max(points.length - 1, 1);
  const path = points.map((v, i) => `${i === 0 ? 'M' : 'L'} ${i * step} ${height - (v / max) * height}`).join(' ');
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <path d={path} stroke={color} strokeWidth={2} fill="none" />
    </svg>
  );
};

const Heatmap: React.FC<{ data: ActivityPoint[] }> = ({ data }) => {
  // Render as 7xN weeks grid (group by weekday)
  if (!data?.length) return <Typography variant="caption" className="text-muted-foreground">No activity yet</Typography>;
  const values = data.map(d => d.value || 0);
  const max = Math.max(...values, 1);
  return (
    <div className="grid grid-cols-14 gap-1">
      {values.slice(-98).map((v, idx) => {
        const intensity = v / max;
        const alpha = 0.15 + 0.85 * intensity;
        return <div key={idx} className="w-3 h-3 rounded-sm" style={{ backgroundColor: `rgba(59,130,246,${alpha})` }} title={`${v} activity`} />;
      })}
    </div>
  );
};

const UserAnalyticsLayout: React.FC = () => {
  const [data, setData] = useState<UserAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<'1m' | '3m' | '6m' | '12m'>('3m');
  const { user } = useAuth();
  const displayName =
    (user as any)?.user?.name ||
    (user as any)?.user?.fullName ||
    (user as any)?.user?.username ||
    (user as any)?.user?.email ||
    'Your';

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    AnalyticsService
      .getUserAnalytics(range)
      .then(res => {
        if (!cancelled) setData(res || {});
      })
      .catch((e) => {
        console.error('Error fetching user analytics', e);
        if (!cancelled) setError(e?.response?.data?.message || e?.message || 'Failed to load analytics');
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [range]);

  const completed = data?.taskStatusBreakdown?.completed ?? data?.tasksCompleted ?? 0;
  const inProgress = data?.taskStatusBreakdown?.inProgress ?? 0;
  const pending = data?.taskStatusBreakdown?.pending ?? 0;
  const overdue = data?.taskStatusBreakdown?.overdue ?? 0;
  const totalTasksForPct = (completed + inProgress + pending + overdue) || data?.tasksAssigned || 0;

  const contributionsSeries = useMemo(() => fallbackArray(data?.contributionsOverTime).map(p => p.count), [data]);

  return (
    <DashboardShell title="My Analytics">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <Typography variant="h1" className="text-2xl font-bold">{displayName} Analytics</Typography>
          <Typography variant="caption" className="text-muted-foreground">Personal insights based on your activity</Typography>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as any)}
            className="px-3 py-2 rounded-md bg-background border border-border"
          >
            <option value="1m">Last Month</option>
            <option value="3m">Last 3 Months</option>
            <option value="6m">Last 6 Months</option>
            <option value="12m">Last Year</option>
          </select>
        </div>
      </div>

      {loading && (
        <Card>
          <CardContent className="py-10"><Typography>Loading analytics…</Typography></CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-destructive/40">
          <CardHeader><CardTitle>Error</CardTitle></CardHeader>
          <CardContent>
            <Typography className="text-destructive">{error}</Typography>
          </CardContent>
        </Card>
      )}

      {!loading && !error && (
        <div className="space-y-6">
          {/* Top Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="backdrop-blur-sm ring-1 ring-accent/10 border border-[hsl(var(--accent))]/20">
              <CardHeader className="pb-2 flex items-center justify-between">
                <CardTitle className="text-sm">Total Projects Created</CardTitle>
                <Folder className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Typography variant="h2" className="text-2xl font-bold">{data?.totalProjects ?? 0}</Typography>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm ring-1 ring-accent/10 border border-[hsl(var(--accent))]/20">
              <CardHeader className="pb-2 flex items-center justify-between">
                <CardTitle className="text-sm">Tasks Assigned</CardTitle>
                <ListChecks className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Typography variant="h2" className="text-2xl font-bold">{data?.tasksAssigned ?? totalTasksForPct}</Typography>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm ring-1 ring-accent/10 border border-[hsl(var(--accent))]/20">
              <CardHeader className="pb-2 flex items-center justify-between">
                <CardTitle className="text-sm">Tasks Completed</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <Typography variant="h2" className="text-2xl font-bold">{completed}</Typography>
                  <Typography variant="caption" className="text-muted-foreground">{pct(completed, totalTasksForPct)}%</Typography>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm ring-1 ring-accent/10 border border-[hsl(var(--accent))]/20">
              <CardHeader className="pb-2 flex items-center justify-between">
                <CardTitle className="text-sm">Last Active</CardTitle>
                <CalendarClock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Typography variant="h2" className="text-xl font-semibold">
                  {data?.lastActiveAt ? format(new Date(data.lastActiveAt), 'PP p') : '—'}
                </Typography>
              </CardContent>
            </Card>
          </div>

          {/* Charts & Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card className="lg:col-span-6 backdrop-blur-sm ring-1 ring-accent/10 border border-[hsl(var(--accent))]/20">
              <CardHeader>
                <CardTitle>Projects Created Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {fallbackArray(data?.projectsOverTime).length ? (
                    <div className="space-y-2">
                      {fallbackArray(data?.projectsOverTime).map((p, idx, arr) => {
                        const max = Math.max(...arr.map(a => a.count || 0), 1);
                        return (
                          <div key={idx} className="flex items-center gap-3">
                            <Typography variant="caption" className="w-24 text-muted-foreground">{p.month}</Typography>
                            <div className="flex-1 h-2 bg-muted rounded-full">
                              <div className="h-2 bg-primary rounded-full" style={{ width: `${(p.count / max) * 100}%` }} />
                            </div>
                            <Typography variant="caption" className="w-8 text-right">{p.count}</Typography>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <Typography variant="caption" className="text-muted-foreground">No data</Typography>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-6 backdrop-blur-sm ring-1 ring-accent/10 border border-[hsl(var(--accent))]/20">
              <CardHeader>
                <CardTitle>Task Completion Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <Donut completed={completed} inProgress={inProgress} pending={pending} overdue={overdue} />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#16a34a' }} />
                      <Typography variant="caption">Completed: {completed}</Typography>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#eab308' }} />
                      <Typography variant="caption">In Progress: {inProgress}</Typography>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#3b82f6' }} />
                      <Typography variant="caption">Pending: {pending}</Typography>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#ef4444' }} />
                      <Typography variant="caption">Overdue: {overdue}</Typography>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-7 backdrop-blur-sm ring-1 ring-accent/10 border border-[hsl(var(--accent))]/20">
              <CardHeader>
                <CardTitle>Activity Heatmap</CardTitle>
              </CardHeader>
              <CardContent>
                <Heatmap data={fallbackArray(data?.activityHeatmap)} />
              </CardContent>
            </Card>

            <Card className="lg:col-span-5 backdrop-blur-sm ring-1 ring-accent/10 border border-[hsl(var(--accent))]/20">
              <CardHeader>
                <CardTitle>User Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                {contributionsSeries.length ? (
                  <Sparkline points={contributionsSeries} />
                ) : (
                  <Typography variant="caption" className="text-muted-foreground">No contributions yet</Typography>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Tables / Lists */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="backdrop-blur-sm ring-1 ring-accent/10 border border-[hsl(var(--accent))]/20">
              <CardHeader>
                <CardTitle>Recent Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {fallbackArray(data?.recentProjects).slice(0, 5).map((p) => (
                    <div key={p.id} className="flex items-center justify-between border-b border-border/60 pb-2 last:border-b-0 last:pb-0">
                      <div>
                        <Typography className="font-medium">{p.name}</Typography>
                        <Typography variant="caption" className="text-muted-foreground">
                          {p.createdAt ? `Created ${format(new Date(p.createdAt), 'PP')}` : (p.role ? `Role: ${p.role}` : '—')}
                        </Typography>
                      </div>
                    </div>
                  ))}
                  {!fallbackArray(data?.recentProjects).length && (
                    <Typography variant="caption" className="text-muted-foreground">No recent projects</Typography>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm ring-1 ring-accent/10 border border-[hsl(var(--accent))]/20">
              <CardHeader>
                <CardTitle>Recent Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {fallbackArray(data?.recentTasks).slice(0, 5).map((t) => (
                    <div key={t.id} className="flex items-center justify-between border-b border-border/60 pb-2 last:border-b-0 last:pb-0">
                      <div>
                        <Typography className="font-medium">{t.title}</Typography>
                        <Typography variant="caption" className="text-muted-foreground">{t.status}</Typography>
                      </div>
                      <Typography variant="caption" className="text-muted-foreground">{t.updatedAt ? format(new Date(t.updatedAt), 'PP') : ''}</Typography>
                    </div>
                  ))}
                  {!fallbackArray(data?.recentTasks).length && (
                    <Typography variant="caption" className="text-muted-foreground">No recent tasks</Typography>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Optional Collaborations */}
          {fallbackArray(data?.collaborators).length > 0 && (
            <Card className="backdrop-blur-sm ring-1 ring-accent/10 border border-[hsl(var(--accent))]/20">
              <CardHeader>
                <CardTitle>Top Collaborations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {fallbackArray(data?.collaborators).slice(0, 6).map((c) => (
                    <div key={c.id} className="flex items-center gap-3 p-3 rounded-md border border-border/60">
                      <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                        <Users className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <Typography className="font-medium">{c.name}</Typography>
                        {typeof c.interactions === 'number' && (
                          <Typography variant="caption" className="text-muted-foreground">{c.interactions} interactions</Typography>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </DashboardShell>
  );
};

export default UserAnalyticsLayout;
