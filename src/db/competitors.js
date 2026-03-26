import { getDb } from './init.js';

const VALID_PLATFORMS = ['shopify', 'amazon', 'custom'];

export function create({ id, org_id, name, domain = null, platform = 'custom' }) {
  if (!VALID_PLATFORMS.includes(platform)) {
    throw new Error(`Invalid platform "${platform}". Must be one of: ${VALID_PLATFORMS.join(', ')}`);
  }
  getDb().prepare(
    `INSERT INTO competitors (id, org_id, name, domain, platform) VALUES (?, ?, ?, ?, ?)`
  ).run(id, org_id, name, domain, platform);
  return getById(id);
}

export function getById(id) {
  return getDb().prepare(`SELECT * FROM competitors WHERE id = ?`).get(id);
}

export function listByOrg(org_id) {
  return getDb().prepare(
    `SELECT * FROM competitors WHERE org_id = ? ORDER BY created_at DESC`
  ).all(org_id);
}

export function update(id, fields) {
  const allowed = ['name', 'domain', 'platform'];
  if (fields.platform && !VALID_PLATFORMS.includes(fields.platform)) {
    throw new Error(`Invalid platform "${fields.platform}"`);
  }
  const entries = Object.entries(fields).filter(([k]) => allowed.includes(k));
  if (entries.length === 0) return getById(id);
  const setClause = entries.map(([k]) => `${k} = ?`).join(', ');
  const values = entries.map(([, v]) => v);
  getDb().prepare(`UPDATE competitors SET ${setClause} WHERE id = ?`).run(...values, id);
  return getById(id);
}

export function del(id) {
  return getDb().prepare(`DELETE FROM competitors WHERE id = ?`).run(id);
}
