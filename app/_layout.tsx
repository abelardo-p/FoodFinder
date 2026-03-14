import { Stack } from "expo-router";
import { SQLiteProvider } from 'expo-sqlite';
import { createTables } from '../src/schema';



export default function RootLayout() {
  return (
	// Provider let's us call this database in other files by just using the context instead! Since it wraps around everything, all children
	// should have access to the database
	<SQLiteProvider databaseName="locals.db" onInit={createTables}>
		<Stack>
		<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
		</Stack>
    </SQLiteProvider>
  );
}
