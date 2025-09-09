import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Switch, View as RNView, Modal } from 'react-native';
import { useRouter } from 'expo-router';

import { View, Text, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { useAppDispatch, useAppSelector } from '@/store';
import { SpaceService } from '@/services/spaceService';
import { setSelectedSpace } from '@/store/slices/workspaceSlice';
import SpaceRightSidebar from '@/components/space/SpaceRightSidebar';

export default function SpaceSettingsScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { selectedSpace } = useAppSelector((s: any) => s.workspace);
  const space = selectedSpace;

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState<boolean>(false);

  useEffect(() => {
    if (space) {
      setName(space.name || '');
      setDescription(space.description || '');
      setIsPrivate(!!(space?.settings?.isPrivate));
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
      const resp = await SpaceService.updateSpace(id, payload);
      const updatedFromUpdate = (resp as any)?.data || (resp as any);

      // Fetch authoritative server state after update to ensure fresh values
      const fresh = await SpaceService.getSpace(id);
      const serverSpace = (fresh as any)?.data || (fresh as any) || updatedFromUpdate;

      if (!serverSpace) {
        // Fallback to merging locally if server didn't return payload
        dispatch(setSelectedSpace({ ...(space as any), ...payload }));
      } else {
        dispatch(setSelectedSpace(serverSpace));
      }

      setIsEditing(false);
      Alert.alert('Saved', 'Space settings have been updated.');
    } catch (e: any) {
      // Provide detailed diagnostics to console and user
      console.log('Save space failed:', e?.response?.status, e?.response?.data || e?.message);
      Alert.alert('Failed to save', e?.response?.data?.message || e?.message || 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!space?._id && !space?.id) return;
    try {
      const id = space._id || space.id;
      await SpaceService.deleteSpace(id);
      Alert.alert('Space deleted', 'The space has been deleted.');
      setShowDeleteConfirm(false);
      // Navigate back to workspace
      router.replace('/workspace');
    } catch (e: any) {
      console.log('Delete space failed:', e?.response?.status, e?.response?.data || e?.message);
      Alert.alert('Failed to delete', e?.message || 'Unknown error');
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
        <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.primary }]} onPress={() => router.back()}>
          <Text style={{ color: colors['primary-foreground'], fontWeight: '600' }}>{'<'}</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>Space Settings</Text>
          <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>Manage your space configuration</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
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
                <TouchableOpacity onPress={handleSave} disabled={saving} style={[styles.primaryBtn, { backgroundColor: colors.primary, opacity: saving ? 0.7 : 1 }]}>
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

        {/* Danger Zone */}
        <Card style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.destructive, borderWidth: 1 }]}> 
          <Text style={[TextStyles.heading.h3, { color: colors.destructive, marginBottom: 10 }]}>Danger Zone</Text>
          <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'], marginBottom: 12 }]}>Once you delete a space, there is no going back. Please be certain.</Text>
          <TouchableOpacity onPress={() => setShowDeleteConfirm(true)} style={[styles.dangerBtn, { backgroundColor: colors.destructive }]}>
            <Text style={{ color: colors['destructive-foreground'], fontWeight: '700' }}>Delete Space</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <Modal animationType="fade" transparent visible={showDeleteConfirm} onRequestClose={() => setShowDeleteConfirm(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
            <Text style={[TextStyles.heading.h3, { color: colors.foreground, marginBottom: 8 }]}>Delete Space</Text>
            <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'], marginBottom: 16 }]}>Are you sure you want to delete "{space.name}"? This action cannot be undone.</Text>
            <RNView style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }}>
              <TouchableOpacity onPress={() => setShowDeleteConfirm(false)} style={[styles.ghostBtn, { borderColor: colors.border }]}>
                <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} style={[styles.dangerBtn, { backgroundColor: colors.destructive }]}>
                <Text style={{ color: colors['destructive-foreground'], fontWeight: '700' }}>Delete Space</Text>
              </TouchableOpacity>
            </RNView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
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
});
