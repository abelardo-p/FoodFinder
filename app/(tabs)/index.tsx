import ItemCardCollapsible from "@/components/ui/item-card-collapsible";
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
      <SearchBar onChangeCallBack={updateFunction}>

      </SearchBar>
      <ItemCardCollapsible head={<Text style={{fontWeight: '500'}}>Edit app/index.tsx to edit this screen.</Text>}>
      <View>
        <Text>Hidden Content</Text>
      </View>
      </ItemCardCollapsible>
    </View>
  );
}
