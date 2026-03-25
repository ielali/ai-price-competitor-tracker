import { getDb } from './init.js';

export function create({ id, competitor_id, product_id, external_url, external_identifier }) {
  const db = getDb();
  db.prepare(
    `INSERT INTO competitor_products (id, competitor_id, product_id, external_url, external_identifier) VALUES (?, ?, ?, ?, ?)`
  ).run(id, competitor_id, product_id, external_url ?? null, external_identifier ?? null);
  return getById(id);
}

export function getById(id) {
  return getDb().prepare(`SELECT * FROM competitor_products WHERE id = ?`).get(id);
}

export function listByUser(user_id) {
  return getDb().prepare(`
    SELECT cp.* FROM competitor_products cp
    JOIN competitors c ON c.id = cp.competitor_id
    WHERE c.user_id = ?
    ORDER BY cp.last_checked_at DESC
  `).all(user_id);
}

export function listByCompetitor(competitor_id) {
  return getDb().prepare(`SELECT * FROM competitor_products WHERE competitor_id = ?`).all(competitor_id);
}

export function listByProduct(product_id) {
  return getDb().prepare(`SELECT * FROM competitor_products WHERE product_id = ?`).all(product_id);
}

export function update(id, fields) {
  const allowed = ['external_url', 'external_identifier', 'last_checked_at'];
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
