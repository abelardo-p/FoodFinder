import { Text, View, FlatList, LayoutAnimation, Pressable } from "react-native";
import ItemCard from "@/components/ui/item-card";
import SearchBar from "@/components/ui/search-bar";
import { useState } from "react";

type Item = {
  id: string;
  name: string;
}
const data: Item[] = [
  {id: '1', name: 'apple'},
  {id: '2', name: 'banana'},
  {id: '3', name: 'bread'},
  {id: '4', name: 'potato'},
  {id: '5', name: 'hamburger'},
  {id: '6', name: 'soup'},
];

const cardElement = (text: string) => {
  return (
    <Text style={{fontSize: 18}}>
      {text}
    </Text>
  )
}

const dataElement = (text: string) => {
  return (
    <Pressable>

    </Pressable>
  )
}

export default function Index() {
  const [items, setItems] = useState<Item[]>(data);
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleLongPress = (id: string) => {
    setActiveId(id);

    setTimeout(() => {
      LayoutAnimation.configureNext(
        LayoutAnimation.Presets.easeInEaseOut
      );

      setItems((prev) => prev.filter((item) => item.id !== id));
      setActiveId(null);
    }, 300);
  };
  return (
    <View
      style={{
      flex: 1,
      justifyContent: "flex-start", 
      alignItems: "center",
      marginTop: 115
      }}
    >
      <SearchBar onChangeCallBack={() => {}} 
        containerStyle={{ marginBottom: 25 }} 
        searchBarStyle={{ height: 55, width: 250, borderWidth: 3, borderRadius: 10  }}>
      </SearchBar>
      {/* <FlatList>
        basic stack of ingredients that where pressable
      </FlatList> */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ItemCard
            head={cardElement(item.name)}
            isActive={activeId === item.id}
            onClickCallBack={() => {}}
            onLongClickCallBack={() => handleLongPress(item.id)}
            pressableStyle={{ margin: 4, width: 65, height: 50, minWidth: 125, maxWidth: 250 }}
            longPressStyle={{ backgroundColor: 'lightcoral' }}
          />
        )}
      />  

    </View>
  );
}
