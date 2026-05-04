import * as SQLite from 'expo-sqlite';

import {
  CREATE_CYCLES_TABLE,
  CREATE_DAILY_LOGS_TABLE,
  CREATE_INDEXES,
  CREATE_SETTINGS_TABLE,
  DB_NAME,
} from './schema';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function runMigrations(
  db: SQLite.SQLiteDatabase
): Promise<void> {
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync('PRAGMA foreign_keys = ON;');

  const version = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version'
  );
  const currentVersion = version?.user_version ?? 0;

  if (currentVersion < 1) {
    await db.execAsync(CREATE_CYCLES_TABLE);
    await db.execAsync(CREATE_DAILY_LOGS_TABLE);
    await db.execAsync(CREATE_SETTINGS_TABLE);
    await db.execAsync(CREATE_INDEXES);
    await db.execAsync('PRAGMA user_version = 1');
  }
}

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) return dbInstance;
  dbInstance = await SQLite.openDatabaseAsync(DB_NAME);
  await runMigrations(dbInstance);
  return dbInstance;
}

export async function resetDatabase(
  db: SQLite.SQLiteDatabase
): Promise<void> {
  await db.execAsync('DROP TABLE IF EXISTS daily_logs');
  await db.execAsync('DROP TABLE IF EXISTS cycles');
  await db.execAsync('DROP TABLE IF EXISTS settings');
  await db.execAsync('PRAGMA user_version = 0');
  await runMigrations(db);
}
