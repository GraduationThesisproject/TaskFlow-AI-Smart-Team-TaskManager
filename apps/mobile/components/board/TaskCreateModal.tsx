import React, { useState, useRef } from 'react';
import {
  Modal,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Switch,
  Alert,
  SafeAreaView,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import {
  X,
  CheckSquare,
  Paperclip,
  Users,
  Calendar,
  Clock,
  Tag,
  MessageSquare,
  Send,
  MoreVertical,
  Edit3,
  Plus,
  Check,
  Trash2,
  FileText,
  Image,
} from 'lucide-react-native';
import { View, Text } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { DragTask, TaskAssignee, TaskPriority } from '@/types/dragBoard.types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
// Calculate safe modal height based on platform
const MODAL_HEIGHT = Platform.OS === 'ios' ? SCREEN_HEIGHT * 0.9 : SCREEN_HEIGHT * 0.85;

interface TaskCreateModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (task: Partial<DragTask>) => void;
  columnId: string;
  columnName: string;
}

interface QuickAction {
  id: string;
  label: string;
  icon: any;
  color: string;
}

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface Checklist {
  id: string;
  title: string;
  items: ChecklistItem[];
}

interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'document' | 'link';
  url?: string;
  size?: string;
}

interface Comment {
  id: string;
  text: string;
  author: string;
  timestamp: string;
  avatar?: string;
}

