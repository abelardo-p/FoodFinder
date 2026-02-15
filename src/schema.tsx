import * as SQLite from 'expo-sqlite';


interface Ingredient {
	name: String;
	id: Number;
	broad_category: String;
	storage: String;
	min_days: Number;
	max_days: Number;
}

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


async function createFoodItemTable(db: SQLite.SQLiteDatabase) {
	await db.execAsync(`
    PRAGMA journal_mode = WAL; 
    CREATE TABLE IF NOT EXISTS FoodItem (
      id INTEGER PRIMARY KEY,
      name TEXT, 
      category TEXT NOT NULL,
      storage TEXT,
      min_days INTEGER,
      max_days INTEGER,

      quantity INTEGER NOT NULL,
      date_purchased TEXT NOT NULL,
      date_opened TEXT NOT NULL
    );
  `);
}

async function insertIntoFoodItem(db: SQLite.SQLiteDatabase, foodObj: Ingredient) {

	// Dummy variables for now:
	const quantity = 0;
	const date_purchased = getCurrFormattedDate();
	const date_opened = getCurrFormattedDate(); 


	const result = await db.runAsync(`
		INSERT INTO local (id, name, category, storage, min_days, max_days, quantity, date_purchased_ date_opened) 
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
		 'aaa', 100, , , , , , 
		 
		 ${quantity}, ${date_purchased}, ${date_opened} 
		`
		)
	console.log(result.lastInsertRowId, result.changes);

}

export async function createTables(db: SQLite.SQLiteDatabase) {
	createFoodItemTable(db);
}