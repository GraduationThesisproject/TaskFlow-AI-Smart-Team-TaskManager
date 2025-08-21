import { useState } from 'react';
import { useWorkspaces } from './useWorkspaces';

export const useCreateWorkspaceModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { createNewWorkspace, loading, error } = useWorkspaces();

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const handleCreateWorkspace = async (workspaceData: {
    name: string;
    description?: string;
    visibility: 'private' | 'public';
  }) => {
    try {
      await createNewWorkspace(workspaceData);
      closeModal();
    } catch (error) {
      // Error is handled by the modal component
      throw error;
    }
  };

  return {
    isOpen,
    openModal,
    closeModal,
    handleCreateWorkspace,
    loading,
    error
  };
};
