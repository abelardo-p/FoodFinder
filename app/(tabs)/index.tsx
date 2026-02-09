import ItemCard from "@/components/ui/item-card";
import SearchBar from "@/components/ui/search-bar";
import { Text, View } from "react-native";

const updateFunction = (text: string) => {
  console.log("FML")
}
export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <SearchBar onChangeCallback={updateFunction}>

      </SearchBar>
      <ItemCard head={<Text style={{fontWeight: '500'}}>Edit app/index.tsx to edit this screen.</Text>}>
      <View>
        <Text>Hidden Content</Text>
      </View>
      </ItemCard>
    </View>
  );
}
