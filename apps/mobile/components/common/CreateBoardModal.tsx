import React, { useState, useEffect } from 'react';
import { Modal, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity, Dimensions, ScrollView, StyleSheet } from 'react-native';
import { Text, View, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export type BoardType = 'kanban' | 'list' | 'calendar' | 'timeline';
export type BoardVisibility = 'private' | 'public';

interface CreateBoardModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: { 
    name: string; 
    description?: string; 
    type: BoardType; 
    visibility: BoardVisibility 
  }) => Promise<void> | void;
  submitting?: boolean;
}

export default function CreateBoardModal({ visible, onClose, onSubmit, submitting }: CreateBoardModalProps) {
  const colors = useThemeColors();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<BoardType>('kanban');
  const [visibility, setVisibility] = useState<BoardVisibility>('public');

  useEffect(() => {
    if (!visible) {
      setName('');
      setDescription('');
      setType('kanban');
      setVisibility('public');
    }
  }, [visible]);

  const canCreate = name.trim().length > 0 && !submitting;

  const handleSubmit = async () => {
    if (!canCreate) return;
    await onSubmit({ 
      name: name.trim(), 
      description: description.trim() || undefined, 
      type,
      visibility 
    });
  };

  const boardTypes = [
    { id: 'kanban', name: 'Kanban', icon: 'columns', description: 'Visual workflow with columns' },
    { id: 'list', name: 'List', icon: 'list', description: 'Simple task list' },
    { id: 'calendar', name: 'Calendar', icon: 'calendar', description: 'Time-based view (coming soon)' },
    { id: 'timeline', name: 'Timeline', icon: 'clock-o', description: 'Project timeline (coming soon)' },
  ] as const;

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <Card style={[styles.modal, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
              <View style={styles.headerLeft}>
                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                  <FontAwesome name="plus-square" size={20} color={colors.primary} />
                </View>
                <View>
                  <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>Create Board</Text>
                  <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
                    Set up a new board for your tasks
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={onClose} style={[styles.closeButton, { backgroundColor: colors.muted }]}>
                <FontAwesome name="times" size={16} color={colors['muted-foreground']} />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView 
              style={styles.scrollableContent}
              contentContainerStyle={styles.scrollContentContainer}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.content}>
                {/* Board Name */}
                <View style={styles.inputGroup}>
                  <Text style={[TextStyles.body.medium, { color: colors.foreground, marginBottom: 8, fontWeight: '600' }]}>
                    Board Name *
                  </Text>
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="e.g. Sprint Planning, Bug Fixes, Feature Development"
                    placeholderTextColor={colors['muted-foreground']}
                    style={[styles.input, { 
                      borderColor: colors.border, 
                      backgroundColor: colors.background,
                      color: colors.foreground 
                    }]}
                    autoFocus
                  />
                </View>

                {/* Description */}
                <View style={styles.inputGroup}>
                  <Text style={[TextStyles.body.medium, { color: colors.foreground, marginBottom: 8, fontWeight: '600' }]}>
                    Description
                  </Text>
                  <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'], marginBottom: 8 }]}>
                    Optional: Brief description of what this board is for
                  </Text>
                  <TextInput
                    value={description}
                    onChangeText={setDescription}
                    placeholder="e.g. Track all bug reports and their resolution status"
                    placeholderTextColor={colors['muted-foreground']}
                    multiline
                    numberOfLines={3}
                    style={[styles.textArea, { 
                      borderColor: colors.border, 
                      backgroundColor: colors.background,
                      color: colors.foreground 
                    }]}
                  />
                </View>

                {/* Board Type */}
                <View style={styles.inputGroup}>
                  <Text style={[TextStyles.body.medium, { color: colors.foreground, marginBottom: 8, fontWeight: '600' }]}>
                    Board Type
                  </Text>
                  <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'], marginBottom: 12 }]}>
                    Choose the layout that works best for your workflow
                  </Text>
                  <View style={styles.typeContainer}>
                    {boardTypes.map((boardType) => {
                      const isDisabled = boardType.id === 'calendar' || boardType.id === 'timeline';
                      const isSelected = type === boardType.id;
                      return (
                        <TouchableOpacity
                          key={boardType.id}
                          onPress={() => {
                            if (!isDisabled) setType(boardType.id as BoardType);
                          }}
                          disabled={isDisabled}
                          style={[
                            styles.typeOption,
                            { 
                              borderColor: colors.border,
                              backgroundColor: isSelected ? colors.primary + '10' : colors.background,
                              opacity: isDisabled ? 0.6 : 1
                            }
                          ]}
                        >
                          <View style={styles.typeHeader}>
                            <FontAwesome 
                              name={boardType.icon as any} 
                              size={16} 
                              color={isSelected ? colors.primary : colors['muted-foreground']} 
                            />
                            <Text style={[
                              TextStyles.body.medium, 
                              { 
                                color: isSelected ? colors.primary : colors.foreground,
                                fontWeight: '600',
                                marginLeft: 8
                              }
                            ]}>
                              {boardType.name}
                            </Text>
                            {isSelected && !isDisabled && (
                              <FontAwesome name="check-circle" size={16} color={colors.primary} style={{ marginLeft: 'auto' }} />
                            )}
                          </View>
                          <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'], marginTop: 4 }]}>
                            {boardType.description}
                          </Text>
                          {isDisabled && (
                            <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'], marginTop: 6 }]}>Future feature</Text>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Visibility */}
                <View style={styles.inputGroup}>
                  <Text style={[TextStyles.body.medium, { color: colors.foreground, marginBottom: 8, fontWeight: '600' }]}>
                    Visibility
                  </Text>
                  <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'], marginBottom: 12 }]}>
                    Control who can see and access this board
                  </Text>
                  <View style={styles.visibilityContainer}>
                    <TouchableOpacity
                      onPress={() => setVisibility('private')}
                      style={[
                        styles.visibilityOption,
                        { 
                          borderColor: colors.border,
                          backgroundColor: visibility === 'private' ? colors.primary + '10' : colors.background 
                        }
                      ]}
                    >
                      <View style={styles.visibilityHeader}>
                        <FontAwesome 
                          name="lock" 
                          size={16} 
                          color={visibility === 'private' ? colors.primary : colors['muted-foreground']} 
                        />
                        <Text style={[
                          TextStyles.body.medium, 
                          { 
                            color: visibility === 'private' ? colors.primary : colors.foreground,
                            fontWeight: '600',
                            marginLeft: 8
                          }
                        ]}>
                          Private
                        </Text>
                        {visibility === 'private' && (
                          <FontAwesome name="check-circle" size={16} color={colors.primary} style={{ marginLeft: 'auto' }} />
                        )}
                      </View>
                      <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'], marginTop: 4 }]}>
                        Only space members can see this board
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => setVisibility('public')}
                      style={[
                        styles.visibilityOption,
                        { 
                          borderColor: colors.border,
                          backgroundColor: visibility === 'public' ? colors.primary + '10' : colors.background 
                        }
                      ]}
                    >
                      <View style={styles.visibilityHeader}>
                        <FontAwesome 
                          name="globe" 
                          size={16} 
                          color={visibility === 'public' ? colors.primary : colors['muted-foreground']} 
                        />
                        <Text style={[
                          TextStyles.body.medium, 
                          { 
                            color: visibility === 'public' ? colors.primary : colors.foreground,
                            fontWeight: '600',
                            marginLeft: 8
                          }
                        ]}>
                          Public
                        </Text>
                        {visibility === 'public' && (
                          <FontAwesome name="check-circle" size={16} color={colors.primary} style={{ marginLeft: 'auto' }} />
                        )}
                      </View>
                      <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'], marginTop: 4 }]}>
                        Anyone with space access can see this board
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* Actions - Fixed at bottom */}
            <View style={[styles.actions, { borderTopColor: colors.border }]}>
                <TouchableOpacity
                  onPress={onClose}
                  disabled={submitting}
                  style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
                >
                  <Text style={[TextStyles.body.medium, { color: colors.foreground, fontWeight: '500' }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={!canCreate}
                  style={[
                    styles.button, 
                    styles.createButton, 
                    { 
                      backgroundColor: canCreate ? colors.primary : colors.muted,
                      opacity: canCreate ? 1 : 0.6
                    }
                  ]}
                >
                  <Text style={[TextStyles.body.medium, { color: colors['primary-foreground'], fontWeight: '700', textAlign: 'center' }]}>
                    {submitting ? 'Creating...' : 'Create Board'}
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modal: {
    width: '100%',
    maxWidth: 480,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    maxHeight: screenHeight * 0.95,
    minHeight: screenHeight * 0.6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollableContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  content: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 48,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  typeContainer: {
    gap: 12,
  },
  typeOption: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  typeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  visibilityContainer: {
    gap: 12,
  },
  visibilityOption: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  visibilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  cancelButton: {
    borderWidth: 1,
  },
  createButton: {
    // backgroundColor set dynamically
  },
});
