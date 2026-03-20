import ItemCardCollapsible from '@/components/ui/item-card-collapsible';
import { useSQLiteContext } from 'expo-sqlite';
import { useState, useEffect } from 'react';
import { View, Text, FlatList, Linking, Pressable } from "react-native";
import { Button } from "@react-navigation/elements";
import * as dbFunctions from "@/src/database_helper_functions";

const LIMIT = 9;
const ALLERGY_TABLE = "Allergy";
const CUISINE_TABLE = "Cuisine";

type Meal = {
  id: string; 
  name: string;
  ingredients: string[];
};

type restriction = {
  id: string;
  name: string;
}

type cuisine = {
  id: string;
  name: string;
}

const meals: Meal[] = [
  { 
    id: '1', 
    name: 'Spaghetti Bolognese', 
    ingredients: ['Spaghetti', 'Beef', 'Tomato', 'Onion', 'Garlic', 'Olive Oil', 'Salt', 'Pepper']
  },
  { 
    id: '2', 
    name: 'Chicken Curry', 
    ingredients: ['Chicken', 'Curry Paste', 'Coconut Milk', 'Onion', 'Garlic', 'Salt', 'Pepper']
  },
  { 
    id: '3', 
    name: 'Beef Stroganoff', 
    ingredients: ['Beef', 'Onion', 'Mushroom', 'Cream', 'Butter', 'Salt', 'Pepper']
  },
  { 
    id: '4', 
    name: 'Vegetable Stir Fry', 
    ingredients: ['Carrot', 'Broccoli', 'Bell Pepper', 'Garlic', 'Soy Sauce', 'Olive Oil', 'Salt']
  },
  { 
    id: '5', 
    name: 'Omelette', 
    ingredients: ['Egg', 'Milk', 'Cheese', 'Salt', 'Pepper', 'Butter']
  },
  { 
    id: '6', 
    name: 'Grilled Cheese Sandwich', 
    ingredients: ['Bread', 'Cheese', 'Butter']
  },
  { 
    id: '7', 
    name: 'Caesar Salad', 
    ingredients: ['Lettuce', 'Croutons', 'Parmesan', 'Caesar Dressing']
  },
  { 
    id: '8', 
    name: 'Pancakes', 
    ingredients: ['Flour', 'Egg', 'Milk', 'Sugar', 'Butter']
  },
  { 
    id: '9', 
    name: 'Tomato Soup', 
    ingredients: ['Tomato', 'Onion', 'Garlic', 'Olive Oil', 'Salt', 'Pepper', 'Basil']
  },
  { 
    id: '10', 
    name: 'Roast Chicken', 
    ingredients: ['Chicken', 'Salt', 'Pepper', 'Olive Oil', 'Basil', 'Garlic']
  },
];

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
        state: 'OPEN', 
        storage: 'FRIDGE', 
        min_days: 5,
        max_days: 7
      }
    }
  };

  const fetchRecommendations = async () => {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    // await delay(1000);
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
            <Text style={{marginTop: 0, margin: 15}}>{item.cuisine}: <a></a>{}</Text>
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
