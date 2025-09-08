import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, RefreshControl } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';

import { Text, View, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { useAppSelector } from '@/store';
import { WorkspaceService } from '@/services/D_workspaceService';

export default function WorkspaceRulesScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { currentWorkspaceId, currentWorkspace } = useAppSelector((s: any) => s.workspace);

  const workspaceId = useMemo(() => currentWorkspaceId || (currentWorkspace?._id || currentWorkspace?.id) || null, [currentWorkspaceId, currentWorkspace]);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [content, setContent] = useState('');
  const [version, setVersion] = useState<number | undefined>(undefined);
  const [lastUpdated, setLastUpdated] = useState<string | undefined>(undefined);
  const [showPreview, setShowPreview] = useState(false);

  const goBack = () => router.back();

  const loadRules = async () => {
    if (!workspaceId) return;
    setLoading(true);
    try {
      const rules = await WorkspaceService.getWorkspaceRules(workspaceId);
      setContent(rules?.content || '');
      setVersion(rules?.version);
      setLastUpdated(rules?.updatedAt);
    } catch (e: any) {
      Alert.alert('Rules', e?.message || 'Failed to load rules');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    if (!workspaceId) return;
    setRefreshing(true);
    try {
      await loadRules();
    } finally {
      setRefreshing(false);
    }
  };

  const saveRules = async () => {
    if (!workspaceId) return;
    setLoading(true);
    try {
      const updated = await WorkspaceService.updateWorkspaceRules(workspaceId, { content });
      setContent(updated?.content || content);
      setVersion(updated?.version);
      setLastUpdated(updated?.updatedAt);
      Alert.alert('Rules', 'Rules saved successfully');
    } catch (e: any) {
      Alert.alert('Rules', e?.message || 'Failed to save rules');
    } finally {
      setLoading(false);
    }
  };

  const deleteRules = async () => {
    if (!workspaceId) return;
    Alert.alert('Delete Rules', 'Are you sure you want to delete/reset the workspace rules?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          setLoading(true);
          try {
            await WorkspaceService.deleteWorkspaceRules(workspaceId);
            setContent('');
            setVersion(undefined);
            setLastUpdated(undefined);
            Alert.alert('Rules', 'Rules deleted');
          } catch (e: any) {
            Alert.alert('Rules', e?.message || 'Failed to delete rules');
          } finally {
            setLoading(false);
          }
        }
      }
    ]);
  };

  const uploadPdf = async () => {
    if (!workspaceId) return;
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', multiple: false });
      if (res.canceled || !res.assets?.length) return;
      const file = res.assets[0];
      setLoading(true);
      // Expo DocumentPicker returns { uri, name, mimeType, size }
      const formFile: any = { uri: file.uri, name: file.name || 'rules.pdf', type: file.mimeType || 'application/pdf' };
      const uploaded = await WorkspaceService.uploadWorkspaceRules(workspaceId, formFile);
      setContent(uploaded?.content || content);
      setVersion(uploaded?.version);
      setLastUpdated(uploaded?.updatedAt);
      Alert.alert('Rules', 'Rules PDF uploaded and content updated');
    } catch (e: any) {
      Alert.alert('Rules', e?.message || 'Failed to upload rules PDF');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workspaceId) loadRules();
  }, [workspaceId]);

  if (!workspaceId) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity style={[styles.headerBtn, { backgroundColor: colors.primary }]} onPress={goBack}>
            <FontAwesome name="chevron-left" size={18} color={colors['primary-foreground']} />
          </TouchableOpacity>
          <Text style={[TextStyles.heading.h1, { color: colors.foreground }]} numberOfLines={1}>Workspace Rules</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.emptyBox}>
          <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'], textAlign: 'center' }]}>No workspace selected</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={[styles.headerBtn, { backgroundColor: colors.primary }]} onPress={goBack}>
          <FontAwesome name="chevron-left" size={18} color={colors['primary-foreground']} />
        </TouchableOpacity>
        <Text style={[TextStyles.heading.h1, { color: colors.foreground }]} numberOfLines={1}>Workspace Rules</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>        
        {/* Info */}
        <Card style={styles.sectionCard}>
          <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>Workspace</Text>
          <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>{currentWorkspace?.name || workspaceId}</Text>
          {version ? (
            <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'], marginTop: 4 }]}>Version {version}{lastUpdated ? ` • Updated ${new Date(lastUpdated).toLocaleString()}` : ''}</Text>
          ) : null}
        </Card>

        {/* Editor */}
        <Card style={styles.sectionCard}>
          <Text style={[TextStyles.heading.h2, { color: colors.foreground, marginBottom: 8 }]}>Content</Text>
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder={'# Workspace Rules\n\nWelcome to **TaskFlow**! Edit these rules to match your workspace policies.'}
            placeholderTextColor={colors['muted-foreground']}
            multiline
            style={[styles.textArea, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
          />
          <View style={styles.actionsRow}>
            <TouchableOpacity disabled={loading} onPress={loadRules} style={[styles.actionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[TextStyles.body.small, { color: colors.foreground }]}>Load</Text>
            </TouchableOpacity>
            <TouchableOpacity disabled={loading} onPress={saveRules} style={[styles.actionBtn, { backgroundColor: colors.primary }]}>
              <Text style={{ color: colors['primary-foreground'] }}>{loading ? 'Saving...' : 'Save'}</Text>
            </TouchableOpacity>
            <TouchableOpacity disabled={loading} onPress={deleteRules} style={[styles.actionBtn, { backgroundColor: colors.destructive }]}>
              <Text style={{ color: colors['destructive-foreground'] }}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity disabled={loading} onPress={uploadPdf} style={[styles.actionBtn, { backgroundColor: colors.secondary }]}>
              <Text style={{ color: colors['secondary-foreground'] }}>Upload PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity disabled={loading} onPress={() => setShowPreview(p => !p)} style={[styles.actionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[TextStyles.body.small, { color: colors.foreground }]}>{showPreview ? 'Hide Preview' : 'Show Preview'}</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {showPreview && (
          <Card style={styles.sectionCard}>
            <Text style={[TextStyles.heading.h2, { color: colors.foreground, marginBottom: 8 }]}>Preview</Text>
            <ScrollView style={{ maxHeight: 260 }}>
              <Text style={[TextStyles.body.small, { color: colors.foreground }]}>
                {content || 'No content'}
              </Text>
            </ScrollView>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  headerBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  headerSpacer: { width: 40 },
  content: { flex: 1, padding: 16 },
  sectionCard: { padding: 20, marginBottom: 20 },
  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  textArea: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, minHeight: 220, textAlignVertical: 'top' },
  actionsRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  actionBtn: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10, borderWidth: 1 },
});
