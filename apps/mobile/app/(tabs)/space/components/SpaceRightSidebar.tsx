import React, { useMemo, useState, useEffect } from 'react';
import { View as RNView, TouchableOpacity, Image, ScrollView, StyleSheet, Platform, StatusBar } from 'react-native';
import { View, Text, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { useMobileAlert } from '@/components/common/MobileAlertProvider';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export type SpaceRightSidebarProps = {
  space: any;
  availableMembers?: any[]; // workspace members to invite
  spaceMembers?: any[]; // current space members (enriched with proper user IDs)
  ownerIds?: Set<string>; // owner IDs to exclude from candidates
  currentUserId?: string; // current user ID to prevent self-removal
  onInvite?: (memberIds: string[], role?: string) => void; // invite/add to space action
  onAddMember?: (memberId: string, role: string) => void; // add single member to space
  onRemoveMember?: (memberId: string) => void; // remove member from space
  onCleanupInvalidMembers?: () => void; // cleanup invalid members
  onClose?: () => void; // close sidebar
  isVisible?: boolean; // whether sidebar is visible
  width?: number; // sidebar width
  canManageMembers?: boolean; // whether current user can manage members
  loading?: boolean; // loading state
};

export default function SpaceRightSidebar({ 
  space, 
  availableMembers = [], 
  spaceMembers = [],
  ownerIds,
  currentUserId,
  onInvite, 
  onAddMember,
  onRemoveMember,
  onCleanupInvalidMembers,
  onClose, 
  isVisible = true,
  width = 320,
  canManageMembers = false,
  loading = false
}: SpaceRightSidebarProps) {
  const colors = useThemeColors();
  const { showConfirm } = useMobileAlert();
  const topInset = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0;

  // existing space members list (use passed spaceMembers or fallback to space?.members)
  const members: any[] = useMemo(
    () => Array.isArray(spaceMembers) && spaceMembers.length > 0 
      ? spaceMembers.filter(Boolean)
      : (Array.isArray(space?.members) ? space.members.filter(Boolean) : []),
    [spaceMembers, space?.members]
  );


  // derive available workspace member IDs for intersection
  const availableIds = useMemo(
    () => new Set(
      (Array.isArray(availableMembers) ? availableMembers : [])
        .filter(Boolean)
        .map((m: any) => String(m?._id || m?.id || m?.user?._id || m?.user?.id))
    ),
    [availableMembers]
  );

  // use passed ownerIds or derive from space object as fallback
  const computedOwnerIds = useMemo(() => {
    if (ownerIds) return ownerIds;
    
    // fallback: derive owner ids (common shapes: space.owner{id,_id}, space.ownerId, space.createdBy{id,_id})
    const ids: string[] = [];
    const pushId = (val: any) => {
      const s = String(val || '').trim();
      if (s) ids.push(s);
    };
    if (space?.owner) {
      pushId((space.owner as any)?._id || (space.owner as any)?.id);
    }
    if (space?.ownerId) pushId(space.ownerId);
    if (space?.createdBy) {
      pushId((space.createdBy as any)?._id || (space.createdBy as any)?.id || space.createdBy);
    }
    return new Set(ids.filter(Boolean));
  }, [ownerIds, space?.owner, space?.ownerId, space?.createdBy]);

  // Also check if space members have owner role from workspace
  const spaceMemberOwnerIds = useMemo(() => {
    const ids = new Set<string>();
    members.forEach((m: any) => {
      const id = getMemberId(m);
      if (id && String(m?.role || '').toLowerCase() === 'owner') {
        ids.add(id);
      }
    });
    return ids;
  }, [members]);

  // show all space members (owner + any members that are in the space members list)
  const visibleMembers = useMemo(() => {
    const filtered = members.filter((m: any) => {
      const id = getMemberId(m);
      if (!id) return false;
      
      // Include if it's the owner
      const isOwner = computedOwnerIds.has(id) || spaceMemberOwnerIds.has(id);
      if (isOwner) {
        // console.log('✅ SPACE MEMBER (Owner):', id, m?.user?.name || m?.name);
        return true;
      }
      
      // Include if they're in the space members list (regardless of membership record structure)
      // This means they were added to the space somehow
      // console.log('✅ SPACE MEMBER (In Space):', id, m?.user?.name || m?.name, 'membershipId:', m?._id || m?.id || 'none');
      return true;
    });
    
    // Debug logging (commented out for performance)
    // console.log('=== SPACE MEMBERS FINAL ===');
    // console.log('Total space members:', filtered.length);
    // console.log('Space members:', filtered.map(m => ({
    //   id: getMemberId(m) || 'unknown',
    //   name: m?.user?.name || m?.name || 'unknown',
    //   isOwner: computedOwnerIds.has(getMemberId(m) || '') || spaceMemberOwnerIds.has(getMemberId(m) || ''),
    //   hasMembership: !!(m?._id || m?.id)
    // })));
    // console.log('=== END SPACE MEMBERS ===');
    
    return filtered;
  }, [members, computedOwnerIds, spaceMemberOwnerIds]);

  // dedupe by member id so the same person doesn't appear twice
  const visibleMembersUnique = useMemo(() => {
    const seen = new Set<string>();
    const out: any[] = [];
    for (const m of visibleMembers) {
      const id = getMemberId(m);
      if (!id || seen.has(id)) continue;
      seen.add(id);
      out.push(m);
    }
    return out;
  }, [visibleMembers]);

  // invite candidates (exclude already-in-space and owners)
  // Use the same filtering logic as visibleMembers to ensure consistency
  const existingMemberIds = useMemo(() => {
    const ids = new Set<string>();
    visibleMembersUnique.forEach((m: any) => {
      const id = getMemberId(m);
      if (id) ids.add(id);
    });
    return ids;
  }, [visibleMembersUnique]);
  
  const candidates = useMemo(() => {
    const filtered = Array.isArray(availableMembers)
      ? availableMembers
          .filter(Boolean)
          .filter((m: any) => {
            // For available members (workspace members), use user ID for comparison
            const userId = String(m?.user?._id || m?.user?.id || '');
            const isAlreadyInSpace = existingMemberIds.has(userId);
            const isOwner = computedOwnerIds.has(userId);
            
            if (isAlreadyInSpace) {
              // console.log('❌ FILTERED OUT from Available (Already in Space):', userId, m?.user?.name || m?.name);
              return false;
            }
            
            if (isOwner) {
              // console.log('❌ FILTERED OUT from Available (Owner):', userId, m?.user?.name || m?.name);
              return false;
            }
            
            // console.log('✅ AVAILABLE MEMBER:', userId, m?.user?.name || m?.name);
            return true;
          })
      : [];
    
    // Debug logging (commented out for performance)
    // console.log('=== AVAILABLE MEMBERS FINAL ===');
    // console.log('Total available members:', filtered.length);
    // console.log('Available members:', filtered.map(m => ({
    //   id: String(m?.user?._id || m?.user?.id || ''),
    //   name: m?.user?.name || m?.name
    // })));
    // console.log('=== END AVAILABLE MEMBERS ===');
    
    return filtered;
  }, [availableMembers, existingMemberIds, computedOwnerIds]);

  // Local role selection for adding members
  const [addRole, setAddRole] = React.useState<'viewer' | 'editor' | 'admin'>('viewer');

  // Add member handler - adds member to THIS SPECIFIC SPACE only
  const handleAddMember = async (memberId: string, role: string = addRole) => {
    if (!memberId || memberId === 'undefined' || memberId === 'null' || memberId === '') {
      console.error('Invalid memberId for addMember:', memberId);
      return;
    }
    
    if (onAddMember) {
      // This will add the member to the current space only, not all spaces
      await onAddMember(memberId, role);
    }
  };

  const handleRemoveMember = (member: any) => {
    const displayName = member?.user?.name || member?.name || member?.user?.email || member?.email || 'this member';
    showConfirm(
      'Remove Member',
      `Are you sure you want to remove ${displayName} from the space?`,
      () => confirmRemoveMember(member)
    );
  };

  const confirmRemoveMember = async (member: any) => {
    if (member && onRemoveMember) {
      // Use the user ID, not the space membership record ID
      const memberId = String(member?.user?._id || member?.user?.id || '');
      console.log('=== REMOVE MEMBER DEBUG (Sidebar) ===');
      console.log('member object:', member);
      console.log('extracted memberId (user ID):', memberId);
      console.log('space membership record ID:', member?._id || member?.id);
      if (memberId) {
        await onRemoveMember(memberId);
      }
    }
  };

  const Avatar = ({ name, avatar }: { name: string; avatar?: string }) => {
    const letter = String(name || 'U').charAt(0).toUpperCase();
    if (avatar) return <Image source={{ uri: avatar }} style={styles.avatarImg} />;
    return (
      <RNView style={[styles.avatarImg, { backgroundColor: colors.muted, alignItems: 'center', justifyContent: 'center' }]}> 
        <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>{letter}</Text>
      </RNView>
    );
  };

  return (
    <>
      {/* Backdrop */}
      {isVisible && (
        <TouchableOpacity
          style={[styles.backdrop, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}
          activeOpacity={1}
          onPress={onClose}
        />
      )}
      
      {/* Sidebar */}
      {isVisible && (
        <RNView 
          style={[
            styles.container,
            {
              width,
              top: topInset + 8,
              bottom: 0,
            }
          ]}
        >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={[styles.headerIcon, { backgroundColor: colors.primary + '15' }]}>
              <FontAwesome name="users" size={18} color={colors.primary} />
            </View>
            <View>
              <Text style={[TextStyles.heading.h3, { color: colors.foreground }]}>Space Members</Text>
              <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
                {visibleMembersUnique.length} member{visibleMembersUnique.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
          {!!onClose && (
            <TouchableOpacity onPress={onClose} style={[styles.closeButton, { backgroundColor: colors.background }]}>
              <FontAwesome name="times" size={16} color={colors.foreground} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Space Members */}
        <Card style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitle}>
              <View style={[styles.sectionIcon, { backgroundColor: colors.primary + '15' }]}>
                <FontAwesome name="users" size={14} color={colors.primary} />
              </View>
              <Text style={[TextStyles.heading.h4, { color: colors.foreground }]}>
                Current Members
              </Text>
            </View>
            <View style={styles.headerButtons}>
              {canManageMembers && onCleanupInvalidMembers && (
                <TouchableOpacity
                  onPress={onCleanupInvalidMembers}
                  style={[styles.cleanupButton, { backgroundColor: colors.destructive + '15', borderColor: colors.destructive + '30' }]}
                >
                  <FontAwesome name="trash" size={12} color={colors.destructive} />
                  <Text style={[TextStyles.caption.small, { color: colors.destructive, marginLeft: 4, fontWeight: '500' }]}>Cleanup</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          {visibleMembersUnique.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'], textAlign: 'center' }]}>
                No members in this space yet.
              </Text>
              {canManageMembers && (
                <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'], textAlign: 'center', marginTop: 4 }]}>
                  Use the "Available Members" section below to add members.
                </Text>
              )}
            </View>
          ) : (
            <View style={styles.memberList}>
              {visibleMembersUnique.map((m: any, index: number) => {
                const uid = getMemberId(m);
                const reactKey = `member-${uid || index}`;
                const name = m?.name || m?.user?.name || 'User';
                const email = m?.user?.email || m?.email || '';
                const avatar = m?.avatar || m?.profile?.avatar || m?.user?.avatar;
                const isOwner = uid ? (computedOwnerIds.has(uid) || spaceMemberOwnerIds.has(uid)) : false;
                const role = isOwner ? 'owner' : (m?.role || 'member');
                const letter = String(name).charAt(0).toUpperCase();
                
                return (
                  <View key={reactKey} style={[styles.memberItem, { backgroundColor: colors.background, borderColor: colors.border }]}> 
                    {avatar ? (
                      <Image source={{ uri: avatar }} style={styles.avatarImg} />
                    ) : (
                      <View style={[styles.avatarImg, styles.avatarPlaceholder, { backgroundColor: colors.muted }]}>
                        <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>{letter}</Text>
                      </View>
                    )}
                    <View style={styles.memberInfo}>
                      <Text style={[TextStyles.body.medium, { color: colors.foreground }]} numberOfLines={1}>
                        {name} {isOwner && '👑'}
                      </Text>
                      {!!email && (
                        <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]} numberOfLines={1}>{email}</Text>
                      )}
                      <Text style={[TextStyles.caption.small, { color: colors.primary }]}>{role}</Text>
                    </View>
                    {canManageMembers && !isOwner && uid && uid !== currentUserId && (
                      <TouchableOpacity
                        onPress={() => handleRemoveMember(m)}
                        style={[styles.removeButton, { backgroundColor: colors.destructive }]}
                      >
                        <FontAwesome name="user-times" size={12} color={colors['destructive-foreground']} />
                        <Text style={[TextStyles.caption.small, { color: colors['destructive-foreground'], fontWeight: '500' }]}>Remove</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </Card>

        {/* Available Workspace Members */}
        {canManageMembers && (
          <Card style={[styles.section, { backgroundColor: colors.card }]}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitle}>
                <View style={[styles.sectionIcon, { backgroundColor: colors.primary + '15' }]}>
                  <FontAwesome name="user-plus" size={14} color={colors.primary} />
                </View>
                <View>
                  <Text style={[TextStyles.heading.h4, { color: colors.foreground }]}>Available Members</Text>
                  <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
                    {candidates.length} workspace member{candidates.length !== 1 ? 's' : ''} available
                  </Text>
                </View>
              </View>
            </View>
            
            {candidates.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'], textAlign: 'center' }]}>
                  All workspace members are already in this space.
                </Text>
              </View>
            ) : (
              <View style={styles.candidateList}>
                {/* Role selection row */}
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                  {(['viewer','editor','admin'] as const).map(r => (
                    <TouchableOpacity
                      key={r}
                      onPress={() => setAddRole(r)}
                      style={[styles.pill, { borderColor: colors.border, backgroundColor: addRole === r ? colors.primary + '15' : colors.background }]}
                    >
                      <Text style={[TextStyles.caption.small, { color: addRole === r ? colors.primary : colors['muted-foreground'], fontWeight: '600' }]}>
                        {r}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {candidates.slice(0, 5).map((m: any, index: number) => {
                  const memberRecordId = m?._id || m?.id;
                  const userId = String(m?.user?._id || m?.user?.id || ''); // User ID for API call
                  const reactKey = `candidate-${userId || memberRecordId || index}`;
                  const name = m?.name || m?.user?.name || 'User';
                  const email = m?.user?.email || m?.email || '';
                  const avatar = m?.avatar || m?.profile?.avatar || m?.user?.avatar;
                  const letter = String(name).charAt(0).toUpperCase();
                  
                  return (
                    <View key={reactKey} style={[styles.candidateItem, { backgroundColor: colors.background, borderColor: colors.border }]}> 
                      {avatar ? (
                        <Image source={{ uri: avatar }} style={styles.avatarImg} />
                      ) : (
                        <View style={[styles.avatarImg, styles.avatarPlaceholder, { backgroundColor: colors.muted }]}>
                          <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>{letter}</Text>
                        </View>
                      )}
                      <View style={styles.memberInfo}>
                        <Text style={[TextStyles.body.medium, { color: colors.foreground }]} numberOfLines={1}>{name}</Text>
                        {!!email && (
                          <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]} numberOfLines={1}>{email}</Text>
                        )}
                        <Text style={[TextStyles.caption.small, { color: colors.primary }]}>{m.role || 'member'}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleAddMember(userId)}
                        style={[styles.addButton, { backgroundColor: colors.primary }]}
                      >
                        <FontAwesome name="user-plus" size={12} color={colors['primary-foreground']} />
                        <Text style={[TextStyles.caption.small, { color: colors['primary-foreground'], fontWeight: '500' }]}>Add as {addRole}</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
                {candidates.length > 5 && (
                  <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'], textAlign: 'center', marginTop: 8 }]}>
                    +{candidates.length - 5} more members available
                  </Text>
                )}
              </View>
            )}
          </Card>
        )}
      </ScrollView>
        </RNView>
      )}

    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  container: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'transparent',
    height: 'auto',
    zIndex: 1001,
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
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
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
  section: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  memberList: {
    gap: 12,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  memberInfo: {
    flex: 1,
  },
  candidateList: {
    maxHeight: 200,
    gap: 12,
  },
  candidateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviteButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  avatarImg: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  cleanupButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  removeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

function getMemberId(m: any): string | undefined {
  // For space members, prefer user ID over membership record ID
  // For workspace members, use user ID directly
  return String(m?.user?._id || m?.user?.id || m?._id || m?.id);
}

function isOwnerMember(m: any, ownerIds: Set<string>): boolean {
  const id = getMemberId(m);
  return !!(id && ownerIds.has(id));
}
