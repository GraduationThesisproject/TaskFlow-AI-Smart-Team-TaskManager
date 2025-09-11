import React, { useState } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Typography,
  TextArea
} from '@taskflow/ui';

interface AddChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (template: { name: string; color: string; items: string[] }) => Promise<void>;
}

const CHECKLIST_COLORS = [
  { name: "Blue", value: "#3B82F6", bg: "bg-blue-500" },
  { name: "Green", value: "#10B981", bg: "bg-green-500" },
  { name: "Purple", value: "#8B5CF6", bg: "bg-purple-500" },
  { name: "Pink", value: "#EC4899", bg: "bg-pink-500" },
  { name: "Orange", value: "#F59E0B", bg: "bg-orange-500" },
  { name: "Red", value: "#EF4444", bg: "bg-red-500" },
  { name: "Teal", value: "#14B8A6", bg: "bg-teal-500" },
  { name: "Indigo", value: "#6366F1", bg: "bg-indigo-500" },
];

export const AddChecklistModal: React.FC<AddChecklistModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    name: '',
    color: '#3B82F6',
    items: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      const items = formData.items
        .split('\n')
        .map(item => item.trim())
        .filter(item => item.length > 0);

      await onSubmit({
        name: formData.name.trim(),
        color: formData.color,
        items
      });

      // Reset form
      setFormData({
        name: '',
        color: '#3B82F6',
        items: ''
      });
      onClose();
    } catch (error) {
      console.error('Failed to create checklist template:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        name: '',
        color: '#3B82F6',
        items: ''
      });
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalHeader>
        <Typography variant="h2">Create Checklist Template</Typography>
        <Typography variant="body-small" textColor="muted" className="mt-1">
          Create a reusable checklist template for your board
        </Typography>
      </ModalHeader>

      <ModalBody className="space-y-6">
        {/* Checklist Name */}
        <div className="space-y-2">
          <Typography variant="body-medium" className="font-medium">
            Template Name
          </Typography>
          <Input
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter checklist template name..."
            className="w-full"
          />
        </div>

        {/* Color Picker */}
        <div className="space-y-3">
          <Typography variant="body-medium" className="font-medium">
            Color
          </Typography>
          <div className="flex flex-wrap gap-2">
            {CHECKLIST_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                className={`w-8 h-8 rounded-lg ${color.bg} transition-all duration-200 hover:scale-110 ${
                  formData.color === color.value
                    ? 'ring-2 ring-primary ring-offset-2'
                    : ''
                }`}
                title={color.name}
              />
            ))}
          </div>
        </div>

        {/* Checklist Items */}
        <div className="space-y-2">
          <Typography variant="body-medium" className="font-medium">
            Checklist Items
          </Typography>
          <Typography variant="body-small" textColor="muted">
            Enter each item on a new line
          </Typography>
          <TextArea
            value={formData.items}
            onChange={(e) => setFormData(prev => ({ ...prev, items: e.target.value }))}
            placeholder="Enter checklist items (one per line)..."
            rows={6}
            className="w-full"
          />
        </div>

        {/* Preview */}
        {formData.name && (
          <div className="space-y-2">
            <Typography variant="body-medium" className="font-medium">
              Preview
            </Typography>
            <div className="bg-muted/30 rounded-lg p-4 border">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: formData.color }}
                />
                <Typography variant="body-medium" className="font-medium">
                  {formData.name}
                </Typography>
              </div>
              {formData.items.split('\n').filter(item => item.trim()).length > 0 && (
                <div className="space-y-1">
                  {formData.items
                    .split('\n')
                    .filter(item => item.trim())
                    .slice(0, 3)
                    .map((item, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-4 h-4 border rounded flex items-center justify-center">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        {item.trim()}
                      </div>
                    ))}
                  {formData.items.split('\n').filter(item => item.trim()).length > 3 && (
                    <div className="text-xs text-muted-foreground ml-6">
                      +{formData.items.split('\n').filter(item => item.trim()).length - 3} more items
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </ModalBody>

      <ModalFooter className="flex gap-3">
        <Button
          variant="outline"
          onClick={handleClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!formData.name.trim() || isSubmitting}
          loading={isSubmitting}
        >
          Create Template
        </Button>
      </ModalFooter>
    </Modal>
  );
};
