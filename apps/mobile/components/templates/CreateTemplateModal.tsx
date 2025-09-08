import React, { useState } from 'react';
import { StyleSheet, Modal, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, View, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { TemplateType, CATEGORY_OPTIONS, TYPE_OPTIONS } from '@/types/dash.types';

interface CreateTemplateModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (templateData: {
    name: string;
    description: string;
    type: TemplateType;
    content: Record<string, any>;
    category: string;
    isPublic: boolean;
    status: string;
  }) => Promise<void>;
}

export default function CreateTemplateModal({ isVisible, onClose, onSubmit }: CreateTemplateModalProps) {
  const colors = useThemeColors();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'task' as TemplateType,
    category: 'General',
    isPublic: false,
    status: 'active'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Template name is required');
      return;
    }

    if (!formData.type) {
      Alert.alert('Error', 'Template type is required');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create content based on template type
      const content = createContentForType(formData.type);
      
      await onSubmit({
        ...formData,
        content
      });
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        type: 'task',
        category: 'General',
        isPublic: false,
        status: 'active'
      });
      
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to create template');
    } finally {
      setIsSubmitting(false);
    }
  };

  const createContentForType = (type: TemplateType): Record<string, any> => {
    switch (type) {
      case 'task':
        return {
          title: 'New Task',
          description: 'Task description',
          priority: 'medium',
          status: 'todo',
          assignee: null,
          dueDate: null,
          tags: []
        };
      case 'board':
        return {
          name: 'New Board',
          description: 'Board description',
          columns: [
            { name: 'To Do', order: 0 },
            { name: 'In Progress', order: 1 },
            { name: 'Done', order: 2 }
          ]
        };
      case 'space':
        return {
          name: 'New Space',
          description: 'Space description',
          boards: [],
          members: []
        };
      case 'workflow':
        return {
          name: 'New Workflow',
          description: 'Workflow description',
          steps: [
            { name: 'Start', type: 'start' },
            { name: 'Process', type: 'action' },
            { name: 'End', type: 'end' }
          ]
        };
      case 'checklist':
        return {
          title: 'New Checklist',
          description: 'Checklist description',
          items: [
            { text: 'Item 1', completed: false },
            { text: 'Item 2', completed: false }
          ]
        };
      default:
        return {};
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>Create Template</Text>
          <TouchableOpacity 
            onPress={handleSubmit} 
            style={[styles.submitButton, { backgroundColor: colors.primary }]}
            disabled={isSubmitting}
          >
            <Text style={[TextStyles.body.medium, { color: colors['primary-foreground'] }]}>
              {isSubmitting ? 'Creating...' : 'Create'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <Card style={[styles.formCard, { backgroundColor: colors.card }]}>
            {/* Template Name */}
            <View style={styles.fieldContainer}>
              <Text style={[TextStyles.body.medium, { color: colors.foreground, marginBottom: 8 }]}>
                Template Name *
              </Text>
              <View style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Text 
                  style={[TextStyles.body.medium, { color: colors.foreground }]}
                  onPress={() => {
                    // In a real app, you'd use a TextInput here
                    Alert.prompt(
                      'Template Name',
                      'Enter template name',
                      (text) => updateFormData('name', text || ''),
                      'plain-text',
                      formData.name
                    );
                  }}
                >
                  {formData.name || 'Tap to enter template name'}
                </Text>
              </View>
            </View>

            {/* Template Type */}
            <View style={styles.fieldContainer}>
              <Text style={[TextStyles.body.medium, { color: colors.foreground, marginBottom: 8 }]}>
                Template Type *
              </Text>
              <View style={styles.optionsContainer}>
                {TYPE_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionButton,
                      { 
                        backgroundColor: formData.type === option.value ? colors.primary : colors.background,
                        borderColor: colors.border
                      }
                    ]}
                    onPress={() => updateFormData('type', option.value)}
                  >
                    <Text style={[
                      TextStyles.body.medium, 
                      { color: formData.type === option.value ? colors['primary-foreground'] : colors.foreground }
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Category */}
            <View style={styles.fieldContainer}>
              <Text style={[TextStyles.body.medium, { color: colors.foreground, marginBottom: 8 }]}>
                Category
              </Text>
              <View style={styles.optionsContainer}>
                {CATEGORY_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionButton,
                      { 
                        backgroundColor: formData.category === option.value ? colors.primary : colors.background,
                        borderColor: colors.border
                      }
                    ]}
                    onPress={() => updateFormData('category', option.value)}
                  >
                    <Text style={[
                      TextStyles.body.medium, 
                      { color: formData.category === option.value ? colors['primary-foreground'] : colors.foreground }
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Description */}
            <View style={styles.fieldContainer}>
              <Text style={[TextStyles.body.medium, { color: colors.foreground, marginBottom: 8 }]}>
                Description
              </Text>
              <View style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Text 
                  style={[TextStyles.body.medium, { color: colors.foreground }]}
                  onPress={() => {
                    Alert.prompt(
                      'Description',
                      'Enter template description',
                      (text) => updateFormData('description', text || ''),
                      'plain-text',
                      formData.description
                    );
                  }}
                >
                  {formData.description || 'Tap to enter description'}
                </Text>
              </View>
            </View>

            {/* Visibility */}
            <View style={styles.fieldContainer}>
              <Text style={[TextStyles.body.medium, { color: colors.foreground, marginBottom: 8 }]}>
                Visibility
              </Text>
              <View style={styles.optionsContainer}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    { 
                      backgroundColor: !formData.isPublic ? colors.primary : colors.background,
                      borderColor: colors.border
                    }
                  ]}
                  onPress={() => updateFormData('isPublic', false)}
                >
                  <FontAwesome name="lock" size={16} color={!formData.isPublic ? colors['primary-foreground'] : colors.foreground} />
                  <Text style={[
                    TextStyles.body.medium, 
                    { color: !formData.isPublic ? colors['primary-foreground'] : colors.foreground, marginLeft: 8 }
                  ]}>
                    Private
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    { 
                      backgroundColor: formData.isPublic ? colors.primary : colors.background,
                      borderColor: colors.border
                    }
                  ]}
                  onPress={() => updateFormData('isPublic', true)}
                >
                  <FontAwesome name="globe" size={16} color={formData.isPublic ? colors['primary-foreground'] : colors.foreground} />
                  <Text style={[
                    TextStyles.body.medium, 
                    { color: formData.isPublic ? colors['primary-foreground'] : colors.foreground, marginLeft: 8 }
                  ]}>
                    Public
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Preview */}
            <View style={styles.fieldContainer}>
              <Text style={[TextStyles.body.medium, { color: colors.foreground, marginBottom: 8 }]}>
                Preview
              </Text>
              <Card style={[styles.previewCard, { backgroundColor: colors.background }]}>
                <Text style={[TextStyles.heading.h3, { color: colors.foreground }]}>
                  {formData.name || 'Template Name'}
                </Text>
                <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
                  Type: {TYPE_OPTIONS.find(t => t.value === formData.type)?.label}
                </Text>
                <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
                  Category: {formData.category}
                </Text>
                {formData.description && (
                  <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
                    {formData.description}
                  </Text>
                )}
                <View style={styles.previewBadges}>
                  <View style={[
                    styles.badge,
                    { backgroundColor: formData.isPublic ? colors.success : colors.muted }
                  ]}>
                    <Text style={[TextStyles.caption.small, { color: colors.foreground }]}>
                      {formData.isPublic ? 'Public' : 'Private'}
                    </Text>
                  </View>
                </View>
              </Card>
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
  cancelButton: {
    padding: 8,
  },
  submitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  formCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: 'center',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  previewBadges: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
});
