import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text, View, Card } from '@/components/Themed';
import { TextStyles } from '@/constants/Fonts';
import { useThemeColors } from '@/components/ThemeProvider';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import { useSpaceManager } from '@/hooks/useSpaceManager';
import { useTasks } from '@/hooks/useTasks';
import { useColumns } from '@/hooks/useColumns';

export default function TimelineScreen() {
  const colors = useThemeColors();
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
        <Text style={[TextStyles.heading.h1, { color: colors.foreground }]}>Timeline</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {useMemo(() => {
          const byDate: Record<string, any[]> = {};
          tasks.forEach((t: any) => {
            if (!t.dueDate) return;
            const d = new Date(t.dueDate);
            const key = isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
            if (!key) return;
            if (!byDate[key]) byDate[key] = [];
            byDate[key].push(t);
          });
          const keys = Object.keys(byDate).sort();
          if (keys.length === 0) {
            return (
              <Card style={[styles.sectionCard, { borderColor: colors.border }]}>
                <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'] }]}>No tasks with due dates</Text>
              </Card>
            );
          }
          return keys.map(dateKey => {
            const dayTasks = byDate[dateKey].sort((a: any, b: any) => (a.title || '').localeCompare(b.title || ''));
            const friendly = new Date(dateKey + 'T00:00:00Z').toDateString();
            return (
              <View key={dateKey} style={{ marginBottom: 16 }}>
                <Text style={[TextStyles.heading.h3, { color: colors.foreground, marginBottom: 8 }]}>{friendly}</Text>
                {dayTasks.map((t: any) => {
                  const colName = columns.find(c => c._id === t.column)?.name || '—';
                  return (
                    <TouchableOpacity
                      key={t._id}
                      style={[styles.row, { borderColor: colors.border, backgroundColor: colors.card }]}
                      onPress={() => router.push(`/board/task/${t._id}`)}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[TextStyles.body.medium, { color: colors.foreground }]} numberOfLines={1}>
                          {t.title || 'Untitled Task'}
                        </Text>
                        <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>Column: {colName}</Text>
                      </View>
                      <FontAwesome name="chevron-right" size={14} color={colors['muted-foreground']} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            );
          });
        }, [tasks, columns, colors])}
      </ScrollView>
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
  sectionCard: { padding: 16, borderWidth: 1, borderRadius: 12 },
  row: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});
