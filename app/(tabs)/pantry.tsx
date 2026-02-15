import ItemCard from "@/components/ui/item-card";
import SearchBar from "@/components/ui/search-bar";
import * as dbFunctions from "@/src/schema";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { FlatList, LayoutAnimation, Pressable, StyleSheet, Text, View } from "react-native";

type Item = {
  id: string;
  name: string;
}

// const data: Item[] = [
//   {id: '1', name: 'apple'},
//   {id: '2', name: 'banana'},
//   {id: '3', name: 'bread'},
//   {id: '4', name: 'potato'},
//   {id: '5', name: 'hamburger'},
//   {id: '6', name: 'soup'},
//   {id: '7', name: 'apple'},
//   {id: '8', name: 'banana'},
//   {id: '9', name: 'bread'},
//   {id: '10', name: 'potato'},
//   {id: '11', name: 'hamburger'},
//   {id: '12', name: 'soup'},
// ];

const cardElement = (text: string) => {
  return (
    <Text style={{marginLeft: 20, fontSize: 18}}>
      {text}
    </Text>
  )
}
const dataElement = (text: string) => {
  return (
    <Pressable style={{ justifyContent: 'center', alignItems: 'center', margin: 12}}>
      <Text style={{fontSize: 16}}>
        {text}
      </Text>
    </Pressable>
  )
}

export default function Index() {
  const db = useSQLiteContext();
  const [isFocus, setFocus] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);


  useEffect(() => {

	const fetchItems = async () => {
		const foodItems = await dbFunctions.fetchItemsForPantry(db);
		console.log(foodItems);
		setItems((foodItems as Item[]) ?? []);
	};

	fetchItems();
  }, []);


  const handleLongPress = (id: string) => {
    setActiveId(id);

    setTimeout(() => {
      LayoutAnimation.configureNext(
        LayoutAnimation.Presets.easeInEaseOut
      );
      setItems((prev) => prev.filter((item) => item.id !== id));
      setActiveId(null);
	  dbFunctions.deleteItemFromDB(id, db);
    }, 300);

	dbFunctions.printTable(db);
  };

  return (
    <View
      style={{
      flex: 1,
      justifyContent: "center", 
      alignItems: "center",
      marginTop: 105
      }}
    >
      <SearchBar
        containerStyle={{}} 
        searchBarStyle={{ height: 60, width: 250, borderWidth: 3, borderRadius: 10, backgroundColor: 'snow'}}
        onChange={() => {}}
        onFocus={() => {setFocus(!isFocus)}}
        onBlur={() => {setFocus(!isFocus)}}
      >
      </SearchBar>
      {isFocus ? (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item } ) => (
            dataElement(item.name)
          )}
          style={{ shadowColor: '#000',
                  shadowOffset: { width: 1, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 6,
                  maxHeight: 450, width: 225, borderRadius: 11, borderWidth: 3, margin: 10, padding: 10, backgroundColor: 'snow'}}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (<View style={{margin: 15}}></View>)}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ItemCard
            head={cardElement(item.name)}
            isActive={activeId === item.id}
            onClickCallBack={() => {}}
            onLongClickCallBack={() => handleLongPress(item.id)}
            pressableStyle={{ alignItems: 'flex-start', margin: 5, height: 80, minWidth: 250, maxWidth: 250, borderWidth: 0, borderRadius: 15}}
            longPressStyle={{ backgroundColor: 'lightcoral' }}
          />
        )}
        showsVerticalScrollIndicator={false}
      />  

    </View>
  );
}

const styles = StyleSheet.create({
  separator: {
    backgroundColor: 'grey',
    marginHorizontal: 20,
    borderBottomWidth: 1,
  },
});