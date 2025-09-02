import { Text, View } from "react-native";
import  {Button} from  "../ui/Button"
export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>TaskFlow</Text>
      <Text>Edit app/index.tsx to edit this screen.</Text>
      <Button variant="default">Button</Button>
    </View>
  );
}
