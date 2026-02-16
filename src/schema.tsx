import * as SQLite from 'expo-sqlite';

interface Ingredient {
	name: string;
	id: string;
	broad_category: string;
	storage: string;
	min_days: Number;
	max_days: Number;
}

const defaultConfig: Ingredient = {
  name: 'omomo',
  id: '1',
  broad_category: 'bruh',
  storage: 'bruh',
  min_days: 0,
  max_days: 0,
};

/*
Food Item Table:
int FoodId (pk)
varchar category
varchar name
varchar storage // sqlite doesn't have an enum type
int min_days
int max_days

(These are updated when user adds item or updates quantity)
int quantity
date purchased // sqlite doesn't have date types; use a built-in function to format it properly
date opened
*/

// returns in this format: MM/DD/YYYY
const getCurrFormattedDate = () => {
  const today = new Date();
  // getMonth starts at index 0
  const month = String(today.getMonth() + 1).padStart(2, '0'); 
  const year = today.getFullYear();
  const date = String(today.getDate()).padStart(2, '0');

  return `${month}/${date}/${year}`; 
};

export const printTable = async (db: SQLite.SQLiteDatabase) => {
	try {
  		const allRows = await db.getAllAsync('SELECT * FROM FoodItem');
	
		if (allRows.length === 0) {
			console.log("Table empty");
		} else {
			console.table(allRows);
		}

	} catch (error) {
		console.error("Could not fetch data:", error);
	}

}


async function createFoodItemTable(db: SQLite.SQLiteDatabase) {
	await db.execAsync(`
		PRAGMA journal_mode = WAL; 
		CREATE TABLE IF NOT EXISTS FoodItem (
		id INTEGER PRIMARY KEY,
		name TEXT, 
		category TEXT NOT NULL,
		storage TEXT,
		minDays INTEGER,
		maxDays INTEGER,

		quantity INTEGER NOT NULL,
		datePurchased TEXT NOT NULL,
		dateOpened TEXT NOT NULL
		);
  	`);

	// insertIntoFoodItem(db);
	printTable(db);

}

export async function deleteItemFromDB(id: string, db: SQLite.SQLiteDatabase) {
	try {
		await db.runAsync('DELETE FROM FoodItem WHERE id = $value', { $value: id })
	} catch (error) {
		console.error("Deletion failed", error)
	}
}

export async function fetchItemsForPantry(db: SQLite.SQLiteDatabase) {

	try {
      return await db.getAllAsync('SELECT id, name FROM FoodItem');

    } catch (error) {
      console.error("Failed to fetch items", error);
    }
}

export async function insertIntoFoodItem(db: SQLite.SQLiteDatabase, foodObj: Ingredient = defaultConfig) {

	// Dummy variables for now:
	const quantity = 0;
	const datePurchased = getCurrFormattedDate();
	const dateOpened = getCurrFormattedDate(); 



	const statement = await db.prepareAsync(`
  		INSERT INTO FoodItem (id, name, category, storage, minDays, maxDays, quantity, datePurchased, dateOpened) 
		VALUES ($foodID, $foodName, $foodCat, $foodStor, $minDays, $maxDays, $quantity, $datePurchased, $dateOpened)
	`);

	try {
		let result = await statement.executeAsync({ 
			$foodID: '100', 
			$foodName: 'omomo',
			$foodCat: 'bruh',
			$foodStor: 'bruh',
			$minDays: 0,
			$maxDays: 0,
			$quantity: 1,
			$datePurchased: datePurchased,
			$dateOpened: dateOpened,
		});
		console.log(result.lastInsertRowId, result.changes);
	} catch (error) {
		console.log(error);
	} finally {
		await statement.finalizeAsync();
	}

}

export async function createTables(db: SQLite.SQLiteDatabase) {
	createFoodItemTable(db);
}