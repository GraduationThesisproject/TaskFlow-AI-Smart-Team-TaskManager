import { Card, CardHeader, CardTitle, CardContent, Typography, Button, Badge, EmptyState } from "@taskflow/ui";
import { Plus, Users } from "lucide-react";
import { PermissionGuard } from "../..";
import type { Workspace } from "../../../types";

interface WorkspacesSectionProps {
  workspaces: Workspace[];
  openCreateModal: () => void;
}

export const WorkspacesSection: React.FC<WorkspacesSectionProps> = ({ workspaces, openCreateModal }) => (
  <Card>
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle>Your Workspaces</CardTitle>
        <PermissionGuard requiredRole="member">
          <Button variant="default" size="sm" onClick={openCreateModal}>
            <Plus className="h-4 w-4 mr-2" /> New Workspace
          </Button>
        </PermissionGuard>
      </div>
    </CardHeader>
    <CardContent>
      {workspaces.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {workspaces.slice(0, 4).map((workspace) => (
            <div key={workspace._id} className="p-4 border rounded-lg hover:border-primary cursor-pointer">
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