export const TaskCreateModal: React.FC<TaskCreateModalProps> = ({
  visible,
  onClose,
  onSave,
  columnId,
  columnName,
}) => {
  const colors = useThemeColors();
  const scrollViewRef = useRef<ScrollView>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [assignees, setAssignees] = useState<TaskAssignee[]>([]);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [showChecklistInput, setShowChecklistInput] = useState(false);
  const [editingChecklist, setEditingChecklist] = useState<string | null>(null);
  const [newChecklistItem, setNewChecklistItem] = useState('');

  // UI state
  const [editingTitle, setEditingTitle] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const quickActions: QuickAction[] = [
    { id: 'checklist', label: 'Add checklist', icon: CheckSquare, color: '#10b981' },
    { id: 'attachment', label: 'Add attachment', icon: Paperclip, color: '#3b82f6' },
    { id: 'members', label: 'Members', icon: Users, color: '#a855f7' },
  ];

  const priorityColors = {
    low: '#22c55e',
    medium: '#eab308',
    high: '#f97316',
    urgent: '#ef4444',
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Required Field', 'Please enter a task title');
      return;
    }

    const newTask: Partial<DragTask> = {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      dueDate: dueDate || undefined,
      tags: tags.length > 0 ? tags : undefined,
      assignees: assignees.length > 0 ? assignees : [],
      attachments: attachments.length,
      comments: comments.length,
      columnId,
      status: 'todo',
      position: 0,
    };

    onSave(newTask);
    handleClose();
  };

  const handleClose = () => {
    // Reset form
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate('');
    setTags([]);
    setAssignees([]);
    setChecklists([]);
    setAttachments([]);
    setComments([]);
    setNewComment('');
    setNewTag('');
    setNewChecklistTitle('');
    setNewChecklistItem('');
    setEditingTitle(false);
    setShowDescription(false);
    setShowTagInput(false);
    setShowChecklistInput(false);
    setEditingChecklist(null);
    setActiveSection(null);
    
    onClose();
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    const comment: Comment = {
      id: Date.now().toString(),
      text: newComment.trim(),
      author: 'Current User',
      timestamp: new Date().toISOString(),
      avatar: undefined,
    };
    
    setComments([...comments, comment]);
    setNewComment('');
  };

  const handleAddTag = () => {
    if (!newTag.trim() || tags.includes(newTag.trim())) return;
    setTags([...tags, newTag.trim()]);
    setNewTag('');
    setShowTagInput(false);
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleAddChecklist = () => {
    if (!newChecklistTitle.trim()) return;
    
    const newChecklist: Checklist = {
      id: Date.now().toString(),
      title: newChecklistTitle.trim(),
      items: [],
    };
    
    setChecklists([...checklists, newChecklist]);
    setNewChecklistTitle('');
    setShowChecklistInput(false);
    setEditingChecklist(newChecklist.id);
  };

  const handleAddChecklistItem = (checklistId: string) => {
    if (!newChecklistItem.trim()) return;
    
    const item: ChecklistItem = {
      id: Date.now().toString(),
      text: newChecklistItem.trim(),
      completed: false,
    };
    
    setChecklists(checklists.map(cl => 
      cl.id === checklistId 
        ? { ...cl, items: [...cl.items, item] }
        : cl
    ));
    setNewChecklistItem('');
  };

  const handleToggleChecklistItem = (checklistId: string, itemId: string) => {
    setChecklists(checklists.map(cl => 
      cl.id === checklistId 
        ? {
            ...cl,
            items: cl.items.map(item => 
              item.id === itemId 
                ? { ...item, completed: !item.completed }
                : item
            )
          }
        : cl
    ));
  };

  const handleAddAttachment = (type: 'image' | 'document') => {
    const attachment: Attachment = {
      id: Date.now().toString(),
      name: type === 'image' ? 'Screenshot.png' : 'Document.pdf',
      type,
      size: type === 'image' ? '2.3 MB' : '156 KB',
    };
    
    setAttachments([...attachments, attachment]);
  };

  const handleAddMember = () => {
    const mockMember: TaskAssignee = {
      id: Date.now().toString(),
      name: 'Team Member',
      email: 'member@team.com',
      avatar: undefined,
    };
    
    if (!assignees.find(a => a.email === mockMember.email)) {
      setAssignees([...assignees, mockMember]);
    }
  };

  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case 'checklist':
        setShowChecklistInput(true);
        setActiveSection('checklists');
        break;
      case 'attachment':
        setActiveSection('attachments');
        break;
      case 'members':
        setActiveSection('members');
        handleAddMember();
        break;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      onRequestClose={handleClose}
    >
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        style={[styles.overlay, { backgroundColor: 'rgba(0, 0, 0, 0.7)' }]}
      >
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardAvoid}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            <Animated.View
              entering={SlideInDown.duration(300).springify()}
              exiting={SlideOutDown.duration(300).springify()}
              style={[
                styles.modal,
                {
                  backgroundColor: colors.card,
                  borderTopColor: colors.border,
                },
              ]}
            >
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <X size={24} color={colors.foreground} />
              </TouchableOpacity>
              
              <View style={styles.headerCenter}>
                <Text style={[styles.columnLabel, { color: colors['muted-foreground'] }]}>
                  in {columnName}
                </Text>
              </View>
              
              <TouchableOpacity style={styles.moreButton}>
                <MoreVertical size={20} color={colors['muted-foreground']} />
              </TouchableOpacity>
            </View>

            <ScrollView
              ref={scrollViewRef}
              style={styles.content}
              contentContainerStyle={{ paddingBottom: 100 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              bounces={false}
            >
              {/* Title */}
              <View style={styles.titleSection}>
                <View style={styles.titleRow}>
                  <TextInput
                    style={[styles.titleInput, { 
                      color: colors.foreground,
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      borderWidth: 1,
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                    }]}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Enter task title..."
                    placeholderTextColor={colors['muted-foreground']}
                    autoFocus={true}
                  />
                </View>
              </View>

              {/* Quick Actions */}
              <View style={styles.quickActions}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                  Quick Actions
                </Text>
                <View style={styles.actionButtons}>
                  {quickActions.map((action) => (
                    <TouchableOpacity
                      key={action.id}
                      style={[
                        styles.actionButton,
                        { backgroundColor: `${action.color}20` },
                      ]}
                      onPress={() => handleQuickAction(action.id)}
                    >
                      <action.icon size={18} color={action.color} />
                      <Text style={[styles.actionText, { color: action.color }]}>
                        {action.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Description */}
              <TouchableOpacity
                style={styles.section}
                onPress={() => setShowDescription(!showDescription)}
              >
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIcon}>
                    <MessageSquare size={18} color={colors['muted-foreground']} />
                  </View>
                  <Text style={[styles.sectionLabel, { color: colors.foreground }]}>
                    Add Description
                  </Text>
                </View>
                {showDescription && (
                  <TextInput
                    style={[styles.descriptionInput, { 
                      color: colors.foreground,
                      borderColor: colors.border,
                    }]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Add a more detailed description..."
                    placeholderTextColor={colors['muted-foreground']}
                    multiline
                    numberOfLines={4}
                  />
                )}
              </TouchableOpacity>

              {/* Labels */}
              <View style={[styles.section, activeSection === 'labels' && styles.activeSection]}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIcon}>
                    <Tag size={18} color={colors['muted-foreground']} />
                  </View>
                  <Text style={[styles.sectionLabel, { color: colors.foreground }]}>
                    Labels
                  </Text>
                  <TouchableOpacity 
                    style={styles.addButton}
                    onPress={() => {
                      setShowTagInput(!showTagInput);
                      setActiveSection('labels');
                    }}
                  >
                    <Plus size={16} color={colors.primary} />
                  </TouchableOpacity>
                </View>
                {showTagInput && (
                  <View style={styles.inputRow}>
                    <TextInput
                      style={[styles.inlineInput, { 
                        color: colors.foreground,
                        backgroundColor: colors.input,
                        borderColor: colors.border,
                      }]}
                      value={newTag}
                      onChangeText={setNewTag}
                      placeholder="Add a label..."
                      placeholderTextColor={colors['muted-foreground']}
                      onSubmitEditing={handleAddTag}
                    />
                    <TouchableOpacity
                      style={[styles.inlineButton, { backgroundColor: colors.primary }]}
                      onPress={handleAddTag}
                    >
                      <Check size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                )}
                {tags.length > 0 && (
                  <View style={styles.labelsList}>
                    {tags.map((tag) => (
                      <TouchableOpacity
                        key={tag}
                        style={[styles.label, { backgroundColor: colors.primary }]}
                        onPress={() => handleRemoveTag(tag)}
                      >
                        <Text style={styles.labelText}>{tag}</Text>
                        <X size={14} color="white" />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Members */}
              <View style={[styles.section, activeSection === 'members' && styles.activeSection]}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIcon}>
                    <Users size={18} color={colors['muted-foreground']} />
                  </View>
                  <Text style={[styles.sectionLabel, { color: colors.foreground }]}>
                    Members
                  </Text>
                  <TouchableOpacity 
                    style={styles.addButton}
                    onPress={handleAddMember}
                  >
                    <Plus size={16} color={colors.primary} />
                  </TouchableOpacity>
                </View>
                {assignees.length > 0 && (
                  <View style={styles.membersList}>
                    {assignees.map((member) => (
                      <View key={member.id} style={styles.memberItem}>
                        <View style={[styles.memberAvatar, { backgroundColor: colors.primary }]}>
                          <Text style={styles.memberAvatarText}>
                            {member.name.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View style={styles.memberInfo}>
                          <Text style={[styles.memberName, { color: colors.foreground }]}>
                            {member.name}
                          </Text>
                          <Text style={[styles.memberEmail, { color: colors['muted-foreground'] }]}>
                            {member.email}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => setAssignees(assignees.filter(a => a.id !== member.id))}
                        >
                          <X size={16} color={colors['muted-foreground']} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {/* Due Date */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIcon}>
                    <Clock size={18} color={colors['muted-foreground']} />
                  </View>
                  <Text style={[styles.sectionLabel, { color: colors.foreground }]}>
                    Due Date
                  </Text>
                </View>
                <TextInput
                  style={[styles.dateInput, { 
                    color: colors.foreground,
                    backgroundColor: colors.input,
                    borderColor: colors.border,
                  }]}
                  value={dueDate}
                  onChangeText={setDueDate}
                  placeholder="Select due date (e.g., 2024-12-25)..."
                  placeholderTextColor={colors['muted-foreground']}
                />
              </View>

              {/* Priority */}
              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: colors.foreground }]}>
                  Priority
                </Text>
                <View style={styles.priorityOptions}>
                  {(['low', 'medium', 'high', 'urgent'] as const).map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={[
                        styles.priorityOption,
                        {
                          backgroundColor: priority === p ? priorityColors[p] : colors.muted,
                          borderColor: priorityColors[p],
                        },
                      ]}
                      onPress={() => setPriority(p)}
                    >
                      <Text
                        style={[
                          styles.priorityText,
                          {
                            color: priority === p ? 'white' : colors.foreground,
                          },
                        ]}
                      >
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Attachments */}
              <View style={[styles.section, activeSection === 'attachments' && styles.activeSection]}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIcon}>
                    <Paperclip size={18} color={colors['muted-foreground']} />
                  </View>
                  <Text style={[styles.sectionLabel, { color: colors.foreground }]}>
                    Attachments
                  </Text>
                  <TouchableOpacity style={styles.addButton}>
                    <Plus size={16} color={colors.primary} />
                  </TouchableOpacity>
                </View>
                {attachments.length > 0 && (
                  <View style={styles.attachmentsList}>
                    {attachments.map((attachment) => (
                      <View key={attachment.id} style={[styles.attachmentItem, { backgroundColor: colors.muted }]}>
                        <View style={styles.attachmentIcon}>
                          {attachment.type === 'image' ? (
                            <Image size={20} color={colors.primary} />
                          ) : (
                            <FileText size={20} color={colors.primary} />
                          )}
                        </View>
                        <View style={styles.attachmentInfo}>
                          <Text style={[styles.attachmentName, { color: colors.foreground }]}>
                            {attachment.name}
                          </Text>
                          <Text style={[styles.attachmentSize, { color: colors['muted-foreground'] }]}>
                            {attachment.size}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => setAttachments(attachments.filter(a => a.id !== attachment.id))}
                        >
                          <Trash2 size={16} color={colors['muted-foreground']} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
                <View style={styles.attachmentActions}>
                  <TouchableOpacity 
                    style={[styles.attachmentButton, { backgroundColor: colors.muted }]}
                    onPress={() => handleAddAttachment('image')}
                  >
                    <Image size={16} color={colors.primary} />
                    <Text style={[styles.attachmentButtonText, { color: colors.foreground }]}>Add Image</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.attachmentButton, { backgroundColor: colors.muted }]}
                    onPress={() => handleAddAttachment('document')}
                  >
                    <FileText size={16} color={colors.primary} />
                    <Text style={[styles.attachmentButtonText, { color: colors.foreground }]}>Add File</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Checklists */}
              <View style={[styles.section, activeSection === 'checklists' && styles.activeSection]}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIcon}>
                    <CheckSquare size={18} color={colors['muted-foreground']} />
                  </View>
                  <Text style={[styles.sectionLabel, { color: colors.foreground }]}>
                    Checklists
                  </Text>
                  <TouchableOpacity 
                    style={styles.addButton}
                    onPress={() => setShowChecklistInput(!showChecklistInput)}
                  >
                    <Plus size={16} color={colors.primary} />
                  </TouchableOpacity>
                </View>
                {showChecklistInput && (
                  <View style={styles.inputRow}>
                    <TextInput
                      style={[styles.inlineInput, { 
                        color: colors.foreground,
                        backgroundColor: colors.input,
                        borderColor: colors.border,
                      }]}
                      value={newChecklistTitle}
                      onChangeText={setNewChecklistTitle}
                      placeholder="Checklist title..."
                      placeholderTextColor={colors['muted-foreground']}
                      onSubmitEditing={handleAddChecklist}
                    />
                    <TouchableOpacity
                      style={[styles.inlineButton, { backgroundColor: colors.primary }]}
                      onPress={handleAddChecklist}
                    >
                      <Check size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                )}
                {checklists.map((checklist) => (
                  <View key={checklist.id} style={[styles.checklistContainer, { backgroundColor: colors.muted }]}>
                    <View style={styles.checklistHeader}>
                      <Text style={[styles.checklistTitle, { color: colors.foreground }]}>
                        {checklist.title}
                      </Text>
                      <Text style={[styles.checklistProgress, { color: colors['muted-foreground'] }]}>
                        {checklist.items.filter(i => i.completed).length}/{checklist.items.length}
                      </Text>
                    </View>
                    {checklist.items.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={styles.checklistItemRow}
                        onPress={() => handleToggleChecklistItem(checklist.id, item.id)}
                      >
                        <View style={[styles.checkbox, { borderColor: colors.border }]}>
                          {item.completed && <Check size={14} color={colors.primary} />}
                        </View>
                        <Text style={[
                          styles.checklistItemText, 
                          { color: colors.foreground },
                          item.completed && styles.checklistItemCompleted
                        ]}>
                          {item.text}
                        </Text>
                      </TouchableOpacity>
                    ))}
                    {editingChecklist === checklist.id && (
                      <View style={styles.inputRow}>
                        <TextInput
                          style={[styles.inlineInput, { 
                            color: colors.foreground,
                            backgroundColor: colors.background,
                            borderColor: colors.border,
                            flex: 1,
                          }]}
                          value={newChecklistItem}
                          onChangeText={setNewChecklistItem}
                          placeholder="Add an item..."
                          placeholderTextColor={colors['muted-foreground']}
                          onSubmitEditing={() => handleAddChecklistItem(checklist.id)}
                        />
                        <TouchableOpacity
                          style={[styles.inlineButton, { backgroundColor: colors.primary }]}
                          onPress={() => handleAddChecklistItem(checklist.id)}
                        >
                          <Plus size={16} color="white" />
                        </TouchableOpacity>
                      </View>
                    )}
                    {editingChecklist !== checklist.id && (
                      <TouchableOpacity
                        style={styles.addItemButton}
                        onPress={() => setEditingChecklist(checklist.id)}
                      >
                        <Plus size={14} color={colors['muted-foreground']} />
                        <Text style={[styles.addItemText, { color: colors['muted-foreground'] }]}>
                          Add an item
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>

              {/* Activity/Comments */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                  Activity
                </Text>
                {comments.map((comment) => (
                  <View key={comment.id} style={styles.comment}>
                    <View style={[styles.commentAvatar, { backgroundColor: colors.primary }]}>
                      <Text style={styles.commentAvatarText}>
                        {comment.author[0].toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.commentContent}>
                      <Text style={[styles.commentAuthor, { color: colors.foreground }]}>
                        {comment.author}
                      </Text>
                      <Text style={[styles.commentText, { color: colors['muted-foreground'] }]}>
                        {comment.text}
                      </Text>
                      <Text style={[styles.commentTime, { color: colors['muted-foreground'] }]}>
                        {new Date(comment.timestamp).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              <View style={{ height: 20 }} />
            </ScrollView>

            {/* Comment Input */}
            <View style={[styles.commentInputContainer, { 
              borderTopColor: colors.border,
              backgroundColor: colors.background,
            }]}>
              <View style={[styles.commentInputAvatar, { backgroundColor: colors.primary }]}>
                <Text style={styles.commentAvatarText}>DH</Text>
              </View>
              <TextInput
                style={[styles.commentInput, { 
                  color: colors.foreground,
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                }]}
                value={newComment}
                onChangeText={setNewComment}
                placeholder="Add a comment..."
                placeholderTextColor={colors['muted-foreground']}
                multiline
              />
              <TouchableOpacity
                style={[styles.sendButton, { backgroundColor: colors.primary }]}
                onPress={handleAddComment}
              >
                <Send size={18} color="white" />
              </TouchableOpacity>
            </View>

            {/* Save Button */}
            <View style={styles.saveButtonContainer}>
              <TouchableOpacity
                style={[styles.saveButton, { 
                  backgroundColor: title.trim() ? colors.primary : colors.muted,
                  opacity: title.trim() ? 1 : 0.5,
                }]}
                onPress={handleSave}
                disabled={!title.trim()}
              >
                <Text style={[styles.saveButtonText, { 
                  color: title.trim() ? 'white' : colors['muted-foreground']
                }]}>Create Task</Text>
              </TouchableOpacity>
            </View>
            </Animated.View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  keyboardAvoid: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modal: {
    maxHeight: MODAL_HEIGHT,
    minHeight: SCREEN_HEIGHT * 0.5,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  columnLabel: {
    fontSize: 12,
  },
  moreButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    maxHeight: MODAL_HEIGHT - 200, // Reserve space for header and save button
  },
  titleSection: {
    paddingVertical: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
  },
  titleInput: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    minHeight: 45,
  },
  quickActions: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '500',
  },
  section: {
    marginBottom: 20,
  },
  activeSection: {
    borderLeftWidth: 3,
    paddingLeft: 12,
    marginLeft: -12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionIcon: {
    marginRight: 10,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  addButton: {
    padding: 4,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  inlineInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  inlineButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  descriptionInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  dateInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  priorityOptions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  priorityOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  priorityText: {
    fontSize: 13,
    fontWeight: '500',
  },
  labelsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  label: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  labelText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  membersList: {
    marginTop: 8,
    gap: 8,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    gap: 10,
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '500',
  },
  memberEmail: {
    fontSize: 12,
  },
  attachmentsList: {
    marginTop: 8,
    gap: 8,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    gap: 10,
  },
  attachmentIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachmentInfo: {
    flex: 1,
  },
  attachmentName: {
    fontSize: 14,
    fontWeight: '500',
  },
  attachmentSize: {
    fontSize: 12,
  },
  attachmentActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  attachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  attachmentButtonText: {
    fontSize: 13,
  },
  checklistContainer: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
  },
  checklistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  checklistTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  checklistProgress: {
    fontSize: 12,
  },
  checklistItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checklistItemText: {
    flex: 1,
    fontSize: 14,
  },
  checklistItemCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 6,
  },
  addItemText: {
    fontSize: 13,
  },
  comment: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 10,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentAvatarText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  commentContent: {
    flex: 1,
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  commentText: {
    fontSize: 13,
    marginBottom: 4,
  },
  commentTime: {
    fontSize: 11,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    borderTopWidth: 1,
    gap: 10,
  },
  commentInputAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
  },
  saveButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'inherit',
  },
  saveButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
