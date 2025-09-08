import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { Text, View, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { useAppSelector, useAppDispatch } from '@/store';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Sidebar from '@/components/navigation/Sidebar';
import { listTemplates, createTemplate, deleteTemplate } from '@/store/slices/templatesSlice';
import CreateTemplateModal from '@/components/templates/CreateTemplateModal';

export default function TemplatesScreen() {
  const colors = useThemeColors();
  const dispatch = useAppDispatch();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);

  const { templates, loading, error } = useAppSelector(state => state.templates);

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

  const handleDeleteTemplate = (templateId: string, templateName: string) => {
    Alert.alert(
      'Delete Template',
      `Are you sure you want to delete "${templateName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteTemplate(templateId));
              Alert.alert('Success', 'Template deleted successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete template');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => setSidebarVisible(true)} style={styles.menuButton}>
          <FontAwesome name="bars" size={24} color={colors.foreground} />
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
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'] }]}>
              Loading templates...
            </Text>
          </View>
        ) : error ? (
          <Card style={[styles.errorCard, { backgroundColor: colors.card }]}>
            <Text style={[TextStyles.body.medium, { color: colors.destructive }]}>
              Error: {error}
            </Text>
          </Card>
        ) : templates && templates.length > 0 ? (
          <View style={styles.templatesList}>
            {templates.map((template) => (
              <Card key={template._id} style={[styles.templateCard, { backgroundColor: colors.card }]}>
                <View style={styles.templateHeader}>
                  <Text style={[TextStyles.heading.h3, { color: colors.foreground }]}>
                    {template.name}
                  </Text>
                  <TouchableOpacity 
                    onPress={() => handleDeleteTemplate(template._id, template.name)}
                    style={styles.deleteButton}
                  >
                    <FontAwesome name="trash" size={16} color={colors.destructive} />
                  </TouchableOpacity>
                </View>
                
                <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'] }]}>
                  {template.description || 'No description'}
                </Text>
                
                <View style={styles.templateInfo}>
                  <View style={styles.infoRow}>
                    <FontAwesome name="tag" size={14} color={colors['muted-foreground']} />
                    <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
                      Category: {template.category || 'General'}
                    </Text>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <FontAwesome name="calendar" size={14} color={colors['muted-foreground']} />
                    <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
                      Created {new Date(template.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  
                  <View style={styles.badges}>
                    <View style={[
                      styles.badge, 
                      { backgroundColor: template.isPublic ? colors.success : colors.muted }
                    ]}>
                      <Text style={[TextStyles.caption.small, { color: colors.foreground }]}>
                        {template.isPublic ? 'Public' : 'Private'}
                      </Text>
                    </View>
                    
                    <View style={[
                      styles.badge, 
                      { backgroundColor: template.status === 'active' ? colors.success : colors.destructive }
                    ]}>
                      <Text style={[TextStyles.caption.small, { color: colors.foreground }]}>
                        {template.status === 'active' ? 'Active' : 'Inactive'}
                      </Text>
                    </View>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <FontAwesome name="copy" size={64} color={colors['muted-foreground']} />
            <Text style={[TextStyles.heading.h3, { color: colors.foreground }]}>
              No Templates Yet
            </Text>
            <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'], textAlign: 'center' }]}>
              Create your first template to standardize your task management.
            </Text>
            <TouchableOpacity 
              onPress={handleCreateTemplate}
              style={[styles.createButton, { backgroundColor: colors.primary }]}
            >
              <FontAwesome name="plus" size={16} color={colors['primary-foreground']} />
              <Text style={[TextStyles.body.medium, { color: colors['primary-foreground'] }]}>
                Create Template
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Sidebar isVisible={sidebarVisible} onClose={() => setSidebarVisible(false)} context="dashboard" />
      
      <CreateTemplateModal
        isVisible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSubmit={handleSubmitTemplate}
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
  templateCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  deleteButton: {
    padding: 8,
  },
  templateInfo: {
    marginTop: 12,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
    gap: 16,
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
});
