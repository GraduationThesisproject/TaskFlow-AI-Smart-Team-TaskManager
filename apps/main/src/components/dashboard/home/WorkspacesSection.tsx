import { Card, CardHeader, CardTitle, CardContent, Typography, Button, Badge, EmptyState } from "@taskflow/ui";
import { Plus, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { setCurrentWorkspaceId } from "../../../store/slices/workspaceSlice";
import { useAppDispatch } from "../../../store";
import type { WorkspacesSectionProps } from "../../../types/dash.types";


export const WorkspacesSection: React.FC<WorkspacesSectionProps> = ({ workspaces, openCreateModal }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleWorkspaceClick = (workspaceId: string) => {
    navigate(`/workspace`);
    dispatch(setCurrentWorkspaceId(workspaceId));
  };

  return (
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
        {workspaces.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {workspaces.slice(0, 4).map((workspace) => (
              <div
                key={workspace._id}
                className="p-4 border rounded-lg hover:border-primary cursor-pointer"
                onClick={() => handleWorkspaceClick(workspace._id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <Typography variant="body-medium" className="font-medium">{workspace.name}</Typography>
                  <Badge variant="secondary">{workspace.members?.length || 0} members</Badge>
                </div>
                <Typography variant="caption" className="text-muted-foreground">{workspace.description || 'No description'}</Typography>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Users className="h-8 w-8" />}
            title="No workspaces yet"
            description="Create your first workspace to get started with team collaboration."
            action={{ label: "Create Workspace", onClick: openCreateModal, variant: "default" }}
          />
        )}
      </CardContent>
    </Card>
  );
};
