import React, { useState, useEffect } from 'react';
import { StyleSheet, Modal, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Text, View, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAppDispatch } from '@/store';
import { updateTemplate } from '@/store/slices/templatesSlice';
import { CATEGORY_OPTIONS, TYPE_OPTIONS } from '@/types/dash.types';
import type { TemplateItem, TemplateType } from '@/types/dash.types';

interface EditTemplateModalProps {
  isVisible: boolean;
  template: TemplateItem | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function EditTemplateModal({
  isVisible,
  template,
  onClose,
  onSuccess
}: EditTemplateModalProps) {
  const colors = useThemeColors();
  const dispatch = useAppDispatch();
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TemplateType>('task');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [content, setContent] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with template data
  useEffect(() => {
    if (template) {
      setName(template.name || '');
      setDescription(template.description || '');
      setType(template.type || 'task');
      setCategory(template.category || '');
      setTags(template.tags || []);
      setIsPublic(template.isPublic !== false);
      setContent(template.content || {});
      setErrors({});
    }
  }, [template]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Template name is required';
    }

    if (name.length > 100) {
      newErrors.name = 'Template name must be less than 100 characters';
    }

    if (description && description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    if (!category) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!template || !validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const updatedTemplate = {
        ...template,
        name: name.trim(),
        description: description.trim(),
        type,
        category,
        tags,
        isPublic,
        content,
        updatedAt: new Date().toISOString(),
      };

      await dispatch(updateTemplate(updatedTemplate));
      
      Alert.alert('Success', 'Template updated successfully!');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update template');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = () => {
    const tag = newTag.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleContentChange = (field: string, value: any) => {
    setContent({
      ...content,
      [field]: value
    });
  };

  const renderContentEditor = () => {
    switch (type) {
      case 'task':
        return (
          <View style={styles.contentSection}>
            <Text style={[TextStyles.heading.h3, { color: colors.foreground, marginBottom: 12 }]}>
              Task Content
            </Text>
            
            <View style={styles.inputGroup}>
              <Text style={[TextStyles.body.medium, { color: colors.foreground, marginBottom: 8 }]}>
                Title
              </Text>
              <TextInput
                style={[styles.textInput, { 
                  backgroundColor: colors.background, 
                  borderColor: colors.border, 
                  color: colors.foreground 
                }]}
                value={content.title || ''}
                onChangeText={(value) => handleContentChange('title', value)}
                placeholder="Task title"
                placeholderTextColor={colors['muted-foreground']}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[TextStyles.body.medium, { color: colors.foreground, marginBottom: 8 }]}>
                Priority
              </Text>
              <View style={styles.priorityOptions}>
                {['low', 'medium', 'high', 'urgent'].map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.priorityOption,
                      { 
                        backgroundColor: content.priority === priority ? colors.primary : colors.background,
                        borderColor: colors.border
                      }
                    ]}
                    onPress={() => handleContentChange('priority', priority)}
                  >
                    <Text style={[
                      TextStyles.body.small,
                      { color: content.priority === priority ? colors['primary-foreground'] : colors.foreground }
                    ]}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[TextStyles.body.medium, { color: colors.foreground, marginBottom: 8 }]}>
                Status
              </Text>
              <View style={styles.statusOptions}>
                {['todo', 'in-progress', 'completed'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusOption,
                      { 
                        backgroundColor: content.status === status ? colors.primary : colors.background,
                        borderColor: colors.border
                      }
                    ]}
                    onPress={() => handleContentChange('status', status)}
                  >
                    <Text style={[
                      TextStyles.body.small,
                      { color: content.status === status ? colors['primary-foreground'] : colors.foreground }
                    ]}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        );

      case 'board':
        return (
          <View style={styles.contentSection}>
            <Text style={[TextStyles.heading.h3, { color: colors.foreground, marginBottom: 12 }]}>
              Board Content
            </Text>
            
            <View style={styles.inputGroup}>
              <Text style={[TextStyles.body.medium, { color: colors.foreground, marginBottom: 8 }]}>
                Board Name
              </Text>
              <TextInput
                style={[styles.textInput, { 
                  backgroundColor: colors.background, 
                  borderColor: colors.border, 
                  color: colors.foreground 
                }]}
                value={content.name || ''}
                onChangeText={(value) => handleContentChange('name', value)}
                placeholder="Board name"
                placeholderTextColor={colors['muted-foreground']}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[TextStyles.body.medium, { color: colors.foreground, marginBottom: 8 }]}>
                Default Columns
              </Text>
              <View style={styles.columnsList}>
                {content.columns?.map((column: any, index: number) => (
                  <View key={index} style={styles.columnItem}>
                    <TextInput
                      style={[styles.columnInput, { 
                        backgroundColor: colors.background, 
                        borderColor: colors.border, 
                        color: colors.foreground 
                      }]}
                      value={column.title}
                      onChangeText={(value) => {
                        const newColumns = [...content.columns];
                        newColumns[index].title = value;
                        handleContentChange('columns', newColumns);
                      }}
                      placeholder="Column name"
                      placeholderTextColor={colors['muted-foreground']}
                    />
                    <TouchableOpacity
                      style={styles.removeColumnButton}
                      onPress={() => {
                        const newColumns = content.columns.filter((_: any, i: number) => i !== index);
                        handleContentChange('columns', newColumns);
                      }}
                    >
                      <FontAwesome name="times" size={16} color={colors.destructive} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
              
              <TouchableOpacity
                style={[styles.addColumnButton, { backgroundColor: colors.primary }]}
                onPress={() => {
                  const newColumns = [...(content.columns || []), { 
                    title: 'New Column', 
                    order: content.columns?.length || 0,
                    color: '#3B82F6'
                  }];
                  handleContentChange('columns', newColumns);
                }}
              >
                <FontAwesome name="plus" size={16} color={colors['primary-foreground']} />
                <Text style={[TextStyles.body.small, { color: colors['primary-foreground'], marginLeft: 8 }]}>
                  Add Column
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'checklist':
        return (
          <View style={styles.contentSection}>
            <Text style={[TextStyles.heading.h3, { color: colors.foreground, marginBottom: 12 }]}>
              Checklist Content
            </Text>
            
            <View style={styles.inputGroup}>
              <Text style={[TextStyles.body.medium, { color: colors.foreground, marginBottom: 8 }]}>
                Checklist Title
              </Text>
              <TextInput
                style={[styles.textInput, { 
                  backgroundColor: colors.background, 
                  borderColor: colors.border, 
                  color: colors.foreground 
                }]}
                value={content.title || ''}
                onChangeText={(value) => handleContentChange('title', value)}
                placeholder="Checklist title"
                placeholderTextColor={colors['muted-foreground']}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[TextStyles.body.medium, { color: colors.foreground, marginBottom: 8 }]}>
                Checklist Items
              </Text>
              <View style={styles.itemsList}>
                {content.items?.map((item: any, index: number) => (
                  <View key={index} style={styles.itemRow}>
                    <TextInput
                      style={[styles.itemInput, { 
                        backgroundColor: colors.background, 
                        borderColor: colors.border, 
                        color: colors.foreground 
                      }]}
                      value={item.text}
                      onChangeText={(value) => {
                        const newItems = [...content.items];
                        newItems[index].text = value;
                        handleContentChange('items', newItems);
                      }}
                      placeholder="Item text"
                      placeholderTextColor={colors['muted-foreground']}
                    />
                    <TouchableOpacity
                      style={styles.removeItemButton}
                      onPress={() => {
                        const newItems = content.items.filter((_: any, i: number) => i !== index);
                        handleContentChange('items', newItems);
                      }}
                    >
                      <FontAwesome name="times" size={16} color={colors.destructive} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
              
              <TouchableOpacity
                style={[styles.addItemButton, { backgroundColor: colors.primary }]}
                onPress={() => {
                  const newItems = [...(content.items || []), { text: 'New Item', completed: false }];
                  handleContentChange('items', newItems);
                }}
              >
                <FontAwesome name="plus" size={16} color={colors['primary-foreground']} />
                <Text style={[TextStyles.body.small, { color: colors['primary-foreground'], marginLeft: 8 }]}>
                  Add Item
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  if (!template) return null;

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
            Edit Template
          </Text>
          <TouchableOpacity 
            onPress={handleSubmit} 
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
            disabled={loading}
          >
            <Text style={[TextStyles.body.medium, { color: colors['primary-foreground'] }]}>
              {loading ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Basic Information */}
          <Card style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[TextStyles.heading.h3, { color: colors.foreground, marginBottom: 16 }]}>
              Basic Information
            </Text>

            {/* Name */}
            <View style={styles.inputGroup}>
              <Text style={[TextStyles.body.medium, { color: colors.foreground, marginBottom: 8 }]}>
                Template Name *
              </Text>
              <TextInput
                style={[styles.textInput, { 
                  backgroundColor: colors.background, 
                  borderColor: errors.name ? colors.destructive : colors.border, 
                  color: colors.foreground 
                }]}
                value={name}
                onChangeText={setName}
                placeholder="Enter template name"
                placeholderTextColor={colors['muted-foreground']}
              />
              {errors.name && (
                <Text style={[TextStyles.caption.small, { color: colors.destructive, marginTop: 4 }]}>
                  {errors.name}
                </Text>
              )}
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={[TextStyles.body.medium, { color: colors.foreground, marginBottom: 8 }]}>
                Description
              </Text>
              <TextInput
                style={[styles.textArea, { 
                  backgroundColor: colors.background, 
                  borderColor: errors.description ? colors.destructive : colors.border, 
                  color: colors.foreground 
                }]}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter template description"
                placeholderTextColor={colors['muted-foreground']}
                multiline
                numberOfLines={3}
              />
              {errors.description && (
                <Text style={[TextStyles.caption.small, { color: colors.destructive, marginTop: 4 }]}>
                  {errors.description}
                </Text>
              )}
            </View>

            {/* Type */}
            <View style={styles.inputGroup}>
              <Text style={[TextStyles.body.medium, { color: colors.foreground, marginBottom: 8 }]}>
                Template Type *
              </Text>
              <View style={styles.typeOptions}>
                {TYPE_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.typeOption,
                      { 
                        backgroundColor: type === option.value ? colors.primary : colors.background,
                        borderColor: colors.border
                      }
                    ]}
                    onPress={() => setType(option.value)}
                  >
                    <Text style={[
                      TextStyles.body.small,
                      { color: type === option.value ? colors['primary-foreground'] : colors.foreground }
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Category */}
            <View style={styles.inputGroup}>
              <Text style={[TextStyles.body.medium, { color: colors.foreground, marginBottom: 8 }]}>
                Category *
              </Text>
              <View style={styles.categoryOptions}>
                {CATEGORY_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.categoryOption,
                      { 
                        backgroundColor: category === option.value ? colors.primary : colors.background,
                        borderColor: colors.border
                      }
                    ]}
                    onPress={() => setCategory(option.value)}
                  >
                    <Text style={[
                      TextStyles.body.small,
                      { color: category === option.value ? colors['primary-foreground'] : colors.foreground }
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.category && (
                <Text style={[TextStyles.caption.small, { color: colors.destructive, marginTop: 4 }]}>
                  {errors.category}
                </Text>
              )}
            </View>
          </Card>

          {/* Tags */}
          <Card style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[TextStyles.heading.h3, { color: colors.foreground, marginBottom: 16 }]}>
              Tags
            </Text>

            {/* Current Tags */}
            {tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {tags.map((tag, index) => (
                  <View key={index} style={[styles.tag, { backgroundColor: colors.primary + '20' }]}>
                    <Text style={[TextStyles.caption.small, { color: colors.primary }]}>
                      {tag}
                    </Text>
                    <TouchableOpacity onPress={() => handleRemoveTag(tag)} style={styles.removeTagButton}>
                      <FontAwesome name="times" size={12} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Add New Tag */}
            <View style={styles.addTagContainer}>
              <TextInput
                style={[styles.tagInput, { 
                  backgroundColor: colors.background, 
                  borderColor: colors.border, 
                  color: colors.foreground 
                }]}
                value={newTag}
                onChangeText={setNewTag}
                placeholder="Add tag"
                placeholderTextColor={colors['muted-foreground']}
                onSubmitEditing={handleAddTag}
              />
              <TouchableOpacity 
                style={[styles.addTagButton, { backgroundColor: colors.primary }]}
                onPress={handleAddTag}
              >
                <FontAwesome name="plus" size={16} color={colors['primary-foreground']} />
              </TouchableOpacity>
            </View>
          </Card>

          {/* Content Editor */}
          {renderContentEditor()}

          {/* Settings */}
          <Card style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[TextStyles.heading.h3, { color: colors.foreground, marginBottom: 16 }]}>
              Settings
            </Text>

            {/* Visibility */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>
                  Make Public
                </Text>
                <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
                  Allow others to use this template
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.toggle, { backgroundColor: isPublic ? colors.primary : colors.muted }]}
                onPress={() => setIsPublic(!isPublic)}
              >
                <View style={[
                  styles.toggleThumb,
                  { 
                    backgroundColor: colors.foreground,
                    transform: [{ translateX: isPublic ? 20 : 2 }]
                  }
                ]} />
              </TouchableOpacity>
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
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  typeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  categoryOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  removeTagButton: {
    marginLeft: 8,
    padding: 2,
  },
  addTagContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  addTagButton: {
    padding: 12,
    borderRadius: 8,
  },
  contentSection: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  priorityOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  priorityOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  columnsList: {
    gap: 8,
    marginBottom: 12,
  },
  columnItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  columnInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  removeColumnButton: {
    padding: 8,
  },
  addColumnButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  itemsList: {
    gap: 8,
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  removeItemButton: {
    padding: 8,
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flex: 1,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
});
