import React from 'react';
import { StyleSheet, Modal, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, View, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import type { TemplateItem } from '@/types/dash.types';

interface TemplateDetailModalProps {
  isVisible: boolean;
  template: TemplateItem | null;
  onClose: () => void;
  onLike?: (template: TemplateItem) => void;
  onEdit?: (template: TemplateItem) => void;
  onDelete?: (template: TemplateItem) => void;
  onApply?: (template: TemplateItem) => void;
  userLiked?: boolean;
}

export default function TemplateDetailModal({
  isVisible,
  template,
  onClose,
  onLike,
  onEdit,
  onDelete,
  onApply,
  userLiked = false
}: TemplateDetailModalProps) {
  const colors = useThemeColors();

  if (!template) return null;

  const handleLike = () => {
    if (onLike) {
      onLike(template);
    }
  };

  const handleEdit = () => {
    onEdit?.(template);
    onClose();
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Template',
      `Are you sure you want to delete "${template.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {
          onDelete?.(template);
          onClose();
        }}
      ]
    );
  };

  const handleApply = () => {
    if (onApply) {
      onApply(template);
      onClose();
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

  const renderContentPreview = () => {
    if (!template.content) return null;

    return (
      <Card style={[styles.contentCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[TextStyles.heading.h3, { color: colors.foreground, marginBottom: 12 }]}>
          Content Preview
        </Text>
        
        {template.type === 'task' && template.content && (
          <View style={styles.contentPreview}>
            <View style={styles.contentRow}>
              <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>Title:</Text>
              <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>{template.content.title || 'New Task'}</Text>
            </View>
            <View style={styles.contentRow}>
              <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>Priority:</Text>
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(template.content.priority || 'medium') }]}>
                <Text style={[TextStyles.caption.small, { color: colors.foreground }]}>
                  {template.content.priority || 'medium'}
                </Text>
              </View>
            </View>
            <View style={styles.contentRow}>
              <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>Status:</Text>
              <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>{template.content.status || 'todo'}</Text>
            </View>
          </View>
        )}

        {template.type === 'board' && template.content && (
          <View style={styles.contentPreview}>
            <View style={styles.contentRow}>
              <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>Name:</Text>
              <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>{template.content.name || 'New Board'}</Text>
            </View>
            <View style={styles.contentRow}>
              <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>Columns:</Text>
              <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>
                {template.content.columns?.length || 0} columns
              </Text>
            </View>
            {template.content.columns && (
              <View style={styles.columnsPreview}>
                {template.content.columns.slice(0, 3).map((column: any, index: number) => (
                  <View key={index} style={[styles.columnChip, { backgroundColor: colors.muted }]}>
                    <Text style={[TextStyles.caption.small, { color: colors.foreground }]}>
                      {column.name}
                    </Text>
                  </View>
                ))}
                {template.content.columns.length > 3 && (
                  <View style={[styles.columnChip, { backgroundColor: colors.muted }]}>
                    <Text style={[TextStyles.caption.small, { color: colors.foreground }]}>
                      +{template.content.columns.length - 3}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {template.type === 'checklist' && template.content && (
          <View style={styles.contentPreview}>
            <View style={styles.contentRow}>
              <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>Title:</Text>
              <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>{template.content.title || 'New Checklist'}</Text>
            </View>
            <View style={styles.contentRow}>
              <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>Items:</Text>
              <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>
                {template.content.items?.length || 0} items
              </Text>
            </View>
          </View>
        )}
      </Card>
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return colors.destructive;
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return colors.success;
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
          <Text style={[TextStyles.heading.h2, { color: colors.foreground }]} numberOfLines={1}>
            {template.name}
          </Text>
          <View style={styles.headerActions}>
            {onLike && (
              <TouchableOpacity onPress={handleLike} style={styles.actionButton}>
                <FontAwesome 
                  name={userLiked ? "heart" : "heart-o"} 
                  size={20} 
                  color={userLiked ? colors.destructive : colors.foreground} 
                />
              </TouchableOpacity>
            )}
            {onEdit && (
              <TouchableOpacity onPress={handleEdit} style={styles.actionButton}>
                <FontAwesome name="edit" size={18} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView style={styles.content}>
          {/* Template Info */}
          <Card style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.typeHeader}>
              <View style={[styles.typeIcon, { backgroundColor: getTypeColor(template.type) + '20' }]}>
                <FontAwesome 
                  name={getTypeIcon(template.type)} 
                  size={24} 
                  color={getTypeColor(template.type)} 
                />
              </View>
              <View style={styles.typeInfo}>
                <Text style={[TextStyles.heading.h3, { color: colors.foreground }]}>
                  {template.type.charAt(0).toUpperCase() + template.type.slice(1)} Template
                </Text>
                <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'] }]}>
                  {template.category || 'General'} • {template.isPublic ? 'Public' : 'Private'}
                </Text>
              </View>
            </View>

            {template.description && (
              <Text style={[TextStyles.body.medium, { color: colors.foreground, marginTop: 12 }]}>
                {template.description}
              </Text>
            )}

            {/* Tags */}
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

          {/* Content Preview */}
          {renderContentPreview()}

          {/* Statistics */}
          <Card style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[TextStyles.heading.h3, { color: colors.foreground, marginBottom: 12 }]}>
              Statistics
            </Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <FontAwesome name="eye" size={20} color={colors.primary} />
                <Text style={[TextStyles.body.large, { color: colors.foreground }]}>
                  {template.views || 0}
                </Text>
                <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
                  Views
                </Text>
              </View>
              <View style={styles.statItem}>
                <FontAwesome name="heart" size={20} color={colors.destructive} />
                <Text style={[TextStyles.body.large, { color: colors.foreground }]}>
                  {template.likedBy?.length || 0}
                </Text>
                <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
                  Likes
                </Text>
              </View>
            </View>
          </Card>

          {/* Metadata */}
          <Card style={[styles.metaCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[TextStyles.heading.h3, { color: colors.foreground, marginBottom: 12 }]}>
              Template Details
            </Text>
            <View style={styles.metaGrid}>
              <View style={styles.metaRow}>
                <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>Created:</Text>
                <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>
                  {template.createdAt ? new Date(template.createdAt).toLocaleDateString() : 'N/A'}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>Updated:</Text>
                <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>
                  {template.updatedAt ? new Date(template.updatedAt).toLocaleDateString() : 'N/A'}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>Status:</Text>
                <View style={[
                  styles.statusBadge, 
                  { backgroundColor: template.status === 'active' ? colors.success : colors.muted }
                ]}>
                  <Text style={[TextStyles.caption.small, { color: colors.foreground }]}>
                    {template.status || 'active'}
                  </Text>
                </View>
              </View>
            </View>
          </Card>
        </ScrollView>

        {/* Footer Actions */}
        <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <TouchableOpacity 
            style={[styles.footerButton, { backgroundColor: colors.background, borderColor: colors.border }]}
            onPress={onClose}
          >
            <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>Close</Text>
          </TouchableOpacity>
          
          {onApply && (
            <TouchableOpacity 
              style={[styles.footerButton, styles.primaryButton, { backgroundColor: colors.primary }]}
              onPress={handleApply}
            >
              <FontAwesome name="plus" size={16} color={colors['primary-foreground']} />
              <Text style={[TextStyles.body.medium, { color: colors['primary-foreground'], marginLeft: 8 }]}>
                Use Template
              </Text>
            </TouchableOpacity>
          )}
        </View>
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
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  typeHeader: {
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
  typeInfo: {
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
  contentCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  contentPreview: {
    gap: 8,
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  columnsPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  columnChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statsCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  metaCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  metaGrid: {
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  footerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  primaryButton: {
    flex: 2,
  },
});
