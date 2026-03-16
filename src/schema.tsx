import * as SQLite from 'expo-sqlite';


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

}

async function createPreferenceTables(db: SQLite.SQLiteDatabase) {
	await db.execAsync(`
		PRAGMA journal_mode = WAL; 
		CREATE TABLE IF NOT EXISTS Allergy (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			allergy TEXT NOT NULL UNIQUE
		);
		CREATE TABLE IF NOT EXISTS Cuisine (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			cuisine TEXT NOT NULL UNIQUE
		);
  	`);
}

async function createFoodStorageTable(db: SQLite.SQLiteDatabase) {
	// Added state field (Opened / unopened)
	await db.execAsync(`
		PRAGMA journal_mode = WAL; 
		CREATE TABLE IF NOT EXISTS FoodStorage (
			id TEXT,
			storage TEXT,
			state TEXT,				
			minDays INTEGER,
			maxDays INTEGER,
			PRIMARY KEY (id, storage, state),
    		FOREIGN KEY (id) REFERENCES FoodItem(id)
		);
  	`);
}

// Used for debugging
async function deleteAllTablesFromDB(db: SQLite.SQLiteDatabase) {
	await db.execAsync(`DROP TABLE IF EXISTS *;`);
}




export async function createTables(db: SQLite.SQLiteDatabase) {
	await createFoodItemTable(db);
	await createFoodStorageTable(db);
	await createPreferenceTables(db);
}