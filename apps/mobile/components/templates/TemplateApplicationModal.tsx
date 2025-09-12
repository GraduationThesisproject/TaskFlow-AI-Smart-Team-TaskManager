import React, { useState } from 'react';
import { StyleSheet, Modal, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, View, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAppDispatch, useAppSelector } from '@/store';
import { createTask } from '@/store/slices/taskSlice';
import { createBoard } from '@/store/slices/boardSlice';
import { createSpace } from '@/store/slices/spaceSlice';
import type { TemplateItem } from '@/types/dash.types';

interface TemplateApplicationModalProps {
  isVisible: boolean;
  template: TemplateItem | null;
  onClose: () => void;
  onSuccess?: (createdItem: any) => void;
}

export default function TemplateApplicationModal({
  isVisible,
  template,
  onClose,
  onSuccess
}: TemplateApplicationModalProps) {
  const colors = useThemeColors();
  const dispatch = useAppDispatch();
  const { currentWorkspace, currentSpace } = useAppSelector(state => state.workspace);
  
  const [loading, setLoading] = useState(false);
  const [customizations, setCustomizations] = useState<Record<string, any>>({});

  if (!template) return null;

  const handleApplyTemplate = async () => {
    if (!template || !currentWorkspace) {
      Alert.alert('Error', 'Missing workspace information');
      return;
    }

    setLoading(true);
    try {
      let createdItem;

      switch (template.type) {
        case 'task':
          createdItem = await applyTaskTemplate();
          break;
        case 'board':
          createdItem = await applyBoardTemplate();
          break;
        case 'space':
          createdItem = await applySpaceTemplate();
          break;
        case 'checklist':
          createdItem = await applyChecklistTemplate();
          break;
        case 'workflow':
          createdItem = await applyWorkflowTemplate();
          break;
        default:
          throw new Error('Unsupported template type');
      }

      Alert.alert('Success', `${template.type.charAt(0).toUpperCase() + template.type.slice(1)} created successfully!`);
      onSuccess?.(createdItem);
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to apply template');
    } finally {
      setLoading(false);
    }
  };

  const applyTaskTemplate = async () => {
    const taskData = {
      title: customizations.title || template.content?.title || template.name,
      description: customizations.description || template.description || '',
      priority: customizations.priority || template.content?.priority || 'medium',
      status: customizations.status || template.content?.status || 'todo',
      workspaceId: currentWorkspace._id,
      spaceId: currentSpace?._id,
      labels: template.tags || [],
      estimatedHours: customizations.estimatedHours || template.content?.estimatedHours || 1,
    };

    const result = await dispatch(createTask(taskData));
    return result.payload;
  };

  const applyBoardTemplate = async () => {
    const boardData = {
      name: customizations.name || template.content?.name || template.name,
      description: customizations.description || template.description || '',
      workspaceId: currentWorkspace._id,
      spaceId: currentSpace?._id,
      lists: template.content?.columns || template.content?.lists || [],
      isPublic: customizations.isPublic !== undefined ? customizations.isPublic : template.isPublic,
    };

    const result = await dispatch(createBoard(boardData));
    return result.payload;
  };

  const applySpaceTemplate = async () => {
    const spaceData = {
      name: customizations.name || template.content?.name || template.name,
      description: customizations.description || template.description || '',
      workspaceId: currentWorkspace._id,
      isPublic: customizations.isPublic !== undefined ? customizations.isPublic : template.isPublic,
      boards: template.content?.boards || [],
    };

    const result = await dispatch(createSpace(spaceData));
    return result.payload;
  };

  const applyChecklistTemplate = async () => {
    // For checklist templates, create a task with checklist items
    const taskData = {
      title: customizations.title || template.content?.title || template.name,
      description: customizations.description || template.description || '',
      priority: customizations.priority || 'medium',
      status: 'todo',
      workspaceId: currentWorkspace._id,
      spaceId: currentSpace?._id,
      labels: template.tags || [],
      checklist: template.content?.items || [],
    };

    const result = await dispatch(createTask(taskData));
    return result.payload;
  };

  const applyWorkflowTemplate = async () => {
    // For workflow templates, create multiple related tasks
    const workflowData = template.content?.workflow || [];
    const createdTasks = [];

    for (const step of workflowData) {
      const taskData = {
        title: step.title || `${template.name} - ${step.name}`,
        description: step.description || '',
        priority: step.priority || 'medium',
        status: step.status || 'todo',
        workspaceId: currentWorkspace._id,
        spaceId: currentSpace?._id,
        labels: template.tags || [],
        estimatedHours: step.estimatedHours || 1,
      };

      const result = await dispatch(createTask(taskData));
      createdTasks.push(result.payload);
    }

    return createdTasks;
  };

  const renderCustomizationOptions = () => {
    switch (template.type) {
      case 'task':
        return (
          <View style={styles.customizationSection}>
            <Text style={[TextStyles.heading.h3, { color: colors.foreground, marginBottom: 16 }]}>
              Customize Task
            </Text>

            <View style={styles.inputGroup}>
              <Text style={[TextStyles.body.medium, { color: colors.foreground, marginBottom: 8 }]}>
                Task Title
              </Text>
              <View style={[styles.inputContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>
                  {customizations.title || template.content?.title || template.name}
                </Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[TextStyles.body.medium, { color: colors.foreground, marginBottom: 8 }]}>
                Priority
              </Text>
              <View style={styles.optionsContainer}>
                {['low', 'medium', 'high', 'urgent'].map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.optionChip,
                      { 
                        backgroundColor: (customizations.priority || template.content?.priority || 'medium') === priority 
                          ? colors.primary 
                          : colors.background,
                        borderColor: colors.border
                      }
                    ]}
                    onPress={() => setCustomizations({...customizations, priority})}
                  >
                    <Text style={[
                      TextStyles.body.small,
                      { color: (customizations.priority || template.content?.priority || 'medium') === priority 
                        ? colors['primary-foreground'] 
                        : colors.foreground 
                      }
                    ]}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[TextStyles.body.medium, { color: colors.foreground, marginBottom: 8 }]}>
                Estimated Hours
              </Text>
              <View style={[styles.inputContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>
                  {customizations.estimatedHours || template.content?.estimatedHours || 1} hours
                </Text>
              </View>
            </View>
          </View>
        );

      case 'board':
        return (
          <View style={styles.customizationSection}>
            <Text style={[TextStyles.heading.h3, { color: colors.foreground, marginBottom: 16 }]}>
              Customize Board
            </Text>

            <View style={styles.inputGroup}>
              <Text style={[TextStyles.body.medium, { color: colors.foreground, marginBottom: 8 }]}>
                Board Name
              </Text>
              <View style={[styles.inputContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>
                  {customizations.name || template.content?.name || template.name}
                </Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[TextStyles.body.medium, { color: colors.foreground, marginBottom: 8 }]}>
                Columns ({template.content?.columns?.length || template.content?.lists?.length || 0})
              </Text>
              <View style={[styles.inputContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
                  {template.content?.columns?.map((col: any) => col.title || col.name).join(', ') || 
                   template.content?.lists?.map((list: any) => list.title || list.name).join(', ') || 
                   'Default columns will be created'}
                </Text>
              </View>
            </View>
          </View>
        );

      case 'space':
        return (
          <View style={styles.customizationSection}>
            <Text style={[TextStyles.heading.h3, { color: colors.foreground, marginBottom: 16 }]}>
              Customize Space
            </Text>

            <View style={styles.inputGroup}>
              <Text style={[TextStyles.body.medium, { color: colors.foreground, marginBottom: 8 }]}>
                Space Name
              </Text>
              <View style={[styles.inputContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>
                  {customizations.name || template.content?.name || template.name}
                </Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[TextStyles.body.medium, { color: colors.foreground, marginBottom: 8 }]}>
                Initial Boards ({template.content?.boards?.length || 0})
              </Text>
              <View style={[styles.inputContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
                  {template.content?.boards?.map((board: any) => board.name || board.title).join(', ') || 
                   'Default boards will be created'}
                </Text>
              </View>
            </View>
          </View>
        );

      case 'checklist':
        return (
          <View style={styles.customizationSection}>
            <Text style={[TextStyles.heading.h3, { color: colors.foreground, marginBottom: 16 }]}>
              Customize Checklist
            </Text>

            <View style={styles.inputGroup}>
              <Text style={[TextStyles.body.medium, { color: colors.foreground, marginBottom: 8 }]}>
                Checklist Title
              </Text>
              <View style={[styles.inputContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>
                  {customizations.title || template.content?.title || template.name}
                </Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[TextStyles.body.medium, { color: colors.foreground, marginBottom: 8 }]}>
                Items ({template.content?.items?.length || 0})
              </Text>
              <View style={[styles.inputContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
                  {template.content?.items?.map((item: any) => item.text || item.title).join(', ') || 
                   'Default items will be created'}
                </Text>
              </View>
            </View>
          </View>
        );

      case 'workflow':
        return (
          <View style={styles.customizationSection}>
            <Text style={[TextStyles.heading.h3, { color: colors.foreground, marginBottom: 16 }]}>
              Customize Workflow
            </Text>

            <View style={styles.inputGroup}>
              <Text style={[TextStyles.body.medium, { color: colors.foreground, marginBottom: 8 }]}>
                Workflow Steps ({template.content?.workflow?.length || 0})
              </Text>
              <View style={[styles.inputContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
                  {template.content?.workflow?.map((step: any, index: number) => 
                    `${index + 1}. ${step.title || step.name}`
                  ).join('\n') || 
                   'Default workflow steps will be created'}
                </Text>
              </View>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'task': return 'check-square-o';
      case 'board': return 'columns';
      case 'space': return 'folder-o';
      case 'workflow': return 'sitemap';
      case 'checklist': return 'list-ul';
      default: return 'file-o';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'task': return colors.primary;
      case 'board': return colors.success;
      case 'space': return colors.warning;
      case 'workflow': return colors.info;
      case 'checklist': return colors.secondary;
      default: return colors.muted;
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <FontAwesome name="times" size={20} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>
            Apply Template
          </Text>
          <TouchableOpacity 
            onPress={handleApplyTemplate} 
            style={[styles.applyButton, { backgroundColor: colors.primary }]}
            disabled={loading}
          >
            <Text style={[TextStyles.body.medium, { color: colors['primary-foreground'] }]}>
              {loading ? 'Creating...' : 'Apply'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Template Preview */}
          <Card style={[styles.previewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.templateHeader}>
              <View style={[styles.typeIcon, { backgroundColor: getTypeColor(template.type) + '20' }]}>
                <FontAwesome 
                  name={getTypeIcon(template.type)} 
                  size={24} 
                  color={getTypeColor(template.type)} 
                />
              </View>
              <View style={styles.templateInfo}>
                <Text style={[TextStyles.heading.h3, { color: colors.foreground }]}>
                  {template.name}
                </Text>
                <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
                  {template.type.charAt(0).toUpperCase() + template.type.slice(1)} Template
                </Text>
              </View>
            </View>

            {template.description && (
              <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'], marginTop: 12 }]}>
                {template.description}
              </Text>
            )}

            {template.tags && template.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {template.tags.map((tag, index) => (
                  <View key={index} style={[styles.tag, { backgroundColor: colors.primary + '20' }]}>
                    <Text style={[TextStyles.caption.small, { color: colors.primary }]}>
                      {tag}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </Card>

          {/* Customization Options */}
          {renderCustomizationOptions()}

          {/* Workspace Information */}
          <Card style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[TextStyles.heading.h3, { color: colors.foreground, marginBottom: 12 }]}>
              Creation Details
            </Text>
            <View style={styles.infoRow}>
              <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>Workspace:</Text>
              <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>
                {currentWorkspace?.name || 'Current Workspace'}
              </Text>
            </View>
            {currentSpace && (
              <View style={styles.infoRow}>
                <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>Space:</Text>
                <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>
                  {currentSpace.name}
                </Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>Template:</Text>
              <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>
                {template.category || 'General'}
              </Text>
            </View>
          </Card>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 8,
  },
  applyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  previewCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  templateInfo: {
    flex: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  customizationSection: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputContainer: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
});
