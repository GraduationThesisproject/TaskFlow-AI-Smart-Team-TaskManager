import { useState } from "react";
import { WorkspaceService } from "../../services/workspaceService";
import type { CreateWorkspaceData, Workspace } from "../../types"

export const useWorkspacesAPI = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWorkspaces = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await WorkspaceService.getWorkspaces();
      setWorkspaces(response.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load workspaces");
    } finally {
      setLoading(false);
    }
  };

  const createWorkspace = async (data: CreateWorkspaceData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await WorkspaceService.createWorkspace(data);
      setWorkspaces(prev => [...prev, response.data]);
      return response.data;
    } catch (err: any) {
      setError(err.message || "Failed to create workspace");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { workspaces, loading, error, loadWorkspaces, createWorkspace };
};
