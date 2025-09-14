import { View } from 'react-native';
import { Stack } from 'expo-router';
import { Board } from '@/components/board';

export default function BoardScreen() {
  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: 'Board',
          headerShown: true,
        }}
      />
      <Board 
        boardId="main-board"
        editable={true}
        showFilters={true}
      />
    </View>
  );
}
