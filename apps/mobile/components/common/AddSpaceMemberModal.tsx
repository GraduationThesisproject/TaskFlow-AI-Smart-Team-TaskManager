import React, { useState, useMemo } from 'react';
import { StyleSheet, Modal, TouchableOpacity, ScrollView, Image, View as RNView, TextInput, Alert } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { Text, View, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';

export interface AddSpaceMemberModalProps {
  visible: boolean;
  onClose: () => void;
  onAddMember: (memberId: string, role: string) => void;
  availableMembers: any[];
  spaceMembers: any[];
  loading?: boolean;
}

export default function AddSpaceMemberModal({
  visible,
  onClose,
  onAddMember,
  availableMembers,
  spaceMembers,
  loading = false,
}: AddSpaceMemberModalProps) {
  const colors = useThemeColors();
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<'member' | 'admin' | 'contributor' | 'viewer'>('member');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter available members (exclude already added ones)
  const filteredMembers = useMemo(() => {
    const addedMemberIds = new Set(
      spaceMembers.map(m => String(m?.user?._id || m?.user?.id || m?._id || m?.id || ''))
    );
    
    let filtered = availableMembers.filter(member => {
      const memberId = String(member?.user?._id || member?.user?.id || member?._id || member?.id || '');
      return memberId && !addedMemberIds.has(memberId);
    });

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(member => {
        const name = (member?.user?.name || member?.name || '').toLowerCase();
        const email = (member?.user?.email || member?.email || '').toLowerCase();
        return name.includes(query) || email.includes(query);
      });
    }

    return filtered;
  }, [availableMembers, spaceMembers, searchQuery]);

  const handleAddMember = () => {
    if (!selectedMemberId) {
      Alert.alert('Error', 'Please select a member to add');
      return;
    }

    onAddMember(selectedMemberId, selectedRole);
    setSelectedMemberId('');
    setSelectedRole('member');
    setSearchQuery('');
  };

  const handleClose = () => {
    setSelectedMemberId('');
    setSelectedRole('member');
    setSearchQuery('');
    onClose();
  };

  const roles = [
    { value: 'viewer', label: 'Viewer', description: 'Can view boards and tasks' },
    { value: 'member', label: 'Member', description: 'Can view and edit boards' },
    { value: 'contributor', label: 'Contributor', description: 'Can create and manage boards' },
    { value: 'admin', label: 'Admin', description: 'Can manage space settings and members' },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <FontAwesome name="times" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>Add Member</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView style={styles.content}>
          {/* Search */}
          <Card style={[styles.searchCard, { backgroundColor: colors.card }]}>
            <Text style={[TextStyles.body.medium, { color: colors.foreground, marginBottom: 8 }]}>Search Members</Text>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by name or email..."
              placeholderTextColor={colors['muted-foreground']}
              style={[styles.searchInput, { 
                color: colors.foreground, 
                borderColor: colors.border, 
                backgroundColor: colors.background 
              }]}
            />
          </Card>

          {/* Available Members */}
          <Card style={[styles.membersCard, { backgroundColor: colors.card }]}>
            <Text style={[TextStyles.body.medium, { color: colors.foreground, marginBottom: 12 }]}>
              Available Members ({filteredMembers.length})
            </Text>
            
            {filteredMembers.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: colors.background }]}>
                <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'], textAlign: 'center' }]}>
                  {searchQuery ? 'No members found matching your search' : 'No available members to add'}
                </Text>
              </View>
            ) : (
              <RNView style={styles.membersList}>
                {filteredMembers.map((member) => {
                  const memberId = String(member?.user?._id || member?.user?.id || member?._id || member?.id || '');
                  const displayName = member?.user?.name || member?.name || member?.user?.email || member?.email || 'Member';
                  const email = member?.user?.email || member?.email || '';
                  const avatarUrl = member?.user?.avatar || member?.avatar || member?.profile?.avatar;
                  const letter = String(displayName).charAt(0).toUpperCase();
                  const isSelected = selectedMemberId === memberId;

                  return (
                    <TouchableOpacity
                      key={memberId}
                      onPress={() => setSelectedMemberId(memberId)}
                      style={[
                        styles.memberItem,
                        { 
                          backgroundColor: isSelected ? colors.primary + '20' : colors.background,
                          borderColor: isSelected ? colors.primary : colors.border,
                        }
                      ]}
                    >
                      {avatarUrl ? (
                        <Image source={{ uri: avatarUrl }} style={styles.memberAvatar} />
                      ) : (
                        <View style={[styles.memberAvatar, styles.memberAvatarPlaceholder, { backgroundColor: colors.muted }]}>
                          <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>{letter}</Text>
                        </View>
                      )}
                      <View style={styles.memberInfo}>
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
                      {isSelected && (
                        <FontAwesome name="check-circle" size={20} color={colors.primary} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </RNView>
            )}
          </Card>

          {/* Role Selection */}
          {selectedMemberId && (
            <Card style={[styles.roleCard, { backgroundColor: colors.card }]}>
              <Text style={[TextStyles.body.medium, { color: colors.foreground, marginBottom: 12 }]}>
                Select Role
              </Text>
              <RNView style={styles.rolesList}>
                {roles.map((role) => (
                  <TouchableOpacity
                    key={role.value}
                    onPress={() => setSelectedRole(role.value as any)}
                    style={[
                      styles.roleItem,
                      {
                        backgroundColor: selectedRole === role.value ? colors.primary + '20' : colors.background,
                        borderColor: selectedRole === role.value ? colors.primary : colors.border,
                      }
                    ]}
                  >
                    <View style={styles.roleInfo}>
                      <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>
                        {role.label}
                      </Text>
                      <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
                        {role.description}
                      </Text>
                    </View>
                    {selectedRole === role.value && (
                      <FontAwesome name="check-circle" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </RNView>
            </Card>
          )}
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <TouchableOpacity
            onPress={handleClose}
            style={[styles.cancelButton, { borderColor: colors.border }]}
          >
            <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleAddMember}
            disabled={!selectedMemberId || loading}
            style={[
              styles.addButton,
              { 
                backgroundColor: selectedMemberId && !loading ? colors.primary : colors.muted,
                opacity: selectedMemberId && !loading ? 1 : 0.6,
              }
            ]}
          >
            <Text style={[TextStyles.body.medium, { color: colors['primary-foreground'] }]}>
              {loading ? 'Adding...' : 'Add Member'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 8,
  },
  headerRight: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  searchCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  membersCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  membersList: {
    gap: 8,
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
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  memberAvatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberInfo: {
    flex: 1,
  },
  emptyState: {
    padding: 24,
    borderRadius: 10,
    alignItems: 'center',
  },
  roleCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  rolesList: {
    gap: 8,
  },
  roleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 12,
  },
  roleInfo: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  addButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
});
