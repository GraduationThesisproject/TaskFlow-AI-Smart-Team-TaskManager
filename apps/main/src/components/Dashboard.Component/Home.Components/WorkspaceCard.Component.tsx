// components/Dashboard/Home.Components/WorkspaceCard.tsx
import React from 'react';
import { Card, CardContent } from "@taskflow/ui";
import type { WorkspaceCardProps } from "../../../types/dashboard";


export const WorkspaceCard: React.FC<WorkspaceCardProps> = ({
  title,
  description,
  memberCount,
  projectCount
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
          {description}
        </p>
        <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
          <span>{memberCount} members</span>
          <span>{projectCount} projects</span>
        </div>
      </CardContent>
    </Card>
  );
};