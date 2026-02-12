import ItemCard from "@/components/ui/item-card";
import { SQLiteProvider, useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';
import { Text, View } from "react-native";
import Todos from "../../components/Todos";

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
		<Todos />


		<ItemCard head={<Text style={{fontWeight: '500'}}>Edit app/index.tsx to edit this screen.</Text>}>
		<View>
			<Text>Hidden Content</Text>
		</View>
		</ItemCard>
		</View>
  );
}
