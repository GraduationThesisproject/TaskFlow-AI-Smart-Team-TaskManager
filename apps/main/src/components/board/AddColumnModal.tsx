import React, { useState } from 'react';
import { 
  Modal, 
  ModalHeader, 
  ModalBody, 
  ModalFooter,
  Button,
  Input,
  Select,
  SelectOption,
  Typography,
  Stack
} from '@taskflow/ui';
import type { Column } from '../../store/slices/taskSlice';

interface AddColumnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (columnData: Partial<Column>) => Promise<void>;
}

const COLOR_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'primary', label: 'Primary' },
  { value: 'secondary', label: 'Secondary' },
  { value: 'success', label: 'Success' },
  { value: 'warning', label: 'Warning' },
  { value: 'error', label: 'Error' },
  { value: 'info', label: 'Info' },
];

export const AddColumnModal: React.FC<AddColumnModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<Partial<Column>>({
    name: '',
    color: 'default',
    wipLimit: 0,
    isDefault: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof Column, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      handleClose();
    } catch (error) {
      console.error('Failed to create column:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      color: 'default',
      wipLimit: 0,
      isDefault: false,
    });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalHeader>
        <Typography variant="h3">Create New Column</Typography>
      </ModalHeader>
      
      <form onSubmit={handleSubmit}>
        <ModalBody>
          <Stack spacing="lg">
            {/* Basic Information */}
            <div>
              <Typography variant="body-medium" className="mb-2 font-semibold">
                Column Information
              </Typography>
              <Stack spacing="md">
                <div>
                  <Typography variant="body-small" className="mb-1 text-muted-foreground">
                    Name *
                  </Typography>
                  <Input
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter column name"
                    required
                  />
                </div>
              </Stack>
            </div>

            {/* Column Properties */}
            <div>
              <Typography variant="body-medium" className="mb-2 font-semibold">
                Column Properties
              </Typography>
              <Stack spacing="md">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Typography variant="body-small" className="mb-1 text-muted-foreground">
                      Color
                    </Typography>
                    <Select
                      value={formData.color}
                      onChange={(e) => handleInputChange('color', e.target.value)}
                    >
                      {COLOR_OPTIONS.map(option => (
                        <SelectOption key={option.value} value={option.value}>
                          {option.label}
                        </SelectOption>
                      ))}
                    </Select>
                  </div>
                  
                  <div>
                    <Typography variant="body-small" className="mb-1 text-muted-foreground">
                      WIP Limit
                    </Typography>
                    <Input
                      type="number"
                      min="0"
                      value={formData.wipLimit || 0}
                      onChange={(e) => handleInputChange('wipLimit', parseInt(e.target.value) || 0)}
                      placeholder="0 (no limit)"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={formData.isDefault || false}
                    onChange={(e) => handleInputChange('isDefault', e.target.checked)}
                    className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
                  />
                  <label htmlFor="isDefault" className="text-sm text-muted-foreground">
                    Set as default column for new tasks
                  </label>
                </div>
              </Stack>
            </div>
          </Stack>
        </ModalBody>

        <ModalFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!formData.name?.trim() || isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Column'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};
