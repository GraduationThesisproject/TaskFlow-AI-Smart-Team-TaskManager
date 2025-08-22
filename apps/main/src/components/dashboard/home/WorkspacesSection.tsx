import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@taskflow/ui";
import { Button } from "@taskflow/ui";
import { Plus, FolderOpen } from "lucide-react";

export const WorkspacesSection = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5" />
          Workspaces
        </CardTitle>
        <CardDescription>
          Manage your team workspaces and projects
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Create New Workspace
        </Button>
      </CardContent>
    </Card>
  );
};
