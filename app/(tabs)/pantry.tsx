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
const data: Item[] = [
  { id: '1', name: 'Tomato' },
  { id: '2', name: 'Onion' },
  { id: '3', name: 'Garlic' }
];

const cardElement = (text: string) => {
  return (
    <Text style={{marginLeft: 20, fontSize: 18}}>
      {text}
    </Text>
  )
}
const dataElement = (text: string, onPress: () => void) => {
  return (
    <Pressable onPress={onPress} style={{ justifyContent: 'center', alignItems: 'center', margin: 12}}>
      <Text style={{fontSize: 16}}>
        {text}
      </Text>
    </Pressable>
  )
}

export default function Pantry() {
  const db = useSQLiteContext();
  const [isFocus, setFocus] = useState(false);
  const [isGroupSelected, setGroupSelected] = useState(false);
  const [isCatSelected, setCatSelected] = useState(false);
  const [items, setItems] = useState<Item[]>(data);
  const [activeId, setActiveId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [results, setSearchResults] = useState([]);


  const fetchItems = async () => {
    const foodItems = await dbFunctions.fetchItemsForPantry(db);
    console.log(foodItems);
    setItems((foodItems as Item[]) ?? []);
	};
  
  useEffect(() => { 
	   fetchItems();
  }, []);

  useEffect(() => {
    // Don't search if below minimum length
    if (searchQuery.length > 0 && searchQuery.length < 3) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      if (searchQuery.length >= 3) {
        try {
          console.log(searchQuery)
          const response = await fetch(`http://localhost:8000/search`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ item: searchQuery })
          });

          const data = await response.json();

          console.log(data);

          if (!data) return [];

          setSearchResults(data);
        } catch (error) {
          console.error('Search failed:', error);
          setSearchResults([]);
        }
      } else {
        setSearchResults([]);
      }
    }, 2000); 

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);
  
  const handleGroupPress = () => {
    setGroupSelected(true);
  }
  const handleCatPress = () => {
    setFocus(false);
    setGroupSelected(false);
    setCatSelected(false);
  }

  const handleLongPress = (id: string) => {
    setActiveId(id);

    setTimeout(() => {
      LayoutAnimation.configureNext(
        LayoutAnimation.Presets.easeInEaseOut
      );
      setItems((prev) => prev.filter((item) => item.id !== id));
      setActiveId(null);
	  dbFunctions.deleteItemFromDB(Number(id), db);
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
        onChange={(text: string) => setSearchQuery(text)}
        onFocus={() => {setFocus(true)}}
        onBlur={() => {}}
      >
      </SearchBar>

      {isFocus ? (
        <View style={{flexDirection: 'row'}}>
          <FlatList
            data={items}
            keyExtractor={(item) => item.id} // keyExtractor wants a string! not a number
            renderItem={({ item } ) => (
              dataElement(item.name, handleGroupPress)
            )}
            style={styles.pantryStyle}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} 
          />}
        />

        {isGroupSelected && !isCatSelected ? (
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={({ item } ) => (
              dataElement(item.name, handleCatPress)
            )}
            style={styles.pantryStyle}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        ) : (<View></View>)}
        </View>

      // Show results to user so user can pick from there, and then based on what user chooses,
      // do another api call so that we add the right item to the pantry list 
      // (from there, query database and update) 

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
  pantryStyle: {
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    maxHeight: 450,
    width: 225,
    borderRadius: 11,
    borderWidth: 3,
    margin: 10,
    marginLeft: 3,
    marginRight: 3,
    padding: 10,
    backgroundColor: 'snow'
  },
  separator: {
    backgroundColor: 'grey',
    marginHorizontal: 20,
    borderBottomWidth: 1,
  },
});