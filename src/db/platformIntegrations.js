import { getDb } from './init.js';
import { encrypt, decrypt } from './encryption.js';

const VALID_PLATFORMS = ['shopify', 'amazon', 'custom'];

export function create({ id, org_id, platform, access_token = null, refresh_token = null, shop_domain = null, expires_at = null, is_active = 1 }) {
  if (!VALID_PLATFORMS.includes(platform)) {
    throw new Error(`Invalid platform "${platform}". Must be one of: ${VALID_PLATFORMS.join(', ')}`);
  }
  getDb().prepare(
    `INSERT INTO platform_integrations (id, org_id, platform, access_token_encrypted, refresh_token_encrypted, shop_domain, expires_at, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    org_id,
    platform,
    encrypt(access_token),
    encrypt(refresh_token),
    shop_domain,
    expires_at,
    is_active ? 1 : 0
  );
  return getById(id);
}

export function getById(id) {
  return getDb().prepare(`SELECT * FROM platform_integrations WHERE id = ?`).get(id);
}

/** Get a record with tokens decrypted. */
export function getByIdDecrypted(id) {
  const row = getById(id);
  if (!row) return null;
  return {
    ...row,
    access_token: decrypt(row.access_token_encrypted),
    refresh_token: decrypt(row.refresh_token_encrypted),
  };
}

export function listByOrg(org_id) {
  return getDb().prepare(
    `SELECT * FROM platform_integrations WHERE org_id = ? ORDER BY created_at DESC`
  ).all(org_id);
}

export function update(id, fields) {
  const allowed = ['shop_domain', 'expires_at', 'is_active'];
  const entries = Object.entries(fields).filter(([k]) => allowed.includes(k));

  // Handle token updates separately (need encryption)
  const tokenUpdates = [];
  if (fields.access_token !== undefined) {
    tokenUpdates.push(['access_token_encrypted', encrypt(fields.access_token)]);
  }
  if (fields.refresh_token !== undefined) {
    tokenUpdates.push(['refresh_token_encrypted', encrypt(fields.refresh_token)]);
  }

  const allEntries = [...entries, ...tokenUpdates];
  if (allEntries.length === 0) return getById(id);
  const setClause = allEntries.map(([k]) => `${k} = ?`).join(', ');
  const values = allEntries.map(([, v]) => v);
  getDb().prepare(`UPDATE platform_integrations SET ${setClause} WHERE id = ?`).run(...values, id);
  return getById(id);
}

export function del(id) {
  return getDb().prepare(`DELETE FROM platform_integrations WHERE id = ?`).run(id);
}
