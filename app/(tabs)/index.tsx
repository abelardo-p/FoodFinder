import ItemCard from "@/components/ui/item-card";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ItemCard head={<Text style={{fontWeight: '500'}}>Edit app/index.tsx to edit this screen.</Text>}>
      <View>
        <Text>Hidden Content</Text>
      </View>
      </ItemCard>
    </View>
  );
}
