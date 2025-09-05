import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, View, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { useAppSelector, useAppDispatch } from '@/store';
import { listTemplates } from '@/store/slices/templatesSlice';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Sidebar from '@/components/navigation/Sidebar';

export default function TemplatesScreen() {
  const colors = useThemeColors();
  const dispatch = useAppDispatch();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const getTemplateStats = () => {
    const total = templates?.length || 0;
    const active = templates?.filter(t => t.status === 'active')?.length || 0;
    const publicTemplates = templates?.filter(t => t.isPublic)?.length || 0;
    const privateTemplates = total - publicTemplates;
    
    return { total, active, public: publicTemplates, private: privateTemplates };
  };

  const stats = getTemplateStats();

  const getTemplateCategory = (template: any) => {
    if (template.category) return template.category;
    if (template.name?.toLowerCase().includes('project')) return 'Project Management';
    if (template.name?.toLowerCase().includes('design')) return 'Design';
    if (template.name?.toLowerCase().includes('development')) return 'Development';
    return 'General';
  };

  const categories = ['All', 'Project Management', 'Design', 'Development', 'General'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={toggleSidebar} style={styles.menuButton}>
          <FontAwesome name="bars" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>Templates</Text>
        <TouchableOpacity style={styles.addButton}>
          <FontAwesome name="plus" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Overview Stats */}
        <Card style={[styles.overviewCard, { backgroundColor: colors.card }]}>
          <Text style={[TextStyles.heading.h3, { color: colors.foreground, marginBottom: 16 }]}>
            Template Overview
          </Text>
          
          <View style={styles.statsGrid}>
            <View style={[styles.statItem, { backgroundColor: colors.background }]}>
              <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>{stats.total}</Text>
              <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>Total</Text>
            </View>
            <View style={[styles.statItem, { backgroundColor: colors.background }]}>
              <Text style={[TextStyles.heading.h2, { color: colors.success }]}>{stats.active}</Text>
              <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>Active</Text>
            </View>
            <View style={[styles.statItem, { backgroundColor: colors.background }]}>
              <Text style={[TextStyles.heading.h2, { color: colors.primary }]}>{stats.public}</Text>
              <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>Public</Text>
            </View>
            <View style={[styles.statItem, { backgroundColor: colors.background }]}>
              <Text style={[TextStyles.heading.h2, { color: colors.warning }]}>{stats.private}</Text>
              <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>Private</Text>
            </View>
          </View>
        </Card>

        {/* Categories */}
        <Card style={[styles.categoriesCard, { backgroundColor: colors.card }]}>
          <Text style={[TextStyles.heading.h3, { color: colors.foreground, marginBottom: 16 }]}>
            Categories
          </Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categoriesList}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[styles.categoryButton, { 
                    backgroundColor: colors.background,
                    borderColor: colors.border 
                  }]}
                >
                  <Text style={[TextStyles.body.small, { color: colors.foreground }]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </Card>

        {/* Templates List */}
        <Card style={[styles.templatesCard, { backgroundColor: colors.card }]}>
          <Text style={[TextStyles.heading.h3, { color: colors.foreground, marginBottom: 16 }]}>
            Available Templates
          </Text>
          
          {loading ? (
            <View style={styles.loadingState}>
              <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'] }]}>
                Loading templates...
              </Text>
            </View>
          ) : error ? (
            <View style={styles.errorState}>
              <FontAwesome name="exclamation-triangle" size={24} color={colors.destructive} />
              <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>
                Error loading templates
              </Text>
              <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
                {error}
              </Text>
            </View>
          ) : templates && templates.length > 0 ? (
            <View style={styles.templatesList}>
              {templates.map((template) => (
                <TouchableOpacity
                  key={template._id}
                  style={[styles.templateItem, { backgroundColor: colors.background, borderColor: colors.border }]}
                >
                  <View style={styles.templateHeader}>
                    <View style={styles.templateInfo}>
                      <Text style={[TextStyles.body.medium, { color: colors.foreground }]} numberOfLines={1}>
                        {template.name}
                      </Text>
                      <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]} numberOfLines={2}>
                        {template.description || "No description"}
                      </Text>
                    </View>
                    <View style={styles.templateActions}>
                      <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary }]}>
                        <FontAwesome name="play" size={14} color={colors['primary-foreground']} />
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.muted }]}>
                        <FontAwesome name="ellipsis-h" size={14} color={colors.foreground} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  <View style={styles.templateDetails}>
                    <View style={styles.templateBadges}>
                      <View style={[styles.badge, { backgroundColor: template.isPublic ? colors.success : colors.muted }]}>
                        <Text style={[TextStyles.caption.small, { color: colors.foreground }]}>
                          {template.isPublic ? 'Public' : 'Private'}
                        </Text>
                      </View>
                      <View style={[styles.badge, { backgroundColor: template.status === 'active' ? colors.success : colors.destructive }]}>
                        <Text style={[TextStyles.caption.small, { color: colors.foreground }]}>
                          {template.status === 'active' ? 'Active' : 'Inactive'}
                        </Text>
                      </View>
                      <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                        <Text style={[TextStyles.caption.small, { color: colors.foreground }]}>
                          {getTemplateCategory(template)}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.templateMeta}>
                      <View style={styles.metaItem}>
                        <FontAwesome name="tasks" size={12} color={colors['muted-foreground']} />
                        <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
                          {template.tasks?.length || 0} tasks
                        </Text>
                      </View>
                      <View style={styles.metaItem}>
                        <FontAwesome name="calendar" size={12} color={colors['muted-foreground']} />
                        <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
                          {new Date(template.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <FontAwesome name="copy" size={48} color={colors['muted-foreground']} />
              <Text style={[TextStyles.heading.h3, { color: colors.foreground }]}>
                No Templates Available
              </Text>
              <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'], textAlign: 'center' }]}>
                Create your first template to streamline your workflow.
              </Text>
              <TouchableOpacity style={[styles.createButton, { backgroundColor: colors.primary }]}>
                <FontAwesome name="plus" size={16} color={colors['primary-foreground']} />
                <Text style={[TextStyles.body.medium, { color: colors['primary-foreground'] }]}>
                  Create Template
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </Card>

        {/* Quick Actions */}
        <Card style={[styles.actionsCard, { backgroundColor: colors.card }]}>
          <Text style={[TextStyles.heading.h3, { color: colors.foreground, marginBottom: 16 }]}>
            Quick Actions
          </Text>
          
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={[styles.actionCard, { backgroundColor: colors.background }]}>
              <FontAwesome name="plus" size={24} color={colors.primary} />
              <Text style={[TextStyles.body.small, { color: colors.foreground }]}>New Template</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionCard, { backgroundColor: colors.background }]}>
              <FontAwesome name="search" size={24} color={colors.primary} />
              <Text style={[TextStyles.body.small, { color: colors.foreground }]}>Search</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionCard, { backgroundColor: colors.background }]}>
              <FontAwesome name="filter" size={24} color={colors.primary} />
              <Text style={[TextStyles.body.small, { color: colors.foreground }]}>Filter</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionCard, { backgroundColor: colors.background }]}>
              <FontAwesome name="sort" size={24} color={colors.primary} />
              <Text style={[TextStyles.body.small, { color: colors.foreground }]}>Sort</Text>
            </TouchableOpacity>
          </View>
        </Card>
      </ScrollView>

      <Sidebar isVisible={sidebarVisible} onClose={() => setSidebarVisible(false)} context="dashboard" />
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
  overviewCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  categoriesCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  categoriesList: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  templatesCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  templatesList: {
    gap: 12,
  },
  templateItem: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  templateInfo: {
    flex: 1,
    marginRight: 12,
  },
  templateActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  templateDetails: {
    gap: 8,
  },
  templateBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  templateMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  loadingState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  errorState: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 24,
  },
  emptyState: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 32,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  actionsCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    gap: 8,
  },
});
