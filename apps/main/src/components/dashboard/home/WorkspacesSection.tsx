import { Card, CardHeader, CardTitle, CardContent, Typography, Button, Badge, EmptyState, Skeleton, Input, AvatarWithFallback } from "@taskflow/ui";
import { Plus, Users, Trash, AlertTriangle, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import { DeleteWorkspaceModal } from "../../../components/dashboard/home/modals/DeleteWorkspaceModal";
import { useWorkspace } from "../../../hooks/useWorkspace";

export const WorkspacesSection = () => {
  const navigate = useNavigate();
  const { 
    workspaces, 
    loading, 
    error, 
    sortedWorkspaces,
    navigateToWorkspace,
    createNewWorkspace,
  } = useWorkspace({ includeArchived: false });

  const [isCreating, setIsCreating] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<{ id: string; name?: string } | null>(null);



  // Ask for permission once when section mounts
  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  const handleWorkspaceClick = (workspaceId: string) => {
    // Set the workspace in Redux state first
    navigateToWorkspace(workspaceId);
    // Navigate to workspace without query parameters
    navigate('/workspace');
  };

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) return;
    
    try {
      await createNewWorkspace({
        name: newWorkspaceName.trim(),
        description: '',
        visibility: 'private'
      });
      setNewWorkspaceName('');
      setIsCreating(false);
    } catch (error) {
      console.error('Failed to create workspace:', error);
    }
  };

  const handleCancelCreate = () => {
    setNewWorkspaceName('');
    setIsCreating(false);
  };

  // Live ticking timestamp only when needed (archived with expiry)
  const hasAnyArchived = useMemo(() => (workspaces || []).some((w: any) => w?.status === 'archived' && w?.archiveExpiresAt), [workspaces]);
  const [now, setNow] = useState<number>(Date.now());
  useEffect(() => {
    if (!hasAnyArchived) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [hasAnyArchived]);

  // Helpers for countdown styling and text (reuse logic from layout)
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
    <>
      <Card className="backdrop-blur-sm ring-1 ring-accent/10 border border-[hsl(var(--accent))]/20 shadow-[0_0_8px_hsl(var(--accent)/0.08)]" size="full">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <CardTitle className="text-sm">Your Workspaces</CardTitle>
            {!isCreating ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreating(true)}
                className="ml-2 flex items-center gap-1.5 border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-foreground/40 h-7 px-2 transition-all duration-200 hover:scale-105"
              >
                <Plus className="h-3 w-3" />
                <span className="text-xs">New Workspace</span>
              </Button>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Enter workspace name..."
                    value={newWorkspaceName}
                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateWorkspace();
                      if (e.key === 'Escape') handleCancelCreate();
                    }}
                    className="h-7 w-48 text-xs border-dashed border-2 border-accent/30 focus:border-accent/60 focus:ring-1 focus:ring-accent/20 transition-all duration-200"
                    autoFocus
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCreateWorkspace}
                  disabled={!newWorkspaceName.trim()}
                  className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 transition-all duration-200"
                  title="Create workspace"
                >
                  <Check className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelCreate}
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
                  title="Cancel"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-14 w-full rounded-md" />)}
            </div>
          ) : error ? (
            <EmptyState
              icon={<Users className="h-5 w-5 text-destructive" />}
              title="Error loading workspaces"
              description={error}
            />
          ) : sortedWorkspaces.length > 0 ? (
            <div className="space-y-2">
              <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
                {sortedWorkspaces.slice(0, 3).map((ws: any) => (
                <div
                  key={ws._id}
                  className="relative overflow-hidden group border rounded-md p-3 cursor-pointer flex flex-col ring-1 ring-accent/10 border-[hsl(var(--accent))]/20 shadow-[0_0_8px_hsl(var(--accent)/0.06)] hover:shadow-[0_0_16px_hsl(var(--accent)/0.12)] transition-all"
                  onClick={() => handleWorkspaceClick(ws._id)}
                >
                  {/* Header with avatar, name and delete button */}
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
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10 h-6 w-6 p-0 -mt-1 -mr-1 flex-shrink-0"
                      onClick={(e) => { e.stopPropagation(); setToDelete({ id: ws._id, name: ws.name }); setIsDeleteOpen(true);  }}
                      title="Delete workspace"
                      aria-label="Delete workspace"
                    >
                      <Trash className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  {/* Badges row */}
                  <div className="flex items-center flex-wrap gap-2 mb-3">
                      {/* Visibility badge */}
                      <Badge
                        variant="secondary"
                        className={ws?.isPublic === true
                          ? 'bg-green-50 text-green-700 border border-green-200 text-xs px-2 py-1'
                          : 'bg-muted text-foreground/80 border border-border text-xs px-2 py-1'}
                        title={ws?.isPublic === true ? 'Public workspace' : 'Private workspace'}
                      >
                        {ws?.isPublic === true ? 'Public' : 'Private'}
                      </Badge>
                      {/* Status badge */}
                      <Badge
                        variant="secondary"
                        className={(ws?.status ?? (ws?.isActive === false ? 'archived' : 'active')) === 'archived'
                          ? 'bg-red-700 text-red-50 border border-red-700 text-xs px-2 py-1'
                          : 'bg-green-700 text-green-50 border border-green-700 text-xs px-2 py-1'}
                        title={`Workspace status: ${ws?.status ?? (ws?.isActive === false ? 'archived' : 'active')}`}
                      >
                        {ws?.status ?? (ws?.isActive === false ? 'archived' : 'active')}
                      </Badge>
                      {/* Deletion countdown when archived */}
                      {ws?.status === 'archived' && ws?.archiveExpiresAt && (
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

            </div>
          ) : (
            <EmptyState
              icon={<Users className="h-5 w-5" />}
              title="No workspaces yet"
              description="Create your first workspace to get started with team collaboration."
              action={{ label: "Create Workspace", onClick: () => setIsCreating(true), variant: "default" }}
            />
          )}
        </CardContent>
      </Card>

      <DeleteWorkspaceModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        workspaceId={toDelete?.id || ''}
        workspaceName={toDelete?.name}
      />
    </>
  );
};
