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

	const machineIP: string = '127.0.0.1';
	await db.execAsync(`
		PRAGMA journal_mode = WAL; 
		CREATE TABLE IF NOT EXISTS User (
			id TEXT PRIMARY KEY 
		);
  	`);

	const userExists = async (db: SQLite.SQLiteDatabase) => {
		let exists = await db.getAllAsync('SELECT * FROM User');

		// if zero rows, that means no user exists so we call the endpoint from the backend
		if (exists.length === 0) {

			console.log("No user exists, calling endpoint");

			const addUser = async () => {
				const response = await fetch(`http://${machineIP}:8000/add_user`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					},
				});
				const userId = await response.json();
				return userId;
			};

			const userId = await addUser();

			await db.runAsync('INSERT INTO User (id) VALUES (?);', [userId]);
		} else {
			console.table(exists);
		}
	}

	userExists(db);

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
	await db.execAsync(`DROP TABLE IF EXISTS User;`);
//	await db.execAsync(`DROP TABLE IF EXISTS Allergy;`);
//  await db.execAsync(`DROP TABLE IF EXISTS Cuisine;`);
}




export async function createTables(db: SQLite.SQLiteDatabase) {
	await createUser(db);
	await createFoodItemTable(db);
	await createFoodStorageTable(db);
	await createPreferenceTables(db);
}