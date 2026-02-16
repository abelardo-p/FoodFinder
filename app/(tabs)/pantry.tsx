import ItemCard from "@/components/ui/item-card";
import SearchBar from "@/components/ui/search-bar";
import * as dbFunctions from "@/src/schema";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { FlatList, LayoutAnimation, Pressable, StyleSheet, Text, View } from "react-native";

type Item = {
  id: number;
  name: string;
}
const data: Item[] = [
  { id: '1', name: 'Tomato' },
  { id: '2', name: 'Onion' },
  { id: '3', name: 'Garlic' },
  { id: '4', name: 'Salt' },
  { id: '5', name: 'Pepper' },
  { id: '6', name: 'Olive Oil' },
  { id: '7', name: 'Butter' },
  { id: '8', name: 'Basil' },
  { id: '9', name: 'Oregano' },
  { id: '10', name: 'Parsley' },
  { id: '11', name: 'Chicken' },
  { id: '12', name: 'Beef' },
  { id: '13', name: 'Pork' },
  { id: '14', name: 'Carrot' },
  { id: '15', name: 'Potato' },
  { id: '16', name: 'Cheese' },
  { id: '17', name: 'Milk' },
  { id: '18', name: 'Egg' },
  { id: '19', name: 'Flour' },
  { id: '20', name: 'Sugar' },
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
    <Pressable onPress={onPress}style={{ justifyContent: 'center', alignItems: 'center', margin: 12}}>
      <Text style={{fontSize: 16}}>
        {text}
      </Text>
    </Pressable>
  )
}

export default function Index() {
  const db = useSQLiteContext();
  const [isFocus, setFocus] = useState(false);
  const [isGroupSelected, setGroupSelected] = useState(false);
  const [isCatSelected, setCatSelected] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setSearchResults] = useState([]);


  useEffect(() => {

	const fetchItems = async () => {
		const foodItems = await dbFunctions.fetchItemsForPantry(db);
		console.log(foodItems);
		setItems((foodItems as Item[]) ?? []);
	};

	fetchItems();
  	}, 
	[]
  );

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

  const handleLongPress = (id: number) => {
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
        onChange={(text: string) => setSearchQuery(text)}
        onFocus={() => {setFocus(true)}}
        onBlur={() => {}}
      >
      </SearchBar>

      {isFocus ? (
        <View style={{flexDirection: 'row'}}>
          <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item } ) => (
            dataElement(item.name, handleGroupPress)
          )}
          style={{ shadowColor: '#000',
                  shadowOffset: { width: 1, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 6,
                  maxHeight: 450, width: 225, borderRadius: 11, borderWidth: 3, margin: 10, marginLeft: 3, marginRight: 3, padding: 10, backgroundColor: 'snow'}}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />

        {isGroupSelected && !isCatSelected ? (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            renderItem={({ item } ) => (
              dataElement(item.name, handleCatPress)
            )}
            style={{ shadowColor: '#000',
                    shadowOffset: { width: 1, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 6,
                    maxHeight: 450, width: 225, borderRadius: 11, borderWidth: 3, margin: 10, marginLeft: 3, marginRight: 3, padding: 10, backgroundColor: 'snow'}}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        ) : (<View></View>)}
        </View>


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