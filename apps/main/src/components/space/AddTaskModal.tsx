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
import type { Task } from '../../types/task.types';
import type { Column } from '../../types/board.types';
import { UserService, type User } from '../../services/userService';
import type { AddTaskModalProps } from '../../types/interfaces/ui';

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
  selectedBoard,
  columns = [],
}) => {
  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    color: '#6B7280',
    board: selectedBoard || '',
    column: selectedColumn || '',
    estimatedHours: 0,
    dueDate: '',
    tags: [],
    assignees: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [assigneeInput, setAssigneeInput] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (selectedColumn) {
      setFormData(prev => ({ ...prev, column: selectedColumn }));
    }
    if (selectedBoard) {
      setFormData(prev => ({ ...prev, board: selectedBoard }));
    }
  }, [selectedColumn, selectedBoard]);

  // Load users for autocomplete
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoadingUsers(true);
        const response = await UserService.getUsers();
        setUsers(response.data || []);
      } catch (error) {
        console.error('Failed to load users:', error);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  // Filter users based on input
  useEffect(() => {
    if (assigneeInput.trim()) {
      const filtered = users.filter(user => 
        user.name.toLowerCase().includes(assigneeInput.toLowerCase()) ||
        user.email.toLowerCase().includes(assigneeInput.toLowerCase())
      );
      setFilteredUsers(filtered);
      setShowUserDropdown(filtered.length > 0);
    } else {
      setFilteredUsers([]);
      setShowUserDropdown(false);
    }
  }, [assigneeInput, users]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Title validation
    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters long';
    } else if (formData.title.trim().length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    // Column validation - only required if no column is pre-selected
    if (!selectedColumn && !formData.column) {
      newErrors.column = 'Please select a column';
    }

    // Due date validation
    if (formData.dueDate) {
      const dueDate = new Date(formData.dueDate);
      const now = new Date();
      if (dueDate < now) {
        newErrors.dueDate = 'Due date cannot be in the past';
      }
    }

    // Estimated hours validation
    if (formData.estimatedHours && formData.estimatedHours < 0) {
      newErrors.estimatedHours = 'Estimated hours cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof Task, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
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
      setShowUserDropdown(false);
    }
  };

  const handleSelectUser = (user: User) => {
    const userDisplay = user.name || user.email;
    if (!formData.assignees?.includes(userDisplay)) {
      setFormData(prev => ({
        ...prev,
        assignees: [...(prev.assignees || []), userDisplay]
      }));
    }
    setAssigneeInput('');
    setShowUserDropdown(false);
  };

  const handleRemoveAssignee = (assigneeToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      assignees: prev.assignees?.filter(assignee => assignee !== assigneeToRemove) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Transform formData to match CreateTaskForm interface
      const taskData = {
        title: formData.title || '',
        description: formData.description || '',
        boardId: formData.board || '',
        columnId: formData.column || '',
        priority: formData.priority || 'medium',
        color: formData.color || '#6B7280',
        assignees: formData.assignees || [],
        tags: formData.tags || [],
        estimatedHours: formData.estimatedHours || 0,
        dueDate: formData.dueDate || '',
        position: formData.position || 0,
      };
      
      await onSubmit(taskData);
      handleClose();
    } catch (error) {
      console.error('Failed to create task:', error);
      // Show error message to user
      setErrors({ submit: 'Failed to create task. Please try again.' });
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
      color: '#6B7280',
      column: selectedColumn || '',
      estimatedHours: 0,
      dueDate: '',
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
          {/* General Error Message */}
          {errors.submit && (
            <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg">
              <Typography variant="body-small" className="text-error">
                {errors.submit}
              </Typography>
            </div>
          )}
          
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
                    className={errors.title ? 'border-error' : ''}
                  />
                  {errors.title && (
                    <Typography variant="body-small" className="mt-1 text-error">
                      {errors.title}
                    </Typography>
                  )}
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
                    className="w-full p-3 border border-border rounded-lg bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 caret-foreground"
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

                {/* Color Picker */}
                <div>
                  <Typography variant="body-small" className="mb-1 text-muted-foreground">
                    Color
                  </Typography>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.color || '#6B7280'}
                      onChange={(e) => handleInputChange('color', e.target.value)}
                      className="w-12 h-10 border border-border rounded-lg cursor-pointer bg-background"
                    />
                    <div className="flex flex-wrap gap-2">
                      {[
                        '#6B7280', '#EF4444', '#F97316', '#EAB308', '#22C55E',
                        '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899', '#84CC16'
                      ].map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => handleInputChange('color', color)}
                          className={`w-8 h-8 rounded-lg border-2 transition-all duration-200 ${
                            formData.color === color 
                              ? 'border-foreground scale-110 shadow-md' 
                              : 'border-border hover:scale-105'
                          }`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Only show column selection if no column is pre-selected */}
                  {!selectedColumn && (
                    <div>
                      <Typography variant="body-small" className="mb-1 text-muted-foreground">
                        Column *
                      </Typography>
                      <Select
                        value={formData.column}
                        onChange={(e) => handleInputChange('column', e.target.value)}
                        required
                        className={errors.column ? 'border-error' : ''}
                      >
                        <SelectOption value="">Select column</SelectOption>
                        {columns.map(column => (
                          <SelectOption key={column._id} value={column._id}>
                            {column.name}
                          </SelectOption>
                        ))}
                      </Select>
                      {errors.column && (
                        <Typography variant="body-small" className="mt-1 text-error">
                          {errors.column}
                        </Typography>
                      )}
                    </div>
                  )}
                  
                  {/* Show selected column info if column is pre-selected */}
                  {selectedColumn && (
                    <div>
                      <Typography variant="body-small" className="mb-1 text-muted-foreground">
                        Column
                      </Typography>
                      <div className="p-3 border border-border rounded-lg bg-muted/20">
                        <Typography variant="body-medium" className="font-medium">
                          {columns.find(col => col._id === selectedColumn)?.name || 'Unknown Column'}
                        </Typography>
                      </div>
                    </div>
                  )}
                  
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

                <div>
                  <Typography variant="body-small" className="mb-1 text-muted-foreground">
                    Due Date
                  </Typography>
                  <Input
                    type="datetime-local"
                    value={formData.dueDate || ''}
                    onChange={(e) => handleInputChange('dueDate', e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    className={errors.dueDate ? 'border-error' : ''}
                  />
                  {errors.dueDate && (
                    <Typography variant="body-small" className="mt-1 text-error">
                      {errors.dueDate}
                    </Typography>
                  )}
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
                <div className="relative">
                  <Input
                    value={assigneeInput}
                    onChange={(e) => setAssigneeInput(e.target.value)}
                    placeholder="Search users by name or email"
                    onKeyPress={(e) => handleKeyPress(e, handleAddAssignee)}
                    onFocus={() => setShowUserDropdown(assigneeInput.trim().length > 0 && filteredUsers.length > 0)}
                  />
                  
                  {/* User Autocomplete Dropdown */}
                  {showUserDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {isLoadingUsers ? (
                        <div className="p-3 text-center text-muted-foreground">
                          Loading users...
                        </div>
                      ) : filteredUsers.length > 0 ? (
                        filteredUsers.map(user => (
                          <div
                            key={user._id}
                            className="p-3 hover:bg-muted cursor-pointer border-b border-border last:border-b-0"
                            onClick={() => handleSelectUser(user)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                                {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-sm text-muted-foreground">{user.email}</div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : assigneeInput.trim() && (
                        <div className="p-3 text-center text-muted-foreground">
                          No users found
                        </div>
                      )}
                    </div>
                  )}
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
            disabled={Object.keys(errors).length > 0 || isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Task'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};
