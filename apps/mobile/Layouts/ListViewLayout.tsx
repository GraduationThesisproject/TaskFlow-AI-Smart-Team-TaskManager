import { useNavigation } from 'expo-router';
import { View, Text, Button } from 'react-native';
export const ListViewLayout = () => {
  const navigation = useNavigation();

  return (
    <View>
      <Text>ListViewLayout</Text>
      <Button
        title="Go to List View"
        onPress={() => navigation.navigate("list")}
      />
    </View>
  );
};