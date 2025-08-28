import React, { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../store";
import { setCurrentWorkspaceId } from "../../store/slices/workspaceSlice";
import { fetchWorkspace } from "../../store/slices/workspaceSlice";
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
import { useState } from "react";
import { useWorkspaces } from "../../hooks/useWorkspaces";
import DeleteWorkspaceModal from "../../components/dashboard/home/modals/DeleteWorkspaceModal";
import { Users, Clock, Folder, ArrowRight, Plus, Trash } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const WorkspacesLayout: React.FC = () => {
  const { workspaces, loading, error } = useWorkspaces();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<{ id: string; name?: string } | null>(null);

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
            <Button
              onClick={() => navigate("/dashboard/workspaces/new")}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Workspace
            </Button>
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
                                {ws?.name}
                              </Typography>
                            </div>
                            {/* Visibility badge */}
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
                              {/* Status badge */}
                              <Badge
                                variant="secondary"
                                className={(ws?.status ?? (ws?.isActive === false ? 'archived' : 'active')) === 'archived'
                                  ? 'bg-red-50 text-red-700 border border-red-200'
                                  : 'bg-green-50 text-green-700 border border-green-200'}
                                title={`Workspace status: ${ws?.status ?? (ws?.isActive === false ? 'archived' : 'active')}`}
                              >
                                {ws?.status ?? (ws?.isActive === false ? 'archived' : 'active')}
                              </Badge>
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
