import ItemCard from "@/components/ui/item-card";
import SearchBar from "@/components/ui/search-bar";
import * as dbFunctions from "@/src/schema";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { FlatList, LayoutAnimation, Pressable, StyleSheet, Text, View } from "react-native";

type ItemResults = {
  id: string;
  name: string;
  category: string;
}

type Item = {
  id: string;
  name: string;
}

interface FoodData {
  /*
  {'chicken': 
  {113: ['whole'], 
  517: ['deli meat', 'pre-packaged', 'package', 'luncheon meat']}, 
  'chicken parts': 
  {116: ['breast halves', 'breast', 'bone', 'bone-in', 'half', 'halves'], 
  117: ['breast halves', 'boneless', 'breast', 'bone', 'half', 'halves'], 
  118: ['leg', 'thigh']}, 
  '_general': 
  {115: ['ground turkey or chicken'], 
  131: ['stuffed, raw chicken breasts'], 
  134: ['chicken nuggets, patties'], 
  136: ['fried chicken'], 
  141: ['rotisserie chicken'], 
  142: ['canned chicken'], 
  418: ['chicken salad']}}
  */
  [category: string]: Record<string, string[]>;
}


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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCatSelected, setCatSelected] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<string[]>();
  const [results, setSearchResults] = useState<ItemResults[]>([]);
  const [subItems, setCategoryItems] = useState<ItemResults[]>([]);

  


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
          if (!data) return [];

          console.log(JSON.parse(data.results));

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

          setCategories(cats);

          setSearchResults(formattedDataFromJson);
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
  
  const handleGroupPress = (category: string, ) => {
    setGroupSelected(true);
    const categoryItems = results.filter(item => item.category === category);
    setCategoryItems(categoryItems);
    console.log(categoryItems);
  }

  const handleCatPress = async (foodId: string) => {
    // Handle the other API call here and add to database!
    // do another api call so that we add the right item to the pantry list 
    // (from there, query database and update)

    const url = `http://localhost:8000/add_item?food_id=${foodId}`;
      
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    const data = await response.json();
    const dataResults = JSON.parse(data.results);
    

    console.log(dataResults);

    dbFunctions.insertIntoFoodItem(db, foodId, dataResults);
    dbFunctions.printTable(db);


    // Reset everything
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
            data={categories}
            renderItem={({ item } ) => (
              dataElement(item, () => handleGroupPress(item))
            )}
            style={styles.pantryStyle}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} 
          />}
        />

        {isGroupSelected && !isCatSelected ? (
          <FlatList
            data={subItems}
            keyExtractor={(item) => item.id}
            renderItem={({ item } ) => (
              dataElement(item.name, () => handleCatPress(item.id))
            )}
            style={styles.pantryStyle}
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