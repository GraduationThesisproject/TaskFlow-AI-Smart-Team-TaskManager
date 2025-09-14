import React, { useState } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Typography
} from '@taskflow/ui';

interface AddTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (tag: { name: string; color: string }) => Promise<void>;
}

const TAG_COLORS = [
  { name: "Blue", value: "#3B82F6", bg: "bg-blue-500" },
  { name: "Green", value: "#10B981", bg: "bg-green-500" },
  { name: "Purple", value: "#8B5CF6", bg: "bg-purple-500" },
  { name: "Pink", value: "#EC4899", bg: "bg-pink-500" },
  { name: "Orange", value: "#F59E0B", bg: "bg-orange-500" },
  { name: "Red", value: "#EF4444", bg: "bg-red-500" },
  { name: "Teal", value: "#14B8A6", bg: "bg-teal-500" },
  { name: "Indigo", value: "#6366F1", bg: "bg-indigo-500" },
];

export const AddTagModal: React.FC<AddTagModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    name: '',
    color: '#3B82F6'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: formData.name.trim(),
        color: formData.color
      });

      // Reset form
      setFormData({
        name: '',
        color: '#3B82F6'
      });
      onClose();
    } catch (error) {
      console.error('Failed to create tag:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        name: '',
        color: '#3B82F6'
      });
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalHeader>
        <Typography variant="h2">Create Tag</Typography>
        <Typography variant="body-small" textColor="muted" className="mt-1">
          Create a reusable tag for your board
        </Typography>
      </ModalHeader>

      <ModalBody className="space-y-6">
        {/* Tag Name */}
        <div className="space-y-2">
          <Typography variant="body-medium" className="font-medium">
            Tag Name
          </Typography>
          <Input
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter tag name..."
            className="w-full"
          />
        </div>

        {/* Color Picker */}
        <div className="space-y-3">
          <Typography variant="body-medium" className="font-medium">
            Color
          </Typography>
          <div className="flex flex-wrap gap-2">
            {TAG_COLORS.map((color) => (
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

        {/* Preview */}
        {formData.name && (
          <div className="space-y-2">
            <Typography variant="body-medium" className="font-medium">
              Preview
            </Typography>
            <div className="bg-muted/30 rounded-lg p-4 border">
              <div 
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/20 transition-all"
                style={{ 
                  backgroundColor: `${formData.color}08`,
                  borderColor: `${formData.color}40`,
                }}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full shadow-sm"
                  style={{ backgroundColor: formData.color }}
                />
                <Typography 
                  variant="body-small" 
                  className="font-medium"
                  style={{ color: formData.color }}
                >
                  {formData.name}
                </Typography>
              </div>
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
          Create Tag
        </Button>
      </ModalFooter>
    </Modal>
  );
};
