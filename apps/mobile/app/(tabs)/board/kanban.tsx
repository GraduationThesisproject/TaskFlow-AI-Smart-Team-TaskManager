import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, Animated, PanResponder, View as RNView, LayoutChangeEvent } from 'react-native';
import { Text, View, Card } from '@/components/Themed';
import { TextStyles } from '@/constants/Fonts';
import { useThemeColors } from '@/components/ThemeProvider';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import { useSpaceManager } from '@/hooks/useSpaceManager';
import { useTasks } from '@/hooks/useTasks';
import { useColumns } from '@/hooks/useColumns';

export default function KanbanScreen() {
  const colors = useThemeColors();
  const {
    currentBoard,
    boards,
    currentSpace,
    loadBoardsBySpace,
    selectBoard,
    loadBoard,
  } = useSpaceManager();
  const { tasks, loadTasks, moveTask } = useTasks();
  const { columns, loadColumnsByBoard } = useColumns();
  const boardId = currentBoard?._id as string | undefined;

  // If no current board is selected, attempt to load boards for the current space and pick one
  useEffect(() => {
    if (!boardId && currentSpace?._id) {
      // Ensure boards for the space are loaded
      if (!boards || boards.length === 0) {
        loadBoardsBySpace(currentSpace._id);
      } else {
        // Prefer first active board
        const active = boards.filter(b => b.space === currentSpace._id && b.isActive && !b.archived);
        const fallback = boards.filter(b => b.space === currentSpace._id);
        const first = (active[0] || fallback[0]) as any;
        if (first && first._id) {
          selectBoard(first);
          loadBoard(first._id);
        }
      }
    }
  }, [boardId, boards, currentSpace, loadBoardsBySpace, selectBoard, loadBoard]);

  // Load board columns and tasks
  useEffect(() => {
    if (boardId) {
      loadColumnsByBoard(boardId);
      loadTasks(boardId);
    }
  }, [boardId, loadColumnsByBoard, loadTasks]);

  // --- Drag & Drop state ---
  const [draggingTask, setDraggingTask] = useState<any | null>(null);
  const [draggingFromColumn, setDraggingFromColumn] = useState<string | null>(null);
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const dragOffset = useRef({ x: 0, y: 0 });

  // Column measurement to detect drop targets
  const columnRefs = useRef<Record<string, any>>({});
  const [columnLayouts, setColumnLayouts] = useState<Record<string, { x: number; y: number; width: number; height: number }>>({});

  const measureColumn = (columnId: string) => {
    const ref = columnRefs.current[columnId];
    if (!ref || !ref.measureInWindow) return;
    ref.measureInWindow((x: number, y: number, width: number, height: number) => {
      setColumnLayouts(prev => ({ ...prev, [columnId]: { x, y, width, height } }));
    });
  };

  const onColumnLayout = (columnId: string) => (_e: LayoutChangeEvent) => {
    // Defer measure to allow layout to settle
    requestAnimationFrame(() => measureColumn(columnId));
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !!draggingTask,
      onMoveShouldSetPanResponder: () => !!draggingTask,
      onPanResponderGrant: (_evt, gestureState) => {
        // Anchor ghost near finger
        dragOffset.current = { x: gestureState.x0 - 80, y: gestureState.y0 - 30 };
        pan.setOffset(dragOffset.current);
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: (evt, gestureState) => {
        pan.flattenOffset();
        const { moveX, moveY } = gestureState;
        // Find target column by absolute coordinates
        const target = Object.entries(columnLayouts).find(([_id, rect]) =>
          moveX >= rect.x && moveX <= rect.x + rect.width && moveY >= rect.y && moveY <= rect.y + rect.height
        );
        const targetColumnId = target ? target[0] : null;

        if (draggingTask && targetColumnId && targetColumnId !== draggingFromColumn) {
          // Append to end of target column
          const targetTasksCount = tasks.filter((t: any) => t.column === targetColumnId).length;
          moveTask({ id: draggingTask._id, moveData: { columnId: targetColumnId, position: targetTasksCount } } as any);
        }

        // Reset drag state
        setDraggingTask(null);
        setDraggingFromColumn(null);
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderTerminate: () => {
        setDraggingTask(null);
        setDraggingFromColumn(null);
        pan.setValue({ x: 0, y: 0 });
      },
    })
  ).current;

  const startDrag = (task: any, columnId: string) => {
    setDraggingTask(task);
    setDraggingFromColumn(columnId);
    // Ensure latest column measurements
    requestAnimationFrame(() => {
      columns.forEach((col: any) => measureColumn(col._id));
    });
  };

  // Empty state if no board is selected/available yet
  if (!boardId) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]} > 
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]} > 
          <Text style={[TextStyles.heading.h1, { color: colors.foreground }]}>Kanban</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Text style={[TextStyles.body.large, { color: colors['muted-foreground'], textAlign: 'center', marginBottom: 8 }]}>No board selected</Text>
          <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'], textAlign: 'center' }]}>We’ll load your space boards automatically. If nothing appears, go back and choose a board.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}
      {...panResponder.panHandlers}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[TextStyles.heading.h1, { color: colors.foreground }]}>Kanban</Text>
      </View>

      {/* Columns */}
      <ScrollView horizontal contentContainerStyle={{ padding: 16, gap: 12 }} showsHorizontalScrollIndicator={false}>
        {columns.map((col: any) => {
          const colTasks = tasks.filter((t: any) => t.column === col._id);
          return (
            <RNView
              key={col._id}
              ref={(el: any) => { if (el) columnRefs.current[col._id] = el; }}
              onLayout={onColumnLayout(col._id)}
              style={[styles.column, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Text style={[TextStyles.heading.h3, { color: colors.foreground, marginBottom: 8 }]} numberOfLines={1}>
                {col.name || 'Untitled'}
              </Text>
              {colTasks.length === 0 ? (
                <Card style={[styles.emptyCard, { borderColor: colors.border }]}>
                  <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>No tasks</Text>
                </Card>
              ) : (
                colTasks.map((t: any) => (
                  <TouchableOpacity
                    key={t._id}
                    style={[styles.task, { borderColor: colors.border, backgroundColor: colors.background, opacity: draggingTask?._id === t._id ? 0.4 : 1 }]}
                    onPress={() => router.push(`/board/task/${t._id}`)}
                    onLongPress={() => startDrag(t, col._id)}
                    delayLongPress={250}
                  >
                    <Text style={[TextStyles.body.medium, { color: colors.foreground }]} numberOfLines={2}>
                      {t.title || 'Untitled Task'}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </RNView>
          );
        })}
      </ScrollView>

      {/* Drag ghost overlay */}
      {draggingTask && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.dragGhost,
            { borderColor: colors.border, backgroundColor: colors.card, shadowColor: colors.foreground },
            { transform: [{ translateX: pan.x }, { translateY: pan.y }] },
          ]}
        >
          <Text style={[TextStyles.body.medium, { color: colors.foreground }]} numberOfLines={2}>
            {draggingTask.title || 'Untitled Task'}
          </Text>
        </Animated.View>
      )}
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
  column: {
    width: 260,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  task: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  emptyCard: { padding: 12, borderWidth: 1, borderRadius: 10 },
  dragGhost: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 220,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
    zIndex: 999,
  },
});
