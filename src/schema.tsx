import * as SQLite from 'expo-sqlite';


async function createFoodItemTable(db: SQLite.SQLiteDatabase) {

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
			dateOpened TEXT,
			keyword TEXT
		);
  	`);

}


async function createUser(db: SQLite.SQLiteDatabase) {

	await db.execAsync(`
		PRAGMA journal_mode = WAL; 
		CREATE TABLE IF NOT EXISTS User (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL 
		);
  	`);

}

async function createPreferenceTables(db: SQLite.SQLiteDatabase) {
	await db.execAsync(`
		PRAGMA journal_mode = WAL; 
		CREATE TABLE IF NOT EXISTS Allergy (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL UNIQUE
		);
		CREATE TABLE IF NOT EXISTS Cuisine (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL UNIQUE
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
	await db.execAsync(`DROP TABLE IF EXISTS Allergy;`);
	await db.execAsync(`DROP TABLE IF EXISTS Cuisine;`);
}




export async function createTables(db: SQLite.SQLiteDatabase) {
	await createFoodItemTable(db);
	await createFoodStorageTable(db);
	await createPreferenceTables(db);
}