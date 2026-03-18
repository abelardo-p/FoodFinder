import ItemCardCollapsible from '@/components/ui/item-card-collapsible';
import { useSQLiteContext } from 'expo-sqlite';
import { View, Text, FlatList } from "react-native";

type Meal = {
  id: string;
  name: string;
  ingredients: string[];
};

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

const cardElement = (text: string) => {
  return (
    <Text style={{fontSize: 18}}>
      {text}
    </Text>
  )
}

export default function Index() {
	const db = useSQLiteContext(); // LET'S SAY YOU WANT TO CALL THE DATABASE, JUST CALL THIS LINE!!
  
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
