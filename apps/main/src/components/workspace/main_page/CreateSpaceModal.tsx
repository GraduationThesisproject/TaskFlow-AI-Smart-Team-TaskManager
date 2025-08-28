import React, { useState } from 'react';
import { Modal, ModalBody, ModalFooter, Button, Input, TextArea } from '@taskflow/ui';
import { SpaceService } from '../../../services/spaceService';
import type { CreateSpaceData } from '../../../services/spaceService';

interface CreateSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  onSpaceCreated: (space: any) => void;
}

const CreateSpaceModal: React.FC<CreateSpaceModalProps> = ({
  isOpen,
  onClose,
  workspaceId,
  onSpaceCreated,
}) => {
  const [formData, setFormData] = useState<CreateSpaceData>({
    name: '',
    description: '',
    workspaceId: workspaceId,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof CreateSpaceData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    setError(null); // Clear error when user starts typing
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Space name is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await SpaceService.createSpace(formData);
      const newSpace = response.data;
      
      console.log('Space created successfully:', newSpace);
      onSpaceCreated(newSpace);
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        workspaceId: workspaceId,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create space';
      console.error('Error creating space:', error);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        name: '',
        description: '',
        workspaceId: workspaceId,
      });
      setError(null);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Space"
      description="Add a new space to your workspace"
      size="md"
    >
      <form onSubmit={handleSubmit}>
        <ModalBody>
          <div className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            
            <div>
              <label htmlFor="space-name" className="block text-sm font-medium mb-2">
                Space Name *
              </label>
              <Input
                id="space-name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter space name"
                required
                disabled={isLoading}
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="space-description" className="block text-sm font-medium mb-2">
                Description
              </label>
              <TextArea
                id="space-description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter space description (optional)"
                disabled={isLoading}
                className="w-full"
                rows={3}
              />
            </div>
          </div>
        </ModalBody>
        
        <ModalFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || !formData.name.trim()}
            loading={isLoading}
          >
            Create Space
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default CreateSpaceModal;
