import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Typography, Stack, Alert } from '@taskflow/ui';
import { useWorkspaces } from '../../../../hooks/useWorkspaces';
import type { DeleteWorkspaceModalProps } from '../../../../types/interfaces/ui';

export const DeleteWorkspaceModal: React.FC<DeleteWorkspaceModalProps> = ({ isOpen, onClose, workspaceId, workspaceName }) => {
  const { deleteWorkspaceById, loading, error: globalError } = useWorkspaces();
  const [localError, setLocalError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setLocalError(null);
    try {
      await deleteWorkspaceById(workspaceId);
      onClose();
    } catch (e: any) {
      setLocalError(e?.message || 'Failed to delete workspace');
    }
  };

  // Only disable while loading
  const disabled = loading;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalHeader>
        <Typography variant="h3">Delete Workspace</Typography>
        <Typography variant="body-small" className="text-muted-foreground mt-1">
          This action cannot be undone.
        </Typography>
      </ModalHeader>
      <ModalBody>
        <Stack spacing="md">
          <Alert
            variant="error"
            title={`Delete ${workspaceName || 'this workspace'}?`}
            description="All spaces, boards and tasks inside this workspace will be permanently deleted. This cannot be undone."
            showCloseButton={false}
          >
            {(localError || globalError) && (
              <div className="mt-3 text-sm text-destructive">
                {localError || globalError}
              </div>
            )}
          </Alert>
        </Stack>
      </ModalBody>
      <ModalFooter>
        <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant="destructive" onClick={handleConfirm} disabled={disabled}>
          {loading ? 'Deleting…' : 'Delete Workspace'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DeleteWorkspaceModal;
