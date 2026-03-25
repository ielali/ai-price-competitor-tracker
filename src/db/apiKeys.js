import { randomBytes } from 'crypto';
import { getDb } from './init.js';
import { hashApiKey } from './encryption.js';

/**
 * Generate and store a new API key.
 * The raw key is returned exactly once — it cannot be retrieved again.
 * @returns { record, rawKey } — record is the stored row, rawKey is the one-time plaintext key
 */
export function create({ id, org_id, label = null, scopes = null, expires_at = null }) {
  const rawKey = `sk_${randomBytes(32).toString('hex')}`;
  const key_hash = hashApiKey(rawKey);
  const scopesStr = Array.isArray(scopes) ? scopes.join(',') : (scopes ?? null);

  getDb().prepare(
    `INSERT INTO api_keys (id, org_id, key_hash, label, scopes, expires_at) VALUES (?, ?, ?, ?, ?, ?)`
  ).run(id, org_id, key_hash, label, scopesStr, expires_at);

  return { record: getById(id), rawKey };
}

export function getById(id) {
  return getDb().prepare(
    `SELECT id, org_id, label, scopes, last_used_at, expires_at, created_at FROM api_keys WHERE id = ?`
  ).get(id);
}

/** Verify a raw key against stored hashes for an org.
 *  Uses composite index idx_api_keys_hash_org for efficient lookup.
 *  Returns the matching record or null.
 */
export function verify(rawKey, org_id) {
  const hash = hashApiKey(rawKey);
  const row = getDb().prepare(
    `SELECT * FROM api_keys WHERE key_hash = ? AND org_id = ? AND (expires_at IS NULL OR expires_at > datetime('now'))`
  ).get(hash, org_id) ?? null;
  if (!row) return null;
  getDb().prepare(`UPDATE api_keys SET last_used_at = datetime('now') WHERE id = ?`).run(row.id);
  return row;
}

export function listByOrg(org_id) {
  // Intentionally excludes key_hash to prevent accidental exposure
  return getDb().prepare(
    `SELECT id, org_id, label, scopes, last_used_at, expires_at, created_at FROM api_keys WHERE org_id = ? ORDER BY created_at DESC`
  ).all(org_id);
}

export function recordUsage(id) {
  const now = new Date().toISOString();
  getDb().prepare(`UPDATE api_keys SET last_used_at = ? WHERE id = ?`).run(now, id);
}

export function del(id) {
  return getDb().prepare(`DELETE FROM api_keys WHERE id = ?`).run(id);
}
