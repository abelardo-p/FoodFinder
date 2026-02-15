import { useSQLiteContext } from 'expo-sqlite';
import { View } from "react-native";
import Todos from "../../components/Todos";

const updateFunction = (text: string) => {
  console.log("FML")
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
		<Todos />


		{/* <ItemCard head={<Text style={{fontWeight: '500'}}>Edit app/index.tsx to edit this screen.</Text>}>
		<View>
			<Text>Hidden Content</Text>
		</View>
		</ItemCard> */}
		</View>
  );
}
