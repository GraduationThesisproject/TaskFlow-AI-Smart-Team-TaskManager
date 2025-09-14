/**
 * BoardRefactored Screen - Example integration of the modular drag-and-drop board
 * Shows how to use the refactored components with Redux
 */

import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { useThemeColors } from '@/components/ThemeProvider';
import { Board } from '@/components/board';
import { DragTask, DragBoard } from '@/types/dragBoard.types';

export default function BoardRefactoredScreen() {
  const colors = useThemeColors();

  // Handle task selection
  const handleTaskSelect = (task: DragTask) => {
    console.log('Task selected:', task);
    // You can add additional logic here, like analytics tracking
  };

  // Handle board updates
  const handleBoardUpdate = (board: DragBoard) => {
    console.log('Board updated:', board);
    // You can add additional logic here, like syncing with backend
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Board
        boardId="board-1"
        onTaskSelect={handleTaskSelect}
        onBoardUpdate={handleBoardUpdate}
        editable={true}
        showFilters={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
