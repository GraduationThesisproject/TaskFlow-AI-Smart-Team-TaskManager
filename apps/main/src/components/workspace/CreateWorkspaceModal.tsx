import React, { useState } from 'react';
import { 
  Modal, 
  ModalHeader, 
  ModalBody, 
  ModalFooter,
  Button,
  Input,
  TextArea,
  Select,
  SelectOption,
  Typography,
  Stack
} from '@taskflow/ui';
import { useAppSelector } from '../../store';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (workspaceData: {
    name: string;
    description?: string;
    visibility: 'private' | 'public';
  }) => Promise<void>;
}

const VISIBILITY_OPTIONS = [
  { value: 'private', label: 'Private' },
  { value: 'public', label: 'Public' },
];

export const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const { user } = useAppSelector(state => state.auth);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    visibility: 'private' as 'private' | 'public'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Workspace name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Workspace name must be at least 2 characters';
    } else if (formData.name.trim().length > 200) {
      newErrors.name = 'Workspace name must be less than 200 characters';
    }
    
    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      await onSubmit({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        visibility: formData.visibility
      });
      
      // Reset form on success
      setFormData({
        name: '',
        description: '',
        visibility: 'private'
      });
      setErrors({});
    } catch (error) {
      // Error handling is done by the parent component
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        name: '',
        description: '',
        visibility: 'private'
      });
      setErrors({});
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalHeader>
        <Typography variant="h3" as="h3" className="text-foreground">
          Create New Workspace
        </Typography>
        <Typography variant="body-medium" className="text-muted-foreground mt-1">
          Set up a new workspace for your team collaboration
        </Typography>
      </ModalHeader>
      
      <ModalBody>
        <Stack spacing="md">
          {/* Workspace Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Workspace Name *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter workspace name"
              disabled={isLoading}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <Typography variant="caption" className="text-destructive mt-1">
                {errors.name}
              </Typography>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Description
            </label>
            <TextArea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your workspace (optional)"
              rows={3}
              disabled={isLoading}
              className={errors.description ? "border-destructive" : ""}
            />
            {errors.description && (
              <Typography variant="caption" className="text-destructive mt-1">
                {errors.description}
              </Typography>
            )}
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Visibility
            </label>
            <Select
              value={formData.visibility}
              onChange={(e) => handleInputChange('visibility', e.target.value)}
              disabled={isLoading}
            >
              {VISIBILITY_OPTIONS.map((option) => (
                <SelectOption key={option.value} value={option.value}>
                  {option.label}
                </SelectOption>
              ))}
            </Select>
            <Typography variant="caption" className="text-muted-foreground mt-1">
              {formData.visibility === 'private' 
                ? 'Only invited members can access this workspace'
                : 'Anyone with the link can view this workspace'
              }
            </Typography>
          </div>

          {/* Owner Info */}
          <div className="p-4 bg-muted rounded-lg">
            <Typography variant="body-medium" className="font-medium mb-1">
              Workspace Owner
            </Typography>
            <Typography variant="body-small" className="text-muted-foreground">
              {user?.user?.name || 'You'} ({user?.user?.email})
            </Typography>
          </div>
        </Stack>
      </ModalBody>
      
      <ModalFooter>
        <Button 
          variant="outline" 
          onClick={handleClose}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={isLoading || !formData.name.trim()}
        >
          {isLoading ? 'Creating...' : 'Create Workspace'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default CreateWorkspaceModal;
