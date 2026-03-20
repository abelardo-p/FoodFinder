import ItemCard from "@/components/ui/item-card";
import SearchBar from "@/components/ui/search-bar";
import * as dbFunctions from "@/src/database_helper_functions";
import { Button } from "@react-navigation/elements";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { FlatList, LayoutAnimation, Pressable, StyleSheet, Switch, Text, TextInput, View } from "react-native";


const machineIP: string = '127.0.0.1';
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


const cardElement = (text: string, quantity: number, keyword: string) => {
	console.log(text, quantity, keyword);

  if (text === keyword) {
    return (
      <Text style={{marginLeft: 20, fontSize: 18}}>
        {text}, {quantity}
      </Text>
    )
  } else {
    return (
      <Text style={{marginLeft: 20, fontSize: 18}}>
        {text} {keyword}, {quantity}
      </Text>
    )
  }
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
  const [expiry, setExpirey] = useState<Boolean>(false);
  const [dateOpened, setDateOpened] = useState<string>('');
  const [datePurchased, setDatePurchased] = useState<string>('');
  const [storage, setStorage] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<Item[]>([]); // Items in pantry
  const [activeId, setActiveId] = useState<string | null>(null); // Boolean for current items in pantry

  const [results, setSearchResults] = useState<ItemResults[]>([]); // Items retrieved from search
  const [categories, setCategories] = useState<string[]>(); // Categories of items retrieved 
  const [subItems, setCategoryItems] = useState<ItemResults[]>([]); // subcategory items 
  const [itemId, setItemId] = useState<string>('');
  const [keyword, setKeyword] = useState<string>('');
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
          const response = await fetch(`http://${currentMachineIP}:8000/search/${ encodeURIComponent(searchQuery)}`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
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

          setCategories(cats);

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
  
  const handleGroupPress = (category: string) => {
    setGroupSelected(true);
    const categoryItems = results.filter(item => item.category === category);
    setCategoryItems(categoryItems);
    console.log(categoryItems);
  }

  const handleCatPress = (foodId: string, keyword: string) => {
    setItemId(foodId);
    setKeyword(keyword);
    setExpirey(true);


    // // Reset everything
    setFocus(false);
    setGroupSelected(false);
    setCatSelected(false);
    // // fetchItems();
    // setExpirey(true);
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
	  dbFunctions.printTable(db);
    }, 300);

  };

  const submitDate = async (datePurchased: string, dateOpened: string) => {
    const url = `http://${currentMachineIP}:8000/add_item?food_id=${itemId}`;
      
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    const data = await response.json();
    const dataResults = data.results;
    console.log(dataResults)

	  // Update item quantity or add new item to database
    await dbFunctions.insertIntoFoodItem(db, itemId, dataResults, keyword, datePurchased, dateOpened);

    dbFunctions.printTable(db);

    // Reset everythingc
    setFocus(false);
    setGroupSelected(false);
    setCatSelected(false);
    setItemId('');
    setKeyword('');
    setDateOpened('');
    setDatePurchased('');
    setStorage('');
    fetchItems();
    setExpirey(false);
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
      <View style={{flexDirection: 'row'}}>
        <View>
          <Text>Avoid</Text>
          <Switch
            trackColor={{false: '#656169', true: '#81b0ff'}}
            thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleSwitch}
            value={isEnabled}
            style={{width: 100, marginRight: 60}}
          />
        </View>
        <SearchBar
          containerStyle={{}} 
          searchBarStyle={{ height: 60, width: 250, borderWidth: 3, borderRadius: 10, backgroundColor: 'snow'}}
          onChange={(text: string) => setSearchQuery(text)}
          onFocus={() => {setFocus(true)}}
          onBlur={() => {}}
        >
        </SearchBar>

        <View style={{width: 100}}>
        </View>
      </View>

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
              dataElement(item.name, () => handleCatPress(item.id, item.name)) // I GUESS ITEM.NAME IS THE KEYWORD!! // SOME ITEMS MIGHT HAVE SAME CATEGORY BUT DIFFERENT KEYWORD
            )}
            style={styles.pantryStyle}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        ) : (<View></View>)}
        </View>

      ) : (<View style={{margin: 15}}></View>)}
      {expiry ? (
        <View style={{marginBottom: 5, justifyContent: 'center', alignItems: 'center'}}>
          <TextInput
            style={{backgroundColor: 'white', padding: 10, borderWidth: 2, borderRadius: 10, width: 235}}
            value={datePurchased}
            onChangeText={setDatePurchased}
            placeholder="Date Purchased: MM/DD/YYYY"
          />
          {storage === '' ? (
              <View style={{flexDirection: 'row', margin: 20, marginBottom: 0}}>
                <Button onPress={() => setStorage('PANTRY')}>Pantry</Button>
                <Button onPress={() => setStorage('FRIDGE')}>Fridge</Button>
                <Button onPress={() => setStorage('FREEZER')}>Freezer</Button>
              </View>
            )
          : <View></View>}
          <TextInput
            style={{backgroundColor: 'white', padding: 10, borderWidth: 2, borderRadius: 10, width: 260, marginTop: 10, marginBottom: 10}}
            value={dateOpened}
            onChangeText={setDateOpened}
            placeholder="Date Opened: MM/DD/YYYY or Empty"
          />
          <Button style={{width: 225}} onPress={() => {submitDate(datePurchased, dateOpened)}}>Submit</Button>
        </View>
      ) : (<View></View>)}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ItemCard
            head={cardElement(item.name, item.quantity, item.keyword)}
            isActive={activeId === item.id}
            onClickCallBack={() => {}}
            onLongClickCallBack={() => handleLongPress(item.id)}
            pressableStyle={{ alignItems: 'flex-start', margin: 5, minHeight: 80, minWidth: 260, maxWidth: 260, borderWidth: 0, borderRadius: 15}}
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