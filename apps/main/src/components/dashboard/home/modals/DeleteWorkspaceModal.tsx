import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Typography, Stack, Alert } from '@taskflow/ui';
import { useWorkspaces } from '../../../../hooks/useWorkspaces';
import { useAppDispatch, useAppSelector } from '../../../../store';
import { restoreWorkspace, permanentDeleteWorkspace } from '../../../../store/slices/workspaceSlice';

interface DeleteWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  workspaceName?: string;
}

export const DeleteWorkspaceModal: React.FC<DeleteWorkspaceModalProps> = ({ isOpen, onClose, workspaceId, workspaceName }) => {
  const { deleteWorkspaceById, loading, error: globalError } = useWorkspaces();
  const dispatch = useAppDispatch();
  const [localError, setLocalError] = useState<string | null>(null);

  const workspace = useAppSelector(state => (state.workspace.workspaces || []).find((w: any) => w?._id === workspaceId || w?.id === workspaceId));
  const isArchived = (workspace?.status === 'archived');

  const handleArchive = async () => {
    setLocalError(null);
    try {
      await deleteWorkspaceById(workspaceId);
      onClose();
    } catch (e: any) {
      setLocalError(e?.message || 'Failed to archive workspace');
    }
  };

  const handleRestore = async () => {
    setLocalError(null);
    try {
      await dispatch(restoreWorkspace({ id: workspaceId }) as any).unwrap();
      onClose();
    } catch (e: any) {
      setLocalError(e?.message || 'Failed to restore workspace');
    }
  };

  const handlePermanentDelete = async () => {
    setLocalError(null);
    try {
      await dispatch(permanentDeleteWorkspace({ id: workspaceId }) as any).unwrap();
      onClose();
    } catch (e: any) {
      setLocalError(e?.message || 'Failed to permanently delete workspace');
    }
  };

  // Only disable while loading
  const disabled = loading;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalHeader>
        <Typography variant="h3">{isArchived ? 'Archived Workspace' : 'Delete Workspace'}</Typography>
        <Typography variant="body-small" className="text-muted-foreground mt-1">
          {isArchived
            ? 'This workspace is archived. You can restore it (stop the timer) or permanently delete it.'
            : 'This will archive the workspace first. Archived workspaces can be restored within the grace period.'}
        </Typography>
      </ModalHeader>
      <ModalBody>
        <Stack spacing="md">
          <Alert
            variant={isArchived ? 'warning' : 'error'}
            title={isArchived ? `Workspace "${workspaceName || ''}" is archived` : `Delete ${workspaceName || 'this workspace'}?`}
            description={isArchived
              ? 'Choose Restore to stop the archive timer and re-activate it, or Permanently Delete to remove all data.'
              : 'All spaces, boards and tasks inside this workspace will be archived first. You can still restore within the grace period or permanently delete later.'}
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
        {isArchived ? (
          <>
            <Button variant="default" onClick={handleRestore} disabled={disabled}>
              {loading ? 'Restoring…' : 'Restore'}
            </Button>
            <Button variant="destructive" onClick={handlePermanentDelete} disabled={disabled}>
              {loading ? 'Deleting…' : 'Permanently Delete'}
            </Button>
          </>
        ) : (
          <Button variant="destructive" onClick={handleArchive} disabled={disabled}>
            {loading ? 'Archiving…' : 'Delete Workspace'}
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
};

export default DeleteWorkspaceModal;
