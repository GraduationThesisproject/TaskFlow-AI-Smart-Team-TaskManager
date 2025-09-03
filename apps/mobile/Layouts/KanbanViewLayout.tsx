import { useNavigation } from 'expo-router';
import { View, Text, Button } from 'react-native';
export const KanbanViewLayout = () => {
  const navigation = useNavigation();

  return (
    <View>
      <Text>KanbanViewLayout</Text>
      <Button
        title="Go to kanban"
        onPress={() => navigation.navigate("kanban")}
      />
    </View>
  );
};