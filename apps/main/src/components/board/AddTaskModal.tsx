import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  ModalHeader, 
  ModalBody, 
  ModalFooter,
  Button,
  Input,
  Select,
  SelectOption,
  Badge,
  Typography,
  Stack,
  Flex
} from '@taskflow/ui';
import type { Task, Column } from '../../store/slices/taskSlice';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: Partial<Task>) => Promise<void>;
  selectedColumn?: string;
  columns?: Column[];
}

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

const STATUS_OPTIONS = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'done', label: 'Done' },
];

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  selectedColumn,
  columns = [],
}) => {
  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    column: selectedColumn || '',
    estimatedHours: 0,
    tags: [],
    assignees: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [assigneeInput, setAssigneeInput] = useState('');

  useEffect(() => {
    if (selectedColumn) {
      setFormData(prev => ({ ...prev, column: selectedColumn }));
    }
  }, [selectedColumn]);

  const handleInputChange = (field: keyof Task, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const handleAddAssignee = () => {
    if (assigneeInput.trim() && !formData.assignees?.includes(assigneeInput.trim())) {
      setFormData(prev => ({
        ...prev,
        assignees: [...(prev.assignees || []), assigneeInput.trim()]
      }));
      setAssigneeInput('');
    }
  };

  const handleRemoveAssignee = (assigneeToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      assignees: prev.assignees?.filter(assignee => assignee !== assigneeToRemove) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim() || !formData.column) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      handleClose();
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      status: 'todo',
      column: selectedColumn || '',
      estimatedHours: 0,
      tags: [],
      assignees: [],
    });
    setTagInput('');
    setAssigneeInput('');
    setIsSubmitting(false);
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalHeader>
        <Typography variant="h3">Create New Task</Typography>
      </ModalHeader>
      
      <form onSubmit={handleSubmit}>
        <ModalBody>
          <Stack spacing="lg">
            {/* Basic Information */}
            <div>
              <Typography variant="body-medium" className="mb-2 font-semibold">
                Basic Information
              </Typography>
              <Stack spacing="md">
                <div>
                  <Typography variant="body-small" className="mb-1 text-muted-foreground">
                    Title *
                  </Typography>
                  <Input
                    value={formData.title || ''}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter task title"
                    required
                  />
                </div>
                
                <div>
                  <Typography variant="body-small" className="mb-1 text-muted-foreground">
                    Description
                  </Typography>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter task description"
                    rows={3}
                    className="w-full p-3 border border-border rounded-lg bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </Stack>
            </div>

            {/* Task Properties */}
            <div>
              <Typography variant="body-medium" className="mb-2 font-semibold">
                Task Properties
              </Typography>
              <Stack spacing="md">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Typography variant="body-small" className="mb-1 text-muted-foreground">
                      Priority
                    </Typography>
                    <Select
                      value={formData.priority}
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                    >
                      {PRIORITY_OPTIONS.map(option => (
                        <SelectOption key={option.value} value={option.value}>
                          {option.label}
                        </SelectOption>
                      ))}
                    </Select>
                  </div>
                  
                  <div>
                    <Typography variant="body-small" className="mb-1 text-muted-foreground">
                      Status
                    </Typography>
                    <Select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                    >
                      {STATUS_OPTIONS.map(option => (
                        <SelectOption key={option.value} value={option.value}>
                          {option.label}
                        </SelectOption>
                      ))}
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Typography variant="body-small" className="mb-1 text-muted-foreground">
                      Column *
                    </Typography>
                    <Select
                      value={formData.column}
                      onChange={(e) => handleInputChange('column', e.target.value)}
                      required
                    >
                      <SelectOption value="">Select column</SelectOption>
                      {columns.map(column => (
                        <SelectOption key={column._id} value={column._id}>
                          {column.name}
                        </SelectOption>
                      ))}
                    </Select>
                  </div>
                  
                  <div>
                    <Typography variant="body-small" className="mb-1 text-muted-foreground">
                      Estimated Hours
                    </Typography>
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      value={formData.estimatedHours || 0}
                      onChange={(e) => handleInputChange('estimatedHours', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                </div>
              </Stack>
            </div>

            {/* Tags */}
            <div>
              <Typography variant="body-medium" className="mb-2 font-semibold">
                Tags
              </Typography>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add a tag"
                    onKeyPress={(e) => handleKeyPress(e, handleAddTag)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddTag}
                    disabled={!tagInput.trim()}
                  >
                    Add
                  </Button>
                </div>
                {formData.tags && formData.tags.length > 0 && (
                  <Flex wrap="wrap" gap="sm">
                    {formData.tags.map(tag => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="cursor-pointer hover:bg-error/10"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        {tag} ×
                      </Badge>
                    ))}
                  </Flex>
                )}
              </div>
            </div>

            {/* Assignees */}
            <div>
              <Typography variant="body-medium" className="mb-2 font-semibold">
                Assignees
              </Typography>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={assigneeInput}
                    onChange={(e) => setAssigneeInput(e.target.value)}
                    placeholder="Add an assignee"
                    onKeyPress={(e) => handleKeyPress(e, handleAddAssignee)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddAssignee}
                    disabled={!assigneeInput.trim()}
                  >
                    Add
                  </Button>
                </div>
                {formData.assignees && formData.assignees.length > 0 && (
                  <Flex wrap="wrap" gap="sm">
                    {formData.assignees.map(assignee => (
                      <Badge
                        key={assignee}
                        variant="secondary"
                        className="cursor-pointer hover:bg-error/10"
                        onClick={() => handleRemoveAssignee(assignee)}
                      >
                        {assignee} ×
                      </Badge>
                    ))}
                  </Flex>
                )}
              </div>
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
            disabled={!formData.title?.trim() || !formData.column || isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Task'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};
