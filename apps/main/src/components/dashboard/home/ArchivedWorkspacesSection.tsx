import { Card, CardHeader, CardTitle, CardContent, Typography, Button, Badge, EmptyState, Skeleton, AvatarWithFallback } from "@taskflow/ui";
import { ArchiveRestore, Trash, AlertTriangle, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import { useWorkspace } from "../../../hooks/useWorkspace";

interface ArchivedWorkspacesSectionProps {
  viewMode?: 'cards' | 'list' | 'list-detail';
}

export const ArchivedWorkspacesSection = ({ viewMode = 'cards' }: ArchivedWorkspacesSectionProps) => {
  const navigate = useNavigate();
  const { 
    archivedWorkspaces,
    loading, 
    error, 
    restoreWorkspaceById,
    permanentDeleteWorkspaceById,
  } = useWorkspace({ includeArchived: true });

  const handleRestoreWorkspace = async (workspaceId: string) => {
    try {
      await restoreWorkspaceById(workspaceId);
    } catch (error) {
      console.error('Failed to restore workspace:', error);
    }
  };

  const handlePermanentDelete = async (workspaceId: string) => {
    try {
      await permanentDeleteWorkspaceById(workspaceId);
    } catch (error) {
      console.error('Failed to permanently delete workspace:', error);
    }
  };

  // Live ticking timestamp for countdown
  const hasAnyArchived = useMemo(() => (archivedWorkspaces || []).some((w: any) => w?.archiveExpiresAt), [archivedWorkspaces]);
  const [now, setNow] = useState<number>(Date.now());
  useEffect(() => {
    if (!hasAnyArchived) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [hasAnyArchived]);

  const formatRemaining = (endISO?: string) => {
    if (!endISO) return '';
    const end = new Date(endISO).getTime();
    const diffMs = Math.max(0, end - now);
    const sec = Math.floor(diffMs / 1000);
    const d = Math.floor(sec / 86400);
    const h = Math.floor((sec % 86400) / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (d > 0) return `${d}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const getCountdownClasses = (endISO?: string) => {
    if (!endISO) return '';
    const end = new Date(endISO).getTime();
    const diffMs = Math.max(0, end - now);
    const hours = diffMs / (1000 * 60 * 60);
    if (hours <= 1) return 'bg-red-700 text-red-50 border border-red-700 animate-pulse';
    if (hours <= 24) return 'bg-amber-600 text-amber-50 border border-amber-600';
    return 'bg-amber-50 text-amber-700 border border-amber-200';
  };

  return (
    <Card className="backdrop-blur-sm ring-1 ring-accent/10 border border-[hsl(var(--accent))]/20 shadow-[0_0_8px_hsl(var(--accent)/0.08)]" size="full">
      <CardHeader>
        <CardTitle className="text-sm">Archived Workspaces</CardTitle>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-14 w-full rounded-md" />)}
          </div>
        ) : error ? (
          <EmptyState
            icon={<Users className="h-5 w-5 text-destructive" />}
            title="Error loading archived workspaces"
            description={error}
          />
        ) : archivedWorkspaces.length > 0 ? (
          <div className="space-y-2">
            {viewMode === 'cards' && (
              <div className="grid gap-3 grid-cols-4">
                {archivedWorkspaces.map((ws: any) => (
                  <div
                    key={ws._id}
                    className="relative overflow-hidden group border rounded-md p-3 cursor-pointer flex flex-col ring-1 ring-accent/10 border-[hsl(var(--accent))]/20 shadow-[0_0_8px_hsl(var(--accent)/0.06)] hover:shadow-[0_0_16px_hsl(var(--accent)/0.12)] transition-all"
                  >
                    {/* Header with avatar, name and action buttons */}
                    <div className="flex items-start gap-3 mb-3">
                      <AvatarWithFallback
                        src={ws.avatar}
                        alt={ws.name}
                        size="sm"
                        variant="rounded"
                        className="border border-border/50 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <Typography variant="body-medium" className="font-medium text-sm text-foreground truncate" title={ws.name}>
                          {ws.name}
                        </Typography>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-green-600 hover:bg-green-50 h-6 w-6 p-0 -mt-1 -mr-1 flex-shrink-0"
                          onClick={(e) => { e.stopPropagation(); handleRestoreWorkspace(ws._id); }}
                          title="Restore workspace"
                          aria-label="Restore workspace"
                        >
                          <ArchiveRestore className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10 h-6 w-6 p-0 -mt-1 -mr-1 flex-shrink-0"
                          onClick={(e) => { e.stopPropagation(); handlePermanentDelete(ws._id); }}
                          title="Delete permanently"
                          aria-label="Delete permanently"
                        >
                          <Trash className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Badges row */}
                    <div className="flex items-center flex-wrap gap-2 mb-3">
                      <Badge
                        variant="secondary"
                        className="bg-red-700 text-red-50 border border-red-700 text-xs px-2 py-1"
                        title="Archived workspace"
                      >
                        Archived
                      </Badge>
                      {ws?.archiveExpiresAt && (
                        <Badge
                          variant="secondary"
                          className={getCountdownClasses(ws.archiveExpiresAt) + ' text-xs px-2 py-1'}
                          title={`Permanent deletion on ${new Date(ws.archiveExpiresAt).toLocaleString()}`}
                        >
                          <AlertTriangle className="h-2.5 w-2.5 mr-1" />
                          Deletes in {formatRemaining(ws.archiveExpiresAt)}
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-xs px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200">
                        {ws.members?.length || 0} members
                      </Badge>
                    </div>

                    {/* Footer with creation date */}
                    <div className="mt-auto">
                      <Typography variant="caption" className="text-muted-foreground text-xs">
                        Created {new Date(ws.createdAt).toLocaleDateString()}
                      </Typography>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {viewMode === 'list' && (
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                  {archivedWorkspaces.map((ws: any) => (
                    <div
                      key={ws._id}
                      className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <AvatarWithFallback
                            src={ws.avatar}
                            alt={ws.name}
                            size="sm"
                            variant="rounded"
                            className="border border-border/50 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <Typography variant="body-medium" className="font-medium text-sm text-foreground truncate" title={ws.name}>
                              {ws.name}
                            </Typography>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge
                                variant="secondary"
                                className="bg-red-700 text-red-50 border border-red-700 text-xs px-2 py-1"
                              >
                                Archived
                              </Badge>
                              {ws?.archiveExpiresAt && (
                                <Badge
                                  variant="secondary"
                                  className={getCountdownClasses(ws.archiveExpiresAt) + ' text-xs px-2 py-1'}
                                >
                                  <AlertTriangle className="h-2.5 w-2.5 mr-1" />
                                  Deletes in {formatRemaining(ws.archiveExpiresAt)}
                                </Badge>
                              )}
                              <Badge variant="secondary" className="text-xs px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200">
                                {ws.members?.length || 0} members
                              </Badge>
                            </div>
                          </div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            Created {new Date(ws.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:bg-green-50 h-6 w-6 p-0"
                            onClick={(e) => { e.stopPropagation(); handleRestoreWorkspace(ws._id); }}
                            title="Restore workspace"
                            aria-label="Restore workspace"
                          >
                            <ArchiveRestore className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10 h-6 w-6 p-0"
                            onClick={(e) => { e.stopPropagation(); handlePermanentDelete(ws._id); }}
                            title="Delete permanently"
                            aria-label="Delete permanently"
                          >
                            <Trash className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {viewMode === 'list-detail' && (
              <div className="space-y-4">
                {archivedWorkspaces.map((ws: any) => (
                  <div
                    key={ws._id}
                    className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow duration-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          <AvatarWithFallback
                            src={ws.avatar}
                            alt={ws.name}
                            size="md"
                            variant="rounded"
                            className="border border-border/50 flex-shrink-0"
                          />
                          <div>
                            <Typography variant="body-large" className="font-semibold text-foreground text-lg">
                              {ws.name}
                            </Typography>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge
                                variant="secondary"
                                className="bg-red-700 text-red-50 border border-red-700 text-xs px-2 py-1"
                              >
                                Archived
                              </Badge>
                              {ws?.archiveExpiresAt && (
                                <Badge
                                  variant="secondary"
                                  className={getCountdownClasses(ws.archiveExpiresAt) + ' text-xs px-2 py-1'}
                                >
                                  <AlertTriangle className="h-2.5 w-2.5 mr-1" />
                                  Deletes in {formatRemaining(ws.archiveExpiresAt)}
                                </Badge>
                              )}
                              <Badge variant="secondary" className="text-xs px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200">
                                {ws.members?.length || 0} members
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Created {new Date(ws.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-600 hover:bg-green-50 h-6 w-6 p-0"
                          onClick={(e) => { e.stopPropagation(); handleRestoreWorkspace(ws._id); }}
                          title="Restore workspace"
                          aria-label="Restore workspace"
                        >
                          <ArchiveRestore className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10 h-6 w-6 p-0"
                          onClick={(e) => { e.stopPropagation(); handlePermanentDelete(ws._id); }}
                          title="Delete permanently"
                          aria-label="Delete permanently"
                        >
                          <Trash className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <EmptyState
            icon={<Users className="h-5 w-5" />}
            title="No archived workspaces"
            description="Workspaces you archive will appear here."
          />
        )}
      </CardContent>
    </Card>
  );
};
