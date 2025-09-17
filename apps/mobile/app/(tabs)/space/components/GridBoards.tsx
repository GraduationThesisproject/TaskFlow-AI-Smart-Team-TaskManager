import React from 'react';
import { View as RNView, StyleSheet } from 'react-native';
import { useThemeColors } from '@/components/ThemeProvider';
import BoardCard from '@/components/common/BoardCard';

export type GridBoardsProps = {
  boards: any[];
  itemWidth?: number;
  onPressBoard: (board: any) => void;
  onToggleArchive?: (board: any) => void;
};

export default function GridBoards({ boards = [], itemWidth, onPressBoard, onToggleArchive }: GridBoardsProps) {
  const colors = useThemeColors();

  return (
    <RNView style={styles.boardGrid}>
      {(Array.isArray(boards) ? boards : []).map((board: any) => (
        <RNView
          key={board?._id || board?.id}
          style={[styles.gridItem, itemWidth ? { width: itemWidth } : null]}
        >
          <BoardCard
            board={board}
            onPress={() => onPressBoard(board)}
            onToggleArchive={onToggleArchive}
          />
        </RNView>
      ))}
    </RNView>
  );
}

const styles = StyleSheet.create({
  boardGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridItem: { marginBottom: 12 },
});


