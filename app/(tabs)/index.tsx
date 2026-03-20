import ItemCardCollapsible from '@/components/ui/item-card-collapsible';
import { useSQLiteContext } from 'expo-sqlite';
import { useState, useEffect } from 'react';
import { View, Text, FlatList, Linking, Pressable, Image} from "react-native";
import { Button } from "@react-navigation/elements";
import * as dbFunctions from "@/src/database_helper_functions";

const LIMIT = 9;
const ALLERGY_TABLE = "Allergy";
const CUISINE_TABLE = "Cuisine";

type Item = {
  id: string;
  name: string;
  keyword: string;
  quantity: number;
}

type pantryItem = {
  id: number;
  name: string;
  date_purchased: string;
  date_opened: string | undefined;
  storage_option: {
    state: string;
    storage: string;
    min_days: number,
    max_days: number
  }
}

type recommendation = {
  recipe_id: number;
  recipename: string;
  cuisine: string;
  image_link: string;
  link: string;
  overall_score: number;
}
const cardElement = (text: string) => {
  return (
    <Text style={{fontSize: 18}}>
      {text}
    </Text>
  )
}
const A = ({ href, children }: any) => {
  const handlePress = () => {
    Linking.openURL(href);
  };

  return (
    <Pressable onPress={handlePress}>
      <Text style={{ color: 'blue', textDecorationLine: 'underline' }}>
        {children}
      </Text>
    </Pressable>
  );
};

export default function Index() {
	const db = useSQLiteContext(); // LET'S SAY YOU WANT TO CALL THE DATABASE, JUST CALL THIS LINE!!
  const [items, setItems] = useState<any[]>([]); // Items in pantry
  const [cusinePrefrences, setCuisinePrefernces] = useState<cuisine[]>([]);
  const [restrictions, setRestrictions] = useState<restriction[]>([]);
  const [recommendations, setRecommendations] = useState<recommendation[]>([]);

  const fetchItems = async () => {
    const foodItems = await dbFunctions.fetchItemsForPantry(db);
    console.log(foodItems);
    setItems((foodItems as Item[]) ?? []);
  };

  const fetchPreferences = async (table: string) => {
    const preferences = await dbFunctions.fetchPreferences(db, table);
    if (table === ALLERGY_TABLE) {
      setRestrictions((preferences as restriction[]) ?? []);
    } else {
      const preferredCuisines = (preferences as restriction[]).map(p => ({id: p.id, name: p.name}));
      setCuisinePrefernces(preferredCuisines as cuisine[] ?? []);
    }
  };

  const getPantryItem = (item: any): pantryItem => {
    let datePurchased = item.datePurchased.split('/'); 
    let dateOpened = undefined;
    console.log('hello', item);
    if (item.dateOpened && item.dateOpened.length > 8) {
      dateOpened = item.dateOpened.split('/');
      dateOpened = [dateOpened[2], dateOpened[0], dateOpened[1]].join('-')
    }
    return {
      id: Number(item.id), 
      name: item.name, 
      date_purchased: [datePurchased[2], datePurchased[0], datePurchased[1]].join('-'), 
      date_opened: dateOpened,
      storage_option: {
        state: 'UNOPENED', 
        storage: 'FRIDGE', 
        min_days: 5,
        max_days: 7
      }
    }
  };

  const fetchRecommendations = async () => {
    const url = `http://localhost:8000/recommend/`;

    let pantryData = {
      user_id: 0,
      limit: 25,
      pantry_items: items.map(getPantryItem),
      restrictions: restrictions.map(restriction => restriction.id),
      preferred_cuisines: cusinePrefrences.map(cuisine => cuisine.id)
    };
    console.log(pantryData)
    const response = await fetch(url, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(pantryData)
    })

    const data = await response.json();
    setRecommendations(data);
    console.log(recommendations);
  };
  
  useEffect(() => { 
    fetchItems();
    fetchPreferences(ALLERGY_TABLE);
    fetchPreferences(CUISINE_TABLE);
    fetchRecommendations();
  }, []);

  useEffect(() => {
  });
  
	return (
		<View
		style={{
			flex: 1,
			justifyContent: "center",
			alignItems: "center",
		}}
		>
      <Button style={{width: 175, marginTop: 25}} onPress={() => {fetchItems(); fetchPreferences(ALLERGY_TABLE); fetchPreferences(CUISINE_TABLE), fetchRecommendations()}}>Refresh</Button>
		  <FlatList
        data={recommendations}
        keyExtractor={(item) => String(item.recipe_id)}
        renderItem={({ item } ) => (
          <ItemCardCollapsible
            head={cardElement(item.recipename)}
            onPress={() => {}}
            pressableStyle={{margin: 5, minHeight: 80, width:250, maxWidth: 250, borderWidth: 0, borderRadius: 15}}
          >
            <Text style={{fontSize: 16, marginTop: 0, margin: 15}}><Text>Cuisine: {item.cuisine}</Text> <A href={item.link}><Text style={{fontSize: 14, fontWeight: 'bold', color: 'darkblue'}}>View Recipe</Text></A></Text>
            <Image
              source={{ uri: item.image_link }}
              style={{ width: 100, height: 100, margin: 10 }}
            />
          </ItemCardCollapsible>
        )}
        style={{ 
            shadowColor: '#000',
            shadowOffset: { width: 1, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 6,
            borderRadius: 12, borderWidth: 0, marginTop: 40, marginBottom: 25, marginLeft: 5, marginRight: 5, padding: 10, backgroundColor: 'snow'}}
        ListFooterComponent={<View style={{ height: 20 }} />}
        showsVerticalScrollIndicator={false}
			/>
		</View>
  );
}
