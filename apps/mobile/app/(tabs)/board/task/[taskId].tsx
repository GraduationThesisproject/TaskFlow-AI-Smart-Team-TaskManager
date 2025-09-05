import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { Text, View, Card } from '@/components/Themed';
import { TextStyles } from '@/constants/Fonts';
import { useThemeColors } from '@/components/ThemeProvider';
import { useLocalSearchParams, router } from 'expo-router';
import { useTasks } from '@/hooks/useTasks';
import { useColumns } from '@/hooks/useColumns';
import { useSpaceManager } from '@/hooks/useSpaceManager';

export default function TaskByIdScreen() {
  const colors = useThemeColors();
  const { taskId } = useLocalSearchParams<{ taskId: string }>();

  const { currentBoard } = useSpaceManager();
  const {
    tasks,
    currentTask,
    loadTasks,
    loadTaskById,
    editTask,
    removeTask,
  } = useTasks();
  const { columns, loadColumnsByBoard } = useColumns();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [columnId, setColumnId] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const boardId = currentBoard?._id as string | undefined;

  useEffect(() => {
    if (boardId) {
      loadColumnsByBoard(boardId);
      loadTasks(boardId);
    }
  }, [boardId, loadColumnsByBoard, loadTasks]);

  useEffect(() => {
    if (taskId) {
      // Attempt to set currentTask from existing list
      loadTaskById(taskId as string);
    }
  }, [taskId, tasks, loadTaskById]);

  const task = useMemo(() => {
    return tasks.find(t => (t as any)._id === taskId) || currentTask || null;
  }, [tasks, currentTask, taskId]);

  useEffect(() => {
    if (task) {
      setTitle((task as any).title || '');
      setDescription((task as any).description || '');
      setColumnId((task as any).column);
    }
  }, [task]);

  const handleSave = async () => {
    if (!taskId) return;
    setSaving(true);
    try {
      await editTask(taskId as string, {
        title,
        description,
        column: columnId,
      } as any);
      router.back();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!taskId) return;
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          setDeleting(true);
          try {
            await removeTask(taskId as string);
            router.back();
          } catch (e) {
            console.error(e);
          } finally {
            setDeleting(false);
          }
        }
      }
    ]);
  };

  const ColumnOption = ({ id, name, selected, onSelect }: { id: string; name: string; selected: boolean; onSelect: () => void }) => (
    <TouchableOpacity onPress={onSelect} style={[styles.pill, { borderColor: selected ? colors.primary : colors.border, backgroundColor: selected ? colors.primary + '22' : colors.background }]}>
      <Text style={[TextStyles.caption.small, { color: selected ? colors.primary : colors['muted-foreground'] }]}>{name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[TextStyles.heading.h1, { color: colors.foreground }]} numberOfLines={1}>Task Details</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {!task ? (
          <Card style={[styles.sectionCard, { borderColor: colors.border }]}> 
            <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'] }]}>Loading task...</Text>
          </Card>
        ) : (
          <>
            <Card style={[styles.sectionCard, { borderColor: colors.border }]}> 
              <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>Title</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Task title"
                placeholderTextColor={colors['muted-foreground']}
                style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
              />

              <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'], marginTop: 12 }]}>Description</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Add a detailed description..."
                placeholderTextColor={colors['muted-foreground']}
                multiline
                numberOfLines={6}
                style={[styles.textarea, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
              />
            </Card>

            <Card style={[styles.sectionCard, { borderColor: colors.border }]}> 
              <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'], marginBottom: 8 }]}>Column</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 4 }}>
                {columns.map(c => (
                  <ColumnOption key={c._id} id={c._id} name={c.name} selected={columnId === c._id} onSelect={() => setColumnId(c._id)} />
                ))}
              </ScrollView>
            </Card>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.primary }]} onPress={handleSave} disabled={saving}>
                <Text style={[TextStyles.body.medium, { color: colors['primary-foreground'] }]}>{saving ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.secondaryBtn, { borderColor: colors.border }]} onPress={() => router.back()}>
                <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.dangerBtn, { backgroundColor: colors.destructive || '#ef4444' }]} onPress={handleDelete} disabled={deleting}>
                <Text style={[TextStyles.body.medium, { color: '#fff' }]}>{deleting ? 'Deleting...' : 'Delete'}</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
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
  sectionCard: { padding: 16, marginBottom: 16, borderWidth: 1, borderRadius: 12 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginTop: 6 },
  textarea: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginTop: 6, textAlignVertical: 'top' },
  primaryBtn: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10 },
  secondaryBtn: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, borderWidth: 1 },
  dangerBtn: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10 },
  pill: { borderWidth: 1, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, marginRight: 8 },
});
