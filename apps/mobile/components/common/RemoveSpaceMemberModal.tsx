import React from 'react';
import { StyleSheet, Modal, TouchableOpacity, Image, View as RNView, Alert } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { Text, View, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';

export interface RemoveSpaceMemberModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  member: any | null;
  loading?: boolean;
}

export default function RemoveSpaceMemberModal({
  visible,
  onClose,
  onConfirm,
  member,
  loading = false,
}: RemoveSpaceMemberModalProps) {
  const colors = useThemeColors();

  const handleConfirm = () => {
    if (!member) return;
    
    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${member?.user?.name || member?.name || 'this member'} from the space?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: onConfirm },
      ]
    );
  };

  const handleClose = () => {
    onClose();
  };

  if (!member) return null;

  const displayName = member?.user?.name || member?.name || member?.user?.email || member?.email || 'Member';
  const email = member?.user?.email || member?.email || '';
  const avatarUrl = member?.user?.avatar || member?.avatar || member?.profile?.avatar;
  const letter = String(displayName).charAt(0).toUpperCase();

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={[styles.backdrop, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
        <Card style={[styles.modal, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Header */}
          <View style={styles.header}>
            <FontAwesome name="exclamation-triangle" size={24} color={colors.warning} />
            <Text style={[TextStyles.heading.h3, { color: colors.foreground, marginLeft: 12 }]}>
              Remove Member
            </Text>
          </View>

          {/* Member Info */}
          <View style={styles.memberInfo}>
            <View style={[styles.memberItem, { backgroundColor: colors.background, borderColor: colors.border }]}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.memberAvatar} />
              ) : (
                <View style={[styles.memberAvatar, styles.memberAvatarPlaceholder, { backgroundColor: colors.muted }]}>
                  <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>{letter}</Text>
                </View>
              )}
              <View style={styles.memberDetails}>
                <Text style={[TextStyles.body.medium, { color: colors.foreground }]} numberOfLines={1}>
                  {displayName}
                </Text>
                {!!email && (
                  <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]} numberOfLines={1}>
                    {email}
                  </Text>
                )}
                <Text style={[TextStyles.caption.small, { color: colors.primary }]}>
                  {member.role || 'member'}
                </Text>
              </View>
            </View>
          </View>

          {/* Warning Message */}
          <View style={[styles.warningBox, { backgroundColor: colors.warning + '20', borderColor: colors.warning }]}>
            <FontAwesome name="info-circle" size={16} color={colors.warning} />
            <Text style={[TextStyles.caption.small, { color: colors.warning, marginLeft: 8, flex: 1 }]}>
              This member will lose access to all boards and tasks in this space. This action cannot be undone.
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={handleClose}
              disabled={loading}
              style={[styles.cancelButton, { borderColor: colors.border }]}
            >
              <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleConfirm}
              disabled={loading}
              style={[
                styles.removeButton,
                { 
                  backgroundColor: loading ? colors.muted : colors.destructive,
                  opacity: loading ? 0.6 : 1,
                }
              ]}
            >
              <Text style={[TextStyles.body.medium, { color: colors['destructive-foreground'] }]}>
                {loading ? 'Removing...' : 'Remove Member'}
              </Text>
            </TouchableOpacity>
          </View>
        </Card>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  memberInfo: {
    marginBottom: 20,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 12,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  memberAvatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberDetails: {
    flex: 1,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  removeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
});
