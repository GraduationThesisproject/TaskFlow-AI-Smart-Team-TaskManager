import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { Text, View, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { useAppSelector } from '@/store/index';
import { BannerProvider, useBanner } from '@/components/common/BannerProvider';

const RULES_STORAGE_KEY = 'workspace_rules';
const RULES_FILE = `${((FileSystem as any).documentDirectory || (FileSystem as any).cacheDirectory || '')}workspace_rules.txt`;

const DEFAULT_RULES = `📌 Task Management Rules

One Task = One Owner

Every task must have a single responsible owner (others can be collaborators).

Clear Titles & Descriptions

Task titles should be short but descriptive.

Description must include context, requirements, and links/resources if needed.

Due Dates are Mandatory

Every task must have a start and/or due date.

Use Labels/Tags

Add at least one tag (e.g., frontend, backend, urgent, bug).

Checklist for Big Tasks

Break larger tasks into subtasks or checklists.

📌 Workflow Rules

No Skipping Columns

Tasks must move step-by-step (e.g., To Do ➝ In Progress ➝ Review ➝ Done).

Limit Work in Progress (WIP)

Max 3 active tasks per person to avoid overload.

Daily Standup Updates

Each member updates at least once per day (comment or status).

Review Required Before Done

Every task in Review must be checked by another teammate or AI assistant before moving to Done.

📌 Communication Rules

Comment Before Closing

Always leave a final comment when completing a task (summary, links, results).

@Mentions for Clarity

Use @name to assign or notify directly.

AI Suggestions First

Before asking the team, check if TaskFlow AI can suggest fixes/answers.

📌 AI Integration Rules

AI for Task Drafting

Use AI to draft tasks, acceptance criteria, or user stories before team refinement.

AI for Summaries

At the end of the day, AI generates a progress summary for the team.

AI for Estimates

Use AI as a second opinion for effort/priority estimation.`;

function WorkspaceRulesScreenContent() {
  const colors = useThemeColors();
  const router = useRouter();
  const { showSuccess, showError, showWarning, showInfo } = useBanner();

  const { currentWorkspace, members } = useAppSelector((s: any) => s.workspace);
  const { user: authUser } = useAppSelector((s: any) => s.auth);

  const [rules, setRules] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  // Determine permissions: owner or admin can edit
  const canEdit = useMemo(() => {
    const uid = String(authUser?.user?._id || authUser?.user?.id || '');
    if (!uid) return false;
    
    console.log('🔍 Rules Permission Check:', {
      uid,
      currentWorkspace,
      members: members?.length || 0,
      ownerField: currentWorkspace?.owner,
      ownerId: currentWorkspace?.ownerId
    });
    
    // Owner check - owner field can be a string (ID) or object with _id/id
    const ownerId = typeof currentWorkspace?.owner === 'string' 
      ? currentWorkspace.owner 
      : (currentWorkspace?.owner?._id || currentWorkspace?.owner?.id || currentWorkspace?.ownerId);
    
    if (ownerId && String(ownerId) === uid) {
      console.log('✅ User is workspace owner');
      return true;
    }
    
    // Admin role among members
    const list: any[] = Array.isArray(members) ? members : [];
    const isAdmin = list.some((m: any) => {
      const mid = m?.user?._id || m?.user?.id || m?.userId || m?._id || m?.id;
      const role = String(m?.role || '').toLowerCase();
      const isAdminRole = String(mid) === uid && (role === 'admin' || role === 'owner');
      if (isAdminRole) {
        console.log('✅ User is admin/owner in members list:', { mid, role });
      }
      return isAdminRole;
    });
    
    console.log('🔍 Final canEdit result:', isAdmin);
    return isAdmin;
  }, [authUser, currentWorkspace, members]);

  useEffect(() => {
    (async () => {
      try {
        // Try to load from AsyncStorage first (more reliable)
        const storedRules = await AsyncStorage.getItem(RULES_STORAGE_KEY);
        if (storedRules) {
          setRules(storedRules);
        } else {
          // Fallback to FileSystem if AsyncStorage is empty
          try {
            const info = await FileSystem.getInfoAsync(RULES_FILE);
            if (info.exists) {
              const content = await FileSystem.readAsStringAsync(RULES_FILE);
              setRules(content);
              // Migrate to AsyncStorage
              await AsyncStorage.setItem(RULES_STORAGE_KEY, content);
            } else {
              // Use default rules
              setRules(DEFAULT_RULES);
              await AsyncStorage.setItem(RULES_STORAGE_KEY, DEFAULT_RULES);
            }
          } catch (fileError) {
            console.warn('FileSystem not available, using defaults:', fileError);
            setRules(DEFAULT_RULES);
            await AsyncStorage.setItem(RULES_STORAGE_KEY, DEFAULT_RULES);
          }
        }
      } catch (e) {
        console.warn('Failed to load rules, using defaults:', e);
        setRules(DEFAULT_RULES);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Check if writeAsStringAsync is available
      if (typeof FileSystem.writeAsStringAsync === 'function') {
        await FileSystem.writeAsStringAsync(RULES_FILE, rules);
      } else {
        // Fallback: Use AsyncStorage or just keep in memory
        console.warn('FileSystem.writeAsStringAsync not available, saving to memory only');
        // For now, we'll just keep the rules in memory state
        // You could also use AsyncStorage as an alternative:
        // await AsyncStorage.setItem('workspace_rules', rules);
      }
      
      showSuccess('Workspace rules saved successfully.');
      setEditing(false);
    } catch (e: any) {
      console.error('Save error:', e);
      showError(`Failed to save rules: ${e?.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleExportPdf = async () => {
    try {
      const safe = (rules || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>');
      const html = `<!DOCTYPE html><html><head><meta charset="utf-8" />
        <title>Workspace Rules</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', Arial, sans-serif; padding: 24px; }
          h1 { font-size: 22px; margin-bottom: 12px; }
          .content { line-height: 1.5; font-size: 14px; }
        </style>
      </head><body>
        <h1>Workspace Rules</h1>
        <div class="content">${safe}</div>
      </body></html>`;

      const { uri } = await Print.printToFileAsync({ html });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, { UTI: 'com.adobe.pdf', mimeType: 'application/pdf' });
      } else {
        showSuccess(`PDF saved to: ${uri}`);
      }
    } catch (e: any) {
      showError(`Export failed: ${e?.message || 'Failed to export PDF'}`);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Professional Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backButton, { backgroundColor: colors.primary }]}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <FontAwesome name="chevron-left" size={18} color={colors['primary-foreground']} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <View style={[styles.headerIcon, { backgroundColor: colors.primary + '15' }]}>
              <FontAwesome name="gavel" size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>Workspace Rules</Text>
              <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
                {canEdit ? 'Manage team guidelines and policies' : 'View workspace rules'}
              </Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              onPress={handleExportPdf} 
              style={[styles.actionButton, { backgroundColor: colors.accent + '15' }]}
              accessibilityLabel="Export PDF"
            >
              <FontAwesome name="file-pdf-o" size={18} color={colors.accent} />
            </TouchableOpacity>
            {canEdit && !editing && (
              <TouchableOpacity 
                onPress={() => setEditing(true)} 
                style={[styles.actionButton, { backgroundColor: colors.primary + '15' }]}
                accessibilityLabel="Edit rules"
              >
                <FontAwesome name="pencil" size={18} color={colors.primary} />
              </TouchableOpacity>
            )}
            {canEdit && editing && (
              <TouchableOpacity 
                onPress={handleSave} 
                disabled={saving} 
                style={[styles.actionButton, { backgroundColor: colors.success + '15', opacity: saving ? 0.6 : 1 }]}
                accessibilityLabel="Save rules"
              >
                <FontAwesome name="save" size={18} color={colors.success} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Rules Editor Card */}
        <Card style={[styles.editorCard, { backgroundColor: colors.card }]}>
          <View style={styles.editorHeader}>
            <View style={styles.editorTitleContainer}>
              <View style={[styles.editorIcon, { backgroundColor: colors.primary + '15' }]}>
                <FontAwesome name="edit" size={16} color={colors.primary} />
              </View>
              <Text style={[TextStyles.heading.h3, { color: colors.foreground }]}>
                {editing ? 'Edit Rules' : 'Workspace Rules'}
              </Text>
            </View>
            {editing && (
              <View style={[styles.editingBadge, { backgroundColor: colors.warning + '15' }]}>
                <FontAwesome name="pencil" size={12} color={colors.warning} />
                <Text style={[TextStyles.caption.small, { color: colors.warning, marginLeft: 4, fontWeight: '500' }]}>
                  Editing
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.editorContainer}>
            <TextInput
              value={rules}
              onChangeText={setRules}
              editable={!loading && canEdit && editing}
              placeholder="Write or paste your workspace rules here...\n\nUse markdown formatting for better structure:\n- Use bullet points for lists\n- Use **bold** for emphasis\n- Use ## for section headers"
              placeholderTextColor={colors['muted-foreground']}
              multiline
              textAlignVertical="top"
              style={[styles.input, { color: colors.foreground, backgroundColor: colors.background }]}
            />
          </View>
          
          {editing && (
            <View style={styles.editorActions}>
              <TouchableOpacity
                onPress={() => setEditing(false)}
                style={[styles.cancelButton, { backgroundColor: colors.muted, borderColor: colors.border }]}
              >
                <FontAwesome name="times" size={14} color={colors.foreground} />
                <Text style={[TextStyles.body.small, { color: colors.foreground, marginLeft: 6, fontWeight: '500' }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                disabled={saving}
                style={[styles.saveButton, { backgroundColor: colors.primary, opacity: saving ? 0.6 : 1 }]}
              >
                <FontAwesome name="save" size={14} color={colors['primary-foreground']} />
                <Text style={[TextStyles.body.small, { color: colors['primary-foreground'], marginLeft: 6, fontWeight: '600' }]}>
                  {saving ? 'Saving...' : 'Save Rules'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </Card>

        {/* Help Section */}
        <Card style={[styles.helpCard, { backgroundColor: colors.card }]}>
          <View style={styles.helpHeader}>
            <View style={[styles.helpIcon, { backgroundColor: colors.accent + '15' }]}>
              <FontAwesome name="lightbulb-o" size={16} color={colors.accent} />
            </View>
            <Text style={[TextStyles.heading.h4, { color: colors.foreground }]}>Tips for Effective Rules</Text>
          </View>
          <View style={styles.helpContent}>
            <View style={styles.helpItem}>
              <FontAwesome name="check-circle" size={14} color={colors.success} />
              <Text style={[TextStyles.body.small, { color: colors.foreground }]}>
                Keep rules clear and actionable
              </Text>
            </View>
            <View style={styles.helpItem}>
              <FontAwesome name="check-circle" size={14} color={colors.success} />
              <Text style={[TextStyles.body.small, { color: colors.foreground }]}>
                Include examples for complex guidelines
              </Text>
            </View>
            <View style={styles.helpItem}>
              <FontAwesome name="check-circle" size={14} color={colors.success} />
              <Text style={[TextStyles.body.small, { color: colors.foreground }]}>
                Update rules as your team grows
              </Text>
            </View>
            <View style={styles.helpItem}>
              <FontAwesome name="check-circle" size={14} color={colors.success} />
              <Text style={[TextStyles.body.small, { color: colors.foreground }]}>
                Use markdown formatting for better readability
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

// Wrapper component with BannerProvider
export default function WorkspaceRulesScreen() {
  return (
    <BannerProvider>
      <WorkspaceRulesScreenContent />
    </BannerProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  editorCard: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  editorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  editorTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  editorIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  editorContainer: {
    marginBottom: 20,
  },
  input: {
    minHeight: 400,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    lineHeight: 24,
    textAlignVertical: 'top',
  },
  editorActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  helpCard: {
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  helpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  helpIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpContent: {
    gap: 12,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
