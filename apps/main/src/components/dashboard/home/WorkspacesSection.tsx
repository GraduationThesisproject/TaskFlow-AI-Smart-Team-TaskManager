import { Card, CardHeader, CardTitle, CardContent, Typography, Button, Badge, EmptyState, Skeleton, Gradient } from "@taskflow/ui";
import { Plus, Users, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../../store";
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<{ id: string; name?: string } | null>(null);

  const handleWorkspaceClick = (workspaceId: string) => {
    dispatch(setCurrentWorkspaceId(workspaceId));
    dispatch(fetchWorkspace(workspaceId));
    navigate(`/workspace?id=${workspaceId}`);

  };

  const recentWorkspaces = useMemo(() => {
    return [...workspaces]
      .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
      .slice(0, 4);
  }, [workspaces]);

  return (
    <>
      <Card className="backdrop-blur-sm ring-1 ring-accent/10 border border-[hsl(var(--accent))]/20 shadow-[0_0_16px_hsl(var(--accent)/0.12)]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Your Workspaces</CardTitle>
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className={`relative overflow-hidden group rounded-md transition-all
                shadow-[0_0_18px_hsl(var(--accent)/0.55)] hover:shadow-[0_0_32px_hsl(var(--accent)/0.75)]
                ring-1 ring-[hsl(var(--accent))/0.6] border border-[hsl(var(--accent))/0.6]
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--neutral-900))]
                ${isModalOpen ? 'ring-2 ring-[hsl(var(--accent))] shadow-[0_0_48px_hsl(var(--accent)/0.95)]' : ''}
              `}
            >
              <Gradient variant="primary" direction="to-r" className="pointer-events-none absolute -inset-6 opacity-25 group-hover:opacity-45 transition-opacity duration-300" />
              <span className="relative z-10 flex items-center">
                <Plus className="h-4 w-4 mr-2" /> New Workspace
              </span>
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
          ) : recentWorkspaces.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentWorkspaces.map(ws => (
                <div
                  key={ws._id}
                  className="relative overflow-hidden group border rounded-lg p-4 cursor-pointer flex flex-col justify-between ring-1 ring-accent/10 border-[hsl(var(--accent))]/20 shadow-[0_0_12px_hsl(var(--accent)/0.10)] hover:shadow-[0_0_26px_hsl(var(--accent)/0.22)] transition-all"
                  onClick={() => handleWorkspaceClick(ws._id)}
                >
                  <Gradient variant="primary" direction="to-r" className="pointer-events-none absolute -inset-8 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                  <div className="flex items-center justify-between mb-2">
                    <Typography variant="body-medium" className="font-medium truncate max-w-[70%]" title={ws.name}>
                      {ws.name}
                    </Typography>
                    <div className="flex items-center gap-2">
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
