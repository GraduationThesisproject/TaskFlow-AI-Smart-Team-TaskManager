import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../store";
import { setCurrentWorkspaceId, fetchWorkspace } from "../../store/slices/workspaceSlice";
import { DashboardShell } from "./DashboardShell";
import { 
  Typography, 
  Skeleton, 
  EmptyState, 
  Card, 
  CardContent, 
  Badge, 
  Button, 
  Avatar,
  AvatarFallback,
  AvatarImage
} from "@taskflow/ui";
import { useWorkspaces } from "../../hooks/useWorkspaces";
import DeleteWorkspaceModal from "../../components/dashboard/home/modals/DeleteWorkspaceModal";
import { Users, Clock, Folder, Trash, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useSocket } from "../../hooks/socket/useSocket";
import { env } from "../../config/env";

const WorkspacesLayout: React.FC = () => {
  const { workspaces, loading, error } = useWorkspaces();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<{ id: string; name?: string } | null>(null);

  // Socket: connect and join all workspace rooms for real-time status updates
  const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || '') : '';
  const { on, off, emit, isConnected, error: socketError } = useSocket({
    url: env.SOCKET_URL,
    // Only auto-connect when we actually have a token
    autoConnect: !!token,
    auth: { token }
  });

  // Debug: warn if there is no token (socket will not auto-connect)
  useEffect(() => {
    if (!token) {
      console.warn('[Workspaces] No JWT token found in localStorage. Socket will not connect.');
    }
  }, [token]);

  // Debug: surface hook-level socket error state
  useEffect(() => {
    if (socketError) {
      console.error('[Workspaces] Socket error:', socketError);
    }
  }, [socketError]);

  // Debug: capture low-level connect errors from socket.io
  useEffect(() => {
    const onConnectError = (err: any) => {
      console.error('[Workspaces] connect_error:', err?.message || err);
    };
    on('connect_error', onConnectError);
    return () => {
      off('connect_error');
    };
  }, [on, off]);

  // Join rooms for each workspace in the list
  useEffect(() => {
    if (!isConnected) return;
    const ids = (workspaces || []).map((w: any) => w?._id || w?.id).filter(Boolean);
    if (ids.length === 0) return;
    ids.forEach((id) => emit('workspace:join', { workspaceId: id }));
    return () => {
      ids.forEach((id) => emit('workspace:leave', { workspaceId: id }));
    };
  }, [isConnected, workspaces, emit]);

  // Listen for status changes and refresh the list
  useEffect(() => {
    const handler = (_payload: any) => {
      // Lightweight refresh to update badges instantly
      import('../../store/slices/workspaceSlice').then(({ fetchWorkspaces }) => {
        dispatch(fetchWorkspaces() as any);
      });
    };
    if (isConnected) on('workspace:status-changed', handler);
    return () => {
      off('workspace:status-changed');
    };
  }, [isConnected, on, off, dispatch]);

  // Live ticking timestamp for countdowns
  const [now, setNow] = useState<number>(Date.now());
  const hasAnyArchived = useMemo(() => (workspaces || []).some((w: any) => (w?.status === 'archived') && (w?.archiveExpiresAt)), [workspaces]);
  useEffect(() => {
    if (!hasAnyArchived) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [hasAnyArchived]);

  // Notification helper
  const notifyPush = (title: string, body?: string) => {
    try {
      if (typeof window === 'undefined' || !('Notification' in window)) return;
      if (Notification.permission === 'granted') {
        new Notification(title, { body });
      }
    } catch (_) { /* noop */ }
  };

  // Ask for permission once when layout mounts
  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

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

  // Compute severity-based classes for the deletion countdown
  const getCountdownClasses = (endISO?: string) => {
    if (!endISO) return '';
    const end = new Date(endISO).getTime();
    const diffMs = Math.max(0, end - now);
    const hours = diffMs / (1000 * 60 * 60);
    if (hours <= 1) return 'bg-red-700 text-red-50 border border-red-700 animate-pulse';
    if (hours <= 24) return 'bg-amber-600 text-amber-50 border border-amber-600';
    return 'bg-amber-50 text-amber-700 border border-amber-200';
  };

  const sortedWorkspaces = useMemo(() => {
    return [...(workspaces || [])].sort(
      (a: any, b: any) =>
        new Date(b?.updatedAt || b?.createdAt).getTime() -
        new Date(a?.updatedAt || a?.createdAt).getTime()
    );
  }, [workspaces]);

  const getInitials = (name: string = "") => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Truncate helper: keeps UI neat while tooltip shows full value
  const truncate = (s?: string, n: number = 10) => {
    if (!s) return "";
    return s.length > n ? `${s.slice(0, n)}…` : s;
  };

  return (
    <DashboardShell>
      <div className="flex flex-col space-y-6 h-full">
        {/* Header */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <Typography
                variant="h1"
                className="font-extrabold text-3xl md:text-4xl tracking-tight"
              >
                Your Workspaces
              </Typography>
              <Typography
                variant="body-medium"
                className="text-muted-foreground mt-1"
              >
                Manage and access all your workspaces in one place
              </Typography>
            </div>
          </div>
        </div>

        {/* Workspaces List */}
        <Card className="backdrop-blur-sm ring-1 ring-accent/10 border border-[hsl(var(--accent))]/20 shadow-[0_0_16px_hsl(var(--accent)/0.12)] h-full">
          <CardContent className="pt-6 h-full overflow-hidden flex flex-col">
            <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-48 rounded-xl" />
                ))}
              </div>
            ) : error ? (
              <EmptyState
                icon={<Folder className="h-10 w-10 text-destructive" />}
                title="Error loading workspaces"
                description={error}
              />
            ) : sortedWorkspaces.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {sortedWorkspaces.map((ws: any) => (
                  <div
                    key={ws?._id}
                    onClick={() => {
                      dispatch(setCurrentWorkspaceId(ws?._id));
                      dispatch(fetchWorkspace(ws?._id));
                      navigate(`/workspace?id=${ws?._id}`);
                      notifyPush('Workspace opened', ws?.name);
                    }}
                    className="group relative border rounded-xl p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-accent/50 hover:ring-2 hover:ring-accent/20 bg-card/50 backdrop-blur-sm"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3" onClick={(e) => {
                        e.stopPropagation();
                        dispatch(setCurrentWorkspaceId(ws?._id));
                        dispatch(fetchWorkspace(ws?._id));
                        navigate(`/workspace?id=${ws?._id}`);
                      }}>
                        <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-accent/10 text-accent font-bold text-lg">
                          {getInitials(ws?.name)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <Typography
                                variant="body-large"
                                className="font-semibold group-hover:text-accent transition-colors"
                                title={ws?.name}
                              >
                                {truncate(ws?.name, 10)}
                              </Typography>
                            </div>
                            {/* Visibility + Status + Countdown */}
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="secondary"
                                className={(ws?.isPublic === true || ws?.visibility === 'public')
                                  ? 'bg-green-50 text-green-700 border border-green-200'
                                  : 'bg-muted text-foreground/80 border border-border'}
                                title={(ws?.isPublic === true || ws?.visibility === 'public') ? 'Public workspace' : 'Private workspace'}
                              >
                                {(ws?.isPublic === true || ws?.visibility === 'public') ? 'Public' : 'Private'}
                              </Badge>
                              <Badge
                                variant="secondary"
                                className={(ws?.status ?? (ws?.isActive === false ? 'archived' : 'active')) === 'archived'
                                  ? 'bg-red-700 text-red-50 border border-red-700'
                                  : 'bg-green-700 text-green-50 border border-green-700'}
                                title={`Workspace status: ${ws?.status ?? (ws?.isActive === false ? 'archived' : 'active')}`}
                              >
                                {ws?.status ?? (ws?.isActive === false ? 'archived' : 'active')}
                              </Badge>
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
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          setToDelete({ id: ws?._id, name: ws?.name });
                          setIsDeleteOpen(true);
                          notifyPush('Delete requested', ws?.name);
                        }}
                        title="Delete workspace"
                      >
                        <Trash className="h-5 w-5" />
                      </Button>
                    </div>

                    <Typography
                      variant="body-small"
                      className="text-muted-foreground line-clamp-2 mb-4 min-h-[2.5rem]"
                    >
                      {ws?.description || "No description provided"}
                    </Typography>

                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <Typography
                          variant="body-small"
                          className="text-muted-foreground"
                        >
                          {ws?.members?.length || 0} members
                        </Typography>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <Typography
                          variant="body-small"
                          className="text-muted-foreground"
                        >
                          {ws?.updatedAt || ws?.createdAt
                            ? formatDistanceToNow(
                                new Date(ws?.updatedAt || ws?.createdAt),
                                { addSuffix: true }
                              )
                            : "N/A"}
                        </Typography>
                      </div>
                    </div>

                    {/* Members Avatars */}
                    <div className="absolute bottom-4 right-4 flex -space-x-2">
                      {ws?.members?.slice(0, 3).map((member: any, idx: number) => (
                        <Avatar
                          key={member?._id || idx}
                          className="h-6 w-6 border-2 border-background"
                        >
                          <AvatarImage src={member?.avatar} alt={member?.name} />
                          <AvatarFallback className="text-xs">
                            {member?.name ? getInitials(member?.name) : "U"}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {ws?.members?.length > 3 && (
                        <div className="h-6 w-6 rounded-full bg-muted text-xs flex items-center justify-center border-2 border-background">
                          +{ws?.members?.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Folder className="h-10 w-10" />}
                title="No workspaces found"
                description="Create your first workspace to get started"
                action={{
                  label: "Create Workspace",
                  onClick: () => navigate("/dashboard/workspaces/new"),
                  variant: "default",
                }}
              />
            )}
            </div>
          </CardContent>
        </Card>
      </div> {/* ✅ closing flex-col wrapper */}
      
      {toDelete && (
        <DeleteWorkspaceModal
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          workspaceId={toDelete.id}
          workspaceName={toDelete.name}
        />
      )}
    </DashboardShell>
  );
};


export default WorkspacesLayout;
