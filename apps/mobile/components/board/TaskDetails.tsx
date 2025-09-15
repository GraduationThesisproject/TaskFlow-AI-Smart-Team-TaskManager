/**
 * TaskDetails Component - Modal for viewing and editing task details
 * Optimized for performance with memoization
 */

import React, { memo, useCallback, useState, useEffect, useMemo } from 'react';
import {
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import {
  Calendar,
  Clock,
  User,
  Tag,
  Paperclip,
  MessageSquare,
  X,
  Check,
  Trash2,
  AlertCircle,
} from 'lucide-react-native';
import { View, Text } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TaskDetailsProps, TaskPriority, TaskStatus, DragTask } from '@/types/dragBoard.types';

// Priority options
const PRIORITY_OPTIONS: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: '#22c55e' },
  { value: 'medium', label: 'Medium', color: '#eab308' },
  { value: 'high', label: 'High', color: '#f97316' },
  { value: 'urgent', label: 'Urgent', color: '#ef4444' },
];

// Status options
const STATUS_OPTIONS: { value: TaskStatus; label: string; color: string }[] = [
  { value: 'todo', label: 'To Do', color: '#94a3b8' },
  { value: 'in_progress', label: 'In Progress', color: '#3b82f6' },
  { value: 'review', label: 'Review', color: '#a855f7' },
  { value: 'done', label: 'Done', color: '#10b981' },
];

