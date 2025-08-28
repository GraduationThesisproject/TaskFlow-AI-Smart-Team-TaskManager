import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Input, TextArea, Select, SelectOption, Typography, Stack } from '@taskflow/ui';
import { useAppSelector } from '../../../../store';
import { useWorkspaces } from '../../../../hooks/useWorkspaces';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VISIBILITY_OPTIONS = [
  { value: 'private', label: 'Private' },
  { value: 'public', label: 'Public' },
];

export const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAppSelector(state => state.auth);
  const { createNewWorkspace, loading } = useWorkspaces({ autoFetch: false });
  const [formData, setFormData] = useState({ name: '', description: '', visibility: 'private' as 'private' | 'public' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    if (error) setError(null);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Workspace name required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setError(null);
  
    try {
      // Pass visibility as required by createNewWorkspace typings
      const payload = {
        name: formData.name,
        description: formData.description,
        isPublic: formData.visibility === 'public', // <-- map string to boolean
        visibility: formData.visibility,
      };
  
      await createNewWorkspace(payload);
      
      // Reset form and close modal

      setFormData({ name: '', description: '', visibility: 'private' });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create workspace');
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({ name: '', description: '', visibility: 'private' });
      setErrors({});
      setError(null);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalHeader>
        <Typography variant="h3">Create New Workspace</Typography>
        <Typography variant="body-medium" className="text-muted-foreground mt-1">
          Set up a new workspace for your team
        </Typography>
      </ModalHeader>

      <ModalBody>
        <Stack spacing="md">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-2">Workspace Name *</label>
            <Input value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} disabled={loading} className={errors.name ? 'border-destructive' : ''}/>
            {errors.name && <Typography variant="caption" className="text-destructive">{errors.name}</Typography>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <TextArea value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} rows={3} disabled={loading} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Visibility</label>
            <Select value={formData.visibility} onChange={(e) => handleInputChange('visibility', e.target.value)} disabled={loading}>
              {VISIBILITY_OPTIONS.map(opt => <SelectOption key={opt.value} value={opt.value}>{opt.label}</SelectOption>)}
            </Select>
            {/* Inline visibility indicator */}
            <div className="mt-2" aria-live="polite">
              {formData.visibility === 'public' ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-green-50 text-green-700 border border-green-200 px-3 py-1 text-xs font-medium">
                  Public
                  <span className="text-green-600/80">Anyone with access to the workspace URL (subject to permissions)</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full bg-muted text-foreground/80 border border-border px-3 py-1 text-xs font-medium">
                  Private
                  <span className="text-muted-foreground">Only invited members can access</span>
                </span>
              )}
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <Typography variant="body-medium" className="font-medium mb-1">Workspace Owner</Typography>
            <Typography variant="body-small" className="text-muted-foreground">{user?.user?.name || 'You'} ({user?.user?.email})</Typography>
          </div>
        </Stack>
      </ModalBody>

      <ModalFooter>
        <Button variant="outline" onClick={handleClose} disabled={loading}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={loading || !formData.name.trim()}>{loading ? 'Creating...' : 'Create Workspace'}</Button>
      </ModalFooter>
    </Modal>
  );
};

export default CreateWorkspaceModal;
