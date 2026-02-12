import ItemCard from "@/components/ui/item-card";
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { Text, View } from "react-native";
import Todos from "../../components/Todos";

export default function Index() {
  return (
	
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Todos />


      <ItemCard head={<Text style={{fontWeight: '500'}}>Edit app/index.tsx to edit this screen.</Text>}>
      <View>
        <Text>Hidden Content</Text>
      </View>
      </ItemCard>
    </View>
  );
}
