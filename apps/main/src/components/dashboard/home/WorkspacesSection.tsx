import { Plus, Users, Trash2, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { setCurrentWorkspaceId } from "../../../store/slices/workspaceSlice";
import { useAppDispatch } from "../../../store";
import type { WorkspacesSectionProps } from "../../../types/dash.types";
import { useState } from "react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Button, 
  Badge, 
  EmptyState, 
  Modal, 
  ModalHeader, 
  ModalFooter 
} from "@taskflow/ui";
import { useWorkspaces } from "../../../hooks/useWorkspaces";

export const WorkspacesSection: React.FC<WorkspacesSectionProps> = ({ workspaces, openCreateModal }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [workspaceToDelete, setWorkspaceToDelete] = useState<{id: string, name: string} | null>(null);
  const { deleteCurrentWorkspace, loading: workspaceLoading } = useWorkspaces();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleWorkspaceClick = (ws: { _id: string; members?: any[] }) => {
    dispatch(setCurrentWorkspaceId(ws._id));
    const membersCount = ws?.members?.length ?? 0;
    navigate(`/workspace?id=${encodeURIComponent(ws._id)}&members=${membersCount}`);
  };

  const handleDeleteClick = (e: React.MouseEvent, ws: { _id: string; name: string }) => {
    e.stopPropagation();
    setWorkspaceToDelete({ id: ws._id, name: ws.name });
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!workspaceToDelete) return;
    try {
      await deleteCurrentWorkspace(workspaceToDelete.id);
      setWorkspaceToDelete(null);
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error("Failed to delete workspace:", err);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Your Workspaces</CardTitle>
            <Button variant="default" size="sm" onClick={openCreateModal}>
              <Plus className="h-4 w-4 mr-2" /> New Workspace
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {workspaces.length === 0 ? (
            <EmptyState
              icon={<Users className="h-12 w-12 text-muted-foreground" />}
              title="No workspaces yet"
              description="Get started by creating a new workspace to organize your tasks and collaborate with your team."
              action={{
                label: 'Create Workspace',
                onClick: openCreateModal
              }}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {workspaces.map((workspace) => (
                <div
                  key={workspace._id}
                  onClick={() => handleWorkspaceClick(workspace)}
                  className="p-4 border rounded-lg hover:border-primary cursor-pointer group relative"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                    onClick={(e) => handleDeleteClick(e, workspace)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{workspace.name}</h3>
                    <Badge variant="outline" className="ml-2">
                      {workspace.members?.length || 0} members
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {workspace.description || 'No description'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)}
        size="sm"
      >
        <ModalHeader>
          <div className="flex items-center gap-2 text-warning">
            <AlertTriangle className="h-5 w-5" />
            <h3>Delete Workspace</h3>
          </div>
        </ModalHeader>

        <ModalFooter>
          <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={confirmDelete} 
            disabled={workspaceLoading}
          >
            {workspaceLoading ? "Deleting..." : "Delete"}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};
