import { Card, CardHeader, CardTitle, CardContent, Typography, Button, Badge, EmptyState, Skeleton } from "@taskflow/ui";
import { Plus, Users, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../store";
import { setCurrentWorkspaceId } from "../../../store/slices/workspaceSlice";
import { useMemo, useState } from "react";
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

  const handleWorkspaceClick = (workspaceId: string) => {
    dispatch(setCurrentWorkspaceId(workspaceId));
    dispatch(fetchWorkspace(workspaceId));
    navigate(`/workspace?id=${workspaceId}`);

  };

  const sortedWorkspaces = useMemo(() => {
    const userId = user?.user?._id || user?.user?._id;
    // console.log("userId", userId);
    // console.log("workspaces", workspaces);
    // Show all workspaces (no membership filtering), sorted by updatedAt/createdAt desc
    return [...workspaces]
      .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
  }, [workspaces, user]);

  return (
    <>
      <Card className="backdrop-blur-sm ring-1 ring-accent/10 border border-[hsl(var(--accent))]/20 shadow-[0_0_16px_hsl(var(--accent)/0.12)]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Your Workspaces</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(true)}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sortedWorkspaces.slice(0, 4).map(ws => (
                <div
                  key={ws._id}
                  className="relative overflow-hidden group border rounded-lg p-4 cursor-pointer flex flex-col justify-between ring-1 ring-accent/10 border-[hsl(var(--accent))]/20 shadow-[0_0_12px_hsl(var(--accent)/0.10)] hover:shadow-[0_0_26px_hsl(var(--accent)/0.22)] transition-all"
                  onClick={() => handleWorkspaceClick(ws._id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Typography variant="body-medium" className="font-medium truncate max-w-[70%]" title={ws.name}>
                      {ws.name}
                    </Typography>
                    <div className="flex items-center gap-2">
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
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-green-50 text-green-700 border border-green-200'}
                        title={`Workspace status: ${ws?.status ?? (ws?.isActive === false ? 'archived' : 'active')}`}
                      >
                        {ws?.status ?? (ws?.isActive === false ? 'archived' : 'active')}
                      </Badge>
                      <Badge variant="secondary">{ws.members?.length || 0} members</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); setToDelete({ id: ws._id, name: ws.name }); setIsDeleteOpen(true); }}
                        title="Delete workspace"
                      >
                        <Trash className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <Typography variant="caption" className="text-muted-foreground break-words max-h-[3rem] overflow-hidden" title={ws.description || "No description"}>
                    {ws.description || "No description"}
                  </Typography>
                  <Typography variant="caption" className="text-muted-foreground mt-1">
                    Created: {new Date(ws.createdAt).toLocaleString()}
                  </Typography>
                </div>
              ))}
              </div>
              {sortedWorkspaces.length > 4 && (
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
              action={{ label: "Create Workspace", onClick: () => setIsModalOpen(true), variant: "default" }}
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
