import React, { useMemo, useState } from 'react';
import { View as RNView, TouchableOpacity, Image, TextInput, ScrollView, StyleSheet } from 'react-native';
import { View, Text, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';

export type SpaceRightSidebarProps = {
  space: any;
  availableMembers?: any[]; // workspace members to invite
  onInvite?: (memberIds: string[]) => void; // invite/add to space action
  onMembersClose?: () => void; // optional: close drawer on phones
};

export default function SpaceRightSidebar({ space, availableMembers = [], onInvite, onMembersClose }: SpaceRightSidebarProps) {
  const colors = useThemeColors();

  // existing space members list (compact)
  const members: any[] = useMemo(
    () => (Array.isArray(space?.members) ? space.members.filter(Boolean) : []),
    [space?.members]
  );

  // invite candidates (exclude already-in-space)
  const existingIds = useMemo(() => new Set(members.map((m: any) => String(m?._id || m?.id || m?.user?._id || m?.user?.id))), [members]);
  const candidates = useMemo(
    () => (Array.isArray(availableMembers) ? availableMembers.filter(Boolean).filter((m: any) => !existingIds.has(String(m?._id || m?.id || m?.user?._id || m?.user?.id))) : []),
    [availableMembers, existingIds]
  );

  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return candidates;
    return candidates.filter((m: any) => (m?.name || m?.user?.name || '').toLowerCase().includes(q));
  }, [candidates, query]);

  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  const handleInvite = () => {
    const ids = Object.keys(selected).filter((k) => selected[k]);
    onInvite?.(ids);
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
    <View style={{ width: 300 }}>
      {/* Space Members (compact list) */}
      <Card style={{ padding: 16, borderRadius: 12, backgroundColor: colors.card, marginBottom: 12 }}>
        <RNView style={styles.rowBetween}>
          <Text style={[TextStyles.heading.h3, { color: colors.foreground }]}>Space Members</Text>
          {!!onMembersClose && (
            <TouchableOpacity onPress={onMembersClose}>
              <Text style={[TextStyles.body.small, { color: colors.primary }]}>Close</Text>
            </TouchableOpacity>
          )}
        </RNView>
        <ScrollView style={{ maxHeight: 160 }}>
          <RNView style={{ gap: 8, marginTop: 10 }}>
            {members.length === 0 ? (
              <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>No members yet.</Text>
            ) : (
              members.map((m: any) => {
                const id = String(m?._id || m?.id || m?.user?._id || m?.user?.id || Math.random());
                const name = m?.name || m?.user?.name || 'User';
                const avatar = m?.avatar || m?.profile?.avatar || m?.user?.avatar;
                const role = m?.role || '';
                return (
                  <RNView key={id} style={[styles.memberRow]}> 
                    <Avatar name={name} avatar={avatar} />
                    <RNView style={{ flex: 1 }}>
                      <Text style={[TextStyles.caption.small, { color: colors.foreground }]} numberOfLines={1}>{name}</Text>
                      {!!role && (
                        <Text style={[TextStyles.caption.tiny, { color: colors['muted-foreground'] }]} numberOfLines={1}>{role}</Text>
                      )}
                    </RNView>
                  </RNView>
                );
              })
            )}
          </RNView>
        </ScrollView>
      </Card>

      {/* Invite Workspace Members */}
      <Card style={{ padding: 16, borderRadius: 12, backgroundColor: colors.card }}>
        <Text style={[TextStyles.heading.h3, { color: colors.foreground, marginBottom: 6 }]}>Invite from Workspace</Text>
        <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'], marginBottom: 10 }]}>Search and add workspace members to this space.</Text>

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search members..."
          placeholderTextColor={colors['muted-foreground']}
          style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
        />

        <ScrollView style={{ maxHeight: 200 }}>
          <RNView style={{ gap: 8, marginTop: 10 }}>
            {filtered.map((m: any) => {
              const id = String(m?._id || m?.id || m?.user?._id || m?.user?.id || Math.random());
              const name = m?.name || m?.user?.name || 'User';
              const avatar = m?.avatar || m?.profile?.avatar || m?.user?.avatar;
              const checked = !!selected[id];
              return (
                <TouchableOpacity key={id} onPress={() => toggle(id)} style={[styles.inviteRow, { borderColor: colors.border }]}> 
                  <Avatar name={name} avatar={avatar} />
                  <Text style={[TextStyles.caption.small, { color: colors.foreground, flex: 1 }]} numberOfLines={1}>{name}</Text>
                  <Text style={[TextStyles.caption.small, { color: checked ? colors.primary : colors['muted-foreground'] }]}>{checked ? '✓' : '+'}</Text>
                </TouchableOpacity>
              );
            })}
            {filtered.length === 0 && (
              <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>No results</Text>
            )}
          </RNView>
        </ScrollView>

        <TouchableOpacity onPress={handleInvite} style={[styles.primaryBtn, { backgroundColor: colors.primary, marginTop: 12 }]}> 
          <Text style={{ color: colors['primary-foreground'], fontWeight: '600' }}>Add Selected</Text>
        </TouchableOpacity>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  inviteRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  avatarImg: { width: 28, height: 28, borderRadius: 14 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  primaryBtn: { paddingHorizontal: 14, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
});
