import React, { useState } from 'react';
import { Button } from '@taskflow/ui';
import ConfirmationDialog, { ConfirmationType } from './ConfirmationDialog';

const ConfirmationDialogDemo: React.FC = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<{
    type: ConfirmationType;
    title: string;
    description: string;
    confirmText: string;
    cancelText: string;
  }>({
    type: 'info',
    title: 'Information',
    description: 'This is an information dialog.',
    confirmText: 'OK',
    cancelText: 'Cancel'
  });

  const openDialog = (type: ConfirmationType, title: string, description: string, confirmText = 'Confirm', cancelText = 'Cancel') => {
    setDialogConfig({
      type,
      title,
      description,
      confirmText,
      cancelText
    });
    setShowDialog(true);
  };

  const handleConfirm = () => {
    // Action confirmed
    setShowDialog(false);
  };

  return (
    <div className="space-y-4 p-6">
      <h2 className="text-2xl font-bold mb-4">Confirmation Dialog Examples</h2>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Danger/Delete Confirmation */}
        <Button
          variant="destructive"
          onClick={() => openDialog(
            'danger',
            'Delete User',
            'Are you sure you want to delete this user? This action cannot be undone.',
            'Delete',
            'Cancel'
          )}
        >
          Delete Confirmation
        </Button>

        {/* Warning Confirmation */}
        <Button
          variant="outline"
          onClick={() => openDialog(
            'warning',
            'Unsaved Changes',
            'You have unsaved changes. Are you sure you want to leave without saving?',
            'Leave',
            'Stay'
          )}
        >
          Warning Confirmation
        </Button>

        {/* Info Confirmation */}
        <Button
          variant="default"
          onClick={() => openDialog(
            'info',
            'Feature Update',
            'A new feature is available. Would you like to enable it now?',
            'Enable',
            'Later'
          )}
        >
          Info Confirmation
        </Button>

        {/* Success Confirmation */}
        <Button
          variant="default"
          onClick={() => openDialog(
            'success',
            'Operation Complete',
            'Your action has been completed successfully. Would you like to continue?',
            'Continue',
            'Close'
          )}
        >
          Success Confirmation
        </Button>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        onConfirm={handleConfirm}
        title={dialogConfig.title}
        description={dialogConfig.description}
        confirmText={dialogConfig.confirmText}
        cancelText={dialogConfig.cancelText}
        type={dialogConfig.type}
      />
    </div>
  );
};

export default ConfirmationDialogDemo;
