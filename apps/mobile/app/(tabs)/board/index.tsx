import { View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Board } from '@/components/board';

export default function BoardScreen() {
  const params = useLocalSearchParams();
  const boardId = params.boardId as string || 'main-board';
  const boardName = params.boardName as string || 'Board';

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: boardName,
          headerShown: false, // Let Board component handle its own header
        }}
      />
      <Board 
        boardId={boardId}
        editable={true}
        showFilters={true}
      />
    </View>
  );
}
