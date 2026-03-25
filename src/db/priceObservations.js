import { getDb } from './init.js';

export function create({ id, competitor_product_id, price, currency = 'USD', was_on_sale = 0, observed_at }) {
  const db = getDb();
  const params = [id, competitor_product_id, price, currency, was_on_sale ? 1 : 0];
  let sql = `INSERT INTO price_observations (id, competitor_product_id, price, currency, was_on_sale`;
  if (observed_at) {
    sql += `, observed_at) VALUES (?, ?, ?, ?, ?, ?)`;
    params.push(observed_at);
  } else {
    sql += `) VALUES (?, ?, ?, ?, ?)`;
  }
  db.prepare(sql).run(...params);
  return getById(id);
}

export function getById(id) {
  return getDb().prepare(`SELECT * FROM price_observations WHERE id = ?`).get(id);
}

export function listByCompetitorProduct(competitor_product_id, { limit = 100 } = {}) {
  return getDb().prepare(
    `SELECT * FROM price_observations WHERE competitor_product_id = ? ORDER BY observed_at DESC LIMIT ?`
  ).all(competitor_product_id, limit);
}

export function listByUser(user_id, { limit = 500 } = {}) {
  return getDb().prepare(`
    SELECT po.* FROM price_observations po
    JOIN competitor_products cp ON cp.id = po.competitor_product_id
    JOIN competitors c ON c.id = cp.competitor_id
    WHERE c.user_id = ?
    ORDER BY po.observed_at DESC
    LIMIT ?
  `).all(user_id, limit);
}

export function update(id, fields) {
  const allowed = ['price', 'currency', 'was_on_sale', 'observed_at'];
  const entries = Object.entries(fields).filter(([k]) => allowed.includes(k));
  if (entries.length === 0) return getById(id);
  const setClause = entries.map(([k]) => `${k} = ?`).join(', ');
  const values = entries.map(([, v]) => v);
  getDb().prepare(`UPDATE price_observations SET ${setClause} WHERE id = ?`).run(...values, id);
  return getById(id);
}

export function del(id) {
  return getDb().prepare(`DELETE FROM price_observations WHERE id = ?`).run(id);
}
