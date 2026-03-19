import ItemCard from '@/components/ui/item-card';
import * as dbFunctions from "@/src/database_helper_functions";

import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { FlatList, Text, View } from "react-native";

type restriction = {
  id: string;
  name: string;
}

type cuisine = {
  id: string;
  name: string;
}

const ALLERGY_TABLE = "Allergy";
const CUISINE_TABLE = "Cuisine";

const restrictionList: restriction[] = [
  { id: "1", name: "vegetarian" },
  { id: "2", name: "gluten-free" },
  { id: "3", name: "peanut-free" },
  { id: "4", name: "tree-nut-free" },
  { id: "5", name: "soy-free" },
  { id: "6", name: "fish-free" },
  { id: "7", name: "shellfish-free" },
  { id: "8", name: "vegan" },
  { id: "9", name: "dairy-free" },
  { id: "10", name: "egg-free" },
  { id: "11", name: "paleo" },
  { id: "12", name: "low sugar" }
];

const cuisineList: cuisine[] = [
  { id: "1", name: "american" },
  { id: "2", name: "asian" },
  { id: "3", name: "italian" },
  { id: "4", name: "nordic" },
  { id: "5", name: "mediterranean" },
  { id: "6", name: "british" },
  { id: "7", name: "chinese" },
  { id: "8", name: "eastern europe" },
  { id: "9", name: "world" },
  { id: "10", name: "middle eastern" },
  { id: "11", name: "indian" },
  { id: "12", name: "mexican" },
  { id: "13", name: "south east asian" },
  { id: "14", name: "french" },
  { id: "15", name: "south american" },
  { id: "16", name: "japanese" },
  { id: "17", name: "central europe" },
  { id: "18", name: "greek" },
  { id: "19", name: "caribbean" },
  { id: "20", name: "korean" },
  { id: "21", name: "kosher" }
];

const cuisine_type = ["american", "asian", "south east asian", "french", "italian", "south american", "world", "mediterranean", "nordic", "british", "chinese", "eastern europe", "middle eastern", "central europe", "mexican", "indian", "japanese", "kosher", "caribbean"];

const cardElement = (text: string) => {
  return (
      <Text style={{textAlign: 'center', fontSize: 18}}>
        {text}
      </Text>
  )
}

