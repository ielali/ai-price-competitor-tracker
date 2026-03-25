import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(__dirname, '../../migrations');

function ensureMigrationTables(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS migration_locks (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      locked_at TEXT NOT NULL
    );
  `);
}

function acquireLock(db) {
  try {
    db.prepare(`INSERT INTO migration_locks (id, locked_at) VALUES (1, datetime('now'))`).run();
    return true;
  } catch {
    return false;
  }
}

function releaseLock(db) {
  db.prepare(`DELETE FROM migration_locks WHERE id = 1`).run();
}

function getAppliedVersions(db) {
  return db.prepare(`SELECT version FROM schema_migrations ORDER BY version ASC`).all().map(r => r.version);
}

function getMigrationFiles() {
  return readdirSync(MIGRATIONS_DIR)
    .filter(f => /^\d+_.*\.sql$/.test(f))
    .sort();
}

function parseMigration(filename) {
  const content = readFileSync(join(MIGRATIONS_DIR, filename), 'utf8');
  const parts = content.split(/^--\s*Down\s*$/m);
  const up = parts[0].replace(/^--\s*Up\s*$/m, '').trim();
  const down = parts[1] ? parts[1].trim() : '';
  return { up, down };
}

/**
 * Run all pending migrations in order.
 * Uses a lock table to prevent concurrent execution.
 */
export function runMigrations(db) {
  ensureMigrationTables(db);

  if (!acquireLock(db)) {
    throw new Error('Migration lock is held. Migrations may already be running.');
  }

  try {
    const applied = new Set(getAppliedVersions(db));
    const files = getMigrationFiles();

    for (const file of files) {
      const version = file.replace(/\.sql$/, '');
      if (applied.has(version)) continue;

      const { up } = parseMigration(file);
      db.exec(up);
      db.prepare(`INSERT INTO schema_migrations (version) VALUES (?)`).run(version);
    }
  } finally {
    releaseLock(db);
  }
}

/**
 * Roll back the most recently applied migration.
 * Returns the version that was rolled back, or null if nothing to roll back.
 */
export function rollbackMigration(db) {
  ensureMigrationTables(db);

  const applied = getAppliedVersions(db);
  if (applied.length === 0) return null;

  const version = applied[applied.length - 1];
  const file = version + '.sql';
  const { down } = parseMigration(file);

  if (!down) throw new Error(`No down migration defined for ${version}`);

  db.exec(down);
  db.prepare(`DELETE FROM schema_migrations WHERE version = ?`).run(version);
  return version;
}

/**
 * Roll back all applied migrations in reverse order.
 * Leaves the DB in an empty state (only migration infrastructure tables remain).
 */
export function rollbackAll(db) {
  ensureMigrationTables(db);

  const applied = getAppliedVersions(db);

  for (const version of [...applied].reverse()) {
    const file = version + '.sql';
    const { down } = parseMigration(file);

    if (!down) throw new Error(`No down migration defined for ${version}`);

    db.exec(down);
    db.prepare(`DELETE FROM schema_migrations WHERE version = ?`).run(version);
  }
}

/**
 * Return list of applied migration versions.
 */
export function getApplied(db) {
  ensureMigrationTables(db);
  return getAppliedVersions(db);
}
