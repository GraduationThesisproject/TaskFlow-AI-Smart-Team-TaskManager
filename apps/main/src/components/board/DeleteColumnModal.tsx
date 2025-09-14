import React, { useState } from 'react';
import { Button } from '@taskflow/ui';
import { Typography } from '@taskflow/ui';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@taskflow/ui';
import { Trash2, AlertTriangle } from 'lucide-react';
import type { Column } from '../../types/board.types';

interface DeleteColumnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  column: Column | null;
  taskCount: number;
  isLastColumn: boolean;
}

export const DeleteColumnModal: React.FC<DeleteColumnModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  column,
  taskCount,
  isLastColumn
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!column) return;
    
    try {
      setIsLoading(true);
      setError(null);
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete column');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setError(null);
      onClose();
    }
  };

  if (!column) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalContent>
        <ModalHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <Typography variant="h3" className="text-lg font-semibold">
                Delete Column
              </Typography>
              <Typography variant="body" className="text-slate-600">
                This action cannot be undone
              </Typography>
            </div>
          </div>
        </ModalHeader>
        
        <ModalBody>
          <div className="space-y-4">
            {/* Warning for last column */}
            {isLastColumn && (
              <div className="flex items-start space-x-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <Typography variant="body-medium" className="font-medium text-orange-900 mb-1">
                    Last Column Warning
                  </Typography>
                  <Typography variant="body" className="text-orange-800 text-sm">
                    This is the last column in the board. Deleting it will leave the board empty.
                  </Typography>
                </div>
              </div>
            )}

            {/* Task count warning */}
            {taskCount > 0 && (
              <div className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg border border-red-200">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <Typography variant="body-medium" className="font-medium text-red-900 mb-1">
                    Tasks Will Be Deleted
                  </Typography>
                  <Typography variant="body" className="text-red-800 text-sm">
                    This column contains {taskCount} task(s). They will be permanently deleted along with the column.
                  </Typography>
                </div>
              </div>
            )}

            {/* Confirmation message */}
            <div className="space-y-3">
              <Typography variant="body" className="text-slate-700">
                Are you sure you want to delete the column <strong>"{column.name}"</strong>?
              </Typography>
              
              {taskCount > 0 && (
                <Typography variant="body" className="text-red-700 font-medium">
                  This will permanently delete {taskCount} task(s) along with the column.
                </Typography>
              )}
            </div>

            {/* Error message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <Typography variant="body" className="text-red-800 text-sm">
                  {error}
                </Typography>
              </div>
            )}
          </div>
        </ModalBody>
        
        <ModalFooter>
          <div className="flex space-x-3 w-full">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isLoading}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              {isLoading ? 'Deleting...' : 'Delete Column'}
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
