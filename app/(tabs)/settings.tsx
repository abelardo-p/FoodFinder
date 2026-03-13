import ItemCard from "@/components/ui/item-card";
import SearchBar from "@/components/ui/search-bar";
import * as dbFunctions from "@/src/schema";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { FlatList, LayoutAnimation, Pressable, StyleSheet, Switch, Text, View } from "react-native";


const machineIP: string = 'localhost';
const emulatorIP: string = '10.0.2.2'

const currentMachineIP: string = machineIP  


type ItemResults = {
  id: string;
  name: string;
  category: string;
}

type Item = {
  id: string;
  name: string;
  keyword: string;
  quantity: number;
}


// @abe, idk how we should format this
const cardElement = (text: string, quantity: number, keyword: string) => {
    console.log(text, quantity, keyword);
  return (
    <Text style={{marginLeft: 20, fontSize: 18}}>
      {text} {quantity} {keyword}
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
  const [items, setItems] = useState<Item[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [results, setSearchResults] = useState<ItemResults[]>([]);

  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);


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
    if (searchQuery.length > 0 && searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        try {
          console.log(searchQuery)
          const response = await fetch(`http://${currentMachineIP}:8000/search`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ item: searchQuery })
          });

          
          const data = await response.json();

          // Handles if query gets no results
          if (!data.results) {
            console.log("No results found");
            setSearchResults([]);
            return;
          }
          const dataResults = JSON.parse(data.results);

          // Converting the weird json to an array-like in order to render for later functions
          const formattedDataFromJson: ItemResults[] = Object.entries(dataResults).flatMap(([category, records]) =>
          Object.entries(records as Record<number, string[]>).map(([id, keywords]) => ({
              id,
              name: Array.isArray(keywords) && keywords.length > 0 ? keywords.join(', ') : category,
              category,
            }))
          );

          console.log(formattedDataFromJson);
          const cats = [...new Set(formattedDataFromJson.map(item => item.category))];

          console.log(cats);

          setSearchResults(formattedDataFromJson);
        } catch (error) {
          console.error('Search failed:', error);
          setSearchResults([]);
        }
      } else {
        setSearchResults([]);
      }
    }, 500); 

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleLongPress = (id: string) => {
    setActiveId(id);

    setTimeout(() => {
      LayoutAnimation.configureNext(
        LayoutAnimation.Presets.easeInEaseOut
      );
      setItems((prev) => prev.filter((item) => item.id !== id));
      setActiveId(null);
      dbFunctions.deleteItemFromDB(Number(id), db);
      dbFunctions.printTable(db);
    }, 300);

    
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
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ItemCard
            head={cardElement(item.name, item.quantity, item.keyword)}
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
    maxWidth: 225,
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