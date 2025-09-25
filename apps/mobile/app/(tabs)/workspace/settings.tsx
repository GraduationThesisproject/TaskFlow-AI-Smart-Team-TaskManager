import React, { useState, useMemo, useEffect } from 'react';
import { StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Switch, Modal } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';

import { Text, View, Card } from '@/components/Themed' ;
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { useAppDispatch, useAppSelector } from '@/store';
import { updateWorkspaceSettings } from '@/store/slices/workspaceSlice';
import { useAuth } from '@/hooks/useAuth';
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
    // Initialize state only when the active workspace changes
    if (currentWorkspace) {
      setWsIsPublic(!!(currentWorkspace as any)?.isPublic);
      setWsAllowGuestAccess(!!(currentWorkspace as any)?.settings?.allowGuestAccess);
      setWsRestrictBoardCreation(!!(currentWorkspace as any)?.settings?.restrictBoardCreation);
      setWsRestrictBoardDeletion(!!(currentWorkspace as any)?.settings?.restrictBoardDeletion);
      setWsSlackRestricted(!!(currentWorkspace as any)?.settings?.slackRestricted);

      // GitHub integration state
      setGithubConnected(!!(currentWorkspace as any)?.githubOrg?.login);
      setGithubOrganization((currentWorkspace as any)?.githubOrg?.login || '');
    }
  }, [workspaceId]);

  const safeUpdateWorkspace = async (updates: any, revert: () => void, section: 'settings' | 'visibility' | 'general' | 'github' = 'settings') => {
    if (!workspaceId) return;
    try {
      // If the thunk resolves without throwing, treat it as success, even if it returns undefined
      await dispatch(updateWorkspaceSettings({ id: workspaceId, section, updates }) as any).unwrap();
      showSuccess('Settings updated successfully');
    } catch (e: any) {
      console.error('Failed to update workspace settings:', e);
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
          showSuccess('GitHub organization linked successfully!');
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
      {/* Professional Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.primary }]}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <FontAwesome name="chevron-left" size={18} color={colors['primary-foreground']} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <View style={[styles.headerIcon, { backgroundColor: colors.primary + '15' }]}>
              <FontAwesome name="cog" size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>Workspace Settings</Text>
              <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
                Manage workspace preferences and integrations
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {!currentWorkspace ? (
          <Card style={[styles.emptyCard, { backgroundColor: colors.card }]}>
            <View style={styles.emptyState}>
              <FontAwesome name="exclamation-triangle" size={32} color={colors.warning} />
              <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>No workspace selected</Text>
              <Text style={[TextStyles.body.small, { color: colors['muted-foreground'], textAlign: 'center' }]}>
                Please select a workspace to manage its settings
              </Text>
            </View>
          </Card>
        ) : (
          <>
            {/* General Settings */}
            <Card style={[styles.sectionCard, { backgroundColor: colors.card }]}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <View style={[styles.sectionIcon, { backgroundColor: colors.primary + '15' }]}>
                    <FontAwesome name="info-circle" size={16} color={colors.primary} />
                  </View>
                  <Text style={[TextStyles.heading.h3, { color: colors.foreground }]}>General Information</Text>
                </View>
              </View>
              
              <View style={styles.formContainer}>
                <View style={styles.fieldGroup}>
                  <Text style={[TextStyles.body.medium, { color: colors.foreground, marginBottom: 8, fontWeight: '500' }]}>
                    Workspace Name
                  </Text>
                  <View style={styles.inputContainer}>
                    <FontAwesome name="building" size={16} color={colors['muted-foreground']} />
                    <TextInput
                      value={name}
                      onChangeText={setName}
                      placeholder="Enter workspace name"
                      placeholderTextColor={colors['muted-foreground']}
                      style={[styles.input, { color: colors.foreground, backgroundColor: colors.background }]}
                    />
                  </View>
                </View>
                
                <View style={styles.fieldGroup}>
                  <Text style={[TextStyles.body.medium, { color: colors.foreground, marginBottom: 8, fontWeight: '500' }]}>
                    Description
                  </Text>
                  <View style={styles.inputContainer}>
                    <FontAwesome name="align-left" size={16} color={colors['muted-foreground']} />
                    <TextInput
                      value={description}
                      onChangeText={setDescription}
                      placeholder="Enter workspace description"
                      placeholderTextColor={colors['muted-foreground']}
                      multiline
                      style={[styles.input, styles.textArea, { color: colors.foreground, backgroundColor: colors.background }]}
                    />
                  </View>
                </View>
                
                <TouchableOpacity
                  disabled={!canSave || loading}
                  onPress={onSave}
                  style={[styles.saveButton, { 
                    backgroundColor: (!canSave || loading) ? colors.muted : colors.primary,
                    opacity: (!canSave || loading) ? 0.6 : 1
                  }]}
                >
                  <FontAwesome name="save" size={16} color={(!canSave || loading) ? colors['muted-foreground'] : colors['primary-foreground']} />
                  <Text style={[TextStyles.body.medium, { 
                    color: (!canSave || loading) ? colors['muted-foreground'] : colors['primary-foreground'],
                    marginLeft: 8,
                    fontWeight: '600'
                  }]}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>

            {/* Workspace Settings */}
            <Card style={[styles.sectionCard, { backgroundColor: colors.card }]}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <View style={[styles.sectionIcon, { backgroundColor: colors.accent + '15' }]}>
                    <FontAwesome name="sliders" size={16} color={colors.accent} />
                  </View>
                  <Text style={[TextStyles.heading.h3, { color: colors.foreground }]}>Workspace Settings</Text>
                </View>
              </View>

              <View style={styles.settingsList}>
                {/* Visibility (Public/Private) */}
                <View style={[styles.settingItem, { backgroundColor: colors.background }]}>
                  <View style={styles.settingInfo}>
                    <View style={[styles.settingIcon, { backgroundColor: colors.primary + '15' }]}>
                      <FontAwesome name="globe" size={16} color={colors.primary} />
                    </View>
                    <View style={styles.settingText}>
                      <Text style={[TextStyles.body.medium, { color: colors.foreground, fontWeight: '500' }]}>Public Workspace</Text>
                      <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
                        Make workspace discoverable and joinable via link
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={wsIsPublic}
                    onValueChange={async (val) => {
                      console.log('Toggling isPublic from', wsIsPublic, 'to', val);
                      const prev = wsIsPublic; 
                      setWsIsPublic(val);
                      
                      try {
                        await safeUpdateWorkspace({ isPublic: val }, () => {
                          console.log('Reverting isPublic back to', prev);
                          setWsIsPublic(prev);
                        }, 'visibility');
                      } catch (error) {
                        console.error('Error updating isPublic:', error);
                        setWsIsPublic(prev);
                      }
                    }}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={colors.background}
                    disabled={!workspaceId || loading}
                  />
                </View>

                {/* Guest Sharing */}
                <View style={[styles.settingItem, { backgroundColor: colors.background }]}>
                  <View style={styles.settingInfo}>
                    <View style={[styles.settingIcon, { backgroundColor: colors.accent + '15' }]}>
                      <FontAwesome name="user-plus" size={16} color={colors.accent} />
                    </View>
                    <View style={styles.settingText}>
                      <Text style={[TextStyles.body.medium, { color: colors.foreground, fontWeight: '500' }]}>Allow Guest Sharing</Text>
                      <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
                        Let non-members access via shared links
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={wsAllowGuestAccess}
                    onValueChange={async (val) => {
                      console.log('Toggling allowGuestAccess from', wsAllowGuestAccess, 'to', val);
                      const prev = wsAllowGuestAccess; 
                      setWsAllowGuestAccess(val);
                      
                      try {
                        await safeUpdateWorkspace({ allowGuestAccess: val }, () => {
                          console.log('Reverting allowGuestAccess back to', prev);
                          setWsAllowGuestAccess(prev);
                        }, 'settings');
                      } catch (error) {
                        console.error('Error updating allowGuestAccess:', error);
                        setWsAllowGuestAccess(prev);
                      }
                    }}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={colors.background}
                    disabled={!workspaceId || loading}
                  />
                </View>

                {/* Board Creation Restriction */}
                <View style={[styles.settingItem, { backgroundColor: colors.background }]}>
                  <View style={styles.settingInfo}>
                    <View style={[styles.settingIcon, { backgroundColor: colors.warning + '15' }]}>
                      <FontAwesome name="columns" size={16} color={colors.warning} />
                    </View>
                    <View style={styles.settingText}>
                      <Text style={[TextStyles.body.medium, { color: colors.foreground, fontWeight: '500' }]}>Restrict Board Creation</Text>
                      <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
                        Only admins can create boards
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={wsRestrictBoardCreation}
                    onValueChange={async (val) => {
                      console.log('Toggling restrictBoardCreation from', wsRestrictBoardCreation, 'to', val);
                      const prev = wsRestrictBoardCreation; 
                      setWsRestrictBoardCreation(val);
                      
                      try {
                        await safeUpdateWorkspace({ restrictBoardCreation: val }, () => {
                          console.log('Reverting restrictBoardCreation back to', prev);
                          setWsRestrictBoardCreation(prev);
                        }, 'settings');
                      } catch (error) {
                        console.error('Error updating restrictBoardCreation:', error);
                        setWsRestrictBoardCreation(prev);
                      }
                    }}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={colors.background}
                    disabled={!workspaceId || loading}
                  />
                </View>

                {/* Board Deletion Restriction */}
                <View style={[styles.settingItem, { backgroundColor: colors.background }]}>
                  <View style={styles.settingInfo}>
                    <View style={[styles.settingIcon, { backgroundColor: colors.destructive + '15' }]}>
                      <FontAwesome name="trash" size={16} color={colors.destructive} />
                    </View>
                    <View style={styles.settingText}>
                      <Text style={[TextStyles.body.medium, { color: colors.foreground, fontWeight: '500' }]}>Restrict Board Deletion</Text>
                      <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
                        Only admins can delete boards
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={wsRestrictBoardDeletion}
                    onValueChange={async (val) => {
                      console.log('Toggling restrictBoardDeletion from', wsRestrictBoardDeletion, 'to', val);
                      const prev = wsRestrictBoardDeletion; 
                      setWsRestrictBoardDeletion(val);
                      
                      try {
                        await safeUpdateWorkspace({ restrictBoardDeletion: val }, () => {
                          console.log('Reverting restrictBoardDeletion back to', prev);
                          setWsRestrictBoardDeletion(prev);
                        }, 'settings');
                      } catch (error) {
                        console.error('Error updating restrictBoardDeletion:', error);
                        setWsRestrictBoardDeletion(prev);
                      }
                    }}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={colors.background}
                    disabled={!workspaceId || loading}
                  />
                </View>

                {/* Slack Restrictions */}
                <View style={[styles.settingItem, { backgroundColor: colors.background }]}>
                  <View style={styles.settingInfo}>
                    <View style={[styles.settingIcon, { backgroundColor: colors.warning + '15' }]}>
                      <FontAwesome name="slack" size={16} color={colors.warning} />
                    </View>
                    <View style={styles.settingText}>
                      <Text style={[TextStyles.body.medium, { color: colors.foreground, fontWeight: '500' }]}>Slack Restrictions</Text>
                      <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
                        Limit Slack actions to approved channels
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={wsSlackRestricted}
                    onValueChange={async (val) => {
                      console.log('Toggling slackRestricted from', wsSlackRestricted, 'to', val);
                      const prev = wsSlackRestricted; 
                      setWsSlackRestricted(val);
                      
                      try {
                        await safeUpdateWorkspace({ slackRestricted: val }, () => {
                          console.log('Reverting slackRestricted back to', prev);
                          setWsSlackRestricted(prev);
                        }, 'settings');
                      } catch (error) {
                        console.error('Error updating slackRestricted:', error);
                        setWsSlackRestricted(prev);
                      }
                    }}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={colors.background}
                    disabled={!workspaceId || loading}
                  />
                </View>
              </View>
            </Card>

            {/* GitHub Integration */}
 {/* GitHub Integration (Locked for now) */}
<Card style={[styles.sectionCard, { backgroundColor: colors.card }]}>
  <View style={styles.sectionHeader}>
    <View style={styles.sectionTitleContainer}>
      <View style={[styles.sectionIcon, { backgroundColor: colors.muted + '15' }]}>
        <FontAwesome name="lock" size={16} color={colors['muted-foreground']} />
      </View>
      <Text style={[TextStyles.heading.h3, { color: colors.foreground }]}>GitHub Integration</Text>
    </View>
  </View>

  <View style={styles.githubDisconnected}>
    <View style={[styles.githubIconLarge, { backgroundColor: colors.muted + '15' }]}>
      <FontAwesome name="github" size={32} color={colors['muted-foreground']} />
    </View>
    <Text style={[TextStyles.body.medium, { color: colors.foreground, fontWeight: '500' }]}>
      Coming Soon
    </Text>
    <Text style={[TextStyles.body.small, { color: colors['muted-foreground'], textAlign: 'center' }]}>
      You’ll soon be able to link your workspace to GitHub organizations to sync repositories and manage issues.
    </Text>
    <TouchableOpacity
      disabled
      style={[styles.connectButton, { backgroundColor: colors.border, opacity: 0.5 }]}
    >
      <FontAwesome name="lock" size={16} color={colors['muted-foreground']} />
      <Text style={[TextStyles.body.small, { color: colors['muted-foreground'], marginLeft: 8, fontWeight: '600' }]}>
        Coming Soon
      </Text>
    </TouchableOpacity>
  </View>
</Card>


          </>
        )}
      </ScrollView>

      {/* GitHub Connection Modal */}
      <Modal
        visible={showGithubModal}
        animationType="none"
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
  content: { flex: 1, padding: 20 },
  emptyCard: {
    padding: 32,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  sectionCard: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formContainer: {
    gap: 20,
  },
  fieldGroup: {
    gap: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  settingsList: {
    gap: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingText: {
    flex: 1,
    gap: 4,
  },
  
  // GitHub Integration Styles
  githubConnected: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  githubInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  githubIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  githubDetails: {
    flex: 1,
    gap: 4,
  },
  githubDisconnected: {
    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  githubIconLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  disconnectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
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
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
});
