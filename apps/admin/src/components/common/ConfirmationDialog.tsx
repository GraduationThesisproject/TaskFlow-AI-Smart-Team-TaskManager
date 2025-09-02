import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@taskflow/ui';
import { Button } from '@taskflow/ui';
import { 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

export type ConfirmationType = 'danger' | 'warning' | 'info' | 'success';

export interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  type?: ConfirmationType;
  isLoading?: boolean;
  confirmButtonVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info',
  isLoading = false,
  confirmButtonVariant = 'default'
}) => {
  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <XCircleIcon className="h-6 w-6 text-red-600" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />;
      case 'success':
        return <CheckCircleIcon className="h-6 w-6 text-green-600" />;
      case 'info':
      default:
        return <InformationCircleIcon className="h-6 w-6 text-blue-600" />;
    }
  };

  const getConfirmButtonVariant = () => {
    if (confirmButtonVariant !== 'default') return confirmButtonVariant;
    
    switch (type) {
      case 'danger':
        return 'destructive';
      case 'warning':
        return 'default';
      case 'success':
        return 'default';
      case 'info':
      default:
        return 'default';
    }
  };

  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm();
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      size="sm"
      padding="default"
    >
      <ModalHeader>
        <div className="flex items-center space-x-3">
          {getIcon()}
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        </div>
        {description && (
          <p className="text-sm text-muted-foreground pt-2">
            {description}
          </p>
        )}
      </ModalHeader>
      
      <ModalFooter>
        <Button
          variant="outline"
          onClick={handleClose}
          disabled={isLoading}
          className="min-w-[80px]"
        >
          {cancelText}
        </Button>
        <Button
          variant={getConfirmButtonVariant()}
          onClick={handleConfirm}
          disabled={isLoading}
          className="min-w-[80px]"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              <span>Loading...</span>
            </div>
          ) : (
            confirmText
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ConfirmationDialog;
