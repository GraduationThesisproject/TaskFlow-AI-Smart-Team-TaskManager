import React, { useState } from 'react';
import { Button } from '@taskflow/ui';
import { Modal } from '@taskflow/ui';
import type { ConfirmRemoveMemberDialogProps } from '../../../types/interfaces/ui';

const ConfirmRemoveMemberDialog: React.FC<ConfirmRemoveMemberDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  memberName,
  isOwner = false,
}) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await onConfirm(password);
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

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Enter your password to confirm
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
              placeholder="Your account password"
              autoComplete="current-password"
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>

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
              type="submit"
              variant="destructive"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : isOwner ? 'Leave Workspace' : 'Remove Member'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default ConfirmRemoveMemberDialog;
