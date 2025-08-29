import { Card, CardHeader, CardTitle, CardContent, Typography, Button, Badge, EmptyState, Skeleton } from "@taskflow/ui";
import { Plus, Users, Trash, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../store";
import { setCurrentWorkspaceId, fetchWorkspaces } from "../../../store/slices/workspaceSlice";
import { useMemo, useState, useEffect } from "react";
import { CreateWorkspaceModal } from "../../../components/dashboard/home/modals/CreateWorkspaceModal";
import DeleteWorkspaceModal from "../../../components/dashboard/home/modals/DeleteWorkspaceModal";
import { useWorkspaces } from "../../../hooks/useWorkspaces";
import { fetchWorkspace } from "../../../store/slices/workspaceSlice";

export const WorkspacesSection = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { workspaces, loading, error } = useWorkspaces();
  const { user } = useAppSelector((s) => s.auth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<{ id: string; name?: string } | null>(null);

  // Notification helper
  const notifyPush = (title: string, body?: string) => {
    try {
      if (typeof window === 'undefined' || !('Notification' in window)) return;
      if (Notification.permission === 'granted') {
        new Notification(title, { body });
      }
    } catch (_) { /* noop */ }
  };

  // Ask for permission once when section mounts
  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  const handleWorkspaceClick = (workspaceId: string) => {
    dispatch(setCurrentWorkspaceId(workspaceId));
    dispatch(fetchWorkspace(workspaceId));
    navigate(`/workspace?id=${workspaceId}`);
    const ws = workspaces.find(w => (w as any)?._id === workspaceId);
    notifyPush('Workspace opened', (ws as any)?.name || workspaceId);
  };

  const sortedWorkspaces = useMemo(() => {
    const userId = user?.user?._id || user?.user?._id;
    // console.log("userId", userId);
    // console.log("workspaces", workspaces);
    // Show all workspaces (no membership filtering), sorted by updatedAt/createdAt desc
    return [...workspaces]
      .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
  }, [workspaces, user]);

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
      <Card className="backdrop-blur-sm ring-1 ring-accent/10 border border-[hsl(var(--accent))]/20 shadow-[0_0_16px_hsl(var(--accent)/0.12)]">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <CardTitle>Your Workspaces</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setIsModalOpen(true); notifyPush('Create workspace', 'Opening create workspace modal'); }}
              className="ml-2 flex items-center gap-2 border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-foreground/40"
            >
              <Plus className="h-4 w-4" />
              <span>New Workspace</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
            </div>
          ) : error ? (
            <EmptyState
              icon={<Users className="h-8 w-8 text-destructive" />}
              title="Error loading workspaces"
              description={error}
            />
          ) : sortedWorkspaces.length > 0 ? (
            <div className="space-y-4">
              <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
                {sortedWorkspaces.slice(0, 3).map(ws => (
                <div
                  key={ws._id}
                  className="relative overflow-hidden group border rounded-lg p-4 cursor-pointer flex flex-col justify-between ring-1 ring-accent/10 border-[hsl(var(--accent))]/20 shadow-[0_0_12px_hsl(var(--accent)/0.10)] hover:shadow-[0_0_26px_hsl(var(--accent)/0.22)] transition-all"
                  onClick={() => handleWorkspaceClick(ws._id)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <Typography variant="body-medium" className="font-medium truncate max-w-full sm:max-w-[60%]" title={ws.name}>
                      {ws.name}
                    </Typography>
                    <div className="flex items-center flex-wrap gap-2">
                      {/* Visibility badge */}
                      <Badge
                        variant="secondary"
                        className={(ws?.isPublic === true || ws?.visibility === 'public')
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-muted text-foreground/80 border border-border'}
                        title={(ws?.isPublic === true || ws?.visibility === 'public') ? 'Public workspace' : 'Private workspace'}
                      >
                        {(ws?.isPublic === true || ws?.visibility === 'public') ? 'Public' : 'Private'}
                      </Badge>
                      {/* Status badge */}
                      <Badge
                        variant="secondary"
                        className={(ws?.status ?? (ws?.isActive === false ? 'archived' : 'active')) === 'archived'
                          ? 'bg-red-700 text-red-50 border border-red-700'
                          : 'bg-green-700 text-green-50 border border-green-700'}
                        title={`Workspace status: ${ws?.status ?? (ws?.isActive === false ? 'archived' : 'active')}`}
                      >
                        {ws?.status ?? (ws?.isActive === false ? 'archived' : 'active')}
                      </Badge>
                      {/* Deletion countdown when archived */}
                      {ws?.status === 'archived' && ws?.archiveExpiresAt && (
                        <Badge
                          variant="secondary"
                          className={getCountdownClasses(ws.archiveExpiresAt)}
                          title={`Permanent deletion on ${new Date(ws.archiveExpiresAt).toLocaleString()}`}
                        >
                          <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
                          Deletes in {formatRemaining(ws.archiveExpiresAt)}
                        </Badge>
                      )}
                      <Badge variant="secondary">{ws.members?.length || 0} members</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                        onClick={(e) => { e.stopPropagation(); setToDelete({ id: ws._id, name: ws.name }); setIsDeleteOpen(true); notifyPush('Delete requested', ws.name); }}
                        title="Delete workspace"
                        aria-label="Delete workspace"
                      >
                        <Trash className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                  <Typography variant="caption" className="text-muted-foreground break-words line-clamp-2" title={ws.description || "No description"}>
                    {ws.description || "No description"}
                  </Typography>
                  <Typography variant="caption" className="text-muted-foreground mt-1">
                    Created: {new Date(ws.createdAt).toLocaleString()}
                  </Typography>
                </div>
              ))}
              </div>
              {sortedWorkspaces.length > 3 && (
                <div className="flex justify-center pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/dashboard/workspaces')}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    View all {sortedWorkspaces.length} workspaces →
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              icon={<Users className="h-8 w-8" />}
              title="No workspaces yet"
              description="Create your first workspace to get started with team collaboration."
              action={{ label: "Create Workspace", onClick: () => { setIsModalOpen(true); notifyPush('Create workspace', 'Opening create workspace modal'); }, variant: "default" }}
            />
          )}
        </CardContent>
      </Card>

      <CreateWorkspaceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <DeleteWorkspaceModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        workspaceId={toDelete?.id || ''}
        workspaceName={toDelete?.name}
      />
    </>
  );
};
