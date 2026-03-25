import { getDb } from './init.js';

export function create({ id, user_id, name, sku, our_price, currency = 'USD', category }) {
  const db = getDb();
  db.prepare(
    `INSERT INTO products (id, user_id, name, sku, our_price, currency, category) VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(id, user_id, name, sku ?? null, our_price, currency, category ?? null);
  return getById(id);
}

export function getById(id) {
  return getDb().prepare(`SELECT * FROM products WHERE id = ?`).get(id);
}

export function listByUser(user_id) {
  return getDb().prepare(`SELECT * FROM products WHERE user_id = ? ORDER BY created_at DESC`).all(user_id);
}

export function update(id, fields) {
  const allowed = ['name', 'sku', 'our_price', 'currency', 'category'];
  const entries = Object.entries(fields).filter(([k]) => allowed.includes(k));
  if (entries.length === 0) return getById(id);
  const setClause = entries.map(([k]) => `${k} = ?`).join(', ');
  const values = entries.map(([, v]) => v);
  getDb().prepare(`UPDATE products SET ${setClause} WHERE id = ?`).run(...values, id);
  return getById(id);
}

export function del(id) {
  return getDb().prepare(`DELETE FROM products WHERE id = ?`).run(id);
}
