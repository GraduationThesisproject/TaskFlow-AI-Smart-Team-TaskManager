import { View, Text } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';

export default function BoardScreen() {
  const params = useLocalSearchParams();
  const boardId = params.boardId as string || 'main-board';
  const boardName = params.boardName as string || 'Board';

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Stack.Screen options={{ title: boardName }} />
      <Text>Board screen is temporarily disabled.</Text>
    </View>
  );
}
