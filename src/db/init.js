import Database from 'better-sqlite3';
import { mkdirSync } from 'fs';
import { dirname } from 'path';
import { config } from 'dotenv';
import { migrate } from './migrate.js';
import { logger } from '../services/logger.js';

config();

let db;

export function getDb() {
  if (!db) {
    const dbPath = process.env.DATABASE_PATH || './data/prices.db';
    if (dbPath !== ':memory:') {
      mkdirSync(dirname(dbPath), { recursive: true });
    }
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    logger.debug('Running database migrations');
    migrate(db);
    logger.debug('Database migrations complete');
  }
  return db;
}

/** For testing only — reset the singleton so a new DB can be opened. */
export function resetDb() {
  if (db) {
    db.close();
    db = null;
  }
}
