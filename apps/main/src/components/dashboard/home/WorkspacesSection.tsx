import { Card, CardHeader, CardTitle, CardContent, Typography, Button, Badge, EmptyState, Skeleton } from "@taskflow/ui";
import { Plus, Users, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../../store";
import { setCurrentWorkspaceId } from "../../../store/slices/workspaceSlice";
import { useMemo, useState } from "react";
import { CreateWorkspaceModal } from "../../../components/dashboard/home/modals/CreateWorkspaceModal";
import DeleteWorkspaceModal from "../../../components/dashboard/home/modals/DeleteWorkspaceModal";
import { useWorkspaces } from "../../../hooks/useWorkspaces";

export const WorkspacesSection = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { workspaces, loading, error } = useWorkspaces();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<{ id: string; name?: string } | null>(null);

  const handleWorkspaceClick = (workspaceId: string) => {
    dispatch(setCurrentWorkspaceId(workspaceId));
    navigate(`/workspace`);
  };

  const recentWorkspaces = useMemo(() => {
    return [...workspaces]
      .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
      .slice(0, 4);
  }, [workspaces]);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Your Workspaces</CardTitle>
            <Button variant="default" size="sm" onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> New Workspace
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
                  className="border rounded-lg p-4 hover:border-primary cursor-pointer flex flex-col justify-between"
                  onClick={() => handleWorkspaceClick(ws._id)}
                >
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