export default function Index() {
  const db = useSQLiteContext(); // LET'S SAY YOU WANT TO CALL THE DATABASE, JUST CALL THIS LINE!!
  // LOAD ALLERGEN ID 
  // Show allergends under differnt context

  //Same for cuisines
  const [cuisines, setcuisines] = useState<cuisine[]>(cuisineList);
  const [activeCuisines, setActiveCuisines] = useState<cuisine[]>([]);

  const [restrictions, setRestrictions] = useState<restriction[]>(restrictionList);
  const [activeRestrictions, setActiveRestrictions] = useState<restriction[]>([]);

  const fetchPreferences = async (table: string) => {
    const preferences = await dbFunctions.fetchPreferences(db, table);
    if (table === ALLERGY_TABLE) {
      setActiveRestrictions((preferences as restriction[]) ?? []);
    } else {
      const preferredCuisines = (preferences as restriction[]).map(p => ({id: p.id, name: p.name}));
      setActiveCuisines(preferredCuisines as cuisine[] ?? []);
    }
	};
  
	useEffect(() => {
		const loadPreferences = async () => {
				await fetchPreferences(ALLERGY_TABLE);
				await fetchPreferences(CUISINE_TABLE);
		};
		loadPreferences();
		console.log("Active cuisines:", activeCuisines);
		console.log("Active restrictions:", activeRestrictions);
	}, []);
  
  const handleRestrictionPress = (item: restriction) => {
    if (!activeRestrictions.some(activeRestriction => activeRestriction.id === item.id && activeRestriction.name == item.name)) {
      setActiveRestrictions(items => [...items, item]);
	    dbFunctions.insertPreference(db, ALLERGY_TABLE, item.name, item.id);
    }
  };
  const handleRestrictionLongPress = (item: restriction) => {
    if (activeRestrictions.some(activeRestriction => activeRestriction.id === item.id && activeRestriction.name == item.name)) {
      setActiveRestrictions(activeRestrictions.filter(activeRestriction => activeRestriction.id !== item.id && activeRestriction.name !== item.name));
	    dbFunctions.deletePreference(db, ALLERGY_TABLE, item.id);
		console.log("Active restrictions:", activeRestrictions);
	  }
  };
  const handleCuisinePress = (cuisine: cuisine) => {
    if (!activeCuisines.some(activeCuisine => activeCuisine.id === cuisine.id)) {
      setActiveCuisines(cuisines => [...cuisines, cuisine]);
	    dbFunctions.insertPreference(db, CUISINE_TABLE, cuisine.name, cuisine.id);
		
		
    }
  }
  const handleCuisineLongPress = (cuisine: cuisine) => {
    if (activeCuisines.some(activeCuisine => activeCuisine.id === cuisine.id)) {
      setActiveCuisines(activeCuisines.filter(activeCuisine => activeCuisine.id !== cuisine.id));
	    dbFunctions.deletePreference(db, CUISINE_TABLE, cuisine.id);
		console.log("Active cuisines:", activeCuisines);
    }
  }
  return (
    <View style={{flex: 1, marginTop: 25, marginBottom: 20, flexDirection: 'row', justifyContent: 'center'}}>
      <View style={{alignItems: 'center'}}>
        <Text style={{fontSize: 24, fontWeight: 'bold'}}>Select Preferred Cuisines</Text>
        <FlatList
          data={cuisines}
          keyExtractor={(item) => item.id}
          renderItem={({ item } ) => (
            <ItemCard
              head={cardElement(item.name)}
              isActive={activeCuisines.some(activeCuisine => activeCuisine.name === item.name)}
              onClickCallBack={() => handleCuisinePress(item)}
              onLongClickCallBack={() => handleCuisineLongPress(item)}
              pressableStyle={{ alignItems: 'center', margin: 6, height: 80, minWidth: 225, width: 250, maxWidth: 250, borderWidth: 0, borderRadius: 15}}
              longPressStyle={{ backgroundColor: 'lightblue' }}
            />
          )}
          contentContainerStyle={{alignItems: 'center'}}
          style={{
            flexGrow: 0,
            width: 350,
            shadowColor: '#000',
            shadowOffset: { width: 1, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 6,
            borderRadius: 12, borderWidth: 0, marginTop: 45, marginBottom: 25, marginLeft: 5, marginRight: 30, padding: 10, backgroundColor: 'snow'}}
          ListFooterComponent={<View style={{ height: 20 }} />}
          showsVerticalScrollIndicator={false}
        />
      </View>
      <View style={{alignItems: 'center'}}>
        <Text style={{fontSize: 24, fontWeight: 'bold'}}>Select Food Restrictions</Text>
        <FlatList
          data={restrictions}
          keyExtractor={(item) => item.id }
          renderItem={({ item } ) => (
            <ItemCard
              head={cardElement(item.name)}
              isActive={activeRestrictions.some(activeRestriction => activeRestriction.name === item.name)}
              onClickCallBack={() => handleRestrictionPress(item)}
              onLongClickCallBack={() => handleRestrictionLongPress(item)}
              pressableStyle={{ alignItems: 'center', margin: 6, height: 80, minWidth: 225, width: 250, maxWidth: 250, borderWidth: 0, borderRadius: 15}}
              longPressStyle={{ backgroundColor: 'lightblue' }}
            />
          )}
          contentContainerStyle={{alignItems: 'center'}}
          style={{
            flexGrow: 0,
            width: 350,
            shadowColor: '#000',
            shadowOffset: { width: 1, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 6,
            borderRadius: 12, borderWidth: 0, marginTop: 45, marginBottom: 25, marginLeft: 30, marginRight: 5, padding: 10, backgroundColor: 'snow'}}
          ListFooterComponent={<View style={{ height: 20 }} />}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>  
  );
}
