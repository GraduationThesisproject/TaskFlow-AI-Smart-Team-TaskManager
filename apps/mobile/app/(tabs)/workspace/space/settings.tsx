import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Switch, View as RNView, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { View, Text, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { useAppDispatch, useAppSelector } from '@/store';
import { SpaceService } from '@/services/spaceService';
import { setSelectedSpace } from '@/store/slices/workspaceSlice';
import { useAuth } from '@/hooks/useAuth';

export default function SpaceSettingsScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { token } = useAuth();

  const { selectedSpace } = useAppSelector((s: any) => s.workspace);
  const space = selectedSpace;

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveOk, setSaveOk] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  
  // GitHub integration state
  const [githubConnected, setGithubConnected] = useState<boolean>(!!(space as any)?.githubRepo?.fullName);
  const [githubRepository, setGithubRepository] = useState<string>((space as any)?.githubRepo?.fullName || '');
  const [githubBranch, setGithubBranch] = useState<string>((space as any)?.githubRepo?.defaultBranch || 'main');
  const [showGithubModal, setShowGithubModal] = useState<boolean>(false);

  useEffect(() => {
    if (space) {
      setName(space.name || '');
      setDescription(space.description || '');
      setIsPrivate(!!(space?.settings?.isPrivate));
      
      // GitHub integration state
      setGithubConnected(!!(space as any)?.githubRepo?.fullName);
      setGithubRepository((space as any)?.githubRepo?.fullName || '');
      setGithubBranch((space as any)?.githubRepo?.defaultBranch || 'main');
    }
  }, [space]);

  const info = useMemo(() => {
    return {
      id: space?._id || space?.id || 'N/A',
      createdAt: space?.createdAt ? new Date(space.createdAt).toLocaleDateString() : 'N/A',
      updatedAt: space?.updatedAt ? new Date(space.updatedAt).toLocaleDateString() : 'N/A',
      status: space?.isActive ? 'Active' : 'Inactive',
    };
  }, [space]);

  const handleSave = async () => {
    if (!space?._id && !space?.id) return;
    const id = space._id || space.id;

    // Build minimal diff payload to avoid backend validation issues
    const payload: any = {};
    if (name.trim() && name.trim() !== (space.name || '')) payload.name = name.trim();
    if ((description ?? '') !== (space.description || '')) payload.description = (description ?? '').trim();
    const desiredPrivate = !!isPrivate;
    const currentPrivate = !!(space?.settings?.isPrivate);
    if (desiredPrivate !== currentPrivate) payload.settings = { ...(space.settings || {}), isPrivate: desiredPrivate };

    if (Object.keys(payload).length === 0) {
      Alert.alert('No changes', 'There are no changes to save.');
      return;
    }

    try {
      setSaving(true);
      setSaveError(null);
      setSaveOk(false);
      console.log('[SpaceSettings] Submitting payload:', payload);

      // Perform update
      const resp = await SpaceService.updateSpace(id, payload);
      // Normalize possible API response shapes: {data: Space}, Space, or wrapper
      const updatedCandidate: any = (resp as any)?.data ?? resp;

      // Try to fetch fresh entity from server to avoid stale/partial merges
      let nextSelected: any = null;
      try {
        const fresh = await SpaceService.getSpace(id);
        const freshEntity: any = (fresh as any)?.data ?? fresh;
        if (freshEntity && (freshEntity._id || freshEntity.id)) {
          nextSelected = freshEntity;
        }
      } catch (fetchErr) {
        console.log('[SpaceSettings] Fetch after update failed, falling back to merge:', fetchErr);
      }

      // Fallbacks: prefer full entity, otherwise merge only known changed fields
      if (!nextSelected) {
        if (updatedCandidate && (updatedCandidate._id || updatedCandidate.id)) {
          nextSelected = { ...(space as any), ...updatedCandidate };
        } else {
          nextSelected = { ...(space as any), ...payload };
        }
      }

      // Never let required identifiers be lost
      if (!nextSelected._id && space._id) nextSelected._id = space._id;
      if (!nextSelected.id && space.id) nextSelected.id = space.id;

      dispatch(setSelectedSpace(nextSelected));
      setIsEditing(false);
      setSaveOk(true);
      Alert.alert('Saved', 'Space settings have been updated.');
    } catch (e: any) {
      const status = e?.response?.status;
      const data = e?.response?.data;
      console.log('Save space failed:', status, data || e?.message);
      const msg = (typeof data === 'string' ? data : data?.message) || e?.message || 'Unknown error';
      setSaveError(`${status || ''} ${msg}`.trim());
      Alert.alert('Failed to save', msg);
    } finally {
      setSaving(false);
    }
  };

  const handleGithubConnect = async () => {
    if (!githubRepository.trim()) {
      Alert.alert('GitHub Integration', 'Please enter a repository name');
      return;
    }
    
    try {
      // Check if user has GitHub linked
      const response = await fetch('/api/github/status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.linked) {
          // User has GitHub linked, link the repository
          const id = space?._id || space?.id;
          if (!id) return;
          
          const payload = {
            githubRepo: {
              fullName: githubRepository.trim(),
              name: githubRepository.split('/').pop(),
              defaultBranch: githubBranch.trim() || 'main',
              linkedAt: new Date()
            }
          };
          
          await SpaceService.updateSpace(id, payload as any);
          
          setGithubConnected(true);
          setGithubRepository(githubRepository.trim());
          setGithubBranch(githubBranch.trim() || 'main');
          setShowGithubModal(false);
          Alert.alert('Success', 'GitHub repository linked successfully!');
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
                  // Redirect to GitHub App installation for repository
                  const installUrl = `https://github.com/apps/taskflow-ai/installations/new?state=${encodeURIComponent(JSON.stringify({
                    type: 'space',
                    spaceId: space?._id || space?.id,
                    repository: githubRepository.trim()
                  }))}&redirect_uri=${encodeURIComponent('http://localhost:3001/api/github-app/install/callback')}`;
                  window.open(installUrl, '_blank');
                }
              }
            ]
       
          );
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to link GitHub repository. Please try again.');
    }
  };

  const handleGithubDisconnect = async () => {
    Alert.alert(
      'Disconnect GitHub',
      'Are you sure you want to disconnect this space from GitHub? This will remove all GitHub-related settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            try {
              const id = space?._id || space?.id;
              if (!id) return;
              
              const payload = {
                githubRepo: {
                  fullName: '',
                  name: '',
                  defaultBranch: '',
                  linkedAt: null
                }
              };
              
              await SpaceService.updateSpace(id, payload as any);
              setGithubConnected(false);
              setGithubRepository('');
              setGithubBranch('main');
              Alert.alert('Success', 'GitHub repository disconnected successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to disconnect GitHub repository.');
            }
          }
        }
      ]
    );
  };

  const handleDelete = async () => {
    if (!space?._id && !space?.id) return;
    try {
      const id = space._id || space.id;
      await SpaceService.deleteSpace(id);
      Alert.alert('Space permanently deleted', 'The space has been permanently deleted.');
      setShowDeleteConfirm(false);
      // Navigate back to workspace
      router.replace('/workspace');
    } catch (e: any) {
      const status = e?.response?.status;
      const serverMsg = e?.response?.data?.message || e?.response?.data?.error;
      console.log('Delete space failed:', status, e?.response?.data || e?.message);
      // If backend requires archiving first, offer to archive automatically and retry
      if (status === 400 && (serverMsg || '').toLowerCase().includes('archived')) {
        const id = space._id || space.id;
        Alert.alert(
          'Archive Required',
          'This space must be archived before permanent deletion. Archive now and proceed to delete?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Archive & Delete',
              style: 'destructive',
              onPress: async () => {
                try {
                  await SpaceService.archiveSpace(id);
                  await SpaceService.deleteSpace(id);
                  Alert.alert('Space permanently deleted', 'The space has been permanently deleted.');
                  setShowDeleteConfirm(false);
                  router.replace('/workspace');
                } catch (err: any) {
                  const m = err?.response?.data?.message || err?.message || 'Unknown error';
                  Alert.alert('Failed to permanently delete', m);
                }
              }
            }
          ]
        );
        return;
      }
      Alert.alert('Failed to permanently delete', serverMsg || e?.message || 'Unknown error');
    }
  };

  if (!space) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>Space Settings</Text>
        </View>
        <View style={styles.centerBox}>
          <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'] }]}>No space selected.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={{ color: colors.primary, fontWeight: '600' }}>{'<'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerCenter}>
          <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>Space Settings</Text>
          <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>Manage your space configuration</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        {!!saveError && (
          <Card style={[styles.sectionCard, { backgroundColor: colors.destructive + '22' }]}>
            <Text style={[TextStyles.body.small, { color: colors.destructive }]}>Save failed: {saveError}</Text>
          </Card>
        )}
        {saveOk && (
          <Card style={[styles.sectionCard, { backgroundColor: colors.card }]}>
            <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>Saved successfully.</Text>
          </Card>
        )}

        {/* General Settings */}
        <Card style={[styles.sectionCard, { backgroundColor: colors.card }]}>
          <Text style={[TextStyles.heading.h3, { color: colors.foreground, marginBottom: 10 }]}>General Settings</Text>

          {/* Name */}
          <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>Space Name</Text>
          {isEditing ? (
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Space name"
              placeholderTextColor={colors['muted-foreground']}
              style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
            />
          ) : (
            <Text style={[TextStyles.body.medium, { color: colors.foreground, marginTop: 6 }]}>{space.name}</Text>
          )}

          {/* Description */}
          <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'], marginTop: 12 }]}>Description</Text>
          {isEditing ? (
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Description"
              placeholderTextColor={colors['muted-foreground']}
              multiline
              numberOfLines={4}
              style={[styles.textarea, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
            />
          ) : (
            <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'], marginTop: 6 }]}>{space.description || 'No description'}</Text>
          )}

          {/* Private toggle */}
          <RNView style={[styles.rowBetween, { marginTop: 12 }]}> 
            <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>Private</Text>
            {isEditing ? (
              <Switch value={isPrivate} onValueChange={setIsPrivate} trackColor={{ true: colors.primary, false: colors.border }} />
            ) : (
              <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>{isPrivate ? 'Enabled' : 'Disabled'}</Text>
            )}
          </RNView>

          {/* Actions */}
          <RNView style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 }}>
            {isEditing ? (
              <>
                <TouchableOpacity
                  onPress={handleSave}
                  accessibilityRole="button"
                  testID="save-space-settings"
                  disabled={saving}
                  style={[styles.primaryBtn, { backgroundColor: colors.primary, opacity: saving ? 0.7 : 1 }]}
                >
                  <Text style={{ color: colors['primary-foreground'], fontWeight: '600' }}>{saving ? 'Saving…' : 'Save Changes'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setIsEditing(false);
                    setName(space.name || '');
                    setDescription(space.description || '');
                    setIsPrivate(!!(space?.settings?.isPrivate));
                  }}
                  style={[styles.ghostBtn, { borderColor: colors.border }]}
                  disabled={saving}
                >
                  <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity onPress={() => setIsEditing(true)} style={[styles.primaryBtn, { backgroundColor: colors.primary }]}>
                <Text style={{ color: colors['primary-foreground'], fontWeight: '600' }}>Edit Space</Text>
              </TouchableOpacity>
            )}
          </RNView>
        </Card>

        {/* Space Information */}
        <Card style={[styles.sectionCard, { backgroundColor: colors.card }]}>
          <Text style={[TextStyles.heading.h3, { color: colors.foreground, marginBottom: 10 }]}>Space Information</Text>
          <RNView style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>Space ID</Text>
              <Text style={[TextStyles.body.small, { color: colors.foreground }]} selectable>{info.id}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>Created</Text>
              <Text style={[TextStyles.body.small, { color: colors.foreground }]}>{info.createdAt}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>Last Updated</Text>
              <Text style={[TextStyles.body.small, { color: colors.foreground }]}>{info.updatedAt}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>Status</Text>
              <Text style={[TextStyles.body.small, { color: colors.foreground }]}>{info.status}</Text>
            </View>
          </RNView>
        </Card>

        {/* GitHub Integration */}
        <Card style={[styles.sectionCard, { backgroundColor: colors.card }]}>
          <Text style={[TextStyles.heading.h3, { color: colors.foreground, marginBottom: 10 }]}>GitHub Integration</Text>
          
          {githubConnected ? (
            <View style={styles.githubConnected as any}>
              <View style={styles.githubInfo}>
                <FontAwesome name="github" size={24} color={colors.foreground} />
                <View style={styles.githubDetails}>
                  <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>Connected to GitHub</Text>
                  <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
                    Repository: {githubRepository || 'Not specified'}
                  </Text>
                  <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
                    Branch: {githubBranch || 'main'}
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
              <Text style={[TextStyles.body.medium, { color: colors.foreground, marginTop: 8 }]}>Link to GitHub Repository</Text>
              <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'], textAlign: 'center', marginTop: 4 }]}>
                Connect this space to a GitHub repository to sync issues and manage development tasks
              </Text>
              <TouchableOpacity
                style={[styles.connectButton, { backgroundColor: colors.primary }]}
                onPress={() => setShowGithubModal(true)}
              >
                <Text style={[TextStyles.body.small, { color: colors['primary-foreground'] }]}>Link Repository</Text>
              </TouchableOpacity>
            </View>
          )}
        </Card>

        {/* Danger Zone */}
        <Card style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.destructive, borderWidth: 1 }]}> 
          <Text style={[TextStyles.heading.h3, { color: colors.destructive, marginBottom: 10 }]}>Danger Zone</Text>
          <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'], marginBottom: 12 }]}>This will permanently delete the space and its data. This action cannot be undone.</Text>
          <TouchableOpacity onPress={() => setShowDeleteConfirm(true)} style={[styles.dangerBtn, { backgroundColor: colors.destructive }]}>
            <Text style={{ color: colors['destructive-foreground'], fontWeight: '700' }}>Permanently Delete Space</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>

      {/* Permanent Delete Confirmation Modal */}
      <Modal animationType="fade" transparent visible={showDeleteConfirm} onRequestClose={() => setShowDeleteConfirm(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
            <Text style={[TextStyles.heading.h3, { color: colors.foreground, marginBottom: 8 }]}>Permanently Delete Space</Text>
            <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'], marginBottom: 16 }]}>Are you sure you want to permanently delete "{space.name}"? This action cannot be undone.</Text>
            <RNView style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }}>
              <TouchableOpacity onPress={() => setShowDeleteConfirm(false)} style={[styles.ghostBtn, { borderColor: colors.border }]}>
                <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} style={[styles.dangerBtn, { backgroundColor: colors.destructive }]}>
                <Text style={{ color: colors['destructive-foreground'], fontWeight: '700' }}>Permanently Delete</Text>
              </TouchableOpacity>
            </RNView>
          </View>
        </View>
      </Modal>

      {/* GitHub Connection Modal */}
      <Modal
        visible={showGithubModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowGithubModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[TextStyles.heading.h2, { color: colors.foreground, marginBottom: 16 }]}>Link GitHub Repository</Text>
            
            <Text style={[TextStyles.body.small, { color: colors['muted-foreground'], marginBottom: 12 }]}>
              Enter the GitHub repository name and branch to connect this space.
            </Text>
            
            <TextInput
              style={[styles.input, { 
                color: colors.foreground, 
                borderColor: colors.border, 
                backgroundColor: colors.background 
              }]}
              placeholder="Repository Name (e.g., microsoft/vscode)"
              placeholderTextColor={colors['muted-foreground']}
              value={githubRepository}
              onChangeText={setGithubRepository}
            />
            
            <TextInput
              style={[styles.input, { 
                color: colors.foreground, 
                borderColor: colors.border, 
                backgroundColor: colors.background 
              }]}
              placeholder="Branch Name (e.g., main, develop)"
              placeholderTextColor={colors['muted-foreground']}
              value={githubBranch}
              onChangeText={setGithubBranch}
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
                <Text style={[TextStyles.body.small, { color: colors['primary-foreground'] }]}>Link Repository</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  backButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { flex: 1, padding: 16 },
  centerBox: { padding: 24, alignItems: 'center', justifyContent: 'center' },
  sectionCard: { padding: 16, borderRadius: 12, marginBottom: 16 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginTop: 6 },
  textarea: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginTop: 6, textAlignVertical: 'top' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  primaryBtn: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  ghostBtn: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, alignItems: 'center', borderWidth: 1 },
  dangerBtn: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  infoItem: { width: '48%' },
  modalOverlay: { flex: 1, backgroundColor: '#00000088', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modalCard: { width: '100%', maxWidth: 420, borderRadius: 12, borderWidth: 1, padding: 16 },
  
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
