import React, { useEffect, useState } from 'react';
import { StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Text, View, Card } from '@/components/Themed';
import { useAppSelector } from '@/store';
import { TextStyles } from '@/constants/Fonts';
import { SpaceService } from '@/services/spaceService';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function SpaceBoards() {
  const { selectedSpace } = useAppSelector((s: any) => s.workspace);
  const [boards, setBoards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!selectedSpace?._id) return;
      setLoading(true);
      setError(null);
      try {
        const resp = await SpaceService.getSpaceBoards(selectedSpace._id);
        const list = (resp as any)?.data || (Array.isArray(resp) ? resp : []);
        setBoards(list);
      } catch (e: any) {
        setError(e?.response?.data?.message || e?.message || 'Failed to load boards');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [selectedSpace?._id]);

  if (!selectedSpace) {
    return (
      <View style={styles.container}>
        <Text style={TextStyles.heading.h1}>Boards</Text>
        <Text>No space selected</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={TextStyles.heading.h1}>Boards</Text>
      <Text style={[TextStyles.caption.small, { marginBottom: 12 }]}>{selectedSpace.name}</Text>

      {loading && (
        <View style={styles.centerBox}>
          <ActivityIndicator />
          <Text style={[TextStyles.body.small, { marginTop: 8 }]}>Loading boards…</Text>
        </View>
      )}

      {!loading && error && (
        <Card style={{ padding: 12 }}>
          <Text style={[TextStyles.body.small]}>Error: {error}</Text>
        </Card>
      )}

      {!loading && !error && (
        <View style={{ gap: 12 }}>
          {Array.isArray(boards) && boards.length > 0 ? (
            boards.map((b: any) => (
              <TouchableOpacity key={b._id || b.id} style={styles.boardItem}>
                <FontAwesome name="columns" size={18} />
                <View style={{ marginLeft: 8, flex: 1 }}>
                  <Text style={TextStyles.body.medium} numberOfLines={1}>
                    {b.name || 'Board'}
                  </Text>
                  {b.description ? (
                    <Text style={TextStyles.caption.small} numberOfLines={1}>
                      {b.description}
                    </Text>
                  ) : null}
                </View>
                <FontAwesome name="chevron-right" size={14} />
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.centerBox}>
              <FontAwesome name="inbox" size={22} />
              <Text style={[TextStyles.body.small, { marginTop: 8 }]}>No boards</Text>
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
  boardItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth },
});