export const TaskDetails = memo<TaskDetailsProps>(({
  task,
  visible,
  onClose,
  onUpdate,
  onDelete,
}) => {
  const colors = useThemeColors();
  
  // Local state for editing
  const [editedTask, setEditedTask] = useState<DragTask | null>(task);
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Update local state when task changes
  useEffect(() => {
    setEditedTask(task);
    setIsEditing(false);
    setHasChanges(false);
  }, [task]);

  // Handle field changes
  const handleFieldChange = useCallback((field: keyof DragTask, value: any) => {
    if (!editedTask) return;
    
    setEditedTask(prev => ({
      ...prev!,
      [field]: value,
    }));
    setHasChanges(true);
    setIsEditing(true);
  }, [editedTask]);

  // Save changes
  const handleSave = useCallback(() => {
    if (!editedTask || !hasChanges) return;
    
    const updates: Partial<DragTask> = {
      title: editedTask.title,
      description: editedTask.description,
      priority: editedTask.priority,
      status: editedTask.status,
      dueDate: editedTask.dueDate,
      tags: editedTask.tags,
    };
    
    onUpdate(updates);
    setIsEditing(false);
    setHasChanges(false);
  }, [editedTask, hasChanges, onUpdate]);

  // Cancel editing
  const handleCancel = useCallback(() => {
    setEditedTask(task);
    setIsEditing(false);
    setHasChanges(false);
  }, [task]);

  // Delete task
  const handleDelete = useCallback(() => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onDelete?.();
            onClose();
          },
        },
      ]
    );
  }, [onDelete, onClose]);

  // Format date
  const formatDate = useCallback((date?: string) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString('en', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  // Check if overdue
  const isOverdue = useMemo(() => {
    if (!editedTask?.dueDate) return false;
    return new Date(editedTask.dueDate) < new Date();
  }, [editedTask?.dueDate]);

  if (!editedTask) return null;

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      onRequestClose={onClose}
    >
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        style={styles.overlay}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <Animated.View
            entering={SlideInDown.springify()}
            exiting={SlideOutDown.springify()}
            style={[styles.modal, { backgroundColor: colors.card }]}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.headerTitle, { color: colors.foreground }]}>
                Task Details
              </Text>
              <View style={styles.headerActions}>
                {hasChanges && (
                  <>
                    <TouchableOpacity
                      style={styles.headerButton}
                      onPress={handleCancel}
                    >
                      <X size={20} color={colors['muted-foreground']} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.saveButton, { backgroundColor: colors.primary }]}
                      onPress={handleSave}
                    >
                      <Check size={20} color="white" />
                    </TouchableOpacity>
                  </>
                )}
                {!hasChanges && (
                  <TouchableOpacity
                    style={styles.headerButton}
                    onPress={onClose}
                  >
                    <X size={20} color={colors['muted-foreground']} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
            >
              {/* Title */}
              <View style={styles.section}>
                <Text style={[styles.label, { color: colors['muted-foreground'] }]}>
                  Title
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: colors.foreground,
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                    },
                  ]}
                  value={editedTask.title}
                  onChangeText={(text) => handleFieldChange('title', text)}
                  placeholder="Task title"
                  placeholderTextColor={colors['muted-foreground']}
                />
              </View>

              {/* Description */}
              <View style={styles.section}>
                <Text style={[styles.label, { color: colors['muted-foreground'] }]}>
                  Description
                </Text>
                <TextInput
                  style={[
                    styles.textArea,
                    {
                      color: colors.foreground,
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                    },
                  ]}
                  value={editedTask.description}
                  onChangeText={(text) => handleFieldChange('description', text)}
                  placeholder="Add a description..."
                  placeholderTextColor={colors['muted-foreground']}
                  multiline
                  numberOfLines={4}
                />
              </View>

              {/* Priority */}
              <View style={styles.section}>
                <Text style={[styles.label, { color: colors['muted-foreground'] }]}>
                  Priority
                </Text>
                <View style={styles.optionsGrid}>
                  {PRIORITY_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.option,
                        {
                          backgroundColor:
                            editedTask.priority === option.value
                              ? option.color
                              : colors.muted,
                          borderColor:
                            editedTask.priority === option.value
                              ? option.color
                              : colors.border,
                        },
                      ]}
                      onPress={() => handleFieldChange('priority', option.value)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          {
                            color:
                              editedTask.priority === option.value
                                ? 'white'
                                : colors.foreground,
                          },
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Status */}
              <View style={styles.section}>
                <Text style={[styles.label, { color: colors['muted-foreground'] }]}>
                  Status
                </Text>
                <View style={styles.optionsGrid}>
                  {STATUS_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.option,
                        {
                          backgroundColor:
                            editedTask.status === option.value
                              ? option.color
                              : colors.muted,
                          borderColor:
                            editedTask.status === option.value
                              ? option.color
                              : colors.border,
                        },
                      ]}
                      onPress={() => handleFieldChange('status', option.value)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          {
                            color:
                              editedTask.status === option.value
                                ? 'white'
                                : colors.foreground,
                          },
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Due Date */}
              <View style={styles.section}>
                <Text style={[styles.label, { color: colors['muted-foreground'] }]}>
                  Due Date
                </Text>
                <TouchableOpacity
                  style={[
                    styles.dateButton,
                    {
                      backgroundColor: colors.background,
                      borderColor: isOverdue ? '#ef4444' : colors.border,
                    },
                  ]}
                >
                  <Calendar
                    size={18}
                    color={isOverdue ? '#ef4444' : colors['muted-foreground']}
                  />
                  <Text
                    style={[
                      styles.dateText,
                      {
                        color: isOverdue ? '#ef4444' : colors.foreground,
                      },
                    ]}
                  >
                    {formatDate(editedTask.dueDate)}
                  </Text>
                  {isOverdue && (
                    <View style={styles.overdueBadge}>
                      <AlertCircle size={14} color="#ef4444" />
                      <Text style={styles.overdueText}>Overdue</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* Assignees */}
              <View style={styles.section}>
                <Text style={[styles.label, { color: colors['muted-foreground'] }]}>
                  Assignees
                </Text>
                <View style={styles.assigneesList}>
                  {editedTask.assignees.map((assignee) => (
                    <View
                      key={assignee.id}
                      style={[
                        styles.assigneeChip,
                        { backgroundColor: colors.muted },
                      ]}
                    >
                      <View
                        style={[styles.assigneeAvatar, { backgroundColor: colors.primary }]}
                      >
                        <Text style={styles.assigneeAvatarText}>
                          {assignee.name[0].toUpperCase()}
                        </Text>
                      </View>
                      <Text style={[styles.assigneeName, { color: colors.foreground }]}>
                        {assignee.name}
                      </Text>
                    </View>
                  ))}
                  <TouchableOpacity
                    style={[
                      styles.addAssigneeButton,
                      { borderColor: colors.border },
                    ]}
                  >
                    <User size={16} color={colors['muted-foreground']} />
                    <Text style={[styles.addAssigneeText, { color: colors['muted-foreground'] }]}>
                      Add assignee
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Tags */}
              {editedTask.tags && editedTask.tags.length > 0 && (
                <View style={styles.section}>
                  <Text style={[styles.label, { color: colors['muted-foreground'] }]}>
                    Tags
                  </Text>
                  <View style={styles.tagsList}>
                    {editedTask.tags.map((tag, index) => (
                      <View
                        key={index}
                        style={[styles.tag, { backgroundColor: colors.primary + '20' }]}
                      >
                        <Tag size={12} color={colors.primary} />
                        <Text style={[styles.tagText, { color: colors.primary }]}>
                          {tag}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Metadata */}
              <View style={[styles.metadata, { backgroundColor: colors.muted }]}>
                <View style={styles.metaRow}>
                  <Clock size={14} color={colors['muted-foreground']} />
                  <Text style={[styles.metaLabel, { color: colors['muted-foreground'] }]}>
                    Created:
                  </Text>
                  <Text style={[styles.metaValue, { color: colors.foreground }]}>
                    {formatDate(editedTask.createdAt)}
                  </Text>
                </View>
                <View style={styles.metaRow}>
                  <Clock size={14} color={colors['muted-foreground']} />
                  <Text style={[styles.metaLabel, { color: colors['muted-foreground'] }]}>
                    Updated:
                  </Text>
                  <Text style={[styles.metaValue, { color: colors.foreground }]}>
                    {formatDate(editedTask.updatedAt)}
                  </Text>
                </View>
                {editedTask.comments && editedTask.comments > 0 && (
                  <View style={styles.metaRow}>
                    <MessageSquare size={14} color={colors['muted-foreground']} />
                    <Text style={[styles.metaValue, { color: colors.foreground }]}>
                      {editedTask.comments} comments
                    </Text>
                  </View>
                )}
                {editedTask.attachments && editedTask.attachments > 0 && (
                  <View style={styles.metaRow}>
                    <Paperclip size={14} color={colors['muted-foreground']} />
                    <Text style={[styles.metaValue, { color: colors.foreground }]}>
                      {editedTask.attachments} attachments
                    </Text>
                  </View>
                )}
              </View>

              {/* Delete Button */}
              {onDelete && (
                <TouchableOpacity
                  style={[styles.deleteButton, { backgroundColor: colors.destructive }]}
                  onPress={handleDelete}
                >
                  <Trash2 size={18} color="white" />
                  <Text style={styles.deleteButtonText}>Delete Task</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
});

TaskDetails.displayName = 'TaskDetails';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
  },
  saveButton: {
    padding: 8,
    borderRadius: 8,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  dateText: {
    fontSize: 14,
    flex: 1,
  },
  overdueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  overdueText: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '600',
  },
  assigneesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  assigneeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 12,
    paddingVertical: 4,
    paddingLeft: 4,
    borderRadius: 20,
    gap: 6,
  },
  assigneeAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assigneeAvatarText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  assigneeName: {
    fontSize: 13,
  },
  addAssigneeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: 6,
  },
  addAssigneeText: {
    fontSize: 13,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  metadata: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  metaLabel: {
    fontSize: 12,
  },
  metaValue: {
    fontSize: 12,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    gap: 8,
    marginBottom: 20,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
