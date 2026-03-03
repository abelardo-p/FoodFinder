import * as SQLite from 'expo-sqlite';


interface StorageOption {
  storage: string;
  min_days: number;
  max_days: number;
}

interface FoodItem {
  name: string;
  category: string;
  storage_type: StorageOption[];
}

interface FoodData {
  [id: string]: FoodItem;
}

interface IngredientStorage {
	id: string;
	storage: string;
	min_days: number;
	max_days: number;
}

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
  		let allRows = await db.getAllAsync('SELECT * FROM FoodItem');
	
		if (allRows.length === 0) {
			console.log("Table empty");
		} else {
			console.table(allRows);
		}

		allRows = await db.getAllAsync('SELECT * FROM FoodStorage');
	
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
	// deleteAllTablesFromDB(db);

	await db.execAsync(`
		PRAGMA journal_mode = WAL; 
		CREATE TABLE IF NOT EXISTS FoodItem (
			id TEXT PRIMARY KEY,
			name TEXT, 
			category TEXT NOT NULL,
			storage TEXT,
			minDays INTEGER,
			maxDays INTEGER,

			quantity INTEGER NOT NULL,
			datePurchased TEXT NOT NULL,
			dateOpened TEXT NOT NULL,
			keyword TEXT
		);
  	`);

	await db.execAsync(`
		PRAGMA journal_mode = WAL; 
		CREATE TABLE IF NOT EXISTS FoodStorage (
			id TEXT,
			storage TEXT,
			minDays INTEGER,
			maxDays INTEGER,
			PRIMARY KEY (id, storage),
    		FOREIGN KEY (id) REFERENCES FoodItem(id)
		);
  	`);

	// insertIntoFoodItem(db);
	printTable(db);

}

// Used for debugging
async function deleteAllTablesFromDB(db: SQLite.SQLiteDatabase) {
	await db.execAsync(`DROP TABLE IF EXISTS FoodItem;`);
	await db.execAsync(`DROP TABLE IF EXISTS FoodStorage;`);
}

export async function deleteItemFromDB(id: number, db: SQLite.SQLiteDatabase) {
	try {
		await db.runAsync('DELETE FROM FoodItem WHERE id = $value', { $value: id });
		await db.runAsync('DELETE FROM FoodStorage WHERE id = $value', { $value: id });
	} catch (error) {
		console.error("Deletion failed", error)
	}
}

export async function fetchItemsForPantry(db: SQLite.SQLiteDatabase) {

	try {
      return await db.getAllAsync('SELECT id, name, keyword, quantity FROM FoodItem');

    } catch (error) {
      console.error("Failed to fetch items", error);
    }
}

export async function insertIntoFoodItem(db: SQLite.SQLiteDatabase, id: string, foodObj: FoodData, keyword: string) {

	// Dummy variables for now:
	const quantity = 1;
	const datePurchased = getCurrFormattedDate(); // ASSUMED THAT ADDED DATE IS PURCHASED DATE
	const dateOpened = getCurrFormattedDate(); // TODO: THIS IS STILL A DUMMY VARIABLE



	const foodItemInsertion = await db.prepareAsync(`
  		INSERT INTO FoodItem (id, name, category, quantity, datePurchased, dateOpened, keyword) 
		VALUES ($foodID, $foodName, $foodCat, $quantity, $datePurchased, $dateOpened, $keyword)
		ON CONFLICT (id)
		DO 
			UPDATE 
			SET quantity = quantity + 1;
	`);

	const foodStorageInsertion = await db.prepareAsync(`
  		INSERT OR IGNORE INTO FoodStorage (id, storage, minDays, maxDays) 
		VALUES ($foodID, $storage, $minDays, $maxDays)
	`);

	try {
		let result = await foodItemInsertion.executeAsync({ 
			$foodID: id, 
			$foodName: foodObj[id].name,
			$foodCat: foodObj[id].category,
			$quantity: quantity, // This should get overwritten since it goes through the CONFLICT clause instead
			$datePurchased: datePurchased,
			$dateOpened: dateOpened,
			$keyword: keyword
		});
		
		console.log(result.lastInsertRowId, result.changes);

		const storageOptions = foodObj[id].storage_type;

		for (const storageType of storageOptions) {
			let result = await foodStorageInsertion.executeAsync({
				$foodID: id,
				$storage: storageType.storage,
				$minDays: storageType.min_days,
				$maxDays: storageType.max_days,
			});
			console.log(result.lastInsertRowId, result.changes);

		}

	} catch (error) {
		console.log(error);
	} finally {
		await foodItemInsertion.finalizeAsync();
		await foodStorageInsertion.finalizeAsync();
	}

}

export async function createTables(db: SQLite.SQLiteDatabase) {
	createFoodItemTable(db);
}