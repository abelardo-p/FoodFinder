import ItemCardCollapsible from '@/components/ui/item-card-collapsible';
import { useSQLiteContext } from 'expo-sqlite';
import { View, Text, FlatList } from "react-native";

type Item = {
  id: string;
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
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item } ) => (
          <ItemCardCollapsible
            head={cardElement(item.name)}
            onPress={() => {}}
            pressableStyle={{ alignItems: 'flex-start', margin: 5, height: 80, minWidth: 250, maxWidth: 250, borderWidth: 0, borderRadius: 15}}
          />
        )}
        style={{ shadowColor: '#000',
            shadowOffset: { width: 1, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 6,
            borderRadius: 12, borderWidth: 0, marginTop: 50, marginBottom: 25, marginLeft: 3, marginRight: 3, padding: 10, backgroundColor: 'snow'}}
        showsVerticalScrollIndicator={false}
			/>		
		</View>
  );
}
