import React, { useState } from 'react';
import { Button } from '@taskflow/ui';
import { Modal } from '@taskflow/ui';
import type { ConfirmRemoveMemberDialogProps } from './types';

const ConfirmRemoveMemberDialog: React.FC<ConfirmRemoveMemberDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  memberName,
  isOwner = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await onConfirm('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">
          {isOwner ? 'Leave Workspace' : 'Remove Member'}
        </h2>
        
        <p className="mb-6 text-foreground/80">
          {isOwner 
            ? 'Are you sure you want to leave this workspace? You will lose all access unless you are re-invited.'
            : `Are you sure you want to remove ${memberName} from the workspace? This action cannot be undone.`}
        </p>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : isOwner ? 'Leave Workspace' : 'Remove Member'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmRemoveMemberDialog;
