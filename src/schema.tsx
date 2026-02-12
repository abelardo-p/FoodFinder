import * as SQLite from 'expo-sqlite';


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

export async function createTables(db: SQLite.SQLiteDatabase) {
	createFoodItemTable(db);
}