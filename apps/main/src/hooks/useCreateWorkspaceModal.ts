import { useState } from "react";
import { useWorkspaces } from "./useWorkspaces"; // important: hook that has workspace list

export const useCreateWorkspaceModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { createNewWorkspace, workspaces } = useWorkspaces(); // get workspace list + action

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const handleCreateWorkspace = async (workspaceData: {
    name: string;
    description?: string;
    visibility: "private" | "public";
  }) => {
    try {
      await createNewWorkspace(workspaceData); // dispatch Redux action
    } catch (error) {
      console.error("Workspace creation failed:", error);
      throw error;
    } finally {
      closeModal();
    }
  };

  return { isOpen, openModal, closeModal, handleCreateWorkspace, workspaces };
};
