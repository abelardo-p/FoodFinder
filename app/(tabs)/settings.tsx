import ItemCardCollapsible from '@/components/ui/item-card-collapsible';
import ItemCard from '@/components/ui/item-card';

import { useSQLiteContext } from 'expo-sqlite';
import { View, Text, FlatList } from "react-native";
import { useState } from 'react';

type restriction = {
  id: string;
  name: string;
};

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
  const [cuisines, setcuisines] = useState<string[]>(cuisine_type);
  const [activeCuisines, setActiveCuisines] = useState<string[]>([]);

  const [restrictions, setRestrictions] = useState<restriction[]>(restrictionList);
  const [activeRestrictions, setActiveRestrictions] = useState<restriction[]>([]);
  
  const handleRestrictionPress = (item: restriction) => {
    if (!activeRestrictions.some(activeRestriction => activeRestriction.id === item.id && activeRestriction.name == item.name)) {
      setActiveRestrictions(items => [...items, item]);
    }
  };
  const handleRestrictionLongPress = (item: restriction) => {
    if (activeRestrictions.some(activeRestriction => activeRestriction.id === item.id && activeRestriction.name == item.name)) {
      setActiveRestrictions(activeRestrictions.filter(activeRestriction => activeRestriction.id !== item.id && activeRestriction.name !== item.name));
    }
  };
  const handleCuisinePress = (cuisine: string) => {
    if (!activeCuisines.some(activeCuisine => activeCuisine === cuisine)) {
      setActiveCuisines(cuisines => [...cuisines, cuisine]);
    }
  }
  const handleCuisineLongPress = (cuisine: string) => {
    if (activeCuisines.some(activeCuisine => activeCuisine === cuisine)) {
      setActiveCuisines(activeCuisines.filter(activeCuisine => activeCuisine !== cuisine));
    }
  }
  return (
    <View style={{flex: 1, marginTop: 25, marginBottom: 20, flexDirection: 'row', justifyContent: 'center'}}>
      <FlatList
        data={cuisines}
        keyExtractor={(item) => item}
        renderItem={({ item } ) => (
          <ItemCard
            head={cardElement(item)}
            isActive={activeCuisines.includes(item)}
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
          borderRadius: 12, borderWidth: 0, marginTop: 70, marginBottom: 25, marginLeft: 5, marginRight: 30, padding: 10, backgroundColor: 'snow'}}
        ListFooterComponent={<View style={{ height: 20 }} />}
        showsVerticalScrollIndicator={false}
      />
      <FlatList
        data={restrictions}
        keyExtractor={(item) => item.id }
        renderItem={({ item } ) => (
          <ItemCard
            head={cardElement(item.name)}
            isActive={activeRestrictions.some(activeRestriction => activeRestriction.id === item.id && activeRestriction.name === item.name)}
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
          borderRadius: 12, borderWidth: 0, marginTop: 70, marginBottom: 25, marginLeft: 30, marginRight: 5, padding: 10, backgroundColor: 'snow'}}
        ListFooterComponent={<View style={{ height: 20 }} />}
        showsVerticalScrollIndicator={false}
      />
    </View>  
  );
}
