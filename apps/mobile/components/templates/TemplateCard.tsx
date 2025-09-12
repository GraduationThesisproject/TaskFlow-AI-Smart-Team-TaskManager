import React from 'react';
import { StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Text, View, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import type { TemplateItem } from '@/types/dash.types';

interface TemplateCardProps {
  template: TemplateItem;
  onPress: (template: TemplateItem) => void;
  onLike?: (template: TemplateItem) => void;
  onDelete?: (template: TemplateItem) => void;
  onEdit?: (template: TemplateItem) => void;
  showActions?: boolean;
  userLiked?: boolean;
}

export default function TemplateCard({ 
  template, 
  onPress, 
  onLike, 
  onDelete, 
  onEdit,
  showActions = false,
  userLiked = false 
}: TemplateCardProps) {
  const colors = useThemeColors();

  const handleLike = () => {
    if (onLike) {
      onLike(template);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Template',
      `Are you sure you want to delete "${template.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDelete?.(template) }
      ]
    );
  };

  const handleEdit = () => {
    onEdit?.(template);
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
    <TouchableOpacity onPress={() => onPress(template)} activeOpacity={0.7}>
      <Card style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <View style={styles.typeIndicator}>
              <FontAwesome 
                name={getTypeIcon(template.type)} 
                size={16} 
                color={getTypeColor(template.type)} 
              />
            </View>
            <View style={styles.titleTextContainer}>
              <Text style={[TextStyles.heading.h3, { color: colors.foreground }]} numberOfLines={1}>
                {template.name}
              </Text>
              <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
                {template.type} • {template.category || 'General'}
              </Text>
            </View>
          </View>
          
          {showActions && (
            <View style={styles.actionsContainer}>
              {onEdit && (
                <TouchableOpacity onPress={handleEdit} style={styles.actionButton}>
                  <FontAwesome name="edit" size={16} color={colors.primary} />
                </TouchableOpacity>
              )}
              {onDelete && (
                <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
                  <FontAwesome name="trash" size={16} color={colors.destructive} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Description */}
        {template.description && (
          <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'] }]} numberOfLines={2}>
            {template.description}
          </Text>
        )}

        {/* Tags */}
        {template.tags && template.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {template.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={[styles.tag, { backgroundColor: colors.muted }]}>
                <Text style={[TextStyles.caption.small, { color: colors.foreground }]}>
                  {tag}
                </Text>
              </View>
            ))}
            {template.tags.length > 3 && (
              <View style={[styles.tag, { backgroundColor: colors.muted }]}>
                <Text style={[TextStyles.caption.small, { color: colors.foreground }]}>
                  +{template.tags.length - 3}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.statsContainer}>
            {/* Views */}
            <View style={styles.statItem}>
              <FontAwesome name="eye" size={12} color={colors['muted-foreground']} />
              <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'], marginLeft: 4 }]}>
                {template.views || 0}
              </Text>
            </View>

            {/* Likes */}
            <TouchableOpacity 
              style={styles.statItem} 
              onPress={handleLike}
              disabled={!onLike}
            >
              <FontAwesome 
                name={userLiked ? "heart" : "heart-o"} 
                size={12} 
                color={userLiked ? colors.destructive : colors['muted-foreground']} 
              />
              <Text style={[TextStyles.caption.small, { 
                color: userLiked ? colors.destructive : colors['muted-foreground'], 
                marginLeft: 4 
              }]}>
                {template.likedBy?.length || 0}
              </Text>
            </TouchableOpacity>

            {/* Public/Private indicator */}
            <View style={styles.statItem}>
              <FontAwesome 
                name={template.isPublic ? "globe" : "lock"} 
                size={12} 
                color={template.isPublic ? colors.success : colors.muted} 
              />
              <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'], marginLeft: 4 }]}>
                {template.isPublic ? 'Public' : 'Private'}
              </Text>
            </View>
          </View>

          {/* Date */}
          <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
            {template.createdAt ? new Date(template.createdAt).toLocaleDateString() : 'N/A'}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeIndicator: {
    marginRight: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleTextContainer: {
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
    marginBottom: 12,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
