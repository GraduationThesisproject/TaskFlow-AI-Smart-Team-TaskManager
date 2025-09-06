import React, { useState, useMemo, useEffect } from 'react';
import { StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Switch } from 'react-native';
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

  const [wsIsPublic, setWsIsPublic] = useState<boolean>(!!(currentWorkspace as any)?.isPublic);
  const [wsAllowGuestAccess, setWsAllowGuestAccess] = useState<boolean>(!!(currentWorkspace as any)?.settings?.allowGuestAccess);
  const [wsRestrictBoardCreation, setWsRestrictBoardCreation] = useState<boolean>(!!(currentWorkspace as any)?.settings?.restrictBoardCreation);
  const [wsRestrictBoardDeletion, setWsRestrictBoardDeletion] = useState<boolean>(!!(currentWorkspace as any)?.settings?.restrictBoardDeletion);
  const [wsSlackRestricted, setWsSlackRestricted] = useState<boolean>(!!(currentWorkspace as any)?.settings?.slackRestricted);

  useEffect(() => {
    setWsIsPublic(!!(currentWorkspace as any)?.isPublic);
    setWsAllowGuestAccess(!!(currentWorkspace as any)?.settings?.allowGuestAccess);
    setWsRestrictBoardCreation(!!(currentWorkspace as any)?.settings?.restrictBoardCreation);
    setWsRestrictBoardDeletion(!!(currentWorkspace as any)?.settings?.restrictBoardDeletion);
    setWsSlackRestricted(!!(currentWorkspace as any)?.settings?.slackRestricted);
  }, [currentWorkspace]);

  const safeUpdateWorkspace = async (updates: any, revert: () => void) => {
    if (!workspaceId) return;
    try {
      await dispatch(updateWorkspaceSettings({ id: workspaceId, section: 'settings', updates }) as any).unwrap();
    } catch (e: any) {
      revert();
      Alert.alert('Workspace Settings', e?.message || 'Failed to update workspace settings');
    }
  };

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

            {/* Workspace Settings (Visibility, Sharing, Restrictions) */}
            <Card style={styles.sectionCard}>
              <Text style={[TextStyles.heading.h2, { color: colors.foreground, marginBottom: 16 }]}>Workspace Settings</Text>

              {/* Visibility (Public/Private) */}
              <View style={[styles.settingItem, { backgroundColor: colors.card }]}>
                <View style={styles.settingInfo}>
                  <FontAwesome name="globe" size={20} color={colors.primary} />
                  <View style={styles.settingText}>
                    <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>Public Workspace</Text>
                    <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>Make workspace discoverable and joinable via link</Text>
                  </View>
                </View>
                <Switch
                  value={wsIsPublic}
                  onValueChange={(val) => {
                    const prev = wsIsPublic; setWsIsPublic(val);
                    safeUpdateWorkspace({ isPublic: val }, () => setWsIsPublic(prev));
                  }}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.background}
                  disabled={!workspaceId || loading}
                />
              </View>

              {/* Guest Sharing */}
              <View style={[styles.settingItem, { backgroundColor: colors.card }]}>
                <View style={styles.settingInfo}>
                  <FontAwesome name="user-plus" size={20} color={colors.accent} />
                  <View style={styles.settingText}>
                    <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>Allow Guest Sharing</Text>
                    <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>Let non-members access via shared links</Text>
                  </View>
                </View>
                <Switch
                  value={wsAllowGuestAccess}
                  onValueChange={(val) => {
                    const prev = wsAllowGuestAccess; setWsAllowGuestAccess(val);
                    safeUpdateWorkspace({ allowGuestAccess: val }, () => setWsAllowGuestAccess(prev));
                  }}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.background}
                  disabled={!workspaceId || loading}
                />
              </View>

              {/* Board Creation Restriction */}
              <View style={[styles.settingItem, { backgroundColor: colors.card }]}>
                <View style={styles.settingInfo}>
                  <FontAwesome name="columns" size={20} color={colors.primary} />
                  <View style={styles.settingText}>
                    <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>Restrict Board Creation</Text>
                    <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>Only admins can create boards</Text>
                  </View>
                </View>
                <Switch
                  value={wsRestrictBoardCreation}
                  onValueChange={(val) => {
                    const prev = wsRestrictBoardCreation; setWsRestrictBoardCreation(val);
                    safeUpdateWorkspace({ restrictBoardCreation: val }, () => setWsRestrictBoardCreation(prev));
                  }}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.background}
                  disabled={!workspaceId || loading}
                />
              </View>

              {/* Board Deletion Restriction */}
              <View style={[styles.settingItem, { backgroundColor: colors.card }]}>
                <View style={styles.settingInfo}>
                  <FontAwesome name="trash" size={20} color={colors.destructive} />
                  <View style={styles.settingText}>
                    <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>Restrict Board Deletion</Text>
                    <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>Only admins can delete boards</Text>
                  </View>
                </View>
                <Switch
                  value={wsRestrictBoardDeletion}
                  onValueChange={(val) => {
                    const prev = wsRestrictBoardDeletion; setWsRestrictBoardDeletion(val);
                    safeUpdateWorkspace({ restrictBoardDeletion: val }, () => setWsRestrictBoardDeletion(prev));
                  }}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.background}
                  disabled={!workspaceId || loading}
                />
              </View>

              {/* Slack Restrictions */}
              <View style={[styles.settingItem, { backgroundColor: colors.card }]}>
                <View style={styles.settingInfo}>
                  <FontAwesome name="sliders" size={20} color={colors.warning} />
                  <View style={styles.settingText}>
                    <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>Slack Restrictions</Text>
                    <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>Limit Slack actions to approved channels</Text>
                  </View>
                </View>
                <Switch
                  value={wsSlackRestricted}
                  onValueChange={(val) => {
                    const prev = wsSlackRestricted; setWsSlackRestricted(val);
                    safeUpdateWorkspace({ slackRestricted: val }, () => setWsSlackRestricted(prev));
                  }}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.background}
                  disabled={!workspaceId || loading}
                />
              </View>
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
  settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, marginBottom: 12, borderRadius: 12 },
  settingInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  settingText: { marginLeft: 12, flex: 1 },
  fieldGroup: { marginBottom: 16 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  textArea: { minHeight: 90, textAlignVertical: 'top' },
  saveButton: { marginTop: 8, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
});
