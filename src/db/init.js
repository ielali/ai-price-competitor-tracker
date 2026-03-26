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
    migrate(db);
    logger.debug('Running database migrations');
    runMigrations(db);
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

function runMigrations(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      hashed_password TEXT NOT NULL,
      plan_tier TEXT DEFAULT 'free',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS competitors (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      website_url TEXT,
      platform TEXT NOT NULL DEFAULT 'custom',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      sku TEXT,
      our_price INTEGER NOT NULL,
      currency TEXT DEFAULT 'USD',
      category TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS competitor_products (
      id TEXT PRIMARY KEY,
      competitor_id TEXT NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      external_url TEXT,
      external_identifier TEXT,
      last_checked_at TEXT
    );

    CREATE TABLE IF NOT EXISTS price_observations (
      id TEXT PRIMARY KEY,
      competitor_product_id TEXT NOT NULL REFERENCES competitor_products(id) ON DELETE CASCADE,
      price INTEGER NOT NULL,
      currency TEXT DEFAULT 'USD',
      was_on_sale INTEGER DEFAULT 0,
      observed_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS alert_rules (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      rule_type TEXT NOT NULL,
      threshold_value INTEGER,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_competitors_user ON competitors(user_id);
    CREATE INDEX IF NOT EXISTS idx_products_user ON products(user_id);
    CREATE INDEX IF NOT EXISTS idx_cp_competitor ON competitor_products(competitor_id);
    CREATE INDEX IF NOT EXISTS idx_cp_product ON competitor_products(product_id);
    CREATE INDEX IF NOT EXISTS idx_observations_cp ON price_observations(competitor_product_id);
    CREATE INDEX IF NOT EXISTS idx_observations_time ON price_observations(observed_at);
    CREATE INDEX IF NOT EXISTS idx_alerts_user ON alert_rules(user_id);
    CREATE INDEX IF NOT EXISTS idx_alerts_product ON alert_rules(product_id);

    CREATE TABLE IF NOT EXISTS request_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      method TEXT NOT NULL,
      path TEXT NOT NULL,
      status INTEGER,
      duration_ms INTEGER,
      provider TEXT,
      model TEXT,
      stream INTEGER DEFAULT 0,
      key_id TEXT,
      error_type TEXT,
      timestamp TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_request_logs_timestamp ON request_logs(timestamp);
    CREATE INDEX IF NOT EXISTS idx_request_logs_error_type ON request_logs(error_type);
  `);
}
