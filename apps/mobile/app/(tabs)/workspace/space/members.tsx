import React, { useEffect, useState } from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';
import { Text, View, Card } from '@/components/Themed';
import { useAppSelector } from '@/store';
import { TextStyles } from '@/constants/Fonts';
import { SpaceService } from '@/services/spaceService';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function SpaceMembers() {
  const { selectedSpace } = useAppSelector((s: any) => s.workspace);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!selectedSpace?._id) return;
      setLoading(true);
      setError(null);
      try {
        const resp = await SpaceService.getSpaceMembers(selectedSpace._id);
        const list = (resp as any)?.data || (Array.isArray(resp) ? resp : []);
        setMembers(list);
      } catch (e: any) {
        setError(e?.response?.data?.message || e?.message || 'Failed to load members');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [selectedSpace?._id]);

  if (!selectedSpace) {
    return (
      <View style={styles.container}>
        <Text style={TextStyles.heading.h1}>Members</Text>
        <Text>No space selected</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={TextStyles.heading.h1}>Members</Text>
      <Text style={[TextStyles.caption.small, { marginBottom: 12 }]}>{selectedSpace.name}</Text>

      {loading && (
        <View style={styles.centerBox}>
          <ActivityIndicator />
          <Text style={[TextStyles.body.small, { marginTop: 8 }]}>Loading members…</Text>
        </View>
      )}

      {!loading && error && (
        <Card style={{ padding: 12 }}>
          <Text style={[TextStyles.body.small]}>Error: {error}</Text>
        </Card>
      )}

      {!loading && !error && (
        <View style={{ gap: 12 }}>
          {Array.isArray(members) && members.length > 0 ? (
            members.map((m: any) => (
              <View key={m._id || m.id} style={styles.memberItem}>
                <FontAwesome name="user" size={18} />
                <View style={{ marginLeft: 8, flex: 1 }}>
                  <Text style={TextStyles.body.medium} numberOfLines={1}>
                    {m.user?.name || m.name || m.email || 'Member'}
                  </Text>
                  {m.role ? (
                    <Text style={TextStyles.caption.small}>{m.role}</Text>
                  ) : null}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.centerBox}>
              <FontAwesome name="users" size={22} />
              <Text style={[TextStyles.body.small, { marginTop: 8 }]}>No members</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  centerBox: { alignItems: 'center', justifyContent: 'center', padding: 16 },
  memberItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth },
});