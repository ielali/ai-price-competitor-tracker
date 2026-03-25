import { getDb } from './init.js';

export function create({ id, competitor_id, tracked_product_id, external_url = null, external_sku = null, is_active = 1 }) {
  getDb().prepare(
    `INSERT INTO competitor_products (id, competitor_id, tracked_product_id, external_url, external_sku, is_active)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(id, competitor_id, tracked_product_id, external_url, external_sku, is_active ? 1 : 0);
  return getById(id);
}

export function getById(id) {
  return getDb().prepare(`SELECT * FROM competitor_products WHERE id = ?`).get(id);
}

export function listByOrg(org_id) {
  return getDb().prepare(`
    SELECT cp.* FROM competitor_products cp
    JOIN competitors c ON c.id = cp.competitor_id
    WHERE c.org_id = ?
    ORDER BY cp.created_at DESC
  `).all(org_id);
}

export function listByCompetitor(competitor_id) {
  return getDb().prepare(
    `SELECT * FROM competitor_products WHERE competitor_id = ? ORDER BY created_at DESC`
  ).all(competitor_id);
}

export function listByTrackedProduct(tracked_product_id, { activeOnly = false } = {}) {
  const sql = activeOnly
    ? `SELECT * FROM competitor_products WHERE tracked_product_id = ? AND is_active = 1`
    : `SELECT * FROM competitor_products WHERE tracked_product_id = ?`;
  return getDb().prepare(sql).all(tracked_product_id);
}

export function update(id, fields) {
  const allowed = ['external_url', 'external_sku', 'last_scraped_at', 'is_active'];
  const entries = Object.entries(fields).filter(([k]) => allowed.includes(k));
  if (entries.length === 0) return getById(id);
  const setClause = entries.map(([k]) => `${k} = ?`).join(', ');
  const values = entries.map(([, v]) => v);
  getDb().prepare(`UPDATE competitor_products SET ${setClause} WHERE id = ?`).run(...values, id);
  return getById(id);
}

export function del(id) {
  return getDb().prepare(`DELETE FROM competitor_products WHERE id = ?`).run(id);
}
