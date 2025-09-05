import React, { useState, useMemo } from 'react';
import { StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';

import { Text, View, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { useAppDispatch, useAppSelector } from '@/store';
import { updateWorkspaceSettings } from '@/store/slices/workspaceSlice';

export default function WorkspaceSettingsScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { currentWorkspace, loading } = useAppSelector((state: any) => state.workspace);
  const workspaceId = (currentWorkspace as any)?._id || (currentWorkspace as any)?.id;

  const [name, setName] = useState<string>((currentWorkspace as any)?.name || '');
  const [description, setDescription] = useState<string>((currentWorkspace as any)?.description || '');

  const canSave = useMemo(() => !!workspaceId && (name?.trim() !== (currentWorkspace as any)?.name || (description || '').trim() !== ((currentWorkspace as any)?.description || '')), [workspaceId, name, description, currentWorkspace]);

  const onSave = async () => {
    if (!workspaceId) return;
    try {
      await dispatch(updateWorkspaceSettings({ id: workspaceId, section: 'general', updates: { name, description } }) as any).unwrap();
      Alert.alert('Workspace', 'Settings saved successfully');
    } catch (e: any) {
      Alert.alert('Workspace', e?.message || 'Failed to save settings');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.primary }]} onPress={() => router.back()}>
          <FontAwesome name="chevron-left" size={18} color={colors['primary-foreground']} />
        </TouchableOpacity>
        <Text style={[TextStyles.heading.h1, { color: colors.foreground }]}>Workspace Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content}>
        {!currentWorkspace ? (
          <Card style={styles.sectionCard}>
            <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'] }]}>No workspace selected</Text>
          </Card>
        ) : (
          <>
            <Card style={styles.sectionCard}>
              <Text style={[TextStyles.heading.h2, { color: colors.foreground, marginBottom: 12 }]}>General</Text>
              <View style={styles.fieldGroup}>
                <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'], marginBottom: 6 }]}>Name</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Workspace name"
                  placeholderTextColor={colors['muted-foreground']}
                  style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
                />
              </View>
              <View style={styles.fieldGroup}>
                <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'], marginBottom: 6 }]}>Description</Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Workspace description"
                  placeholderTextColor={colors['muted-foreground']}
                  multiline
                  style={[styles.input, styles.textArea, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
                />
              </View>
              <TouchableOpacity
                disabled={!canSave || loading}
                onPress={onSave}
                style={[styles.saveButton, { backgroundColor: (!canSave || loading) ? colors.border : colors.primary }]}
              >
                <Text style={[TextStyles.body.medium, { color: (!canSave || loading) ? colors['muted-foreground'] : colors['primary-foreground'] }]}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Text>
              </TouchableOpacity>
            </Card>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  backButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  headerSpacer: { width: 40 },
  content: { flex: 1, padding: 16 },
  sectionCard: { padding: 20, marginBottom: 20 },
  fieldGroup: { marginBottom: 16 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  textArea: { minHeight: 90, textAlignVertical: 'top' },
  saveButton: { marginTop: 8, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
});
