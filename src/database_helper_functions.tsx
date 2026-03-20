import * as SQLite from 'expo-sqlite';


interface StorageOption {
  state: string;
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


// returns in this format: MM/DD/YYYY
const getCurrFormattedDate = () => {
  const today = new Date();
  // getMonth starts at index 0
  const month = String(today.getMonth() + 1).padStart(2, '0'); 
  const year = today.getFullYear();
  const date = String(today.getDate()).padStart(2, '0');
  console.log(`${month}/${date}/${year}`);
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

		allRows = await db.getAllAsync('SELECT * FROM Allergy');
		if (allRows.length === 0) {
			console.log("Table empty");
		} else {
			console.table(allRows);
		}

		allRows = await db.getAllAsync('SELECT * FROM Cuisine');
		if (allRows.length === 0) {
			console.log("Table empty");
		} else {
			console.table(allRows);
		}


	} catch (error) {
		console.error("Could not fetch data:", error);
	}

}

// await insert_preference(db, CUISINE_TABLE, CUISINE_COL, "italian");
export const insertPreference = async (db: SQLite.SQLiteDatabase, table: string, id: number, value: string) => {
	await db.runAsync(`INSERT OR IGNORE INTO ${table} (id, name) VALUES (?, ?);`, [id, value]);
}

export const deletePreference = async (db: SQLite.SQLiteDatabase, table: string, value: string) => {
    await db.runAsync(`DELETE FROM ${table} WHERE name = ?;`, [value]);
}

export const fetchPreferences = async (db: SQLite.SQLiteDatabase, table: string) => {
	try {
		return await db.getAllAsync(`SELECT id, name FROM ${table};`);
	} catch (error) {
		console.error("Failed to fetch preferences", error);
		return [];
	}
}

// delete_preference(db, CUISINE_TABLE, CUISINE_COL, "italian");
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
      return await db.getAllAsync('SELECT * FROM FoodItem');

    } catch (error) {
      console.error("Failed to fetch items", error);
    }


	
}

export async function insertIntoFoodItem(db: SQLite.SQLiteDatabase, id: string, foodObj: FoodData, 
											keyword: string, datePurchased: string, dateOpened: string | null) {

	// Dummy variables for now:
	const quantity = 1;
	if (dateOpened && dateOpened.length == 0) {
		dateOpened = null
	}
	// const datePurchased = getCurrFormattedDate(); // ASSUMED THAT ADDED DATE IS PURCHASED DATE
	// const dateOpened = null; // TODO: THIS IS STILL A DUMMY VARIABLE

	const foodItemInsertion = await db.prepareAsync(`
  		INSERT INTO FoodItem (id, name, category, quantity, datePurchased, dateOpened, keyword) 
		VALUES ($foodID, $foodName, $foodCat, $quantity, $datePurchased, $dateOpened, $keyword)
		ON CONFLICT (id)
		DO 
			UPDATE 
			SET quantity = quantity + 1;
	`);
	const foodStorageInsertion = await db.prepareAsync(`
  		INSERT OR IGNORE INTO FoodStorage (id, storage, state, minDays, maxDays) 
		VALUES ($foodID, $storage, $state, $minDays, $maxDays)
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
				$state: storageType.state,
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

// export async function insertIntoFoodItem(db: SQLite.SQLiteDatabase, id: string, foodObj: FoodData, 
// 											keyword: string, datePurchased: string, dateOpened: string | null,
// 												storageOption: string) {

// 	// Dummy variables for now:
// 	const quantity = 1;
// 	if (dateOpened && dateOpened.length == 0) {
// 		dateOpened = null
// 	}
// 	// const datePurchased = getCurrFormattedDate(); // ASSUMED THAT ADDED DATE IS PURCHASED DATE
// 	// const dateOpened = null; // TODO: THIS IS STILL A DUMMY VARIABLE

// 	const foodItemInsertion = await db.prepareAsync(`
//   		INSERT INTO FoodItem (id, name, category, quantity, datePurchased, dateOpened, keyword) 
// 		VALUES ($foodID, $foodName, $foodCat, $quantity, $datePurchased, $dateOpened, $keyword)
// 		ON CONFLICT (id)
// 		DO 
// 			UPDATE 
// 			SET quantity = quantity + 1;
// 	`);
// 	const foodStorageInsertion = await db.prepareAsync(`
//   		INSERT OR IGNORE INTO FoodStorage (id, storage, state, minDays, maxDays) 
// 		VALUES ($foodID, $storage, $state, $minDays, $maxDays)
// 	`);

// 	try {
// 		let result = await foodItemInsertion.executeAsync({ 
// 			$foodID: id, 
// 			$foodName: foodObj[id].name,
// 			$foodCat: foodObj[id].category,
// 			$quantity: quantity, // This should get overwritten since it goes through the CONFLICT clause instead
// 			$datePurchased: datePurchased,
// 			$dateOpened: dateOpened,
// 			$keyword: keyword
// 		});

// 		const storageOptions = foodObj[id].storage_type;

// 		for (const storageType of storageOptions) {
// 			result = await foodStorageInsertion.executeAsync({
// 			$foodID: id,
// 			$storage: storageType.storage,
// 			$state: storageType.state,
// 			$minDays: storageType.min_days,
// 			$maxDays: storageType.max_days,

// 		});

// 		// console.log(result.lastInsertRowId, result.changes);
// 		// const storageOptions = foodObj[id].storage_type;
// 		// console.log(storageOptions);
// 		// console.log("kkkkkkkkkkkkk", dateOpened, ',', storageOption);
// 		// let storage = storageOption;
// 		// let state = null;
// 		// if (dateOpened == null || dateOpened === '') {
// 		// 	state = 'UNOPENED';
// 		// } else {
// 		// 	state = 'OPEN';
// 		// }
// 		// let option = storageOptions.find((storageType) => storageType['storage'] === storage && storageType['state'] === state);
// 		// console.log(option)
// 		// if (option) {
// 		// 	result = await foodStorageInsertion.executeAsync({
// 		// 	$foodID: id,
// 		// 	$storage: storage,
// 		// 	$state: state,
// 		// 	$minDays: option['min_days'],
// 		// 	$maxDays: option['max_days'],
// 		// 	});
// 		// 	console.log("hello1", result.lastInsertRowId, result.changes);
// 		// } else {
// 		// 	result = await foodStorageInsertion.executeAsync({
// 		// 	$foodID: id,
// 		// 	$storage:  null,
// 		// 	$state:  "OPEN",
// 		// 	$minDays: 0,
// 		// 	$maxDays: 0,
// 		// 	});
// 		// 	console.log("hello2", result.lastInsertRowId, result.changes);
// 		// }

	
// 		// result = await foodStorageInsertion.executeAsync({
// 		// 	$foodID: id,
// 		// 	$storage: storageType.storage,
// 		// 	$state: storageType.state,
// 		// 	$minDays: storageType.min_days,
// 		// 	$maxDays: storageType.max_days,
// 		// });
// 		// console.log(result.lastInsertRowId, result.changes);

// 		// }

// 	} catch (error) {
// 		console.log(error);
// 	} finally {
// 		await foodItemInsertion.finalizeAsync();
// 		await foodStorageInsertion.finalizeAsync();
// 	}

// }