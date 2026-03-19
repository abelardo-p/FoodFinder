import ItemCardCollapsible from '@/components/ui/item-card-collapsible';
import { useSQLiteContext } from 'expo-sqlite';
import { useState, useEffect } from 'react';
import { View, Text, FlatList } from "react-native";

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
  date_opened: string;
  storage_option: {
    state: string;
    storage: string;
    min_days: number,
    max_days: number
  }
}
const cardElement = (text: string) => {
  return (
    <Text style={{fontSize: 18}}>
      {text}
    </Text>
  )
}

export default function Index() {
	const db = useSQLiteContext(); // LET'S SAY YOU WANT TO CALL THE DATABASE, JUST CALL THIS LINE!!
  const [items, setItems] = useState<any[]>([]); // Items in pantry
  const [cusinePrefrences, setCuisinePrefernces] = useState<cuisine[]>([]);
  const [restrictions, setRestrictions] = useState<restriction[]>([])
  
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
    return {
      id: Number(item.id), 
      name: item.name, 
      date_purchased: '2026-10-25', 
      date_opened: '2026-10-25',
      storage_option: {
        state: 'OPEN', 
        storage: 'FRIDGE', 
        min_days: 5,
        max_days: 7
      }
    }
  };

  const fetchRecommendations = async () => {
    const url = `http://localhost:8000/recommend/${LIMIT}`;

    let pantryData = {
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

    const data = await response.json()
    console.log(data)
  };
  
  useEffect(() => { 
    fetchItems();
    fetchPreferences(ALLERGY_TABLE);
    fetchPreferences(CUISINE_TABLE);
    console.log(cusinePrefrences);
    console.log(restrictions);
    console.log(items);
    fetchRecommendations();
    
  }, []);

  useEffect(() => {
    fetchRecommendations();
  });
  
	return (
		<View
		style={{
			flex: 1,
			justifyContent: "center",
			alignItems: "center",
		}}
		>
		  <FlatList
        data={meals}
        keyExtractor={(item) => item.id}
        renderItem={({ item } ) => (
          <ItemCardCollapsible
            head={cardElement(item.name)}
            onPress={() => {}}
            pressableStyle={{margin: 5, minHeight: 80, width:250, maxWidth: 250, borderWidth: 0, borderRadius: 15}}
          >
            <Text style={{marginTop: 0, margin: 15}}>{item.ingredients.join(", ")}</Text>
          </ItemCardCollapsible>
        )}
        style={{ 
            shadowColor: '#000',
            shadowOffset: { width: 1, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 6,
            borderRadius: 12, borderWidth: 0, marginTop: 75, marginBottom: 25, marginLeft: 5, marginRight: 5, padding: 10, backgroundColor: 'snow'}}
        ListFooterComponent={<View style={{ height: 20 }} />}
        showsVerticalScrollIndicator={false}
			/>		
		</View>
  );
}
