import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Typography, Card, CardContent, Flex, Stack, ColorPicker, IconPicker } from '@taskflow/ui';
import type { EditColumnModalProps } from '../../types/interfaces/ui';

// Custom preset colors for columns
const columnPresetColors = [
  '#007ADF', // Primary blue
  '#00E8C6', // Accent cyan
  '#10b981', // Success green
  '#f59e0b', // Warning orange
  '#ef4444', // Error red
  '#3b82f6', // Info blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#f97316', // Orange
  '#84cc16', // Lime
  '#06b6d4', // Cyan
  '#6366f1', // Indigo
  '#64748b', // Slate
  '#6b7280', // Gray
  '#374151', // Dark gray
  '#000000', // Black
];

export const EditColumnModal: React.FC<EditColumnModalProps> = ({
  isOpen,
  onClose,
  column,
  onSave
}) => {
  const [name, setName] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#F9FAFB');
  const [icon, setIcon] = useState<string | null>(null);
  const [wipLimit, setWipLimit] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (column) {
      setName(column.name);
      setBackgroundColor(column.style?.backgroundColor || '#F9FAFB');
      setIcon(column.style?.icon || null);
      setWipLimit(column.settings?.wipLimit?.limit || 0);
    }
  }, [column]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!column) return;

    setIsLoading(true);
    try {
      await onSave(column._id, {
        name,
        backgroundColor,
        icon,
        settings: {
          wipLimit: {
            enabled: wipLimit > 0,
            limit: wipLimit,
            strictMode: false
          }
        }
      });
      onClose();
    } catch (error) {
      console.error('Failed to update column:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <Card>
        <CardContent className="p-6">
          <Typography variant="h3" className="mb-6">
            Edit Column
          </Typography>

          <form onSubmit={handleSubmit}>
            <Stack gap={4}>
              <div>
                <Typography variant="body-medium" className="mb-2">
                  Column Name
                </Typography>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter column name"
                  required
                />
              </div>

              <div>
                <Typography variant="body-medium" className="mb-2">
                  Background Color
                </Typography>
                <ColorPicker
                  value={backgroundColor}
                  onChange={setBackgroundColor}
                  placeholder="Choose background color..."
                  presetColors={columnPresetColors}
                  showLabel={false}
                  size="default"
                  variant="outline"
                />
              </div>

              <div>
                <Typography variant="body-medium" className="mb-2">
                  Column Icon
                </Typography>
                <IconPicker
                  value={icon}
                  onChange={setIcon}
                  placeholder="Choose column icon..."
                  showLabel={false}
                  size="default"
                  variant="outline"
                />
              </div>

              <div>
                <Typography variant="body-medium" className="mb-2">
                  WIP Limit (0 = no limit)
                </Typography>
                <Input
                  type="number"
                  value={wipLimit}
                  onChange={(e) => setWipLimit(parseInt(e.target.value) || 0)}
                  min={0}
                  placeholder="0"
                />
              </div>

              <Flex gap={3} className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !name.trim()}
                  className="flex-1"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </Flex>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Modal>
  );
};
