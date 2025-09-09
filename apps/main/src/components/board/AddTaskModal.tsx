import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  ModalHeader, 
  ModalBody,
  Button,
  Input,
  Select,
  SelectOption,
  Badge,
  Typography,
  Flex,
  TextArea,
  Card,
  Avatar,
  AvatarImage,
  AvatarFallback,
  getInitials,
  getAvatarColor
} from '@taskflow/ui';
import type { CreateTaskForm } from '../../types/task.types';
import type { AddTaskModalProps } from '../../types/interfaces/ui';

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800 border-gray-200' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800 border-red-200' },
];

const COLOR_PRESETS = [
  { value: '#6B7280', name: 'Gray' },
  { value: '#EF4444', name: 'Red' },
  { value: '#F97316', name: 'Orange' },
  { value: '#EAB308', name: 'Yellow' },
  { value: '#22C55E', name: 'Green' },
  { value: '#06B6D4', name: 'Cyan' },
  { value: '#3B82F6', name: 'Blue' },
  { value: '#8B5CF6', name: 'Purple' },
  { value: '#EC4899', name: 'Pink' },
  { value: '#84CC16', name: 'Lime' },
];

// Mock users for demonstration - in real app, this would come from props or context
const mockUsers = [
  { _id: '1', name: 'John Doe', email: 'john@example.com', avatar: '' },
  { _id: '2', name: 'Jane Smith', email: 'jane@example.com', avatar: '' },
  { _id: '3', name: 'Bob Johnson', email: 'bob@example.com', avatar: '' },
  { _id: '4', name: 'Alice Brown', email: 'alice@example.com', avatar: '' },
  { _id: '5', name: 'Charlie Wilson', email: 'charlie@example.com', avatar: '' },
];

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  selectedColumn,
  columns = [],
  boardId,
}) => {
  const [formData, setFormData] = useState<CreateTaskForm>({
    title: '',
    description: '',
    boardId: boardId || '',
    columnId: selectedColumn || '',
    priority: 'medium',
    color: '#6B7280',
    assignees: [],
    tags: [],
    estimatedHours: 0,
    dueDate: '',
    checklist: {
      title: 'Checklist',
      items: []
    }
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [checklistItemInput, setChecklistItemInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showColorPicker, setShowColorPicker] = useState(false);

  useEffect(() => {
    if (selectedColumn) {
      setFormData(prev => ({ ...prev, columnId: selectedColumn }));
    }
  }, [selectedColumn]);

  useEffect(() => {
    if (boardId) {
      setFormData(prev => ({ ...prev, boardId }));
    }
  }, [boardId]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title cannot exceed 200 characters';
    }

    if (formData.description && formData.description.length > 2000) {
      newErrors.description = 'Description cannot exceed 2000 characters';
    }

    if (!formData.boardId) {
      newErrors.boardId = 'Board is required';
    }

    if (!formData.columnId) {
      newErrors.columnId = 'Column is required';
    }

    if (formData.estimatedHours && formData.estimatedHours < 0) {
      newErrors.estimatedHours = 'Estimated hours cannot be negative';
    }

    if (formData.dueDate && new Date(formData.dueDate) < new Date()) {
      newErrors.dueDate = 'Due date cannot be in the past';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof CreateTaskForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      if (formData.tags.length >= 10) {
        setErrors(prev => ({ ...prev, tags: 'Maximum 10 tags allowed' }));
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }));
      setTagInput('');
      setErrors(prev => ({ ...prev, tags: '' }));
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };


  const handleSelectUser = (userId: string) => {
    const user = mockUsers.find(u => u._id === userId);
    if (user && !formData.assignees?.includes(userId)) {
      setFormData(prev => ({
        ...prev,
        assignees: [...(prev.assignees || []), userId]
      }));
    }
  };

  const handleRemoveUser = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      assignees: prev.assignees?.filter(id => id !== userId) || []
    }));
  };

  const handleAddChecklistItem = () => {
    if (checklistItemInput.trim()) {
      setFormData(prev => ({
        ...prev,
        checklist: {
          ...prev.checklist!,
          items: [...(prev.checklist?.items || []), {
            text: checklistItemInput.trim(),
            completed: false
          }]
        }
      }));
      setChecklistItemInput('');
    }
  };

  const handleRemoveChecklistItem = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      checklist: {
        ...prev.checklist!,
        items: prev.checklist?.items.filter((_, index) => index !== indexToRemove) || []
      }
    }));
  };

  const handleToggleChecklistItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      checklist: {
        ...prev.checklist!,
        items: prev.checklist?.items.map((item, i) => 
          i === index ? { ...item, completed: !item.completed } : item
        ) || []
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare data for backend
      const taskData: CreateTaskForm = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description?.trim() || undefined,
        estimatedHours: formData.estimatedHours || undefined,
        dueDate: formData.dueDate || undefined,
      };

      await onSubmit(taskData);
      handleClose();
    } catch (error) {
      console.error('Failed to create task:', error);
      setErrors({ submit: 'Failed to create task. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      boardId: boardId || '',
      columnId: selectedColumn || '',
      priority: 'medium',
      color: '#6B7280',
      assignees: [],
      tags: [],
      estimatedHours: 0,
      dueDate: '',
      checklist: {
        title: 'Checklist',
        items: []
      }
    });
    setTagInput('');
    setChecklistItemInput('');
    setErrors({});
    setIsSubmitting(false);
    setShowColorPicker(false);
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  };

  const getSelectedUsers = () => {
    return mockUsers.filter(user => formData.assignees?.includes(user._id));
  };

  return (
    <>
      {/* Hide the default close button */}
      <style>{`
        [aria-label="Close modal"] {
          display: none !important;
        }
        .modal-close-button {
          display: none !important;
        }
      `}</style>
      
      <Modal isOpen={isOpen} onClose={handleClose} size="xl">
        <ModalHeader className="border-b border-border/30 pb-3">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              {/* Task Color Indicator */}
              <div className="relative">
                <div
                  className="w-4 h-4 rounded-full border-2 border-white shadow-sm cursor-pointer hover:scale-110 transition-transform"
                  style={{ backgroundColor: formData.color }}
                  onClick={() => setShowColorPicker(!showColorPicker)}
                />
                {showColorPicker && (
                  <div className="absolute top-6 left-0 z-50 bg-background border border-border rounded-lg shadow-lg p-3">
                    <div className="flex flex-wrap gap-2 w-48">
                      {COLOR_PRESETS.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => {
                            handleInputChange('color', color.value);
                            setShowColorPicker(false);
                          }}
                          className={`w-6 h-6 rounded-md border-2 transition-all duration-200 ${
                            formData.color === color.value
                              ? 'border-foreground scale-110 shadow-md'
                              : 'border-border hover:scale-105'
                          }`}
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <Typography variant="h4" className="font-semibold">
                  Create New Task
                </Typography>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Badge 
                    variant="outline" 
                    size="sm"
                    className={`text-xs px-2 py-0.5 ${PRIORITY_OPTIONS.find(p => p.value === formData.priority)?.color || PRIORITY_OPTIONS[1].color}`}
                  >
                    {PRIORITY_OPTIONS.find(p => p.value === formData.priority)?.label || 'Medium'}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="task-form"
                disabled={!formData.title?.trim() || !formData.columnId || isSubmitting}
                className="px-4 py-1.5 text-xs font-medium bg-primary hover:bg-primary/90 text-white shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creating...
                  </div>
                ) : (
                  'Create Task'
                )}
              </Button>
            </div>
          </div>
        </ModalHeader>
        
        <form id="task-form" onSubmit={handleSubmit}>
          <ModalBody className="p-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 h-[600px]">
              {/* Main Content - Left Side */}
              <div className="lg:col-span-2 p-4 overflow-y-auto">
                <div className="space-y-4">
                  {/* Basic Information */}
                  <Card className="p-4 border border-border/20">
                    <Typography variant="h4" className="font-semibold mb-3 text-sm">
                      Basic Information
                    </Typography>
                    <div className="space-y-3">
                      <div>
                        <Typography variant="body-small" className="text-muted-foreground mb-1.5 text-xs font-medium">
                          Title *
                        </Typography>
                        <Input
                          value={formData.title || ''}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                          placeholder="Enter task title..."
                          className={`text-sm font-medium h-8 ${errors.title ? 'border-red-500' : ''}`}
                          maxLength={200}
                        />
                        {errors.title && (
                          <Typography variant="body-small" className="text-red-500 text-xs mt-1">
                            {errors.title}
                          </Typography>
                        )}
                      </div>
                      
                      <div>
                        <Typography variant="body-small" className="text-muted-foreground mb-1.5 text-xs font-medium">
                          Description
                        </Typography>
                        <TextArea
                          value={formData.description || ''}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          placeholder="Enter task description..."
                          rows={4}
                          className={`resize-none text-sm ${errors.description ? 'border-red-500' : ''}`}
                          maxLength={2000}
                        />
                        {errors.description && (
                          <Typography variant="body-small" className="text-red-500 text-xs mt-1">
                            {errors.description}
                          </Typography>
                        )}
                        <Typography variant="body-small" className="text-muted-foreground text-xs mt-1">
                          {(formData.description?.length || 0)}/2000 characters
                        </Typography>
                      </div>
                    </div>
                  </Card>

                  {/* Task Properties */}
                  <Card className="p-4 border border-border/20">
                    <Typography variant="h4" className="font-semibold mb-3 text-sm">
                      Task Properties
                    </Typography>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Typography variant="body-small" className="text-muted-foreground mb-1.5 text-xs font-medium">
                            Priority
                          </Typography>
                          <Select
                            value={formData.priority}
                            onValueChange={(value) => handleInputChange('priority', value)}
                          >
                            {PRIORITY_OPTIONS.map(option => (
                              <SelectOption key={option.value} value={option.value}>
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${option.color.split(' ')[0]}`}></div>
                                  {option.label}
                                </div>
                              </SelectOption>
                            ))}
                          </Select>
                        </div>
                        
                        <div>
                          <Typography variant="body-small" className="text-muted-foreground mb-1.5 text-xs font-medium">
                            Column *
                          </Typography>
                          <Select
                            value={formData.columnId}
                            onValueChange={(value) => handleInputChange('columnId', value)}
                          >
                            <SelectOption value="">Select column</SelectOption>
                            {columns.map((column: any) => (
                              <SelectOption key={column._id} value={column._id}>
                                {column.name}
                              </SelectOption>
                            ))}
                          </Select>
                          {errors.columnId && (
                            <Typography variant="body-small" className="text-red-500 text-xs mt-1">
                              {errors.columnId}
                            </Typography>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Typography variant="body-small" className="text-muted-foreground mb-1.5 text-xs font-medium">
                            Estimated Hours
                          </Typography>
                          <Input
                            type="number"
                            min="0"
                            step="0.5"
                            value={formData.estimatedHours || ''}
                            onChange={(e) => handleInputChange('estimatedHours', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            className="h-8 text-sm"
                          />
                          {errors.estimatedHours && (
                            <Typography variant="body-small" className="text-red-500 text-xs mt-1">
                              {errors.estimatedHours}
                            </Typography>
                          )}
                        </div>
                        
                        <div>
                          <Typography variant="body-small" className="text-muted-foreground mb-1.5 text-xs font-medium">
                            Due Date
                          </Typography>
                          <Input
                            type="date"
                            value={formData.dueDate || ''}
                            onChange={(e) => handleInputChange('dueDate', e.target.value)}
                            className="h-8 text-sm"
                            min={new Date().toISOString().split('T')[0]}
                          />
                          {errors.dueDate && (
                            <Typography variant="body-small" className="text-red-500 text-xs mt-1">
                              {errors.dueDate}
                            </Typography>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Tags */}
                  <Card className="p-4 border border-border/20">
                    <Typography variant="h4" className="font-semibold mb-3 text-sm">
                      Tags
                    </Typography>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          placeholder="Add a tag"
                          onKeyPress={(e) => handleKeyPress(e, handleAddTag)}
                          className="h-8 text-sm"
                          maxLength={50}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleAddTag}
                          disabled={!tagInput.trim() || formData.tags.length >= 10}
                          className="px-3 py-1 text-xs"
                        >
                          Add
                        </Button>
                      </div>
                      {errors.tags && (
                        <Typography variant="body-small" className="text-red-500 text-xs">
                          {errors.tags}
                        </Typography>
                      )}
                      {formData.tags && formData.tags.length > 0 && (
                        <Flex wrap="wrap" gap="sm">
                          {formData.tags.map(tag => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="cursor-pointer hover:bg-error/10 text-xs px-2 py-0.5"
                              onClick={() => handleRemoveTag(tag)}
                            >
                              {tag} ×
                            </Badge>
                          ))}
                        </Flex>
                      )}
                      <Typography variant="body-small" className="text-muted-foreground text-xs">
                        {formData.tags.length}/10 tags
                      </Typography>
                    </div>
                  </Card>

                  {/* Assignees */}
                  <Card className="p-4 border border-border/20">
                    <Typography variant="h4" className="font-semibold mb-3 text-sm">
                      Assignees
                    </Typography>
                    <div className="space-y-3">
                      {/* Selected Users */}
                      {getSelectedUsers().length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {getSelectedUsers().map(user => (
                            <div key={user._id} className="flex items-center gap-2 bg-muted/20 rounded-lg px-2 py-1">
                              <Avatar size="sm" className="w-6 h-6">
                                {user.avatar ? (
                                  <AvatarImage src={user.avatar} alt={user.name} />
                                ) : null}
                                <AvatarFallback variant={getAvatarColor(user.name)} className="text-xs">
                                  {getInitials(user.name)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs font-medium">{user.name}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveUser(user._id)}
                                className="p-0 h-4 w-4 text-muted-foreground hover:text-red-600"
                              >
                                ×
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Available Users */}
                      <div>
                        <Typography variant="body-small" className="text-muted-foreground mb-2 text-xs font-medium">
                          Available Users
                        </Typography>
                        <div className="grid grid-cols-1 gap-1 max-h-32 overflow-y-auto">
                          {mockUsers
                            .filter(user => !formData.assignees?.includes(user._id))
                            .map(user => (
                              <div
                                key={user._id}
                                className="flex items-center gap-2 p-2 hover:bg-muted/20 rounded-lg cursor-pointer transition-colors"
                                onClick={() => handleSelectUser(user._id)}
                              >
                                <Avatar size="sm" className="w-6 h-6">
                                  {user.avatar ? (
                                    <AvatarImage src={user.avatar} alt={user.name} />
                                  ) : null}
                                  <AvatarFallback variant={getAvatarColor(user.name)} className="text-xs">
                                    {getInitials(user.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <Typography variant="body-small" className="text-xs font-medium">
                                    {user.name}
                                  </Typography>
                                  <Typography variant="body-small" className="text-xs text-muted-foreground">
                                    {user.email}
                                  </Typography>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Submit Error */}
                  {errors.submit && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <Typography variant="body-small" className="text-red-600 text-xs">
                        {errors.submit}
                      </Typography>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Sidebar - Checklist */}
              <div className="lg:col-span-1 border-l border-border/20 p-4 overflow-y-auto">
                <Card className="p-4 border border-border/20 h-full">
                  <Typography variant="h4" className="font-semibold mb-3 text-sm">
                    Checklist
                  </Typography>
                  <div className="space-y-3 h-full flex flex-col">
                    <div className="flex gap-2">
                      <Input
                        value={checklistItemInput}
                        onChange={(e) => setChecklistItemInput(e.target.value)}
                        placeholder="Add checklist item"
                        onKeyPress={(e) => handleKeyPress(e, handleAddChecklistItem)}
                        className="h-8 text-sm"
                        maxLength={500}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddChecklistItem}
                        disabled={!checklistItemInput.trim()}
                        className="px-3 py-1 text-xs"
                      >
                        Add
                      </Button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto">
                      {formData.checklist?.items && formData.checklist.items.length > 0 ? (
                        <div className="space-y-2">
                          {formData.checklist.items.map((item, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-muted/20 rounded-lg">
                              <input
                                type="checkbox"
                                checked={item.completed || false}
                                onChange={() => handleToggleChecklistItem(index)}
                                className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
                              />
                              <span className={`flex-1 text-sm ${item.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                {item.text}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveChecklistItem(index)}
                                className="p-1 h-6 w-6 text-muted-foreground hover:text-red-600 hover:bg-red-50"
                              >
                                ×
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Typography variant="body-small" className="text-muted-foreground text-xs">
                            No checklist items yet
                          </Typography>
                          <Typography variant="body-small" className="text-muted-foreground text-xs mt-1">
                            Add items to create a checklist
                          </Typography>
                        </div>
                      )}
                    </div>
                    
                    <div className="border-t border-border/30 pt-2">
                      <Typography variant="body-small" className="text-muted-foreground text-xs">
                        {formData.checklist?.items.length || 0} items
                      </Typography>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </ModalBody>
        </form>
      </Modal>
    </>
  );
};