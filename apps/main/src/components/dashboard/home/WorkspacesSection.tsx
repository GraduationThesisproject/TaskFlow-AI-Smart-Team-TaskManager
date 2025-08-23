import { Plus, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { setCurrentWorkspaceId } from "../../../store/slices/workspaceSlice";
import { useAppDispatch } from "../../../store";
import type { WorkspacesSectionProps } from "../../../types/dash.types";
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, EmptyState } from "@taskflow/ui";

export const WorkspacesSection: React.FC<WorkspacesSectionProps> = ({ workspaces = [], openCreateModal }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleWorkspaceClick = (ws: { _id: string; members?: any[] }) => {
    dispatch(setCurrentWorkspaceId(ws._id));
    const membersCount = ws.members?.length ?? 0;
    navigate(`/workspace?id=${encodeURIComponent(ws._id)}&members=${membersCount}`);
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
                className="p-4 border rounded-lg hover:border-primary cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium truncate max-w-[180px]">{workspace.name}</h3>
                  <Badge variant="outline" className="ml-2 flex-shrink-0">
                    {workspace.members?.length ?? 0} members
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
  );
};
