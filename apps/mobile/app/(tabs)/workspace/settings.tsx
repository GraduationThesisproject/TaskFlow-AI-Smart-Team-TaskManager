import React, { useState, useMemo, useEffect } from 'react';
import { StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Switch, Modal } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';

import { Text, View, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { useAppDispatch, useAppSelector } from '@/store';
import { updateWorkspaceSettings } from '@/store/slices/workspaceSlice';
import { useAuth } from '@/hooks/useAuth';
import { useAuthToken } from '@/hooks/useLocalStorage';
import { BannerProvider, useBanner } from '@/components/common/BannerProvider';

function WorkspaceSettingsScreenContent() {
  const colors = useThemeColors();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { token } = useAuth();
  const { showSuccess, showError, showWarning, showInfo } = useBanner();

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
  
  // GitHub integration state
  const [githubConnected, setGithubConnected] = useState<boolean>(!!(currentWorkspace as any)?.github?.connected);
  const [githubOrganization, setGithubOrganization] = useState<string>((currentWorkspace as any)?.github?.organization || '');
  const [githubToken, setGithubToken] = useState<string>('');
  const [showGithubModal, setShowGithubModal] = useState<boolean>(false);

  useEffect(() => {
    // Only resync toggle state when switching to a different workspace
    setWsIsPublic(!!(currentWorkspace as any)?.isPublic);
    setWsAllowGuestAccess(!!(currentWorkspace as any)?.settings?.allowGuestAccess);
    setWsRestrictBoardCreation(!!(currentWorkspace as any)?.settings?.restrictBoardCreation);
    setWsRestrictBoardDeletion(!!(currentWorkspace as any)?.settings?.restrictBoardDeletion);
    setWsSlackRestricted(!!(currentWorkspace as any)?.settings?.slackRestricted);
    
    // GitHub integration state
    setGithubConnected(!!(currentWorkspace as any)?.githubOrg?.login);
    setGithubOrganization((currentWorkspace as any)?.githubOrg?.login || '');
  }, [workspaceId]);

  const safeUpdateWorkspace = async (updates: any, revert: () => void, section: 'settings' | 'visibility' | 'general' | 'github' = 'settings') => {
    if (!workspaceId) return;
    try {
      await dispatch(updateWorkspaceSettings({ id: workspaceId, section, updates }) as any).unwrap();
    } catch (e: any) {
      revert();
      showError(`Failed to update workspace settings: ${e?.message || 'Unknown error'}`);
    }
  };

  const handleGithubConnect = async () => {
    try {
      // Check if user already has GitHub linked
      const response = await fetch('/api/github/status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.linked) {
          // User already has GitHub linked, just link the organization
          await safeUpdateWorkspace(
            { 
              githubOrg: { 
                login: githubOrganization.trim(),
                linkedAt: new Date()
              } 
            },
            () => {
              setGithubConnected(false);
              setGithubOrganization('');
            },
            'github'
          );
          
          setGithubConnected(true);
          setGithubOrganization(githubOrganization.trim());
          setShowGithubModal(false);
          Alert.alert('Success', 'GitHub organization linked successfully!');
        } else {
          // User needs to link GitHub account first
          Alert.alert(
            'GitHub Account Required',
            'You need to link your GitHub account first. Would you like to do that now?',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Link GitHub', 
                onPress: () => {
                  // Redirect to GitHub App installation for organization
                  const installUrl = `https://github.com/apps/taskflow-ai/installations/new?state=${encodeURIComponent(JSON.stringify({
                    type: 'workspace',
                    workspaceId: workspaceId,
                    organization: githubOrganization.trim()
                  }))}&redirect_uri=${encodeURIComponent('http://localhost:3001/api/github-app/install/callback')}`;
                  window.open(installUrl, '_blank');
                }
              }
            ]
          );
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to check GitHub status. Please try again.');
    }
  };

  const handleGithubDisconnect = async () => {
    Alert.alert(
      'Disconnect GitHub',
      'Are you sure you want to disconnect GitHub integration? This will remove all GitHub-related settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            await safeUpdateWorkspace(
              { githubOrg: { login: '', linkedAt: null } },
              () => {},
              'github'
            );
            setGithubConnected(false);
            setGithubOrganization('');
            Alert.alert('Success', 'GitHub integration disconnected successfully!');
          }
        }
      ]
    );
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
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.primary }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.primary }]}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <FontAwesome name="chevron-left" size={18} color={colors['primary-foreground']} />
        </TouchableOpacity>
        <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>Workspace Settings</Text>
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
                    safeUpdateWorkspace({ isPublic: val }, () => setWsIsPublic(prev), 'visibility');
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
                    safeUpdateWorkspace({ allowGuestAccess: val }, () => setWsAllowGuestAccess(prev), 'settings');
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
                    safeUpdateWorkspace({ restrictBoardCreation: val }, () => setWsRestrictBoardCreation(prev), 'settings');
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
                    safeUpdateWorkspace({ restrictBoardDeletion: val }, () => setWsRestrictBoardDeletion(prev), 'settings');
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
                    safeUpdateWorkspace({ slackRestricted: val }, () => setWsSlackRestricted(prev), 'settings');
                  }}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.background}
                  disabled={!workspaceId || loading}
                />
              </View>
            </Card>

            {/* GitHub Integration */}
            <Card style={[styles.sectionCard, { backgroundColor: colors.card }]}>
              <Text style={[TextStyles.heading.h2, { color: colors.foreground, marginBottom: 16 }]}>GitHub Integration</Text>
              
              {githubConnected ? (
                <View style={styles.githubConnected}>
                  <View style={styles.githubInfo}>
                    <FontAwesome name="github" size={24} color={colors.foreground} />
                    <View style={styles.githubDetails}>
                      <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>Connected to GitHub</Text>
                      <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
                        Organization: {githubOrganization || 'Not specified'}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[styles.disconnectButton, { backgroundColor: colors.destructive }]}
                    onPress={handleGithubDisconnect}
                  >
                    <Text style={[TextStyles.body.small, { color: colors['destructive-foreground'] }]}>Disconnect</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.githubDisconnected}>
                  <FontAwesome name="github" size={32} color={colors['muted-foreground']} />
                  <Text style={[TextStyles.body.medium, { color: colors.foreground, marginTop: 8 }]}>Connect to GitHub</Text>
                  <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'], textAlign: 'center', marginTop: 4 }]}>
                    Link your workspace to a GitHub organization to sync repositories and manage issues
                  </Text>
                  <TouchableOpacity
                    style={[styles.connectButton, { backgroundColor: colors.primary }]}
                    onPress={() => setShowGithubModal(true)}
                  >
                    <Text style={[TextStyles.body.small, { color: colors['primary-foreground'] }]}>Connect GitHub</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Card>
          </>
        )}
      </ScrollView>

      {/* GitHub Connection Modal */}
      <Modal
        visible={showGithubModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowGithubModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[TextStyles.heading.h2, { color: colors.foreground, marginBottom: 16 }]}>Connect to GitHub</Text>
            
            <Text style={[TextStyles.body.small, { color: colors['muted-foreground'], marginBottom: 12 }]}>
              Enter the GitHub organization name to link to your workspace.
            </Text>
            
            <TextInput
              style={[styles.input, { 
                color: colors.foreground, 
                borderColor: colors.border, 
                backgroundColor: colors.background 
              }]}
              placeholder="GitHub Organization Name (e.g., microsoft, facebook)"
              placeholderTextColor={colors['muted-foreground']}
              value={githubOrganization}
              onChangeText={setGithubOrganization}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.muted }]}
                onPress={() => setShowGithubModal(false)}
              >
                <Text style={[TextStyles.body.small, { color: colors.foreground }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleGithubConnect}
              >
                <Text style={[TextStyles.body.small, { color: colors['primary-foreground'] }]}>Connect</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Wrapper component with BannerProvider
export default function WorkspaceSettingsScreen() {
  return (
    <BannerProvider>
      <WorkspaceSettingsScreenContent />
    </BannerProvider>
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
  
  // GitHub Integration Styles
  githubConnected: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  githubInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  githubDetails: {
    marginLeft: 12,
    flex: 1,
  },
  githubDisconnected: {
    alignItems: 'center',
    padding: 24,
  },
  connectButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 16,
  },
  disconnectButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    padding: 20,
    borderRadius: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
});
