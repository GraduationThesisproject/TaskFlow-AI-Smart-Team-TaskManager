import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Input, TextArea, Select, SelectOption, Typography, Stack } from '@taskflow/ui';
import { useTemplates } from '../../../../hooks/useTemplates';
import type { TemplateType , CreateTemplateModalProps} from '../../../../types/dash.types';
import { TYPE_OPTIONS, CATEGORY_OPTIONS } from '../../../../types/dash.types';



export const CreateTemplateModal: React.FC<CreateTemplateModalProps> = ({ isOpen, onClose }) => {
  const { create, loading } = useTemplates();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'task' as TemplateType,
    category: 'team',
    visibility: 'private' as 'private' | 'public',
    tags: '' as string, // comma-separated input, e.g. "planning, sprint"
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    if (error) setError(null);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Template name required';
    if (formData.name.trim().length > 10) newErrors.name = 'Name must be at most 10 characters';
    if (!formData.type) newErrors.type = 'Type is required';
    if (!formData.category) newErrors.category = 'Category is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setError(null);

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description?.trim() || '',
        type: formData.type,
        category: formData.category,
        isPublic: formData.visibility === 'public',
        status: 'active' as const,
        tags: formData.tags
          .split(',')
          .map(t => t.trim())
          .filter(Boolean),
        content: {}, // Initial empty content; can be extended later
      };

      await create(payload);

      // Reset form and close modal
      setFormData({ name: '', description: '', type: 'task', category: 'team', visibility: 'private', tags: '' });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create template');
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({ name: '', description: '', type: 'task', category: 'team', visibility: 'private', tags: '' });
      setErrors({});
      setError(null);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalHeader>
        <Typography variant="h3">Create New Template</Typography>
        <Typography variant="body-medium" className="text-muted-foreground mt-1">
          Define a reusable template for your team
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
            <label className="block text-sm font-medium mb-2">Template Name *</label>
            <Input
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              disabled={loading}
              maxLength={10}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && <Typography variant="caption" className="text-destructive">{errors.name}</Typography>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <TextArea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Type *</label>
              <Select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                disabled={loading}
              >
                {TYPE_OPTIONS.map(opt => (
                  <SelectOption key={opt.value} value={opt.value}>{opt.label}</SelectOption>
                ))}
              </Select>
              {errors.type && <Typography variant="caption" className="text-destructive">{errors.type}</Typography>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category *</label>
              <Select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                disabled={loading}
              >
                {CATEGORY_OPTIONS.map(opt => (
                  <SelectOption key={opt.value} value={opt.value}>{opt.label}</SelectOption>
                ))}
              </Select>
              {errors.category && <Typography variant="caption" className="text-destructive">{errors.category}</Typography>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tags (comma separated)</label>
            <Input
              placeholder="e.g. planning, sprint, onboarding"
              value={formData.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Visibility</label>
            <Select
              value={formData.visibility}
              onChange={(e) => handleInputChange('visibility', e.target.value)}
              disabled={loading}
            >
              <SelectOption value="private">Private</SelectOption>
              <SelectOption value="public">Public</SelectOption>
            </Select>
          </div>
        </Stack>
      </ModalBody>

      <ModalFooter>
        <Button variant="outline" onClick={handleClose} disabled={loading}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={loading || !formData.name.trim()}>
          {loading ? 'Creating...' : 'Create Template'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default CreateTemplateModal;
