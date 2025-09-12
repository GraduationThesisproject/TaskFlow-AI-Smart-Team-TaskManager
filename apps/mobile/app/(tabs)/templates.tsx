import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { Text, View, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { useAppSelector, useAppDispatch } from '@/store';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Sidebar from '@/components/navigation/Sidebar';
import { listTemplates, createTemplate, deleteTemplate, updateTemplate, toggleTemplateLike, incrementTemplateViews } from '@/store/slices/templatesSlice';
import CreateTemplateModal from '@/components/templates/CreateTemplateModal';
import TemplateCard from '@/components/templates/TemplateCard';
import TemplateDetailModal from '@/components/templates/TemplateDetailModal';
import TemplateFilters from '@/components/templates/TemplateFilters';
import EditTemplateModal from '@/components/templates/EditTemplateModal';
import TemplateApplicationModal from '@/components/templates/TemplateApplicationModal';
import type { TemplateItem, TemplateType } from '@/types/dash.types';

export default function TemplatesScreen() {
  const colors = useThemeColors();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [applicationModalVisible, setApplicationModalVisible] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateItem | null>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<TemplateType | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'name'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { items: templates, loading, error } = useAppSelector(state => state.templates);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      await dispatch(listTemplates({ status: 'active' }));
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTemplates();
    setRefreshing(false);
  };

  const handleCreateTemplate = () => {
    setCreateModalVisible(true);
  };

  const handleSubmitTemplate = async (templateData: any) => {
    try {
      await dispatch(createTemplate(templateData));
      Alert.alert('Success', 'Template created successfully!');
      // Refresh the templates list
      await loadTemplates();
    } catch (error) {
      Alert.alert('Error', 'Failed to create template');
      throw error; // Re-throw so the modal can handle it
    }
  };

  // Filtered and sorted templates
  const filteredTemplates = useMemo(() => {
    let filtered = [...(templates || [])];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(query) ||
        template.description?.toLowerCase().includes(query) ||
        template.tags?.some((tag: string) => tag.toLowerCase().includes(query))
      );
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(template => template.type === selectedType);
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Sort templates
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popular': {
          const scoreA = (a.likedBy?.length || 0) * 3 + (a.views || 0);
          const scoreB = (b.likedBy?.length || 0) * 3 + (b.views || 0);
          return scoreB - scoreA;
        }
        case 'name':
          return a.name.localeCompare(b.name);
        case 'newest':
        default:
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
    });

    return filtered;
  }, [templates, searchQuery, selectedType, selectedCategory, sortBy]);

  const handleTemplatePress = async (template: TemplateItem) => {
    setSelectedTemplate(template);
    setDetailModalVisible(true);
    
    // Increment views
    try {
      await dispatch(incrementTemplateViews(template._id));
    } catch (error) {
      console.error('Failed to increment views:', error);
    }
  };

  const handleTemplateLike = async (template: TemplateItem) => {
    try {
      await dispatch(toggleTemplateLike({ id: template._id, userId: user?.user?._id || '' }));
    } catch (error) {
      Alert.alert('Error', 'Failed to update like status');
    }
  };

  const handleDeleteTemplate = (template: TemplateItem) => {
    Alert.alert(
      'Delete Template',
      `Are you sure you want to delete "${template.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteTemplate(template._id));
              Alert.alert('Success', 'Template deleted successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete template');
            }
          }
        }
      ]
    );
  };

  const handleEditTemplate = (template: TemplateItem) => {
    setSelectedTemplate(template);
    setEditModalVisible(true);
  };

  const handleApplyTemplate = (template: TemplateItem) => {
    setSelectedTemplate(template);
    setApplicationModalVisible(true);
  };

  const isUserLiked = (template: TemplateItem) => {
    const userId = user?.user?._id;
    return userId && template.likedBy?.includes(userId);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => setSidebarVisible(true)} style={styles.menuButton}>
          <FontAwesome name="bars" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>Templates</Text>
        <TouchableOpacity onPress={handleCreateTemplate} style={styles.addButton}>
          <FontAwesome name="plus" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Filters */}
        <TemplateFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* Results Summary */}
        {filteredTemplates.length > 0 && (
          <View style={styles.resultsSummary}>
            <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
              {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
            </Text>
          </View>
        )}

        {/* Loading State */}
        {loading && (
          <View style={styles.loadingContainer}>
            <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'] }]}>
              Loading templates...
            </Text>
          </View>
        )}

        {/* Error State */}
        {error && !loading && (
          <Card style={[styles.errorCard, { backgroundColor: colors.card }]}>
            <Text style={[TextStyles.body.medium, { color: colors.destructive }]}>
              Error: {error}
            </Text>
          </Card>
        )}

        {/* Templates List */}
        {!loading && !error && filteredTemplates.length > 0 && (
          <View style={styles.templatesList}>
            {filteredTemplates.map((template) => (
              <TemplateCard
                key={template._id}
                template={template}
                onPress={handleTemplatePress}
                onLike={handleTemplateLike}
                onDelete={handleDeleteTemplate}
                onEdit={handleEditTemplate}
                showActions={true}
                userLiked={!!isUserLiked(template)}
              />
            ))}
          </View>
        )}

        {/* Empty State */}
        {!loading && !error && filteredTemplates.length === 0 && (
          <View style={styles.emptyState}>
            <FontAwesome 
              name={searchQuery || selectedType !== 'all' || selectedCategory !== 'all' ? "search" : "copy"} 
              size={64} 
              color={colors['muted-foreground']} 
            />
            <Text style={[TextStyles.heading.h3, { color: colors.foreground }]}>
              {searchQuery || selectedType !== 'all' || selectedCategory !== 'all' 
                ? 'No Templates Found' 
                : 'No Templates Yet'
              }
            </Text>
            <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'], textAlign: 'center' }]}>
              {searchQuery || selectedType !== 'all' || selectedCategory !== 'all'
                ? 'Try adjusting your search or filters to find more templates.'
                : 'Create your first template to standardize your task management.'
              }
            </Text>
            {(searchQuery || selectedType !== 'all' || selectedCategory !== 'all') ? (
              <TouchableOpacity 
                onPress={() => {
                  setSearchQuery('');
                  setSelectedType('all');
                  setSelectedCategory('all');
                }}
                style={[styles.clearButton, { backgroundColor: colors.primary }]}
              >
                <FontAwesome name="times" size={16} color={colors['primary-foreground']} />
                <Text style={[TextStyles.body.medium, { color: colors['primary-foreground'] }]}>
                  Clear Filters
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                onPress={handleCreateTemplate}
                style={[styles.createButton, { backgroundColor: colors.primary }]}
              >
                <FontAwesome name="plus" size={16} color={colors['primary-foreground']} />
                <Text style={[TextStyles.body.medium, { color: colors['primary-foreground'] }]}>
                  Create Template
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      <Sidebar isVisible={sidebarVisible} onClose={() => setSidebarVisible(false)} context="dashboard" />
      
      <CreateTemplateModal
        isVisible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSubmit={handleSubmitTemplate}
      />

      <TemplateDetailModal
        isVisible={detailModalVisible}
        template={selectedTemplate}
        onClose={() => {
          setDetailModalVisible(false);
          setSelectedTemplate(null);
        }}
        onLike={handleTemplateLike}
        onEdit={handleEditTemplate}
        onDelete={handleDeleteTemplate}
        onApply={handleApplyTemplate}
        userLiked={!!(selectedTemplate && isUserLiked(selectedTemplate))}
      />

      <EditTemplateModal
        isVisible={editModalVisible}
        template={selectedTemplate}
        onClose={() => {
          setEditModalVisible(false);
          setSelectedTemplate(null);
        }}
        onSuccess={() => {
          // Refresh templates after successful edit
          loadTemplates();
        }}
      />

      <TemplateApplicationModal
        isVisible={applicationModalVisible}
        template={selectedTemplate}
        onClose={() => {
          setApplicationModalVisible(false);
          setSelectedTemplate(null);
        }}
        onSuccess={(createdItem) => {
          // Handle successful template application
          console.log('Template applied successfully:', createdItem);
          // Optionally refresh templates or navigate to created item
        }}
      />
    </View>
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
  menuButton: {
    padding: 8,
  },
  addButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  resultsSummary: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  errorCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  templatesList: {
    gap: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
    gap: 16,
    paddingHorizontal: 32,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
});
