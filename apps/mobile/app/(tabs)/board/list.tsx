import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { Text, View, Card } from '@/components/Themed';
import { TextStyles } from '@/constants/Fonts';
import { useThemeColors } from '@/components/ThemeProvider';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import { useSpaceManager } from '@/hooks/useSpaceManager';
import { useTasks } from '@/hooks/useTasks';
import { useColumns } from '@/hooks/useColumns';

export default function ListScreen() {
  const colors = useThemeColors();
  const [query, setQuery] = useState('');
  const [sortAsc, setSortAsc] = useState(true);

  const { currentBoard } = useSpaceManager();
  const { tasks, loadTasks } = useTasks();
  const { columns, loadColumnsByBoard } = useColumns();

  const boardId = currentBoard?._id as string | undefined;

  useEffect(() => {
    if (boardId) {
      loadColumnsByBoard(boardId);
      loadTasks(boardId);
    }
  }, [boardId, loadColumnsByBoard, loadTasks]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[TextStyles.heading.h1, { color: colors.foreground }]}>List</Text>
      </View>

      {/* Search + Sort */}
      <View style={{ padding: 16, paddingBottom: 0 }}>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search tasks..."
            placeholderTextColor={colors['muted-foreground']}
            style={[styles.search, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
          />
          <TouchableOpacity
            onPress={() => setSortAsc(s => !s)}
            style={[styles.sortBtn, { borderColor: colors.border }]}
          >
            <FontAwesome name={sortAsc ? 'sort-alpha-asc' : 'sort-alpha-desc'} size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* List */}
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 12 }}>
        <FlatList
          data={useMemo(() => {
            const filtered = tasks.filter(t =>
              (t.title || '').toLowerCase().includes(query.trim().toLowerCase())
            );
            return filtered.sort((a, b) => {
              const A = (a.title || '').toLowerCase();
              const B = (b.title || '').toLowerCase();
              return sortAsc ? A.localeCompare(B) : B.localeCompare(A);
            });
          }, [tasks, query, sortAsc])}
          keyExtractor={(item: any) => item._id}
          ListEmptyComponent={
            <Card style={[styles.sectionCard, { borderColor: colors.border }]}> 
              <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'] }]}>No tasks</Text>
            </Card>
          }
          renderItem={({ item }: any) => {
            const colName = columns.find(c => c._id === item.column)?.name || '—';
            return (
              <TouchableOpacity
                style={[styles.row, { borderColor: colors.border, backgroundColor: colors.card }]}
                onPress={() => router.push(`/board/task/${item._id}`)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[TextStyles.body.medium, { color: colors.foreground }]} numberOfLines={1}>
                    {item.title || 'Untitled Task'}
                  </Text>
                  <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>Column: {colName}</Text>
                </View>
                <FontAwesome name="chevron-right" size={14} color={colors['muted-foreground']} />
              </TouchableOpacity>
            );
          }}
        />
      </View>
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
  search: { flex: 1, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  sortBtn: { padding: 10, borderWidth: 1, borderRadius: 10 },
  row: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionCard: { padding: 20, borderWidth: 1, borderRadius: 12 },
});
