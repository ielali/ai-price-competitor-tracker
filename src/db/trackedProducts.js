import { getDb } from './init.js';

const VALID_PLATFORMS = ['shopify', 'amazon', 'custom'];

export function create({ id, org_id, name, sku = null, url = null, platform = 'custom', our_price, currency = 'USD', is_active = 1 }) {
  if (!VALID_PLATFORMS.includes(platform)) {
    throw new Error(`Invalid platform "${platform}". Must be one of: ${VALID_PLATFORMS.join(', ')}`);
  }
  getDb().prepare(
    `INSERT INTO tracked_products (id, org_id, name, sku, url, platform, our_price, currency, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(id, org_id, name, sku, url, platform, our_price, currency, is_active ? 1 : 0);
  return getById(id);
}

export function getById(id) {
  return getDb().prepare(`SELECT * FROM tracked_products WHERE id = ?`).get(id);
}

export function listByOrg(org_id, { activeOnly = false } = {}) {
  const sql = activeOnly
    ? `SELECT * FROM tracked_products WHERE org_id = ? AND is_active = 1 ORDER BY created_at DESC`
    : `SELECT * FROM tracked_products WHERE org_id = ? ORDER BY created_at DESC`;
  return getDb().prepare(sql).all(org_id);
}

export function update(id, fields) {
  const allowed = ['name', 'sku', 'url', 'platform', 'our_price', 'currency', 'is_active'];
  if (fields.platform && !VALID_PLATFORMS.includes(fields.platform)) {
    throw new Error(`Invalid platform "${fields.platform}"`);
  }
  const entries = Object.entries(fields).filter(([k]) => allowed.includes(k));
  if (entries.length === 0) return getById(id);
  const now = new Date().toISOString();
  const setClause = [...entries.map(([k]) => `${k} = ?`), 'updated_at = ?'].join(', ');
  const values = [...entries.map(([, v]) => v), now];
  getDb().prepare(`UPDATE tracked_products SET ${setClause} WHERE id = ?`).run(...values, id);
  return getById(id);
}

export function del(id) {
  return getDb().prepare(`DELETE FROM tracked_products WHERE id = ?`).run(id);
}
