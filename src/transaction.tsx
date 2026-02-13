// import { getDB, SQLITE } from './sqlite_database';

// export const executeTransaction = async (
//   operations: (db: SQLite.SQLiteDatabase) => Promise
// ): Promise => {
//   const db = await getDatabase();

//   try {
//     await db.execAsync('BEGIN TRANSACTION');

//     const result = await operations(db);

//     await db.execAsync('COMMIT');

//     return result;
//   } catch (error) {
//     await db.execAsync('ROLLBACK');
//     throw error;
//   }
// };