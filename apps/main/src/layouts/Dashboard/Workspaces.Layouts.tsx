import React, { useEffect, useMemo } from "react";
import { DashboardShell } from "./DashboardShell";
import { Typography, Skeleton, EmptyState, Card, CardContent } from "@taskflow/ui";
import { useWorkspaces } from "../../hooks/useWorkspaces";

const WorkspacesLayout: React.FC = () => {
  // Fetch workspaces (public list). Only display titles.
  const { workspaces, loading, error } = useWorkspaces({ public: true });

  const sortedWorkspaces = useMemo(() => {
    return [...(workspaces || [])].sort(
      (a: any, b: any) =>
        new Date(b.updatedAt || b.createdAt).getTime() -
        new Date(a.updatedAt || a.createdAt).getTime()
    );
  }, [workspaces]);

  // Log public workspaces when they are loaded/updated
  useEffect(() => {
    if (!loading && !error) {
      try {
        console.log("Public workspaces (raw):", workspaces);
        console.table(
          (sortedWorkspaces || []).map((ws: any) => ({
            id: ws?._id,
            name: ws?.name,
            updatedAt: ws?.updatedAt,
            createdAt: ws?.createdAt,
          }))
        );
      } catch (e) {
        // no-op
      }
    }
  }, [loading, error, workspaces, sortedWorkspaces]);

  return (
    <DashboardShell>
      <div className="flex items-center justify-between mb-4">
        <Typography variant="h1" className="font-extrabold text-3xl md:text-4xl tracking-tight">
          Public Workspaces
        </Typography>
      </div>

      <Card className="backdrop-blur-sm ring-1 ring-accent/10 border border-[hsl(var(--accent))]/20 shadow-[0_0_16px_hsl(var(--accent)/0.12)]">
        <CardContent className="pt-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          ) : error ? (
            <EmptyState title="Error loading workspaces" description={error} />
          ) : sortedWorkspaces.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedWorkspaces.map((ws: any) => (
                <div
                  key={ws._id}
                  className="border rounded-lg p-4 ring-1 ring-accent/10 border-[hsl(var(--accent))]/20 shadow-[0_0_8px_hsl(var(--accent)/0.08)]"
                >
                  <Typography variant="body-medium" className="font-medium truncate" title={ws.name}>
                    {ws.name}
                  </Typography>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No workspaces to show" description="There are no workspaces available." />
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  );
};

export default WorkspacesLayout;
